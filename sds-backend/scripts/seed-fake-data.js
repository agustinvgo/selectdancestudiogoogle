const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configuración
const NUM_ALUMNOS = 50;
const NUM_CURSOS = 10;
const NUM_PROFESORES = 5;
const NUM_EQUIPO = 5;

// Arrays de datos falsos
const NOMBRES = ['Juan', 'Maria', 'Pedro', 'Lucia', 'Carlos', 'Ana', 'Sofia', 'Miguel', 'Valentina', 'Diego', 'Isabella', 'Mateo', 'Camila', 'Santiago', 'Martina', 'Nicolas'];
const APELLIDOS = ['Garcia', 'Martinez', 'Rodriguez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Romero', 'Fernandez', 'Torres', 'Diaz', 'Ruiz', 'Alvarez', 'Gomez', 'Benitez'];
const CALLES = ['Av. Santa Fe', 'Calle Falsa', 'Av. Corrientes', 'Av. Libertador', 'Calle 123', 'San Martin', 'Belgrano', 'Urquiza', 'Mitre', 'Rivadavia'];
const DISCIPLINAS = ['Jazz', 'Ballet', 'Urbano', 'Hip Hop', 'Contemporáneo', 'Salsa', 'Bachata', 'Tango', 'Zumba', 'Reggaeton'];
const NIVELES = ['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles', 'Baby', 'Mini', 'Junior', 'Teen', 'Senior', 'Recreative'];
const CARGOS = ['Director', 'Coordinador', 'Secretaria', 'Community Manager', 'Fotógrafo', 'Asistente'];

// Helpers
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
const generateDNI = () => getRandomInt(20000000, 59000000).toString();
const generatePhone = () => `+54911${getRandomInt(10000000, 99999999)}`;

