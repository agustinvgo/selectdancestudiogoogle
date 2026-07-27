const { NodeSSH } = require('node-ssh');
require('dotenv').config();
const ssh = new NodeSSH();
const BRANCH = 'feat/clases-en-vivo-y-pausa-notificaciones';

async function run() {
    console.log(`\n🚀 Desplegando actualización de frontend en VPS...`);
    await ssh.connect({ host: process.env.SSH_HOST, username: process.env.SSH_USER, password: process.env.SSH_PASSWORD });
    const exec = async (cmd, label) => {
        if (label) console.log(`\n▶ ${label}`);
        const r = await ssh.execCommand(cmd, { cwd: process.env.REMOTE_PATH });
        if (r.stdout) console.log(r.stdout);
        if (r.stderr && !r.stderr.includes('Warning') && !r.stderr.includes('FETCH_HEAD') && !r.stderr.includes('branch'))
            console.log('[ERR]', r.stderr);
        return r;
    };

    await exec(`git pull origin ${BRANCH}`, 'git pull');
    await exec('docker compose up --build -d backend frontend', 'Reconstruyendo backend y frontend');

    console.log('⏳ Esperando 10s...');
    await new Promise(r => setTimeout(r, 10000));

    await exec('docker ps --format "table {{.Names}}\\t{{.Status}}"', 'Estado contenedores');

    ssh.dispose();
    console.log('\n✅ Deploy de backend y frontend completado!');
}
run().catch(e => { console.error(e.message); ssh.dispose(); });
