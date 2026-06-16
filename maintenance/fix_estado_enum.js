require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const { NodeSSH } = require("node-ssh");
const ssh = new NodeSSH();
const HOST = process.env.SSH_HOST;
const USER = process.env.SSH_USER;
const PASS = (process.env.SSH_PASSWORD || "").replace(/^"|"$/g, "");

const SQLS = [
  "ALTER TABLE clases_prueba MODIFY COLUMN estado ENUM('pendiente','confirmada','cancelada','asisitido','contactado','agendado','completado','cancelado') DEFAULT 'pendiente'",
  "UPDATE clases_prueba SET estado='contactado' WHERE estado='confirmada'",
  "UPDATE clases_prueba SET estado='completado' WHERE estado='asisitido'",
  "UPDATE clases_prueba SET estado='cancelado' WHERE estado='cancelada'",
  "ALTER TABLE clases_prueba MODIFY COLUMN estado ENUM('pendiente','contactado','agendado','completado','cancelado') DEFAULT 'pendiente'"
];

async function run() {
  await ssh.connect({ host: HOST, username: USER, password: PASS });
  console.log("Conectado al VPS");
  const ps = await ssh.execCommand("docker ps --format '{{.Names}}'");
  const dbC = (ps.stdout.split("\n").find(c => c.includes("db")) || "sds-db").trim();
  const envR = await ssh.execCommand("cat /var/www/select-dance-studio/.env");
  const envL = envR.stdout.split("\n");
  const gE = k => { const l = envL.find(x => x.startsWith(k+"=")); return l ? l.split("=").slice(1).join("=").trim() : ""; };
  const DB = gE("DB_NAME"), DU = gE("DB_USER"), DP = gE("DB_PASSWORD");
  console.log("Container:", dbC, "DB:", DB);
  for (const sql of SQLS) {
    console.log("Ejecutando:", sql.substring(0, 60) + "...");
    const r = await ssh.execCommand(`docker exec ${dbC} mysql -u${DU} -p'${DP}' ${DB} -e "${sql}"`);
    if (r.stderr && !r.stderr.includes("Warning")) console.warn(r.stderr);
    console.log("OK");
  }
  const v = await ssh.execCommand(`docker exec ${dbC} mysql -u${DU} -p'${DP}' ${DB} -e "SHOW COLUMNS FROM clases_prueba LIKE 'estado';"`);
  console.log("Resultado final:", v.stdout);
  ssh.dispose();
  console.log("Migracion completada!");
}
run().catch(e => { console.error("Error:", e.message); ssh.dispose(); process.exit(1); });