const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function checkTableCount() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- COUNTING AS ROOT ---');
        const resRoot = await ssh.execCommand('mysql select_dance_db -s -N -e "SELECT COUNT(*) FROM usuarios"');
        console.log('ROOT COUNT:', resRoot.stdout);

        console.log('--- COUNTING AS SDSUSER ---');
        const resSds = await ssh.execCommand('mysql -u sdsuser -p\'sds_pass_2024_!\' select_dance_db -s -N -e "SELECT COUNT(*) FROM usuarios"');
        console.log('SDSUSER COUNT:', resSds.stdout);
        console.log('SDSUSER ERR:', resSds.stderr);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

checkTableCount();
