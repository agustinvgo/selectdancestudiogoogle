const { NodeSSH } = require('node-ssh');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const ssh = new NodeSSH();

async function resetAdminPassword() {
    try {
        const newPassword = 'Select2026!'; // Policy compliant
        const hash = await bcrypt.hash(newPassword, 10);
        
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
                    const [res] = await connection.execute(
                        'UPDATE usuarios SET password_hash = ?, activo = 1 WHERE email = \"agustin.v@selectdancestudio.com\"',
                        ['${hash}']
                    );
                    console.log('RESET STATUS:', res.affectedRows > 0 ? 'SUCCESS' : 'USER NOT FOUND');
                    await connection.end();
                } catch (e) {
                    console.error('ERROR:', e.message);
                }
            }
            run();
        `;

        const res = await ssh.execCommand(`node -e "${remoteScriptContent.replace(/"/g, '\\"').replace(/\n/g, '')}"`, { cwd: '/var/www/sds-backend' });
        
        console.log("--- PASSWORD RESET ---");
        console.log(res.stdout);
        console.log(res.stderr);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

resetAdminPassword();
