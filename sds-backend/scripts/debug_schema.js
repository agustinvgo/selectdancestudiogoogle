const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function check() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'select_dance_db'
    });

    try {
        const [rows] = await pool.query('DESCRIBE alumnos');
        console.log(rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
check();
