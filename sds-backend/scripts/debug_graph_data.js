const db = require('../src/config/db');

async function debugGraphs() {
    try {
        console.log('--- DEBUG GRAPH DATA (RETRY) ---');

        // 1. REVENUE CHART
        console.log('\n[REVENUE CHARTS] Checking payments...');
        const [ingresosGrouped] = await db.query(`
             SELECT 
                DATE_FORMAT(fecha_pago, '%Y-%m') as mes,
                MONTHNAME(fecha_pago) as nombre_mes,
                SUM(monto) as total
            FROM pagos
            WHERE estado = 'pagado'
                AND fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(fecha_pago, '%Y-%m'), MONTHNAME(fecha_pago)
            ORDER BY mes ASC
        `);
        console.log('Revenue Grouped (API Result):', ingresosGrouped);


        // 2. GROWTH CHART (Fixed column created_at)
        console.log('\n[GROWTH CHART] Checking students...');
        const [nuevosAlumnos] = await db.query(`
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as mes,
                COUNT(*) as nuevos_alumnos
            FROM alumnos
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY mes ASC
        `);
        console.log('New Students Grouped (API Result):', nuevosAlumnos);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

debugGraphs();
