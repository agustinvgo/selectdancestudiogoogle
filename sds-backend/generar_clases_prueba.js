const db = require('./src/config/db');

async function checkDateExistance(cursoId, fecha, horario) {
    const [rows] = await db.query(
        'SELECT id FROM clases_prueba_disponibles WHERE curso_id = ? AND fecha = ? AND horario = ?',
        [cursoId, fecha, horario]
    );
    return rows.length > 0;
}

function getNextDayOfWeek(date, dayOfWeekNumber) {
    const resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (7 + dayOfWeekNumber - date.getDay()) % 7);
    return resultDate;
}

const dayMap = {
    'lunes': 1,
    'martes': 2,
    'miercoles': 3,
    'jueves': 4,
    'viernes': 5,
    'sabado': 6,
    'domingo': 0
};

function normalizeDayName(dayStr) {
    return dayStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

async function run() {
    try {
        console.log('🔄 Extrayendo cursos activos...');
        const [cursos] = await db.query('SELECT id, nombre, dia_semana, hora_inicio FROM cursos WHERE activo = 1 AND dia_semana IS NOT NULL AND dia_semana != ""');
        
        console.log(`Encontrados ${cursos.length} cursos formales con día asignado.`);
        
        let insertedCount = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const semanasAGenerar = 4;

        for (const curso of cursos) {
            const diasSplit = curso.dia_semana.split(/[\s,-y,Y,e,E]+/);
            
            for (let d of diasSplit) {
                const normalizedDia = normalizeDayName(d);
                const diaNumber = dayMap[normalizedDia];
                
                if (diaNumber !== undefined) {
                    for (let w = 0; w < semanasAGenerar; w++) {
                        let baseDate = new Date(today);
                        baseDate.setDate(baseDate.getDate() + (w * 7));
                        const claseDate = getNextDayOfWeek(baseDate, diaNumber);
                        
                        if (claseDate < today) {
                            claseDate.setDate(claseDate.getDate() + 7);
                        }

                        const fechaSQL = claseDate.toISOString().split('T')[0];
                        const horarioCorto = curso.hora_inicio.slice(0, 5);
                        
                        const existe = await checkDateExistance(curso.id, fechaSQL, horarioCorto);
                        
                        if (!existe) {
                            await db.query(
                                'INSERT INTO clases_prueba_disponibles (curso_id, fecha, horario, cupos, descripcion, titulo) VALUES (?, ?, ?, ?, ?, ?)',
                                [curso.id, fechaSQL, horarioCorto, 10, 'Generado Automáticamente del Curso Formal', curso.nombre]
                            );
                            console.log(`✅ Agregado: ${curso.nombre} - ${fechaSQL} a las ${horarioCorto}`);
                            insertedCount++;
                        }
                    }
                } else if (normalizedDia.length > 0) {
                    console.log(`⚠️ No se reconoció el formato del día: "${d}" (normalizado a "${normalizedDia}") para el curso ${curso.nombre}`);
                }
            }
        }

        console.log(`\n🎉 Finalizado! Se crearon ${insertedCount} nuevas clases de prueba.`);
        process.exit(0);

    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

run();
