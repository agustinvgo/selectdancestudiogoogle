const db = require('../config/db');
const AsistenciasModel = require('./asistencias.model');

const DAY_INDEX = {
    domingo: 6,
    lunes: 0,
    martes: 1,
    miercoles: 2,
    jueves: 3,
    viernes: 4,
    sabado: 5
};

const normalizeDay = (value = '') => value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const parseLocalDate = (isoDate) => {
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 12));
};

const formatDate = (date) => date.toISOString().slice(0, 10);

const getTodayIso = () => {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${values.year}-${values.month}-${values.day}`;
};

const addDays = (isoDate, days) => {
    const date = parseLocalDate(isoDate);
    date.setUTCDate(date.getUTCDate() + days);
    return formatDate(date);
};

const getWeekStart = (dateValue) => {
    const safeValue = /^\d{4}-\d{2}-\d{2}$/.test(dateValue || '')
        ? dateValue
        : getTodayIso();
    const date = parseLocalDate(safeValue);
    const day = date.getUTCDay();
    const distanceToMonday = day === 0 ? -6 : 1 - day;
    date.setUTCDate(date.getUTCDate() + distanceToMonday);
    return formatDate(date);
};

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const canAccessCourse = async (user, cursoId) => {
    if (user.rol === 'admin') return true;
    if (user.rol !== 'profesor') return false;

    const [rows] = await db.query(`
        SELECT c.id
        FROM cursos c
        WHERE c.id = ?
          AND (
            c.profesor_id = ?
            OR EXISTS (
                SELECT 1 FROM curso_profesores cp
                WHERE cp.curso_id = c.id AND cp.profesor_id = ?
            )
          )
        LIMIT 1
    `, [cursoId, user.id, user.id]);
    return rows.length > 0;
};

const hasActiveEnrollment = async (alumnoId, cursoId) => {
    const [rows] = await db.query(`
        SELECT 1
        FROM inscripciones_curso
        WHERE alumno_id = ? AND curso_id = ? AND activo = 1
        LIMIT 1
    `, [alumnoId, cursoId]);
    return rows.length > 0;
};

const AgendaModel = {
    getWeekStart,

    async getWeekly(user, requestedDate) {
        const weekStart = getWeekStart(requestedDate);
        const weekEnd = addDays(weekStart, 6);
        const professorFilter = user.rol === 'profesor'
            ? `AND (
                c.profesor_id = ?
                OR EXISTS (
                    SELECT 1 FROM curso_profesores cp_filter
                    WHERE cp_filter.curso_id = c.id AND cp_filter.profesor_id = ?
                )
            )`
            : '';
        const professorParams = user.rol === 'profesor' ? [user.id, user.id] : [];

        const [courseRows] = await db.query(`
            SELECT c.id AS curso_id, c.nombre AS curso_nombre, c.dia_semana,
                   c.hora_inicio, c.hora_fin, c.cupo_maximo,
                   (SELECT GROUP_CONCAT(
                        TRIM(CONCAT_WS(' ', p.nombre, p.apellido))
                        ORDER BY cp.orden SEPARATOR ', '
                    )
                    FROM curso_profesores cp
                    INNER JOIN usuarios p ON p.id = cp.profesor_id
                    WHERE cp.curso_id = c.id) AS profesores,
                   ic.alumno_id, DATE_FORMAT(ic.fecha_inscripcion, '%Y-%m-%d') AS fecha_inscripcion,
                   u.nombre AS alumno_nombre, u.apellido AS alumno_apellido,
                   u.telefono AS alumno_telefono, u.email AS alumno_email,
                   a.email_padre
            FROM cursos c
            LEFT JOIN inscripciones_curso ic ON ic.curso_id = c.id AND ic.activo = 1
            LEFT JOIN alumnos a ON a.id = ic.alumno_id
            LEFT JOIN usuarios u ON u.id = a.usuario_id AND u.activo = 1
            WHERE c.activo = 1
              ${professorFilter}
            ORDER BY c.dia_semana, c.hora_inicio, u.apellido, u.nombre
        `, professorParams);

        const [confirmationRows, attendanceRows] = await Promise.all([
            db.query(`
                SELECT alumno_id, curso_id, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha,
                       estado, observaciones
                FROM agenda_confirmaciones
                WHERE fecha BETWEEN ? AND ?
            `, [weekStart, weekEnd]).then(([rows]) => rows),
            db.query(`
                SELECT alumno_id, curso_id, DATE_FORMAT(fecha, '%Y-%m-%d') AS fecha,
                       presente, observaciones
                FROM asistencias
                WHERE fecha BETWEEN ? AND ?
            `, [weekStart, weekEnd]).then(([rows]) => rows)
        ]);

        const confirmationMap = new Map(confirmationRows.map((row) => [
            `${row.curso_id}:${row.alumno_id}:${row.fecha}`,
            row
        ]));
        const attendanceMap = new Map(attendanceRows.map((row) => [
            `${row.curso_id}:${row.alumno_id}:${row.fecha}`,
            row
        ]));

        const days = Array.from({ length: 7 }, (_, index) => {
            const fecha = addDays(weekStart, index);
            const date = parseLocalDate(fecha);
            return {
                fecha,
                dia: new Intl.DateTimeFormat('es-AR', { weekday: 'long', timeZone: 'UTC' })
                    .format(date)
                    .replace(/^./, (letter) => letter.toUpperCase()),
                clases: []
            };
        });
        const dayMap = new Map(days.map((day) => [day.fecha, day]));
        const classMap = new Map();

        courseRows.forEach((row) => {
            const dayOffset = DAY_INDEX[normalizeDay(row.dia_semana)];
            if (dayOffset === undefined) return;

            const fecha = addDays(weekStart, dayOffset);
            const classKey = `regular:${row.curso_id}:${fecha}`;
            if (!classMap.has(classKey)) {
                const courseClass = {
                    id: classKey,
                    tipo: 'regular',
                    curso_id: row.curso_id,
                    nombre: row.curso_nombre,
                    fecha,
                    hora_inicio: row.hora_inicio,
                    hora_fin: row.hora_fin,
                    cupo_maximo: row.cupo_maximo,
                    profesores: row.profesores || 'Sin profesor',
                    alumnos: []
                };
                classMap.set(classKey, courseClass);
                dayMap.get(fecha)?.clases.push(courseClass);
            }

            if (!row.alumno_id || !row.alumno_nombre || (row.fecha_inscripcion && row.fecha_inscripcion > fecha)) return;
            const recordKey = `${row.curso_id}:${row.alumno_id}:${fecha}`;
            const confirmation = confirmationMap.get(recordKey);
            const attendance = attendanceMap.get(recordKey);
            let estado = confirmation?.estado || 'programado';
            if (attendance) estado = Number(attendance.presente) === 1 ? 'presente' : 'ausente';

            classMap.get(classKey).alumnos.push({
                tipo: 'regular',
                alumno_id: row.alumno_id,
                nombre: row.alumno_nombre,
                apellido: row.alumno_apellido || '',
                telefono: row.alumno_telefono || '',
                email: row.alumno_email || row.email_padre || '',
                estado,
                observaciones: attendance?.observaciones || confirmation?.observaciones || ''
            });
        });

        const trialFilter = user.rol === 'profesor'
            ? `AND d.curso_id IS NOT NULL AND (
                c.profesor_id = ?
                OR EXISTS (
                    SELECT 1 FROM curso_profesores cp_trial
                    WHERE cp_trial.curso_id = c.id AND cp_trial.profesor_id = ?
                )
            )`
            : '';
        const trialParams = [weekStart, weekEnd, ...professorParams];
        const [trialRows] = await db.query(`
            SELECT d.id AS disponibilidad_id, d.curso_id,
                   DATE_FORMAT(d.fecha, '%Y-%m-%d') AS fecha,
                   d.horario, COALESCE(c.nombre, d.titulo, 'Clase de prueba') AS curso_nombre,
                   (SELECT GROUP_CONCAT(
                        TRIM(CONCAT_WS(' ', p.nombre, p.apellido))
                        ORDER BY cp.orden SEPARATOR ', '
                    )
                    FROM curso_profesores cp
                    INNER JOIN usuarios p ON p.id = cp.profesor_id
                    WHERE cp.curso_id = c.id) AS profesores,
                   r.id AS clase_prueba_id, r.nombre, r.apellido,
                   r.telefono, r.email, r.estado, r.asistio, r.asistencia_estado
            FROM clases_prueba_disponibles d
            LEFT JOIN cursos c ON c.id = d.curso_id
            LEFT JOIN clases_prueba r ON r.disponibilidad_id = d.id
                AND LOWER(r.estado) NOT IN ('cancelado', 'cancelada')
            WHERE d.fecha BETWEEN ? AND ?
              ${trialFilter}
            ORDER BY d.fecha, d.horario, r.apellido, r.nombre
        `, trialParams);

        trialRows.forEach((row) => {
            const classKey = `prueba:${row.disponibilidad_id}:${row.fecha}`;
            if (!classMap.has(classKey)) {
                const trialClass = {
                    id: classKey,
                    tipo: 'prueba',
                    disponibilidad_id: row.disponibilidad_id,
                    curso_id: row.curso_id,
                    nombre: row.curso_nombre,
                    fecha: row.fecha,
                    hora_inicio: row.horario,
                    hora_fin: null,
                    profesores: row.profesores || 'Sin profesor',
                    alumnos: []
                };
                classMap.set(classKey, trialClass);
                dayMap.get(row.fecha)?.clases.push(trialClass);
            }

            if (!row.clase_prueba_id) return;
            classMap.get(classKey).alumnos.push({
                tipo: 'prueba',
                clase_prueba_id: row.clase_prueba_id,
                nombre: row.nombre,
                apellido: row.apellido || '',
                telefono: row.telefono || '',
                email: row.email || '',
                estado: row.asistencia_estado || (Number(row.asistio) === 1 ? 'presente' : 'confirmado'),
                observaciones: ''
            });
        });

        days.forEach((day) => day.clases.sort((a, b) =>
            String(a.hora_inicio || '').localeCompare(String(b.hora_inicio || ''))
        ));

        const allStudents = days.flatMap((day) => day.clases.flatMap((item) => item.alumnos));
        const today = getTodayIso();
        const uniqueStudents = new Set(allStudents
            .filter((student) => student.tipo === 'regular')
            .map((student) => student.alumno_id));

        return {
            semana_inicio: weekStart,
            semana_fin: weekEnd,
            resumen: {
                clases: days.reduce((total, day) => total + day.clases.length, 0),
                visitas_programadas: allStudents.length,
                alumnos_unicos: uniqueStudents.size,
                confirmados: allStudents.filter((student) => student.estado === 'confirmado').length,
                no_asistiran: allStudents.filter((student) => student.estado === 'no_asistira').length,
                presentes: allStudents.filter((student) => student.estado === 'presente').length,
                hoy: dayMap.get(today)?.clases.reduce((total, item) => total + item.alumnos.length, 0) || 0
            },
            dias: days
        };
    },

    async setStatus(user, data) {
        const { alumno_id, curso_id, fecha, estado, observaciones } = data;
        const validStates = ['programado', 'confirmado', 'no_asistira'];
        if (!alumno_id || !curso_id || !/^\d{4}-\d{2}-\d{2}$/.test(fecha || '') || !validStates.includes(estado)) {
            throw createHttpError('Datos de confirmación inválidos', 400);
        }
        if (!(await canAccessCourse(user, curso_id))) {
            throw createHttpError('No tienes permisos para modificar este curso', 403);
        }
        if (!(await hasActiveEnrollment(alumno_id, curso_id))) {
            throw createHttpError('El alumno no tiene una inscripción activa en este curso', 404);
        }

        if (estado === 'programado') {
            await db.query(
                'DELETE FROM agenda_confirmaciones WHERE alumno_id = ? AND curso_id = ? AND fecha = ?',
                [alumno_id, curso_id, fecha]
            );
            return true;
        }

        await db.query(`
            INSERT INTO agenda_confirmaciones
                (alumno_id, curso_id, fecha, estado, observaciones, updated_by)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                estado = VALUES(estado),
                observaciones = VALUES(observaciones),
                updated_by = VALUES(updated_by)
        `, [alumno_id, curso_id, fecha, estado, observaciones || null, user.id]);
        return true;
    },

    async setAttendance(user, data) {
        const { tipo = 'regular', presente } = data;
        if (presente === undefined) throw createHttpError('El estado de asistencia es requerido', 400);

        if (tipo === 'prueba') {
            const [rows] = await db.query(`
                SELECT r.id, d.curso_id
                FROM clases_prueba r
                INNER JOIN clases_prueba_disponibles d ON d.id = r.disponibilidad_id
                WHERE r.id = ?
                LIMIT 1
            `, [data.clase_prueba_id]);
            if (!rows.length) throw createHttpError('Clase de prueba no encontrada', 404);
            if (user.rol !== 'admin' && (!rows[0].curso_id || !(await canAccessCourse(user, rows[0].curso_id)))) {
                throw createHttpError('No tienes permisos para modificar esta clase', 403);
            }
            await db.query(
                'UPDATE clases_prueba SET asistio = ?, asistencia_estado = ? WHERE id = ?',
                [presente ? 1 : 0, presente ? 'presente' : 'ausente', data.clase_prueba_id]
            );
            return true;
        }

        const { alumno_id, curso_id, fecha } = data;
        if (!alumno_id || !curso_id || !/^\d{4}-\d{2}-\d{2}$/.test(fecha || '')) {
            throw createHttpError('Datos de asistencia inválidos', 400);
        }
        if (!(await canAccessCourse(user, curso_id))) {
            throw createHttpError('No tienes permisos para modificar este curso', 403);
        }
        if (!(await hasActiveEnrollment(alumno_id, curso_id))) {
            throw createHttpError('El alumno no tiene una inscripción activa en este curso', 404);
        }
        await AsistenciasModel.marcarAsistencia({
            alumno_id,
            curso_id,
            fecha,
            presente: presente ? 1 : 0,
            observaciones: data.observaciones || null
        });
        return true;
    }
};

module.exports = AgendaModel;
