const { NodeSSH } = require('node-ssh');
const ssh = new NodeSSH();

(async () => {
    try {
        await ssh.connect({
            host: '187.77.62.115',
            username: 'root',
            password: 'Agustinyas43PazCamio@'
        });

        const res = await ssh.execCommand('grep -A 20 "error during build" /tmp/docker_build.log || tail -n 200 /tmp/docker_build.log');
        console.log('--- BUILD LOG SNIPPET ---');
        console.log(res.stdout);
        
        ssh.dispose();
    } catch (e) {
        console.error(e);
    }
})();
