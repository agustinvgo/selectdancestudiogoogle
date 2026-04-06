const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function checkMysqlUser() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- MYSQL USER PRIVILEGES ---');
        const res = await ssh.execCommand('mysql -e "SELECT user, host FROM mysql.user WHERE user = \'sdsuser\'"');
        console.log(res.stdout);

        console.log('--- GRANTS ---');
        const resGrants = await ssh.execCommand('mysql -e "SHOW GRANTS FOR \'sdsuser\'@\'localhost\'"');
        console.log(resGrants.stdout);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

checkMysqlUser();
