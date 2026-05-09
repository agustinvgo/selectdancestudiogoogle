// =============================================================
// Deploy Script - Select Dance Studio
// Conecta al VPS por SSH y actualiza los contenedores Docker
// =============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

const HOST     = process.env.SSH_HOST;
const USER     = process.env.SSH_USER;
const PASSWORD = process.env.SSH_PASSWORD?.replace(/^"|"$/g, '');
const REMOTE   = process.env.REMOTE_PATH || '/var/www/select-dance-studio';

// Colores en consola
const c = {
  reset : '\x1b[0m',
  green : '\x1b[32m',
  red   : '\x1b[31m',
  yellow: '\x1b[33m',
  cyan  : '\x1b[36m',
  bold  : '\x1b[1m',
};

function log(icon, msg, color = c.reset) {
  console.log(`${color}${icon}  ${msg}${c.reset}`);
}

async function runCmd(label, command) {
  log('⚙️ ', `${label}...`, c.cyan);
  const result = await ssh.execCommand(command, { cwd: REMOTE });
  if (result.stdout) console.log(result.stdout);
  if (result.stderr) console.error(`${c.yellow}${result.stderr}${c.reset}`);
  if (result.code !== 0 && result.code !== null) {
    throw new Error(`Comando falló con código ${result.code}: ${command}`);
  }
  return result;
}

async function deploy() {
  console.log('');
  console.log(`${c.bold}${c.cyan}=======================================================${c.reset}`);
  console.log(`${c.bold}${c.cyan}  🚀 Deploy - Select Dance Studio${c.reset}`);
  console.log(`${c.bold}${c.cyan}=======================================================${c.reset}`);
  console.log('');

  // ── 1. Validar configuración ────────────────────────────────
  if (!HOST || !USER || !PASSWORD) {
    log('❌', 'Faltan variables en .env: SSH_HOST, SSH_USER, SSH_PASSWORD', c.red);
    process.exit(1);
  }
  log('🔧', `Conectando a ${USER}@${HOST}`, c.yellow);

  // ── 2. Conectar por SSH ─────────────────────────────────────
  await ssh.connect({ host: HOST, username: USER, password: PASSWORD });
  log('✅', 'Conexión SSH establecida', c.green);

  try {
    // ── 3. Verificar que existe el directorio ─────────────────
    await runCmd('Verificando directorio remoto', `ls ${REMOTE}`);

    // ── 4. Detectar si es un repositorio git ─────────────────
    const isGit = await ssh.execCommand(`test -d ${REMOTE}/.git && echo YES || echo NO`);
    const REPO_URL = 'https://github.com/agustinvgo/selectdancestudiogoogle.git';

    if (isGit.stdout.trim() === 'NO') {
      log('📦', 'No es un repositorio git. Clonando desde GitHub...', c.yellow);

      // Respaldar .env si existe
      await ssh.execCommand(`[ -f ${REMOTE}/.env ] && cp ${REMOTE}/.env /tmp/sds_env_backup || true`);
      log('💾', 'Backup de .env guardado en /tmp/sds_env_backup', c.yellow);

      // Clonar en carpeta temporal y mover contenido
      await runCmd(
        'Clonando repositorio desde GitHub',
        `git clone ${REPO_URL} /tmp/sds_clone_tmp && \
         rsync -av --delete \
           --exclude='.env' \
           --exclude='sds-backend/uploads/' \
           --exclude='database/' \
           /tmp/sds_clone_tmp/ ${REMOTE}/ && \
         rm -rf /tmp/sds_clone_tmp`
      );

      // Restaurar .env
      await ssh.execCommand(`[ -f /tmp/sds_env_backup ] && cp /tmp/sds_env_backup ${REMOTE}/.env || true`);
      log('✅', '.env restaurado correctamente', c.green);
    } else {
      // ── 4b. Ya es git → git pull ────────────────────────────
      await runCmd('Actualizando código (git pull)', `cd ${REMOTE} && git pull origin main`);
    }

    // ── 5. Copiar .env de producción (si es necesario) ────────
    // El .env ya está en el servidor, no se sobreescribe

    // ── 6. Reconstruir y reiniciar contenedores ───────────────
    await runCmd(
      'Reconstruyendo contenedores Docker (puede tardar ~2 min)',
      `cd ${REMOTE} && docker compose up --build -d`
    );

    // ── 7. Esperar arranque ───────────────────────────────────
    log('⏳', 'Esperando 15 segundos para que los servicios inicien...', c.yellow);
    await new Promise(r => setTimeout(r, 15000));

    // ── 8. Health check ───────────────────────────────────────
    log('🩺', 'Verificando health del backend...', c.cyan);
    const health = await ssh.execCommand(
      'curl -sf http://localhost:5000/api/health && echo OK || echo FAIL'
    );
    if (health.stdout.trim() === 'OK') {
      log('✅', 'Backend responde correctamente', c.green);
    } else {
      log('⚠️ ', 'Backend no respondió. Revisá los logs con: docker compose logs -f backend', c.yellow);
    }

    // ── 9. Estado de los contenedores ─────────────────────────
    const ps = await ssh.execCommand(
      'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"'
    );
    console.log('');
    log('📊', 'Estado de los contenedores:', c.cyan);
    console.log(ps.stdout);

    // ── 10. Resumen ───────────────────────────────────────────
    console.log('');
    console.log(`${c.bold}${c.green}=======================================================${c.reset}`);
    console.log(`${c.bold}${c.green}  ✅ Deploy completado exitosamente!${c.reset}`);
    console.log(`${c.bold}${c.green}=======================================================${c.reset}`);
    console.log('');
    console.log(`${c.cyan}  🌐 Frontend:  https://selectdancestudio.com${c.reset}`);
    console.log(`${c.cyan}  🔌 API:       https://selectdancestudio.com/api/health${c.reset}`);
    console.log('');
    console.log(`  📋 Comandos útiles en el servidor:`);
    console.log(`     Ver logs:     docker compose logs -f`);
    console.log(`     Reiniciar:    docker compose restart`);
    console.log(`     Detener:      docker compose down`);
    console.log(`${c.cyan}=======================================================${c.reset}`);

  } finally {
    ssh.dispose();
  }
}

deploy().catch(err => {
  console.error(`\n${c.red}❌ Error durante el deploy:${c.reset}`, err.message);
  ssh.dispose();
  process.exit(1);
});
