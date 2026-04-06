require('dotenv').config();
const { NodeSSH } = require('node-ssh');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ssh = new NodeSSH();

// Configuración del Servidor (Cargada desde .env en la raíz)
const SSH_HOST = process.env.SSH_HOST;
const SSH_USER = process.env.SSH_USER;
const SSH_PASSWORD = process.env.SSH_PASSWORD;

if (!SSH_HOST || !SSH_USER || !SSH_PASSWORD) {
    console.error('❌ Error: Faltan variables de entorno SSH (SSH_HOST, SSH_USER o SSH_PASSWORD) en el archivo .env');
    process.exit(1);
}

// Rutas locales
const FRONTEND_DIR = path.join(__dirname, 'sds-frontend');
const BACKEND_DIR = path.join(__dirname, 'sds-backend');
const FRONTEND_DIST = path.join(FRONTEND_DIR, 'dist');

// Rutas remotas (Servidor - Se pueden sobreescribir vía .env)
const REMOTE_FRONTEND = process.env.REMOTE_FRONTEND || '/var/www/sds-frontend';
const REMOTE_BACKEND = process.env.REMOTE_BACKEND || '/var/www/sds-backend';

async function compressDirectory(sourceDir, outPath, expectSubDir = null) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outPath);
        const archive = archiver('tar', { gzip: true, gzipOptions: { level: 9 } });

        output.on('close', () => resolve(outPath));
        archive.on('error', (err) => reject(err));

        archive.pipe(output);

        if (expectSubDir) {
            archive.directory(sourceDir, expectSubDir);
        } else {
            // Comprimir el interior de la carpeta (sin la propia carpeta raíz)
            archive.glob('**/*', {
                cwd: sourceDir,
                ignore: ['node_modules/**', '.env', '.git/**', 'backups/**', '.chrome/**', '.wwebjs_auth/**', '.wwebjs_cache/**']
            });
        }
        archive.finalize();
    });
}

async function deploy() {
    console.log('🚀 Iniciando despliegue de Select Dance Studio...\n');

    try {
        // 1. Compilar Frontend
        console.log('📦 1. Compilando Frontend (React/Vite)...');
        execSync('npm run build', { cwd: FRONTEND_DIR, stdio: 'inherit' });

        // 2. Empaquetar
        console.log('\n🗜️ 2. Empaquetando archivos para despliegue...');
        const frontArchive = path.join(__dirname, 'frontend.tar.gz');
        const backArchive = path.join(__dirname, 'backend.tar.gz');

        await compressDirectory(FRONTEND_DIST, frontArchive, false); // Comprime el interior de dist
        console.log('   ✅ Frontend empaquetado.');

        await compressDirectory(BACKEND_DIR, backArchive, false); // Comprime el backend (ignorando carpetas pesadas/secretos)
        console.log('   ✅ Backend empaquetado.');

        // 3. Conectar al VPS
        console.log(`\n🔗 3. Conectando al servidor VPS (${SSH_HOST})...`);
        await ssh.connect({
            host: SSH_HOST,
            username: SSH_USER,
            password: SSH_PASSWORD
        });
        console.log('   ✅ Conectado.');

        // 4. Subir y Desplegar Backend
        console.log('\n⬆️ 4. Subiendo y actualizando Backend (limpiando anterior)...');
        await ssh.putFile(backArchive, '/root/backend.tar.gz');
        
        // También subimos el archivo de configuración de PM2
        await ssh.putFile(path.join(__dirname, 'ecosystem.config.js'), path.join(REMOTE_BACKEND, 'ecosystem.config.js'));

        await ssh.execCommand(`
            mkdir -p ${REMOTE_BACKEND} &&
            tar -xzf /root/backend.tar.gz -C ${REMOTE_BACKEND} &&
            rm /root/backend.tar.gz &&
            cd ${REMOTE_BACKEND} &&
            npm install --production &&
            pm2 restart ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production
        `);
        console.log('   ✅ Backend actualizado y gestionado por PM2.');

        // 5. Subir y Desplegar Frontend
        console.log('\n⬆️ 5. Subiendo y actualizando Frontend...');
        await ssh.putFile(frontArchive, '/root/frontend.tar.gz');
        await ssh.execCommand(`
            mkdir -p ${REMOTE_FRONTEND} &&
            rm -rf ${REMOTE_FRONTEND}/* &&
            tar -xzf /root/frontend.tar.gz -C ${REMOTE_FRONTEND} &&
            rm /root/frontend.tar.gz
        `);
        console.log('   ✅ Frontend actualizado (archivos en ' + REMOTE_FRONTEND + ').');

        // Limpieza local
        fs.unlinkSync(frontArchive);
        fs.unlinkSync(backArchive);
        ssh.dispose();

        console.log('\n🎉 ¡Despliegue finalizado con éxito! La página está actualizada.');

    } catch (error) {
        console.error('\n❌ Error durante el despliegue:', error);
        if (ssh) ssh.dispose();
        process.exit(1);
    }
}

deploy();
