const db = require('../src/config/db');

async function checkData() {
    try {
        console.log('--- DATA CHECK ---');

        const [alumnos] = await db.query('SELECT COUNT(*) as count FROM alumnos');
        console.log('Alumnos:', alumnos[0].count);

        const [pagos] = await db.query('SELECT COUNT(*) as count FROM pagos');
        console.log('Pagos:', pagos[0].count);

        const [asistencias] = await db.query('SELECT COUNT(*) as count FROM asistencias');
        console.log('Asistencias (Total):', asistencias[0].count);

        const [asistenciasRecent] = await db.query('SELECT COUNT(*) as count FROM asistencias WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)');
        console.log('Asistencias (Last 3 Months):', asistenciasRecent[0].count);

        const [cursos] = await db.query('SELECT COUNT(*) as count FROM cursos');
        console.log('Cursos:', cursos[0].count);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkData();
