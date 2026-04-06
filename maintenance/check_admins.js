const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function checkAdminUsers() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        // Query the database directly for admin users
        const dbUser = 'sdsuser';
        const dbPass = 'SWplMggtREJwf@S43@'; 
        const dbName = 'select_dance_db';
        
        const res = await ssh.execCommand(`mysql -u ${dbUser} -p'${dbPass}' ${dbName} -e "SELECT id, email, rol, activo FROM usuarios WHERE rol = 'admin'"`);
        
        console.log("--- PRODUCTION ADMINS ---");
        console.log(res.stdout);
        console.log(res.stderr);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

checkAdminUsers();
