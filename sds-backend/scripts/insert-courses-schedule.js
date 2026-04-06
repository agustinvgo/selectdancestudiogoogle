const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const COURSES = [
    { nombre: 'Technique Foundations', dia_semana: 'Lunes', hora_inicio: '16:30:00', hora_fin: '17:30:00' },
    { nombre: 'Soloist Coaching', dia_semana: 'Lunes', hora_inicio: '17:30:00', hora_fin: '18:30:00' },
    { nombre: 'Stage Development', dia_semana: 'Martes', hora_inicio: '17:30:00', hora_fin: '18:30:00' },
    { nombre: 'Academic Technique', dia_semana: 'Miércoles', hora_inicio: '16:30:00', hora_fin: '17:30:00' },
    { nombre: 'Acro Technique', dia_semana: 'Miércoles', hora_inicio: '17:30:00', hora_fin: '18:30:00' },
    { nombre: 'Femme', dia_semana: 'Miércoles', hora_inicio: '19:00:00', hora_fin: '20:00:00' },
    { nombre: 'Flamenco', dia_semana: 'Miércoles', hora_inicio: '20:00:00', hora_fin: '21:00:00' },
    { nombre: 'Conditioning for Dancers', dia_semana: 'Jueves', hora_inicio: '17:00:00', hora_fin: '19:00:00' },
    { nombre: 'Heels', dia_semana: 'Jueves', hora_inicio: '20:00:00', hora_fin: '21:00:00' },
    { nombre: 'Soloist Coaching', dia_semana: 'Viernes', hora_inicio: '16:30:00', hora_fin: '17:30:00' },
    { nombre: 'Conditioning for Dancers', dia_semana: 'Viernes', hora_inicio: '17:00:00', hora_fin: '19:00:00' },
    { nombre: 'Teen Training', dia_semana: 'Viernes', hora_inicio: '18:30:00', hora_fin: '20:00:00' },
    { nombre: 'Acro Technique', dia_semana: 'Sábado', hora_inicio: '10:00:00', hora_fin: '11:00:00' },
    { nombre: 'Technique Foundations', dia_semana: 'Sábado', hora_inicio: '11:00:00', hora_fin: '12:00:00' },
    { nombre: 'Select Teen Company', dia_semana: 'Sábado', hora_inicio: '16:30:00', hora_fin: '18:30:00' }
];

async function insertCourses() {
    console.log('🚀 Iniciando inserción de cursos desde el cronograma...');

    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'select_dance_db'
    };

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión establecida.');

        for (const curso of COURSES) {
            console.log(`📝 Insertando: ${curso.nombre} (${curso.dia_semana} ${curso.hora_inicio})`);

            await connection.execute(`
                INSERT INTO cursos (
                    nombre, descripcion, nivel, categoria, tipo, dia_semana, 
                    hora_inicio, hora_fin, cupo_maximo, activo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            `, [
                curso.nombre,
                'Agregado desde cronograma oficial.',
                JSON.stringify([]),
                JSON.stringify([]),
                JSON.stringify([]),
                curso.dia_semana,
                curso.hora_inicio,
                curso.hora_fin,
                20 // Cupo por defecto
            ]);
        }

        console.log('\n✨ Todos los cursos han sido insertados exitosamente.');
    } catch (error) {
        console.error('\n❌ Error durante la inserción:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada.');
        }
    }
}

insertCourses();
