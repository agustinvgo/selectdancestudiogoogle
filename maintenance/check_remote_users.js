const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function checkRemoteUsersNode() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        // 1. Crear un script temporal en el VPS
        const remoteScriptPath = '/root/test_users.js';
        const remoteScriptContent = `
            const mysql = require('mysql2/promise');
            require('dotenv').config({ path: '/var/www/sds-backend/.env' });

            async function run() {
                try {
                    const connection = await mysql.createConnection({
                        host: process.env.DB_HOST,
                        user: process.env.DB_USER,
                        password: process.env.DB_PASSWORD,
                        database: process.env.DB_NAME
                    });
                    console.log('--- DB CONNECTION OK ---');
                    const [rows] = await connection.execute('SELECT id, email, rol, activo FROM usuarios WHERE rol = \"admin\"');
                    console.log('ADMIN USERS:', JSON.stringify(rows));
                    await connection.end();
                } catch (e) {
                    console.error('--- DB CONNECTION ERROR ---');
                    console.error(e.message);
                }
            }
            run();
        `;

        await ssh.execCommand(`echo "${remoteScriptContent.replace(/"/g, '\\"')}" > ${remoteScriptPath}`);
        
        // 2. Ejecutar el script (necesitamos node_modules, así que lo corremos desde /var/www/sds-backend)
        console.log('--- RUNNING REMOTE NODE SCRIPT ---');
        const res = await ssh.execCommand(`node -e "${remoteScriptContent.replace(/"/g, '\\"')}"`, { cwd: '/var/www/sds-backend' });
        
        console.log(res.stdout);
        console.log(res.stderr);

        // 3. Limpiar
        await ssh.execCommand(`rm ${remoteScriptPath}`);
        
        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

checkRemoteUsersNode();
