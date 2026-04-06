require('dotenv').config();
const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();
const SSH_HOST = process.env.SSH_HOST || '187.77.62.115';
const SSH_USER = process.env.SSH_USER || 'root';
const SSH_PASSWORD = process.env.SSH_PASSWORD || 'YERkw147?N@C)?(CeW1#';

const remoteScript = `
const db = require('./src/config/db');
async function run() {
    try {
        await db.query(\\\`
            CREATE OR REPLACE VIEW vw_balance_financiero AS
            SELECT 
                m.mes, 
                m.anio,
                COALESCE(p.ingresos_pagos, 0) AS ingresos_pagos,
                0 AS ingresos_tienda,
                COALESCE(g.total_gastos, 0) AS total_gastos,
                COALESCE(p.ingresos_pagos, 0) - COALESCE(g.total_gastos, 0) AS balance_neto
            FROM (
                SELECT DISTINCT MONTH(fecha_pago) as mes, YEAR(fecha_pago) as anio FROM pagos WHERE estado = 'pagado'
                UNION
                SELECT DISTINCT MONTH(fecha) as mes, YEAR(fecha) as anio FROM gastos
            ) m
            LEFT JOIN (
                SELECT MONTH(fecha_pago) as mes, YEAR(fecha_pago) as anio, SUM(monto) as ingresos_pagos 
                FROM pagos WHERE estado = 'pagado' 
                GROUP BY YEAR(fecha_pago), MONTH(fecha_pago)
            ) p ON m.mes = p.mes AND m.anio = p.anio
            LEFT JOIN (
                SELECT MONTH(fecha) as mes, YEAR(fecha) as anio, SUM(monto) as total_gastos 
                FROM gastos 
                GROUP BY YEAR(fecha), MONTH(fecha)
            ) g ON m.mes = g.mes AND m.anio = g.anio;
        \\\`);

        await db.query(\\\`
            CREATE OR REPLACE VIEW vw_retencion_alumnos AS
            SELECT 
                COALESCE(ROUND((COUNT(CASE WHEN u.activo = 1 THEN 1 END) / NULLIF(COUNT(*), 0)) * 100, 2), 100.00) AS retencion_mensual,
                COUNT(CASE WHEN u.activo = 1 THEN 1 END) AS inscritos_activos,
                COUNT(CASE WHEN u.activo = 0 THEN 1 END) AS dados_de_baja,
                COALESCE(ROUND((COUNT(CASE WHEN u.activo = 0 THEN 1 END) / NULLIF(COUNT(*), 0)) * 100, 2), 0.00) AS tasa_bajas
            FROM alumnos a
            JOIN usuarios u ON a.usuario_id = u.id;
        \\\`);
        console.log("Vistas creadas correctamente usando db.js.");
        process.exit(0);
    } catch(e) {
        console.error("Error remoto:", e);
        process.exit(1);
    }
}
run();
`;

async function fixDatabase() {
    try {
        await ssh.connect({
            host: SSH_HOST,
            username: SSH_USER,
            password: SSH_PASSWORD
        });
        console.log("Conectado. Aplicando Vistas a la Base de Datos de Producción...");
        
        await ssh.execCommand(`echo "${remoteScript.replace(/"/g, '\\"').replace(/\$/g, '\\$')}" > /var/www/sds-backend/fix-views.js`);
        
        const result = await ssh.execCommand('node fix-views.js', { cwd: '/var/www/sds-backend' });
        
        console.log("STDOUT:", result.stdout);
        console.error("STDERR:", result.stderr);
        
        await ssh.execCommand('pm2 restart sds-backend');
        console.log("¡Vistas aplicadas y backend reiniciado!");
    } catch (error) {
        console.error("Error SSH:", error);
    } finally {
        ssh.dispose();
    }
}

fixDatabase();
