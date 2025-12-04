const db = require('../config/db');

const AsistenciasModel = {
    // Asistencias de un alumno con filtros
    async findByAlumno(alumnoId, mes = null, anio = null) {
        try {
            let query = `
        SELECT a.*, c.nombre as curso_nombre
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
               al.nombre as alumno_nombre, al.apellido as alumno_apellido,
               al.telefono as alumno_telefono, al.email_padre as alumno_email
        FROM alumnos al
        INNER JOIN inscripciones_curso ic ON al.id = ic.alumno_id
        LEFT JOIN asistencias a ON a.alumno_id = al.id 
          AND a.curso_id = ? AND a.fecha = ?
        WHERE ic.curso_id = ? AND ic.activo = 1
        ORDER BY al.apellido, al.nombre
      `, [cursoId, fecha, cursoId]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Marcar asistencia
    async marcarAsistencia(asistenciaData) {
        try {
            const { alumno_id, curso_id, fecha, presente, observaciones } = asistenciaData;

            // Verificar si ya existe un registro para esta fecha
            const [existe] = await db.query(
                'SELECT id FROM asistencias WHERE alumno_id = ? AND curso_id = ? AND fecha = ?',
                [alumno_id, curso_id, fecha]
            );

            if (existe.length > 0) {
                // Actualizar
                const [result] = await db.query(
                    'UPDATE asistencias SET presente = ?, observaciones = ? WHERE id = ?',
                    [presente, observaciones, existe[0].id]
                );
                return existe[0].id;
            } else {
                // Insertar
                const [result] = await db.query(
                    'INSERT INTO asistencias (alumno_id, curso_id, fecha, presente, observaciones) VALUES (?, ?, ?, ?, ?)',
                    [alumno_id, curso_id, fecha, presente, observaciones]
                );
                return result.insertId;
            }
        } catch (error) {
            throw error;
        }
    },

    // Marcar asistencias masivas
    async marcarAsistenciasMasivas(asistencias) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            for (const asistencia of asistencias) {
                const { alumno_id, curso_id, fecha, presente, observaciones } = asistencia;

                // Verificar si ya existe
                const [existe] = await connection.query(
                    'SELECT id FROM asistencias WHERE alumno_id = ? AND curso_id = ? AND fecha = ?',
                    [alumno_id, curso_id, fecha]
                );

                if (existe.length > 0) {
                    await connection.query(
                        'UPDATE asistencias SET presente = ?, observaciones = ? WHERE id = ?',
                        [presente, observaciones || null, existe[0].id]
                    );
                } else {
                    await connection.query(
                        'INSERT INTO asistencias (alumno_id, curso_id, fecha, presente, observaciones) VALUES (?, ?, ?, ?, ?)',
                        [alumno_id, curso_id, fecha, presente, observaciones || null]
                    );
                }
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
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
    }
};

module.exports = AsistenciasModel;
