const db = require('../src/config/db');

async function fixPaymentMethods() {
    try {
        console.log('--- FIXING PAYMENT METHODS ---');

        // 1. Copy metodo_pago to metodo_pago_realizado if null
        const [result1] = await db.query(`
            UPDATE pagos 
            SET metodo_pago_realizado = metodo_pago 
            WHERE estado = 'pagado' 
            AND metodo_pago_realizado IS NULL
            AND metodo_pago IS NOT NULL
        `);
        console.log(`Updated ${result1.affectedRows} from metodo_pago.`);

        // 2. Default to 'Efectivo' if both are null (common case for old manual payments)
        const [result2] = await db.query(`
            UPDATE pagos 
            SET metodo_pago_realizado = 'Efectivo'
            WHERE estado = 'pagado' 
            AND metodo_pago_realizado IS NULL
        `);
        console.log(`Updated ${result2.affectedRows} to default 'Efectivo'.`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixPaymentMethods();
