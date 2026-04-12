require('dotenv').config();
const { NodeSSH } = require('node-ssh');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

const ssh = new NodeSSH();

// Configuración cargada desde el .env de la raíz
const SSH_HOST = process.env.SSH_HOST;
const SSH_USER = process.env.SSH_USER || 'root';
const SSH_PASSWORD = process.env.SSH_PASSWORD;
const REMOTE_PATH = process.env.REMOTE_PATH || '/var/www/select-dance-studio';

if (!SSH_HOST || !SSH_PASSWORD) {
    console.error('❌ Error: Configura SSH_HOST y SSH_PASSWORD en tu archivo .env');
    process.exit(1);
}

async function createPackage() {
    return new Promise((resolve, reject) => {
        console.log('📦 Creando paquete de despliegue...');
        const output = fs.createWriteStream('deploy.tar.gz');
        const archive = archiver('tar', { gzip: true });

        output.on('close', () => resolve('deploy.tar.gz'));
        archive.on('error', err => reject(err));

        archive.pipe(output);

        // Incluimos archivos base
        archive.file('docker-compose.yml', { name: 'docker-compose.yml' });
        archive.file('ecosystem.config.js', { name: 'ecosystem.config.js' });
        
        // Incluimos carpetas (archiver ignorará lo que esté en .dockerignore si lo configuramos, 
        // pero aquí lo haremos manual para mayor control)
        archive.directory('sds-backend/', 'sds-backend', (data) => {
            if (data.name.includes('node_modules') || 
                data.name.includes('.env') || 
                data.name.includes('logs') || 
                data.name.includes('.wwebjs_auth') || 
                data.name.includes('.wwebjs_cache') || 
                data.name.includes('uploads')) return false;
            return data;
        });
        
        archive.directory('sds-frontend/', 'sds-frontend', (data) => {
            if (data.name.includes('node_modules') || data.name.includes('dist')) return false;
            return data;
        });
        
        // Incluimos la carpeta de base de datos para la inicialización de Docker
        archive.directory('database/', 'database');

        archive.finalize();
    });
}

async function deploy() {
    try {
        const pkgPath = await createPackage();

        console.log(`🚀 Conectando a ${SSH_HOST}...`);
        await ssh.connect({
            host: SSH_HOST,
            username: SSH_USER,
            password: SSH_PASSWORD
        });

        console.log('⬆️ Subiendo archivos al servidor...');
        await ssh.putFile(pkgPath, '/tmp/deploy.tar.gz');
        
        // Subimos el .env de la raíz al REMOTE_PATH para que docker-compose lo lea
        await ssh.putFile('.env', `${REMOTE_PATH}/.env`);

        console.log('🔧 Ejecutando Docker Compose en el servidor...');
        // Comandos remotos
        const commands = [
            `mkdir -p ${REMOTE_PATH}`,
            `tar -xzf /tmp/deploy.tar.gz -C ${REMOTE_PATH}`,
            `rm /tmp/deploy.tar.gz`,
            `cd ${REMOTE_PATH}`,
            // El .env ya se subió por putFile, no hace falta touch
            `docker compose down --remove-orphans`,
            `docker compose up -d --build`,
            `docker image prune -f` // Limpiar imágenes viejas para no llenar el disco
        ];

        for (const cmd of commands) {
            console.log(`   > ${cmd}`);
            // Ejecutamos cada comando dentro del REMOTE_PATH si es relevante para Docker
            const result = await ssh.execCommand(cmd, { cwd: REMOTE_PATH });
            if (result.stderr) console.log(`   ⚠️  ${result.stderr}`);
        }

        console.log('\n✅ ¡Despliegue completado con éxito!');
        
        // Limpiar local
        fs.unlinkSync(pkgPath);
        ssh.dispose();

    } catch (err) {
        console.error('❌ Error durante el despliegue:', err);
        ssh.dispose();
    }
}

deploy();
