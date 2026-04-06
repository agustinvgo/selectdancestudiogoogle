const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

(async () => {
    try {
        await ssh.connect({
            host: '187.77.62.115',
            username: 'root',
            password: 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- WIPE VERIFICATION REPORT ---');
        
        const files = await ssh.execCommand('ls -la /var/www/sds-backend');
        console.log('Backend Directory Content:\n' + (files.stdout || 'EMPTY OR NOT FOUND'));

        const pm2 = await ssh.execCommand('pm2 list');
        console.log('PM2 Processes:\n' + pm2.stdout);

        const db = await ssh.execCommand('mysql -e "SHOW DATABASES;"');
        console.log('Databases:\n' + db.stdout);

        ssh.dispose();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
