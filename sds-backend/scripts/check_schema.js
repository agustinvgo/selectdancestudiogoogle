const db = require('../src/config/db');

async function checkSchema() {
    try {
        console.log('--- SCHEMA CHECK ---');

        const [alumnos] = await db.query('SELECT * FROM alumnos LIMIT 1');
        console.log('Alumnos Keys:', alumnos.length > 0 ? Object.keys(alumnos[0]) : 'No data');

        const [pagos] = await db.query('SELECT * FROM pagos LIMIT 1');
        console.log('Pagos Keys:', pagos.length > 0 ? Object.keys(pagos[0]) : 'No data');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSchema();
