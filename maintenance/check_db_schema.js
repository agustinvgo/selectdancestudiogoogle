const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function checkSchema() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- USUARIOS SCHEMA ---');
        const res = await ssh.execCommand('mysql select_dance_db -e "DESCRIBE usuarios"');
        console.log(res.stdout);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

checkSchema();
