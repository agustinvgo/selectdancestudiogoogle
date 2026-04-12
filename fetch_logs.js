require('dotenv').config();
const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();
const SSH_HOST = '187.77.62.115';
const SSH_USER = 'root';
const SSH_PASSWORD = process.env.SSH_PASSWORD || 'Agustinyas43#PazCamion';

async function fetchLogs() {
    try {
        await ssh.connect({
            host: SSH_HOST,
            username: SSH_USER,
            password: SSH_PASSWORD
        });
        
        console.log("=== Logs del Backend ===");
        const result = await ssh.execCommand('docker logs --tail 200 sds-backend');
        console.log(result.stdout);
        if (result.stderr) {
            console.log("=== Errores (stderr) ===");
            console.log(result.stderr);
        }
        
    } catch (err) {
        console.error(err);
    } finally {
        ssh.dispose();
    }
}

fetchLogs();
