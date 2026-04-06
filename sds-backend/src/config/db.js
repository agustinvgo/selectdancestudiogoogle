/**
 * @file db.js
 * @description Configuración de la conexión a la base de datos MySQL.
 * Utiliza 'mysql2' con asincronismo (promises) y un pool de conexiones para mayor
 * rendimiento en entornos de alta concurrencia.
 */
const mysql = require('mysql2');
require('dotenv').config();

// Crear pool de conexiones con las variables de entorno
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'select_dance_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convertir a promesas
const promisePool = pool.promise();

// Verificar conexión
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
    process.exit(1);
  }
  console.log('✅ Conexión exitosa a MySQL - Base de datos:', process.env.DB_NAME);
  connection.release();
});

module.exports = promisePool;
