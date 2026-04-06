const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function fixRemotePaths() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- FIXING REMOTE PATHS (ROOT ACCESS) ---');
        
        // 1. Check if nested exists
        const check = await ssh.execCommand('ls -d /var/www/sds-backend/sds-backend');
        if (check.stdout.includes('sds-backend')) {
            console.log('Nested folder found! Moving files...');
            // Copy contents up one level, then remove nested
            await ssh.execCommand('cp -R /var/www/sds-backend/sds-backend/* /var/www/sds-backend/');
            await ssh.execCommand('rm -rf /var/www/sds-backend/sds-backend');
            console.log('Files moved and nested folder removed.');
        } else {
            console.log('No nested folder found. Ensuring root is correct.');
        }

        // 2. Restart PM2 to be 100% sure
        console.log('Restarting PM2...');
        await ssh.execCommand('pm2 restart sds-backend');
        
        // 3. Verify specifically for AuthDebug
        const verify = await ssh.execCommand('grep "AuthDebug" /var/www/sds-backend/src/controllers/auth/auth.controller.js');
        console.log('--- VERIFICATION (AuthDebug) ---');
        console.log(verify.stdout || '(None found - something is still wrong)');

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

fixRemotePaths();
