const db = require('../config/db');

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const AsistenciasModel = {
    async canManageCourse(user, cursoId, executor = db) {
        if (user?.rol === 'admin') return true;
        if (user?.rol !== 'profesor') return false;

        const [rows] = await executor.query(`
            SELECT c.id
            FROM cursos c
            WHERE c.id = ?
              AND (
                c.profesor_id = ?
                OR EXISTS (
                    SELECT 1
                    FROM curso_profesores cp
                    WHERE cp.curso_id = c.id AND cp.profesor_id = ?
                )
              )
            LIMIT 1
        `, [cursoId, user.id, user.id]);
        return rows.length > 0;
    },

    async validateAttendanceScope(user, asistencias, executor = db) {
        if (!Array.isArray(asistencias) || asistencias.length === 0) return true;

        const courseIds = [...new Set(asistencias.map((item) => Number(item.curso_id)))];
        const studentIds = [...new Set(asistencias.map((item) => Number(item.alumno_id)))];

        if (user?.rol !== 'admin') {
            if (user?.rol !== 'profesor') {
                throw createHttpError('No tienes permisos para registrar asistencias', 403);
            }
            const [allowedCourses] = await executor.query(`
                SELECT c.id
                FROM cursos c
                WHERE c.id IN (?)
                  AND (
                    c.profesor_id = ?
                    OR EXISTS (
                        SELECT 1
                        FROM curso_profesores cp
                        WHERE cp.curso_id = c.id AND cp.profesor_id = ?
                    )
                  )
            `, [courseIds, user.id, user.id]);
            const allowedIds = new Set(allowedCourses.map((course) => Number(course.id)));
            if (courseIds.some((courseId) => !allowedIds.has(courseId))) {
                throw createHttpError('No tienes permisos para modificar uno de estos cursos', 403);
            }
        }

        const [enrollments] = await executor.query(`
            SELECT alumno_id, curso_id
            FROM inscripciones_curso
            WHERE activo = 1
              AND alumno_id IN (?)
              AND curso_id IN (?)
        `, [studentIds, courseIds]);
        const activePairs = new Set(enrollments.map((row) => `${row.alumno_id}:${row.curso_id}`));
        const invalidEnrollment = asistencias.some((item) =>
            !activePairs.has(`${Number(item.alumno_id)}:${Number(item.curso_id)}`)
        );
        if (invalidEnrollment) {
            throw createHttpError('Uno de los alumnos no tiene una inscripción activa en el curso indicado', 400);
        }

        return true;
    },

    // Asistencias de un alumno con filtros
    async findByAlumno(alumnoId, mes = null, anio = null) {
        try {
            let query = `
        SELECT a.id, a.alumno_id, a.curso_id,
               DATE_FORMAT(a.fecha, '%Y-%m-%d') AS fecha,
               a.presente, a.observaciones, a.created_at,
               c.nombre as curso_nombre
        FROM asistencias a
        INNER JOIN cursos c ON a.curso_id = c.id
        WHERE a.alumno_id = ?
      `;
            const params = [alumnoId];

            if (mes && anio) {
                query += ' AND MONTH(a.fecha) = ? AND YEAR(a.fecha) = ?';
                params.push(mes, anio);
            }

            query += ' ORDER BY a.fecha DESC';

            const [rows] = await db.query(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Lista de asistencia de un curso en una fecha específica
    async findByCurso(cursoId, fecha) {
        try {
            const [rows] = await db.query(`
        SELECT a.id, a.presente, a.observaciones, al.id as alumno_id,
               u.nombre as alumno_nombre, u.apellido as alumno_apellido,
               u.telefono as alumno_telefono, al.email_padre as alumno_email
        FROM alumnos al
        INNER JOIN usuarios u ON al.usuario_id = u.id
        INNER JOIN inscripciones_curso ic ON al.id = ic.alumno_id
        LEFT JOIN asistencias a ON a.alumno_id = al.id 
          AND a.curso_id = ? AND a.fecha = ?
        WHERE ic.curso_id = ? AND ic.activo = 1
        ORDER BY u.apellido, u.nombre
      `, [cursoId, fecha, cursoId]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Marcar asistencia
    async marcarAsistencia(asistenciaData, user = null) {
        try {
            const { alumno_id, curso_id, fecha, presente, observaciones } = asistenciaData;
            if (user) await this.validateAttendanceScope(user, [asistenciaData]);

            const [result] = await db.query(`
                INSERT INTO asistencias (alumno_id, curso_id, fecha, presente, observaciones)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    id = LAST_INSERT_ID(id),
                    presente = VALUES(presente),
                    observaciones = VALUES(observaciones)
            `, [alumno_id, curso_id, fecha, presente, observaciones || null]);
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    // Marcar asistencias masivas
    // Bug #3 fix: envuelto en transacción para garantizar atomicidad (rollback si falla a mitad)
    async marcarAsistenciasMasivas(asistencias, user = null) {
        if (!asistencias || asistencias.length === 0) return true;

        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();
            if (user) await this.validateAttendanceScope(user, asistencias, connection);

            // Preparar valores para Bulk Insert
            const values = asistencias.map(a => [
                a.alumno_id,
                a.curso_id,
                a.fecha,
                a.presente,
                a.observaciones || null
            ]);

            // INSERT ... ON DUPLICATE KEY UPDATE es mucho más rápido y atómico
            const query = `
                INSERT INTO asistencias (alumno_id, curso_id, fecha, presente, observaciones) 
                VALUES ?
                ON DUPLICATE KEY UPDATE 
                presente = VALUES(presente), 
                observaciones = VALUES(observaciones)
            `;

            await connection.query(query, [values]);
            await connection.commit();
            return true;
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('[AsistenciasModel.marcarAsistenciasMasivas] Error — rollback ejecutado:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    // Estadísticas de asistencia de un alumno
    async getEstadisticas(alumnoId, mes = null, anio = null) {
        try {
            let query = `
        SELECT 
          COUNT(*) as total_clases,
          SUM(CASE WHEN presente = 1 THEN 1 ELSE 0 END) as presentes,
          SUM(CASE WHEN presente = 0 THEN 1 ELSE 0 END) as ausentes,
          ROUND((SUM(CASE WHEN presente = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as porcentaje_asistencia
        FROM asistencias
        WHERE alumno_id = ?
      `;
            const params = [alumnoId];

            if (mes && anio) {
                query += ' AND MONTH(fecha) = ? AND YEAR(fecha) = ?';
                params.push(mes, anio);
            }

            const [rows] = await db.query(query, params);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Historia de asistencia (últimos 6 meses) para gráficos
    async getAsistenciaHistorica(alumnoId) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    DATE_FORMAT(fecha, '%Y-%m') as mes,
                    COUNT(*) as total_clases,
                    SUM(CASE WHEN presente = 1 THEN 1 ELSE 0 END) as presentes,
                    ROUND((SUM(CASE WHEN presente = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as porcentaje
                FROM asistencias
                WHERE alumno_id = ? 
                  AND fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(fecha, '%Y-%m')
                ORDER BY mes ASC
            `, [alumnoId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = AsistenciasModel;
