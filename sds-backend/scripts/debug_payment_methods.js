const db = require('../src/config/db');

async function checkPaymentMethods() {
    try {
        console.log('--- CHECKING PAYMENT METHODS ---');

        const [rows] = await db.query(`
            SELECT id, monto, fecha_pago, metodo_pago, metodo_pago_realizado 
            FROM pagos 
            WHERE estado = 'pagado' 
            LIMIT 10
        `);
        console.table(rows);

        const [stats] = await db.query(`
            SELECT 
                COALESCE(metodo_pago_realizado, 'No especificado') as metodo,
                COUNT(*) as cantidad,
                SUM(monto) as total
            FROM pagos
            WHERE estado = 'pagado'
                AND fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
            GROUP BY metodo_pago_realizado
        `);
        console.log('Stats Result:', stats);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkPaymentMethods();
