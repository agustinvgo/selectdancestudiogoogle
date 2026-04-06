const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function testLoginInSitu() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        const remoteScriptContent = `
            const mysql = require('mysql2/promise');
            const bcrypt = require('bcryptjs');
            require('dotenv').config({ path: '/var/www/sds-backend/.env' });

            async function run() {
                try {
                    const email = 'agustin.v@selectdancestudio.com';
                    const pass = 'Select2026!';
                    
                    const connection = await mysql.createConnection({
                        host: process.env.DB_HOST,
                        user: process.env.DB_USER,
                        password: process.env.DB_PASSWORD,
                        database: process.env.DB_NAME
                    });
                    
                    const [rows] = await connection.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
                    const usuario = rows[0];
                    
                    if (!usuario) {
                        console.log('--- USER NOT FOUND IN DB ---');
                        return;
                    }
                    
                    console.log('USER FOUND:', usuario.email, 'ACTIVO:', usuario.activo);
                    
                    const match = await bcrypt.compare(pass, usuario.password_hash);
                    console.log('PASSWORD MATCH:', match ? 'YES' : 'NO');
                    
                    await connection.end();
                } catch (e) {
                    console.error('ERROR:', e.message);
                }
            }
            run();
        `;

        console.log('--- RUNNING IN-SITU LOGIN TEST ---');
        const res = await ssh.execCommand(`node -e "${remoteScriptContent.replace(/"/g, '\\"').replace(/\n/g, '')}"`, { cwd: '/var/www/sds-backend' });
        
        console.log(res.stdout);
        console.log(res.stderr);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

testLoginInSitu();
