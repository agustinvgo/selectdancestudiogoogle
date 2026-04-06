const db = require('../src/config/db');

async function migrate() {
    try {
        console.log('Adding nombre_padre column to alumnos table...');
        await db.query(`
            ALTER TABLE alumnos 
            ADD COLUMN nombre_padre VARCHAR(255) NULL AFTER telefono
        `);
        console.log('Migration successful!');
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists, skipping.');
        } else {
            console.error('Migration failed:', error);
        }
    } finally {
        process.exit();
    }
}

migrate();
