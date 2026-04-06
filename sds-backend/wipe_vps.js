const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

(async () => {
    try {
        await ssh.connect({
            host: '187.77.62.115',
            username: 'root',
            password: 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- STARTING GRANULAR WIPE ---');
        
        console.log('1. Stopping and deleting PM2...');
        const p1 = await ssh.execCommand('pm2 stop all && pm2 delete all && pm2 save --force');
        console.log(p1.stdout || p1.stderr || 'No output');

        console.log('2. Dropping database...');
        const d1 = await ssh.execCommand('mysql -v -u root -e "DROP DATABASE IF EXISTS select_dance_db;"');
        console.log(d1.stdout || d1.stderr || 'No output');

        console.log('3. Removing web directory...');
        const r1 = await ssh.execCommand('rm -rfv /var/www/sds-backend');
        console.log(r1.stdout || r1.stderr || 'No output');

        console.log('4. Removing deployment artifacts...');
        const r2 = await ssh.execCommand('rm -v /tmp/s.sql /tmp/sds-backend-clean.zip /tmp/select_dance_db_local.sql');
        console.log(r2.stdout || r2.stderr || 'No output');

        console.log('--- WIPE COMPLETE ---');
        ssh.dispose();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
