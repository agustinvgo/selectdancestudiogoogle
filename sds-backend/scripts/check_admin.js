const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'select_dance_studio'
};

async function checkAdmin() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Connectado a DB');

        const [rows] = await connection.query('SELECT * FROM usuarios WHERE email = ?', ['admin@selectdance.com']);

        if (rows.length > 0) {
            console.log('Usuario admin existe. ID:', rows[0].id);
            // Update password to be sure
            const hash = await bcrypt.hash('admin123', 10);
            await connection.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [hash, rows[0].id]);
            console.log('Password actualizado a admin123');
        } else {
            console.log('Usuario admin NO existe. Creando...');
            const hash = await bcrypt.hash('admin123', 10);
            await connection.query(
                'INSERT INTO usuarios (email, password_hash, rol, activo, primer_login) VALUES (?, ?, ?, ?, ?)',
                ['admin@selectdance.com', hash, 'admin', 1, 0]
            );
            console.log('Usuario admin creado.');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        if (connection) await connection.end();
    }
}

checkAdmin();
