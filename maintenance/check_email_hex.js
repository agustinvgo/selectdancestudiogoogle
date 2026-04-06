const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function checkHex() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- EMAIL HEX VALUES ---');
        const res = await ssh.execCommand('mysql select_dance_db -s -N -e "SELECT email, HEX(email) FROM usuarios"');
        console.log(res.stdout);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

checkHex();