async function seed() {
    console.log('🌱 Iniciando seeding de datos falsos...');

    const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'select_dance_db'
    };

    console.log(`🔌 Conectando a la base de datos: ${dbConfig.database} en ${dbConfig.host}...`);

    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión establecida.');
        const passwordHash = await bcrypt.hash('123456', 10);

        // 1. Crear Profesores
        console.log(`\n👨‍🏫 Creando ${NUM_PROFESORES} profesores...`);
        let profesorIds = [];
        for (let i = 0; i < NUM_PROFESORES; i++) {
            const nombre = getRandomElement(NOMBRES);
            const apellido = getRandomElement(APELLIDOS);
            const email = `prof.${nombre.toLowerCase()}.${apellido.toLowerCase()}${getRandomInt(1, 999)}@example.com`;

            try {
                const [userResult] = await connection.execute(
                    'INSERT INTO usuarios (email, password_hash, rol, nombre, apellido, activo, primer_login) VALUES (?, ?, ?, ?, ?, 1, 1)',
                    [email, passwordHash, 'profesor', nombre, apellido]
                );
                profesorIds.push(userResult.insertId);
                process.stdout.write('.');
            } catch (err) {
                // Ignorar duplicados
            }
        }
        console.log('✅ Profesores creados.');

        // 2. Crear Cursos (Asignando profesores aleatorios si existen)
        console.log(`\n📚 Creando ${NUM_CURSOS} cursos...`);
        for (let i = 0; i < NUM_CURSOS; i++) {
            const nombre = `${getRandomElement(DISCIPLINAS)} ${getRandomElement(['I', 'II', 'Exploración', 'Coreografía', 'Técnica'])}`;
            const nivel = getRandomElement(NIVELES);
            const dia = getRandomElement(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']);
            const profId = profesorIds.length > 0 ? getRandomElement(profesorIds) : null;

            const duracion = getRandomInt(60, 90);
            const horaInicio = '18:00:00';
            const [horas, minutos] = horaInicio.split(':').map(Number);
            const fechaInicio = new Date();
            fechaInicio.setHours(horas, minutos, 0);
            const fechaFin = new Date(fechaInicio.getTime() + duracion * 60000);
            const horaFin = `${fechaFin.getHours().toString().padStart(2, '0')}:${fechaFin.getMinutes().toString().padStart(2, '0')}:00`;

            try {
                await connection.execute(`
                    INSERT INTO cursos (nombre, descripcion, nivel, dia_semana, hora_inicio, hora_fin, cupo_maximo, activo, profesor_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
                `, [nombre, 'Curso generado automáticamente', nivel, dia, horaInicio, horaFin, getRandomInt(10, 30), profId]);
            } catch (err) {
                // Continuar
            }
        }
        console.log('✅ Cursos creados.');

        // 3. Crear Alumnos
        console.log(`\n👤 Creando ${NUM_ALUMNOS} alumnos...`);
        for (let i = 0; i < NUM_ALUMNOS; i++) {
            const nombre = getRandomElement(NOMBRES);
            const apellido = getRandomElement(APELLIDOS);
            const email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}${getRandomInt(1, 99999)}@example.com`;

            try {
                const [userResult] = await connection.execute(
                    'INSERT INTO usuarios (email, password_hash, rol, activo, primer_login) VALUES (?, ?, ?, 1, 1)',
                    [email, passwordHash, 'alumno']
                );
                const usuarioId = userResult.insertId;

                await connection.execute(`
                    INSERT INTO alumnos (
                        usuario_id, nombre, apellido, fecha_nacimiento, dni,
                        telefono, direccion, email_padre
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    usuarioId,
                    nombre,
                    apellido,
                    getRandomDate(new Date(2000, 0, 1), new Date(2018, 0, 1)),
                    generateDNI(),
                    generatePhone(),
                    `${getRandomElement(CALLES)} ${getRandomInt(100, 9999)}`,
                    `padre.${idGen()}@example.com`
                ]);
                process.stdout.write('.');
            } catch (err) {
            }
        }
        console.log('✅ Alumnos creados.');

        // 4. Crear Miembros de Equipo
        console.log(`\n🤝 Creando ${NUM_EQUIPO} miembros del equipo...`);
        for (let i = 0; i < NUM_EQUIPO; i++) {
            const nombre = `${getRandomElement(NOMBRES)} ${getRandomElement(APELLIDOS)}`;
            const cargo = getRandomElement(CARGOS);

            try {
                await connection.execute(
                    'INSERT INTO equipo (nombre, cargo, descripcion, activo) VALUES (?, ?, ?, 1)',
                    [nombre, cargo, 'Parte fundamental del equipo de Select Dance Studio.']
                );
                process.stdout.write('.');
            } catch (err) {
            }
        }
        console.log('✅ Equipo creado.');

        // 5. Inscripciones, Pagos y Asistencias
        console.log(`\n📝 Generando inscripciones, pagos y asistencias...`);

        // Obtener IDs y datos de cursos (incluyendo día de la semana)
        const [alumnosRows] = await connection.execute('SELECT id FROM alumnos');
        const [cursosRows] = await connection.execute('SELECT id, dia_semana FROM cursos');
        const alumnoIds = alumnosRows.map(r => r.id);

        if (alumnoIds.length > 0 && cursosRows.length > 0) {
            for (const alumnoId of alumnoIds) {
                // Inscribir a cada alumno en 1 o 2 cursos aleatorios
                const numInscripciones = getRandomInt(1, 2);
                for (let k = 0; k < numInscripciones; k++) {
                    const cursoObj = cursosRows[Math.floor(Math.random() * cursosRows.length)];
                    const cursoId = cursoObj.id;

                    // 1. Intentar Inscripción
                    try {
                        await connection.execute(
                            'INSERT INTO inscripciones (alumno_id, curso_id, fecha_inscripcion, activo) VALUES (?, ?, NOW(), 1)',
                            [alumnoId, cursoId]
                        );
                    } catch (err) {
                        // Ignorar si ya esta inscrito
                    }

                    // 2. Generar Pagos (Independiente de la inscripcion)
                    try {
                        const monto = getRandomInt(15000, 25000);
                        const estados = ['pagado', 'pagado', 'pendiente'];
                        const metodos = ['efectivo', 'transferencia', 'tarjeta'];

                        for (let mes = 0; mes < 3; mes++) {
                            const estado = estados[mes];
                            const fechaPago = estado === 'pagado' ? new Date() : null;
                            const mesPago = ['enero', 'febrero', 'marzo'][mes];

                            try {
                                await connection.execute(`
                                    INSERT INTO pagos (
                                        alumno_id, curso_id, monto, mes_correspondiente,
                                        estado, fecha_pago, metodo_pago, concepto
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                                `, [
                                    alumnoId, cursoId, monto, mesPago,
                                    estado, fechaPago,
                                    estado === 'pagado' ? getRandomElement(metodos) : null,
                                    `Cuota ${mesPago} 2024`
                                ]);
                            } catch (e) { }
                        }
                    } catch (e) { }

                    // 3. Generar Asistencias (Independiente)
                    try {
                        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                        const hoy = new Date();

                        for (let d = 0; d < 90; d++) {
                            const fecha = new Date();
                            fecha.setDate(hoy.getDate() - d);
                            const nombreDia = diasSemana[fecha.getDay()];

                            if (cursoObj.dia_semana && cursoObj.dia_semana.includes(nombreDia)) {
                                const estadoAsistencia = getRandomElement(['presente', 'presente', 'presente', 'ausente', 'justificado']);

                                try {
                                    await connection.execute(`
                                        INSERT INTO asistencias (alumno_id, curso_id, fecha, estado, observaciones)
                                        VALUES (?, ?, ?, ?, ?)
                                     `, [alumnoId, cursoId, fecha, estadoAsistencia, 'Generado masivamente']);
                                } catch (e) { }
                            }
                        }
                    } catch (e) { }
                }
                process.stdout.write('.');
            }
        }
        console.log('✅ Inscripciones, Pagos y Asistencias generados.');

        console.log('\n✨ Seeding completado exitosamente.');
        console.log(`   - Contraseña general: 123456`);

    } catch (error) {
        console.error('\n❌ Error fatal:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Desconectado.');
        }
        process.exit(0);
    }
}

function idGen() {
    return Math.floor(Math.random() * 10000);
}

seed();
