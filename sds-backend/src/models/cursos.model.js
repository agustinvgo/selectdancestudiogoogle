const db = require('../config/db');

const PROFESSOR_SELECT_FIELDS = `
    (SELECT GROUP_CONCAT(cp.profesor_id ORDER BY cp.orden SEPARATOR ',')
     FROM curso_profesores cp
     WHERE cp.curso_id = c.id) AS profesor_ids_csv,
    (SELECT GROUP_CONCAT(
        TRIM(CONCAT_WS(' ', profesor.nombre, profesor.apellido))
        ORDER BY cp.orden SEPARATOR ', '
     )
     FROM curso_profesores cp
     INNER JOIN usuarios profesor ON profesor.id = cp.profesor_id
     WHERE cp.curso_id = c.id) AS profesores
`;

const hydrateCourse = (row) => {
    if (!row) return row;

    const profesorIds = row.profesor_ids_csv
        ? row.profesor_ids_csv.split(',').map(Number).filter(Number.isInteger)
        : (row.profesor_id ? [Number(row.profesor_id)] : []);
    const { profesor_ids_csv, ...course } = row;

    return {
        ...course,
        profesor_ids: profesorIds,
        profesores: row.profesores || [
            row.nombre_profesor,
            row.apellido_profesor
        ].filter(Boolean).join(' ') || null
    };
};

const normalizeProfessorIds = (profesorIds, profesorId) => {
    const source = Array.isArray(profesorIds)
        ? profesorIds
        : (profesorId ? [profesorId] : []);

    return [...new Set(
        source
            .map(Number)
            .filter((id) => Number.isInteger(id) && id > 0)
    )];
};

const syncCourseProfessors = async (connection, cursoId, profesorIds) => {
    await connection.query('DELETE FROM curso_profesores WHERE curso_id = ?', [cursoId]);

    if (profesorIds.length > 0) {
        const values = profesorIds.map((profesorId, orden) => [cursoId, profesorId, orden]);
        await connection.query(
            'INSERT INTO curso_profesores (curso_id, profesor_id, orden) VALUES ?',
            [values]
        );
    }
};

