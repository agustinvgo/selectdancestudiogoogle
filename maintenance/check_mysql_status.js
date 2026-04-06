const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function checkMysqlStatus() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- MYSQL USER PLUGIN ---');
        const resPlugin = await ssh.execCommand('mysql -e "SELECT user, host, plugin FROM mysql.user WHERE user = \'sdsuser\'"');
        console.log(resPlugin.stdout);

        const resMax = await ssh.execCommand('mysql -e "SHOW VARIABLES LIKE \'max_connections\'"');
        console.log(resMax.stdout);

        console.log('--- PROCESS LIST ---');
        const resProcess = await ssh.execCommand('mysql -e "SHOW PROCESSLIST"');
        console.log(resProcess.stdout);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

checkMysqlStatus();
