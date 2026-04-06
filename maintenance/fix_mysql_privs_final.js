const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function fixMysqlPrivsFinal() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        const newPass = 'sds_pass_2024_!';
        const queries = [
            `ALTER USER 'sdsuser'@'localhost' IDENTIFIED WITH mysql_native_password BY '${newPass}'`,
            `GRANT ALL PRIVILEGES ON select_dance_db.* TO 'sdsuser'@'localhost'`,
            `FLUSH PRIVILEGES`
        ];

        console.log('--- RESETTING SDSUSER PRIVS & PASS ---');
        for (const q of queries) {
            console.log(`Executing: ${q}`);
            await ssh.execCommand(`mysql -e "${q}"`);
        }

        console.log('--- UPDATING PROD .env ---');
        // We use sed to replace the password in the .env file on the VPS
        await ssh.execCommand(`sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD=${newPass}/' /var/www/sds-backend/.env`);
        
        console.log('--- RESTARTING PM2 ---');
        await ssh.execCommand('pm2 restart sds-backend');

        console.log('--- FINAL TEST (CLI) ---');
        const resTest = await ssh.execCommand(`mysql -u sdsuser -p'${newPass}' select_dance_db -e "SELECT email FROM usuarios LIMIT 1"`);
        console.log('STDOUT:', resTest.stdout);
        console.log('STDERR:', resTest.stderr);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

fixMysqlPrivsFinal();
