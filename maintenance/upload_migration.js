const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function uploadMigration() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        console.log('--- UPLOADING BACKEND ZIP ---');
        await ssh.putFile('c:/xampp/htdocs/selectdancestudiogoogle/sds-backend/sds-backend-deploy.zip', '/root/sds-backend-deploy.zip');

        console.log('--- UPLOADING DB DUMP ---');
        await ssh.putFile('c:/xampp/htdocs/selectdancestudiogoogle/sds-backend/select_dance_db_local.sql', '/root/select_dance_db_local.sql');

        console.log('✅ Uploads completados.');
        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

uploadMigration();
