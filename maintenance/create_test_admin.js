const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function createTestAdmin() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        const hash = '$2b$10$HEDqokVXbI8P7bEfH9hD5.22/uPWmu1mRhgANK1HZHMdRORviP6Ht6'; // Select2026!
        const email = 'dev@admin.com';
        const dbName = 'select_dance_db';

        console.log(`--- Creando usuario de prueba: ${email} ---`);
        const query = `INSERT INTO usuarios (email, password_hash, rol, activo, primer_login) VALUES ('${email}', '${hash}', 'admin', 1, 0) ON DUPLICATE KEY UPDATE activo = 1, password_hash = '${hash}'`;
        
        const res = await ssh.execCommand(`mysql ${dbName} -e "${query}"`);
        console.log('STDOUT:', res.stdout);
        console.log('STDERR:', res.stderr);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

createTestAdmin();
