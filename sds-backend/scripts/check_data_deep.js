const db = require('../src/config/db');

async function checkData() {
    try {
        console.log('--- DATA CHECK EXTENDED ---');

        // Check for paid payments in last 6 months (for Revenue Chart)
        const [paidPayments] = await db.query(`
            SELECT COUNT(*) as count, SUM(monto) as total 
            FROM pagos 
            WHERE estado = 'pagado' 
            AND fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        `);
        console.log('Paid Payments (Last 6 Months):', paidPayments[0].count, 'Total:', paidPayments[0].total);

        // Check for attendance in last 3 months (for Attendance Charts)
        const [recentAttendance] = await db.query(`
            SELECT COUNT(*) as count 
            FROM asistencias 
            WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
        `);
        console.log('Attendance (Last 3 Months):', recentAttendance[0].count);

        // Check for active students
        const [activeStudents] = await db.query(`
            SELECT COUNT(*) as count 
            FROM alumnos a
            JOIN usuarios u ON a.usuario_id = u.id
            WHERE u.activo = 1
        `);
        console.log('Active Students:', activeStudents[0].count);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkData();
