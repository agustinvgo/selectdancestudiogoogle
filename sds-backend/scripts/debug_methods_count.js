const db = require('../src/config/db');

async function checkPaymentMethods() {
    try {
        console.log('--- CHECKING PAYMENT METHODS BREAKDOWN ---');
        const [rows] = await db.query(`
            SELECT metodo_pago_realizado, COUNT(*) as count 
            FROM pagos 
            WHERE estado = 'pagado' 
            GROUP BY metodo_pago_realizado
        `);
        console.table(rows);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkPaymentMethods();
