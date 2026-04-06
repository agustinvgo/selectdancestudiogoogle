const { NodeSSH } = require('node-ssh');
require('dotenv').config();

const ssh = new NodeSSH();

async function repairDbFinal() {
    try {
        await ssh.connect({
            host: process.env.SSH_HOST || '187.77.62.115',
            username: process.env.SSH_USER || 'root',
            password: process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#'
        });

        const dbName = 'select_dance_db';
        const queries = [
            `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS primer_login TINYINT(1) DEFAULT 1 AFTER activo`,
            `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS nombre VARCHAR(100) AFTER primer_login`,
            `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS apellido VARCHAR(100) AFTER nombre`,
            `ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(50) AFTER apellido`
        ];

        console.log('--- REPARANDO ESQUEMA DE USUARIOS ---');
        for (const q of queries) {
            console.log(`Ejecutando: ${q}`);
            const res = await ssh.execCommand(`mysql ${dbName} -e "${q}"`);
            if (res.stderr) console.error(`Error en query [${q}]:`, res.stderr);
        }

        console.log('--- Verificación Final ---');
        const check = await ssh.execCommand(`mysql ${dbName} -e "DESCRIBE usuarios"`);
        console.log(check.stdout);

        ssh.dispose();
    } catch (err) {
        console.error(err);
    }
}

repairDbFinal();
