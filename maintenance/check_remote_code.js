const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function checkRemoteCode() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- CHECKING AuthDebug IN REMOTE FILE ---');
        const res = await ssh.execCommand('grep "AuthDebug" /var/www/sds-backend/src/controllers/auth/auth.controller.js');
        console.log(res.stdout);
        console.log(res.stderr);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

checkRemoteCode();