const CursosModel = {
    // Listar todos los cursos activos
    async findAll() {
        try {
            const [rows] = await db.query(`
        SELECT c.*,
        c.dia_semana as horario_dia,
        c.hora_inicio as horario_hora,
        TIMESTAMPDIFF(MINUTE, c.hora_inicio, c.hora_fin) as duracion_minutos,
        (SELECT COUNT(*) FROM inscripciones_curso ic 
         WHERE ic.curso_id = c.id AND ic.activo = 1) as alumnos_inscritos,
        u.nombre as nombre_profesor,
        u.apellido as apellido_profesor,
        ${PROFESSOR_SELECT_FIELDS}
        FROM cursos c
        LEFT JOIN usuarios u ON c.profesor_id = u.id
        WHERE c.activo = 1
        ORDER BY c.nombre
      `);
            return rows.map(hydrateCourse);
        } catch (error) {
            throw error;
        }
    },

    // Obtener curso por ID
    async findById(id) {
        try {
            const [rows] = await db.query(`
                SELECT c.*,
                u.nombre as nombre_profesor,
                u.apellido as apellido_profesor,
                ${PROFESSOR_SELECT_FIELDS}
                FROM cursos c
                LEFT JOIN usuarios u ON c.profesor_id = u.id
                WHERE c.id = ?
            `, [id]);
            return hydrateCourse(rows[0]);
        } catch (error) {
            throw error;
        }
    },

    // Cursos de un alumno específico
    async findByAlumno(alumnoId) {
        try {
            const [rows] = await db.query(`
        SELECT c.*, ic.fecha_inscripcion,
        u.nombre as nombre_profesor,
        u.apellido as apellido_profesor,
        ${PROFESSOR_SELECT_FIELDS}
        FROM cursos c
        INNER JOIN inscripciones_curso ic ON c.id = ic.curso_id
        LEFT JOIN usuarios u ON c.profesor_id = u.id
        WHERE ic.alumno_id = ? AND ic.activo = 1
        ORDER BY c.dia_semana, c.hora_inicio
      `, [alumnoId]);
            return rows.map(hydrateCourse);
        } catch (error) {
            throw error;
        }
    },

    // Cursos de un profesor específico
    async findByProfesorId(profesorId) {
        try {
            const [rows] = await db.query(`
                SELECT c.*,
                c.dia_semana as horario_dia,
                c.hora_inicio as horario_hora,
                TIMESTAMPDIFF(MINUTE, c.hora_inicio, c.hora_fin) as duracion_minutos,
                (SELECT COUNT(*) FROM inscripciones_curso ic 
                 WHERE ic.curso_id = c.id AND ic.activo = 1) as alumnos_inscritos,
                u.nombre as nombre_profesor,
                u.apellido as apellido_profesor,
                ${PROFESSOR_SELECT_FIELDS}
                FROM cursos c
                LEFT JOIN usuarios u ON c.profesor_id = u.id
                WHERE c.activo = 1
                  AND (
                    c.profesor_id = ?
                    OR EXISTS (
                        SELECT 1
                        FROM curso_profesores cp_filter
                        WHERE cp_filter.curso_id = c.id
                          AND cp_filter.profesor_id = ?
                    )
                  )
                ORDER BY c.dia_semana, c.hora_inicio
            `, [profesorId, profesorId]);
            return rows.map(hydrateCourse);
        } catch (error) {
            throw error;
        }
    },

    // Cursos visibles en la web pública
    async findPublic() {
        const [rows] = await db.query(`
            SELECT c.*,
            c.dia_semana as horario_dia,
            c.hora_inicio as horario_hora,
            TIMESTAMPDIFF(MINUTE, c.hora_inicio, c.hora_fin) as duracion_minutos,
            (SELECT COUNT(*) FROM inscripciones_curso ic
             WHERE ic.curso_id = c.id AND ic.activo = 1) as alumnos_inscritos,
            u.nombre as nombre_profesor,
            u.apellido as apellido_profesor,
            ${PROFESSOR_SELECT_FIELDS}
            FROM cursos c
            LEFT JOIN usuarios u ON c.profesor_id = u.id
            WHERE c.activo = 1 AND c.es_publico = 1
            ORDER BY c.nombre
        `);
        return rows.map(hydrateCourse);
    },

    // Crear curso
    async create(cursoData) {
        const connection = await db.getConnection();
        try {
            const {
                nombre,
                descripcion,
                profesor_id,
                profesor_ids,
                nivel,
                categoria,
                tipo,
                dia_semana,
                hora_inicio,
                hora_fin,
                cupo_maximo,
                es_publico = 1
            } = cursoData;

            // Ensure arrays are stringified for JSON columns
            const nivelJSON = JSON.stringify(Array.isArray(nivel) ? nivel : [nivel]);
            const categoriaJSON = JSON.stringify(Array.isArray(categoria) ? categoria : [categoria]);
            const tipoJSON = JSON.stringify(Array.isArray(tipo) ? tipo : [tipo]);
            const normalizedProfessorIds = normalizeProfessorIds(profesor_ids, profesor_id);
            const primaryProfessorId = normalizedProfessorIds[0] || null;

            await connection.beginTransaction();
            const [result] = await connection.query(`
                INSERT INTO cursos (
                  nombre, descripcion, profesor_id, nivel, categoria, tipo, dia_semana,
                  hora_inicio, hora_fin, cupo_maximo, activo, es_publico
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
            `, [nombre, descripcion, primaryProfessorId, nivelJSON, categoriaJSON, tipoJSON, dia_semana, hora_inicio, hora_fin, cupo_maximo, es_publico]);

            await syncCourseProfessors(connection, result.insertId, normalizedProfessorIds);
            await connection.commit();

            return result.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // Actualizar curso
    async update(id, cursoData) {
        const connection = await db.getConnection();
        try {
            const {
                nombre,
                descripcion,
                profesor_id,
                profesor_ids,
                nivel,
                categoria,
                tipo,
                dia_semana,
                hora_inicio,
                hora_fin,
                cupo_maximo,
                url_clase_vivo,
                activo,
                es_publico = 1
            } = cursoData;

            const nivelJSON = JSON.stringify(Array.isArray(nivel) ? nivel : [nivel]);
            const categoriaJSON = JSON.stringify(Array.isArray(categoria) ? categoria : [categoria]);
            const tipoJSON = JSON.stringify(Array.isArray(tipo) ? tipo : [tipo]);
            const normalizedProfessorIds = normalizeProfessorIds(profesor_ids, profesor_id);
            const primaryProfessorId = normalizedProfessorIds[0] || null;

            await connection.beginTransaction();
            const [result] = await connection.query(`
                UPDATE cursos 
                SET nombre = ?, descripcion = ?, profesor_id = ?, nivel = ?, categoria = ?, tipo = ?, dia_semana = ?,
                    hora_inicio = ?, hora_fin = ?, cupo_maximo = ?, url_clase_vivo = ?, activo = ?, es_publico = ?
                WHERE id = ?
            `, [nombre, descripcion, primaryProfessorId, nivelJSON, categoriaJSON, tipoJSON, dia_semana, hora_inicio, hora_fin, cupo_maximo, url_clase_vivo, activo, es_publico, id]);

            await syncCourseProfessors(connection, id, normalizedProfessorIds);
            await connection.commit();

            return result.affectedRows > 0;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // Eliminar curso (soft delete)
    async delete(id) {
        try {
            const [result] = await db.query(
                'UPDATE cursos SET activo = 0 WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Inscribir alumno a curso (con transacción para evitar race condition en cupos)
    async inscribirAlumno(alumnoId, cursoId) {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // Lock de la fila del curso para evitar doble-inscripción concurrente
            const [cursoRows] = await conn.query(
                'SELECT id, cupo_maximo FROM cursos WHERE id = ? FOR UPDATE',
                [cursoId]
            );
            if (!cursoRows.length) throw new Error('Curso no encontrado');

            const [inscritos] = await conn.query(
                'SELECT COUNT(*) as total FROM inscripciones_curso WHERE curso_id = ? AND activo = 1',
                [cursoId]
            );
            if (inscritos[0].total >= cursoRows[0].cupo_maximo) {
                throw new Error('Cupo completo');
            }

            const [existe] = await conn.query(
                'SELECT id FROM inscripciones_curso WHERE alumno_id = ? AND curso_id = ? AND activo = 1',
                [alumnoId, cursoId]
            );
            if (existe.length > 0) throw new Error('El alumno ya está inscrito en este curso');

            const [result] = await conn.query(
                'INSERT INTO inscripciones_curso (alumno_id, curso_id, fecha_inscripcion, activo) VALUES (?, ?, CURDATE(), 1)',
                [alumnoId, cursoId]
            );

            await conn.commit();
            return result.insertId;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },

    // Desinscribir alumno de curso
    async desinscribirAlumno(alumnoId, cursoId) {
        try {
            const [result] = await db.query(
                'DELETE FROM inscripciones_curso WHERE alumno_id = ? AND curso_id = ?',
                [alumnoId, cursoId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Obtener alumnos de un curso
    async getAlumnosCurso(cursoId) {
        try {
            const [rows] = await db.query(`
        SELECT a.*, ic.fecha_inscripcion, u.nombre, u.apellido, u.telefono, u.foto_perfil, u.email
        FROM alumnos a
        INNER JOIN usuarios u ON a.usuario_id = u.id
        INNER JOIN inscripciones_curso ic ON a.id = ic.alumno_id
        WHERE ic.curso_id = ? AND ic.activo = 1
        ORDER BY u.apellido, u.nombre
      `, [cursoId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = CursosModel;
