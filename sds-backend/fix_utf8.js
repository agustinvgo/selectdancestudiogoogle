require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'select_dance_db',
            charset: 'utf8mb4'
        });

        console.log('Conectado a la BD. Corrigiendo codificación...');

        // 1. Arreglar el system_prompt
        await db.query(
            `UPDATE bot_config SET valor = ? WHERE clave = 'system_prompt'`,
            ['Eres el asistente virtual oficial de Select Dance Studio, una academia de danza moderna de alto rendimiento. Tu rol es responder consultas de alumnos y padres con tono profesional, amable y entusiasta. Usa emojis ocasionalmente 💃🕺. Basa TODAS tus respuestas estrictamente en la base de conocimiento provista. Si te preguntan algo fuera de tu conocimiento, ofrece transferir la consulta a la administración o pide que dejen el mensaje.']
        );

        // 2. Limpiar la tabla de conocimiento
        await db.query('TRUNCATE TABLE bot_knowledge');

        // 3. Re-insertar con UTF-8 nativo
        const conocimientos = [
            ['Horarios de Lunes y Martes', 'Los días Lunes dictamos "Technique Foundations" de 16:30 a 17:30 (Foco: Pre-Competitive) y "Soloist Coaching" de 17:30 a 18:30 (Foco: Competitive). Los días Martes tenemos "Stage Development" de 17:30 a 18:30 (Recreativo/Pre-Competitivo).', 1],
            ['Horarios de Miércoles', 'Los días Miércoles las clases son: "Technique Foundation" (16:30-17:30), "Acro Technique" (17:30-18:30) para nivel competitivo, "Femme" (19:00-20:00) y "Flamenco" (20:00-21:00) de nivel recreativo.', 1],
            ['Horarios de Jueves y Viernes', 'Los días Jueves contamos con "Conditioning for Dancers" (17:00-19:00) y "Heels" (20:00-21:00). Los Viernes dictamos "Soloist Coaching" (16:30-17:30) y "Teen Training" excluyente para grupo TEEN (18:30-20:00).', 1],
            ['Horarios de Sábados', 'Los Sábados son de mucha actividad competitiva: "Acro Technique" (10:00-11:00), "Technique Foundations" (11:00-12:00) y ensayo oficial del "Select Teen Company" de 15:30 a 17:00.', 1],
            ['Niveles y Programas de Danza', 'En Select Dance Studio dividimos las clases en tres enfoques: 1) Recreative (Recreativo): Para disfrutar y aprender sin presión (ej. Heels, Femme, Flamenco). 2) Pre-Competitive: Preparación intensiva para futuras competencias. 3) Competitive: Alto rendimiento y exigencia para bailarines de elite (ej. Soloist Coaching, Acro Technique, Teen Company).', 1],
            ['Pagos, Mensualidades y Matrícula', 'Para ser alumno regular, se abona una matrícula anual inicial. Las mensualidades o cuotas deben abonarse del 1 al 10 de cada mes. Los medios de pago aceptados los coordina la administración central. Las cuotas vencidas tienen un recargo automático. Contamos con descuentos por planes semestrales o grupos familiares.', 1],
            ['Normativa de Vestuario y Uniforme', 'Todos los alumnos de grupos "Pre-Competitive" y "Competitive" deben asistir obligatoriamente a los ensayos y clases de técnica con el uniforme oficial del estudio, pelo recogido, sin accesorios colgantes y calzado/maquillaje indicado para su disciplina.', 1],
            ['Información de Clases de Prueba', '¡Siempre recibimos a nuevos talentos! Las clases de prueba tienen un costo de $30.000. Ese monto se abonará por adelantado, pero si el alumno decide inscribirse oficialmente en la escuela dentro de ese mismo mes, los $30.000 se descuentan del valor total de la matrícula inicial. Se deben agendar con anticipación indicando nombre, edad y disciplina.', 1],
            ['Eventos y Presentaciones', 'A lo largo del año participamos en competencias regionales y cerramos con una Gala Final. Los eventos requieren inscripción temprana y abono extra para derecho a escenario, trajes coreográficos y traslados. La asistencia a ensayos previos es 100% obligatoria para poder subir al escenario.', 1]
        ];

        for (const c of conocimientos) {
            await db.query(
                'INSERT INTO bot_knowledge (tema, contenido, activo) VALUES (?, ?, ?)',
                c
            );
        }

        console.log('¡Textos inyectados correctamente con UTF-8!');
        await db.end();
    } catch (e) {
        console.error('Error:', e);
    }
})();
