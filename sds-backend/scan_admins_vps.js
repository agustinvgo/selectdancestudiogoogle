const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

(async () => {
    try {
        await ssh.connect({
            host: '187.77.62.115',
            username: 'root',
            password: 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- FULL USER DUMP ---');
        const res = await ssh.execCommand('mysql select_dance_db -e "SELECT id, email, rol, activo, LENGTH(email) as len FROM usuarios;"');
        console.log(res.stdout);

        console.log('--- RECENT PM2 LOGS ---');
        const resLogs = await ssh.execCommand('pm2 logs sds-backend --lines 20 --nostream');
        console.log(resLogs.stdout);

        ssh.dispose();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
