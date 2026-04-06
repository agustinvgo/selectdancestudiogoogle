require('dotenv').config();
const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

const SSH_HOST = process.env.SSH_HOST || '187.77.62.115';
const SSH_USER = process.env.SSH_USER || 'root';
const SSH_PASSWORD = process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#';

async function checkLogs() {
    try {
        await ssh.connect({
            host: SSH_HOST,
            username: SSH_USER,
            password: SSH_PASSWORD
        });
        
        console.log("Conectado. Obteniendo logs...");
        // Obtener logs de PM2 (últimas 100 líneas, sin stream)
        const result = await ssh.execCommand('pm2 logs sds-backend --lines 50 --nostream');
        require('fs').writeFileSync('pm2-logs.txt', result.stdout + '\n\n' + result.stderr);
        console.log("Logs guardados en pm2-logs.txt");
        
        // También ver el estado actual
        const status = await ssh.execCommand('pm2 status sds-backend');
        console.log(status.stdout);

        ssh.dispose();
    } catch (error) {
        console.error("Error SSH:", error);
        if (ssh) ssh.dispose();
    }
}

checkLogs();
