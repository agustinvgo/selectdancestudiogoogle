const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function resetViaRoot() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        const hash = '$2b$10$HEDqokVXbI8P7bEfH9hD5.22/uPWmu1mRhgANK1HZHMdRORviP6Ht6';
        const email = 'agustin.v@selectdancestudio.com';
        const dbName = 'select_dance_db';

        console.log(`--- Reseteando password para ${email} vía ROOT ---`);
        // Using root (no -u, no -p needed inside ssh as root)
        const res = await ssh.execCommand(`mysql ${dbName} -e "UPDATE usuarios SET password_hash = '${hash}', activo = 1 WHERE email = '${email}'"`);
        
        console.log('STDOUT:', res.stdout);
        console.log('STDERR:', res.stderr);

        console.log('--- Verificación Final ---');
        const check = await ssh.execCommand(`mysql ${dbName} -e "SELECT email, activo FROM usuarios WHERE email = '${email}'"`);
        console.log(check.stdout);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

resetViaRoot();
