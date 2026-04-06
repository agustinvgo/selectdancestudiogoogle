const db = require('../src/config/db');

async function fixPaymentDates() {
    try {
        console.log('--- FIXING MISSING PAYMENT DATES ---');

        // Update payments that are 'pagado' but have NULL fecha_pago
        // We'll set it to fecha_vencimiento as a reasonable fallback, or updated_at if we had it (we don't track updated_at usually)
        // Or simply CURDATE() to make them appear in this month's stats.
        // Let's use CURDATE() for visibility NOW as requested by user.

        const [result] = await db.query(`
            UPDATE pagos 
            SET fecha_pago = CURDATE() 
            WHERE estado = 'pagado' 
            AND fecha_pago IS NULL
        `);

        console.log(`Updated ${result.affectedRows} payments with missing date.`);

        // Verify current stats
        const [paidPayments] = await db.query(`
            SELECT COUNT(*) as count 
            FROM pagos 
            WHERE estado = 'pagado' 
            AND fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        `);
        console.log('Paid Payments (Last 6 Months) AFTER FIX:', paidPayments[0].count);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixPaymentDates();
