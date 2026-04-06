const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'select_dance_db'
    });

    const [alumnos] = await conn.execute('SELECT COUNT(*) as c FROM alumnos');
    const [asistencias] = await conn.execute('SELECT COUNT(*) as c FROM asistencias');
    const [pagos] = await conn.execute('SELECT COUNT(*) as c FROM pagos');

    console.log(`Alumnos: ${alumnos[0].c}`);
    console.log(`Asistencias: ${asistencias[0].c}`);
    console.log(`Pagos: ${pagos[0].c}`);
    await conn.end();
}
check();
