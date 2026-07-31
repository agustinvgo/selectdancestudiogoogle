const cron = require('node-cron');
const db = require('../../config/db');
const PushService = require('../push.service');

const TIMEZONE = 'America/Argentina/Buenos_Aires';
const REMINDER_MINUTES = 5;

const normalizeDay = (value = '') => value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const getZonedParts = (date) => {
    const parts = new Intl.DateTimeFormat('es-AR', {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

    return {
        date: `${values.year}-${values.month}-${values.day}`,
        time: `${values.hour}:${values.minute}`,
        weekday: normalizeDay(values.weekday)
    };
};

const extractStartTime = (schedule = '') => {
    const match = String(schedule).match(/(?:^|\s)(\d{1,2}):(\d{2})/);
    if (!match) return null;
    return `${match[1].padStart(2, '0')}:${match[2]}`;
};

const ClasesCron = {
    init() {
        cron.schedule('* * * * *', async () => {
            try {
                await this.processUpcomingClasses();
            } catch (error) {
                console.error('[CRON-CLASES] Error procesando recordatorios push:', error);
            }
        }, { timezone: TIMEZONE });
    },

    async findUpcomingEvents(target) {
        const [courses, trialClasses] = await Promise.all([
            db.query(`
                SELECT id, nombre, dia_semana,
                       TIME_FORMAT(hora_inicio, '%H:%i') AS hora_inicio
                FROM cursos
                WHERE activo = 1
                  AND TIME_FORMAT(hora_inicio, '%H:%i') = ?
            `, [target.time]).then(([rows]) => rows),
            db.query(`
                SELECT d.id, d.horario,
                       COALESCE(c.nombre, d.titulo, 'Clase de prueba') AS nombre
                FROM clases_prueba_disponibles d
                LEFT JOIN cursos c ON c.id = d.curso_id
                WHERE d.fecha = ?
                  AND EXISTS (
                      SELECT 1
                      FROM clases_prueba r
                      WHERE r.disponibilidad_id = d.id
                        AND LOWER(r.estado) NOT IN ('cancelado', 'cancelada')
                  )
            `, [target.date]).then(([rows]) => rows)
        ]);

        const regularEvents = courses
            .filter((course) => normalizeDay(course.dia_semana) === target.weekday)
            .map((course) => ({
                key: `curso:${course.id}:${target.date}:${target.time}`,
                type: 'curso',
                id: course.id,
                name: course.nombre,
                date: target.date,
                time: target.time,
                scheduledAt: `${target.date} ${target.time}:00`
            }));

        const trialEvents = trialClasses
            .filter((trial) => extractStartTime(trial.horario) === target.time)
            .map((trial) => ({
                key: `clase_prueba:${trial.id}:${target.date}:${target.time}`,
                type: 'clase_prueba',
                id: trial.id,
                name: trial.nombre,
                date: target.date,
                time: target.time,
                scheduledAt: `${target.date} ${target.time}:00`
            }));

        return [...regularEvents, ...trialEvents];
    },

    async processUpcomingClasses(now = new Date()) {
        const target = getZonedParts(new Date(now.getTime() + REMINDER_MINUTES * 60 * 1000));
        const events = await this.findUpcomingEvents(target);

        const results = [];
        for (const event of events) {
            const result = await PushService.sendClassReminder(event);
            results.push({ event, result });
            if (!result.duplicate) {
                console.log(`[CRON-CLASES] ${event.name}: ${result.success}/${result.recipients} avisos enviados.`);
            }
        }
        return results;
    }
};

ClasesCron.getZonedParts = getZonedParts;
ClasesCron.extractStartTime = extractStartTime;

module.exports = ClasesCron;
