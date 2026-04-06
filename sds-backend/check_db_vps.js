const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

(async () => {
    try {
        await ssh.connect({
            host: '187.77.62.115',
            username: 'root',
            password: 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- TABLE DESC ---');
        const res = await ssh.execCommand('mysql select_dance_db -e "DESC usuarios;"');
        console.log(res.stdout);

        ssh.dispose();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
