require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetDatabase() {
    if (process.env.NODE_ENV === 'production') {
        console.error('❌ ERROR CRÍTICO: No se puede ejecutar este script en el entorno de PRODUCCIÓN.');
        process.exit(1);
    }
    console.log('🗑️  Iniciando reseteo de base de datos...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'sds_db'
    });

    try {
        console.log('🔌 Conectado a la base de datos.');

        // 1. Obtener todas las tablas
        const [rows] = await connection.query('SHOW FULL TABLES WHERE Table_Type = "BASE TABLE"');
        const tables = rows.map(row => Object.values(row)[0]);

        if (tables.length === 0) {
            console.log('⚠️  No se encontraron tablas para limpiar.');
        } else {
            console.log(`📋 Encontradas ${tables.length} tablas.`);

            // 2. Desactivar FK checks
            await connection.query('SET FOREIGN_KEY_CHECKS = 0');

            // 3. Truncar todas las tablas
            for (const table of tables) {
                try {
                    await connection.query(`TRUNCATE TABLE ${table}`);
                    process.stdout.write(`✅ Tabla ${table} limpiada.\r`);
                } catch (err) {
                    console.error(`❌ Error limpiando tabla ${table}:`, err.message);
                }
            }
            console.log('\n✨ Todas las tablas han sido limpiadas.');

            // 4. Reactivar FK checks
            await connection.query('SET FOREIGN_KEY_CHECKS = 1');
        }

        // 5. Crear Admin por defecto
        console.log('👤 Creando administrador por defecto...');
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await connection.query(`
            INSERT INTO usuarios (email, password_hash, rol, activo, primer_login, created_at)
            VALUES (?, ?, 'admin', 1, 1, NOW())
        `, ['admin@selectdance.com', hashedPassword]);

        console.log('✅ Admin creado: admin@selectdance.com pass: admin123');

    } catch (error) {
        console.error('❌ Error durante el reseteo:', error);
    } finally {
        await connection.end();
        console.log('👋 Conexión cerrada.');
        process.exit();
    }
}

resetDatabase();
