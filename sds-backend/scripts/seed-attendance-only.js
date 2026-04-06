const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function seedAttendance() {
    console.log('📅 Iniciando generación exclusiva de Asistencias...');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'select_dance_db'
    });

    try {
        // 1. Obtener todas las inscripciones activas con el día de la semana del curso
        // FIX: Usar 'inscripciones_curso' en lugar de 'inscripciones'
        const [rows] = await connection.execute(`
            SELECT i.alumno_id, i.curso_id, c.dia_semana 
            FROM inscripciones_curso i
            JOIN cursos c ON i.curso_id = c.id
            WHERE i.activo = 1 AND c.activo = 1
        `);

        console.log(`🔍 Encontradas ${rows.length} inscripciones activas.`);

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const hoy = new Date();
        const diasAtras = 120; // 4 meses de historia
        let totalInserted = 0;

        for (const row of rows) {
            const { alumno_id, curso_id, dia_semana } = row;

            if (!dia_semana) continue;

            for (let d = 1; d <= diasAtras; d++) {
                const fecha = new Date();
                fecha.setDate(hoy.getDate() - d);
                const nombreDia = diasSemana[fecha.getDay()];

                // Verificar si el curso se dicta este día
                if (dia_semana.includes(nombreDia)) {
                    // Probabilidad de asistencia (85% presente)
                    const rand = Math.random();
                    let presente = 1;
                    if (rand > 0.85) presente = 0; // Ausente

                    try {
                        const formattedDate = fecha.toISOString().split('T')[0]; // YYYY-MM-DD

                        // FIX: Usar 'presente' (int) en lugar de 'estado' (string)
                        await connection.execute(`
                            INSERT INTO asistencias (alumno_id, curso_id, fecha, presente, observaciones)
                            VALUES (?, ?, ?, ?, 'Backfill Script')
                        `, [alumno_id, curso_id, formattedDate, presente]);

                        totalInserted++;
                    } catch (err) {
                        // Ignorar duplicados
                    }
                }
            }
            process.stdout.write('.');
        }

        console.log(`\n✅ Proceso terminado. Se insertaron aprox. ${totalInserted} registros de asistencia.`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

seedAttendance();
