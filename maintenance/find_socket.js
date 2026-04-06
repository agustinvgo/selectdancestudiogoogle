const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function findSocket() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- BUSCANDO SOCKET DE MYSQL ---');
        const res = await ssh.execCommand('ls -la /var/run/mysqld/mysqld.sock || ls -la /tmp/mysql.sock || find /var -name mysqld.sock 2>/dev/null');
        console.log(res.stdout);
        console.log(res.stderr);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

findSocket();
