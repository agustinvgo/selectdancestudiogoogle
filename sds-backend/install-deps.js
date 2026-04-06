require('dotenv').config();
const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();
const SSH_HOST = process.env.SSH_HOST || '187.77.62.115';
const SSH_USER = process.env.SSH_USER || 'root';
const SSH_PASSWORD = process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#';

async function installDeps() {
    try {
        await ssh.connect({
            host: SSH_HOST,
            username: SSH_USER,
            password: SSH_PASSWORD
        });
        
        console.log("Conectado. Instalando dependencias de Puppeteer en Linux...");
        
        const commands = [
            'apt-get update',
            'DEBIAN_FRONTEND=noninteractive apt-get install -y libx11-xcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 libnss3 libcups2 libdrm2 libxrandr2 libgbm1 libasound2t64 libpangocairo-1.0-0 libatk1.0-0 libatk-bridge2.0-0 libgtk-3-0'
        ];
        
        for (const cmd of commands) {
            console.log(`Ejecutando: ${cmd}`);
            const result = await ssh.execCommand(cmd);
            console.log(result.stdout);
            if (result.stderr) console.error(result.stderr);
        }

        console.log("Reiniciando backend para aplicar cambios...");
        await ssh.execCommand('pm2 restart sds-backend');
        
        console.log("Instalación completada.");
    } catch (error) {
        console.error("Error SSH:", error);
    } finally {
        if(ssh) ssh.dispose();
    }
}

installDeps();
