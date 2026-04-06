const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function checkSdsuserPrivs() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        const dbUser = 'sdsuser';
        const dbPass = 'SWplMggtREJwf@S43@';
        const dbName = 'select_dance_db';

        console.log(`--- PRUEBA DE SELECT COMO ${dbUser} ---`);
        const res = await ssh.execCommand(`mysql -u ${dbUser} -p'${dbPass}' ${dbName} -e "SELECT email FROM usuarios"`);
        console.log('STDOUT:', res.stdout);
        console.log('STDERR:', res.stderr);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

checkSdsuserPrivs();
