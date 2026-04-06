const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '../.env' });

const NUM_STUDENTS = 2000; // Total to reach
const BATCH_SIZE = 100;

async function runLoadTest() {
    console.log('🚀 Iniciando Prueba de Carga...');

    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'select_dance_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    try {
        const connection = await pool.getConnection();
        console.log('✅ Conectado a la base de datos');

        // 1. Check current count
        const [rows] = await connection.query('SELECT COUNT(*) as count FROM alumnos');
        const currentCount = rows[0].count;
        console.log(`📊 Alumnos actuales: ${currentCount}`);

        const toCreate = Math.max(0, NUM_STUDENTS - currentCount);
        console.log(`📝 Se crearán ${toCreate} alumnos nuevos...`);

        if (toCreate > 0) {
            const passwordHash = await bcrypt.hash('password123', 10);

            // Prepare batches
            let created = 0;
            while (created < toCreate) {
                const batch = Math.min(BATCH_SIZE, toCreate - created);
                const userValues = [];
                const alumnoValues = [];

                // We need to insert users first to get IDs, but bulk insert makes getting IDs tricky mapping 1:1 without stored procs or complex locking.
                // For simplified load testing, we'll loop in smaller chunks or just do one-by-one in parallel limits if bulk is too hard.
                // ACTUALLY, let's just insert one by one in parallel promises for simplicity of ID linking, 
                // or use a stored procedure. 
                // Better yet, for load testing 1000 users, mapped promises of size 50 is fine.

                const promises = [];
                for (let i = 0; i < batch; i++) {
                    promises.push((async () => {
                        const email = `loadtest_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`;

                        // Insert Usuario
                        const [uRes] = await connection.query(
                            'INSERT INTO usuarios (nombre, apellido, email, password_hash, rol, activo) VALUES (?, ?, ?, ?, ?, ?)',
                            ['Test', `User${created + i}`, email, passwordHash, 'alumno', 1]
                        );
                        const userId = uRes.insertId;

                        // Insert Alumno
                        await connection.query(
                            `INSERT INTO alumnos (usuario_id, nombre, apellido, telefono, dni, direccion) 
                             VALUES (?, ?, ?, ?, ?, ?)`,
                            [userId, 'Test', `User${created + i}`, '123456789', `DNI${Date.now()}${i}`, 'Calle Falsa 123']
                        );
                    })());
                }

                await Promise.all(promises);
                created += batch;
                process.stdout.write(`\rCreating... ${created}/${toCreate}`);
            }
            console.log('\n✅ Carga de datos completada.');
        }

        // 2. Measure API Performance (Simulation)
        // Since we are in a script, we can simulate the DB Query time for "GetAll" which is the heavy part.
        console.log('\n⏱️  Midiendo rendimiento de consulta DB (GetAll)...');

        const start = performance.now();
        const [alumnos] = await connection.query(`
            SELECT a.*, u.email as usuario_email, u.rol as usuario_rol, u.activo as usuario_activo 
            FROM alumnos a 
            JOIN usuarios u ON a.usuario_id = u.id
        `);
        const end = performance.now();

        console.log(`📦 Registros recuperados: ${alumnos.length}`);
        console.log(`⏱️  Tiempo de consulta DB: ${(end - start).toFixed(2)}ms`);

        if (alumnos.length > 0) {
            console.log(`El tamaño aproximado de respuesta JSON sería: ${(JSON.stringify(alumnos).length / 1024).toFixed(2)} KB`);
        }

        // 3. Recomendaciones based on findings
        console.log('\n🔍 ANÁLISIS PRELIMINAR:');
        if ((end - start) > 200) {
            console.log('⚠️  La consulta DB es lenta (>200ms). Se recomienda paginación.');
        } else {
            console.log('✅ La consulta DB es rápida.');
        }

        if (alumnos.length > 500) {
            console.log('⚠️  Volumen de datos alto. El frontend sufrirá renderizando >500 filas sin virtualización o paginación.');
        }

    } catch (err) {
        console.error('❌ Error:', err);
    } finally {
        await pool.end();
    }
}

runLoadTest();
