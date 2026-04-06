const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function listProductionUsers() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

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
                    const [rows] = await connection.execute('SELECT email, rol, activo FROM usuarios');
                    console.log('USERS:', JSON.stringify(rows));
                    await connection.end();
                } catch (e) {
                    console.error('ERROR:', e.message);
                }
            }
            run();
        `;

        const res = await ssh.execCommand(`node -e "${remoteScriptContent.replace(/"/g, '\\"').replace(/\n/g, '')}"`, { cwd: '/var/www/sds-backend' });
        
        console.log("--- PRODUCTION USES ---");
        console.log(res.stdout);
        console.log(res.stderr);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

listProductionUsers();
