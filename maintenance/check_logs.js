const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function checkRemoteLogs() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- PM2 LOGS ---');
        const logs = await ssh.execCommand('pm2 logs sds-backend --lines 50 --no-daemon');
        console.log(logs.stdout);
        console.log(logs.stderr);

        console.log('--- DIRECTORY CHECK ---');
        const dirList = await ssh.execCommand('ls -R /var/www/sds-backend/src/utils');
        console.log(dirList.stdout);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

checkRemoteLogs();
