const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

(async () => {
    try {
        await ssh.connect({
            host: '187.77.62.115',
            username: 'root',
            password: 'Agustinyas43PazCamio@'
        });

        const log = await ssh.execCommand('grep -B 20 -A 5 "error" /tmp/docker_build.log');
        console.log('--- ERROR CONTEXT ---');
        console.log(log.stdout || 'No explicit "error" string found, showing tail:');
        if (!log.stdout) {
            const tail = await ssh.execCommand('tail -n 500 /tmp/docker_build.log');
            console.log(tail.stdout);
        }

        ssh.dispose();
    } catch (e) {
        console.error(e);
    }
})();
