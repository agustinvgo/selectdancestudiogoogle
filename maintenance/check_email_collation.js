const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function checkCollation() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- EMAIL COLUMN COLLATION ---');
        const res = await ssh.execCommand('mysql select_dance_db -e "SHOW FULL COLUMNS FROM usuarios LIKE \'email\'"');
        console.log(res.stdout);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

checkCollation();
