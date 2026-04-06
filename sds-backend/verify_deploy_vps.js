const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

(async () => {
    try {
        await ssh.connect({
            host: '187.77.62.115',
            username: 'root',
            password: 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- VERIFICATION REPORT ---');
        
        const files = await ssh.execCommand('ls -R /var/www/sds-backend | grep ".js" | head -n 5');
        console.log('Backend Files Sample:\n' + (files.stdout || 'NONE'));

        const tables = await ssh.execCommand('mysql select_dance_db -s -e "SHOW TABLES;"');
        console.log('DB Tables:\n' + (tables.stdout || 'EMPTY'));

        const pm2 = await ssh.execCommand('pm2 list');
        console.log('PM2 Status:\n' + pm2.stdout);

        const env = await ssh.execCommand('cat /var/www/sds-backend/.env | grep "DB_"');
        console.log('.env DB Config:\n' + env.stdout);

        ssh.dispose();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
