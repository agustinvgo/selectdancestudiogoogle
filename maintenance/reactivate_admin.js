const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function reactivateAdmin() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        const dbUser = 'sdsuser';
        const dbPass = 'SWplMggtREJwf@S43@';
        const dbName = 'select_dance_db';

        console.log('--- Reactivando Administradores ---');
        // Update to set activo = 1 for all admins
        await ssh.execCommand(`mysql -u ${dbUser} -p'${dbPass}' ${dbName} -e "UPDATE usuarios SET activo = 1 WHERE rol = 'admin'"`);
        
        console.log('--- Verificando Estado Final ---');
        const res = await ssh.execCommand(`mysql -u ${dbUser} -p'${dbPass}' ${dbName} -e "SELECT email, rol, activo FROM usuarios WHERE rol = 'admin'"`);
        
        console.log(res.stdout);
        
        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

reactivateAdmin();
