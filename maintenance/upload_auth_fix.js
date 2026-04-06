const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function uploadAuthFix() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- Uploading auth.controller.js fix ---');
        await ssh.putFile(
            'c:/xampp/htdocs/selectdancestudiogoogle/sds-backend/src/controllers/auth/auth.controller.js', 
            '/var/www/sds-backend/src/controllers/auth/auth.controller.js'
        );

        console.log('Restarting PM2...');
        await ssh.execCommand('pm2 restart sds-backend');
        
        console.log('Verifying content...');
        const res = await ssh.execCommand('grep "AuthDebug" /var/www/sds-backend/src/controllers/auth/auth.controller.js');
        console.log('GREP RESULT:', res.stdout);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

uploadAuthFix();
