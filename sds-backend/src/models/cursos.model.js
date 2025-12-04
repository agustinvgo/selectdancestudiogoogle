const db = require('../config/db');

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
         WHERE ic.curso_id = c.id AND ic.activo = 1) as alumnos_inscritos
        FROM cursos c
        ORDER BY c.nombre
      `);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Obtener curso por ID
    async findById(id) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM cursos WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Cursos de un alumno específico
    async findByAlumno(alumnoId) {
        try {
            const [rows] = await db.query(`
        SELECT c.*, ic.fecha_inscripcion
        FROM cursos c
        INNER JOIN inscripciones_curso ic ON c.id = ic.curso_id
        WHERE ic.alumno_id = ? AND ic.activo = 1
        ORDER BY c.dia_semana, c.hora_inicio
      `, [alumnoId]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Crear curso
    async create(cursoData) {
        try {
            const {
                nombre,
                descripcion,
                profesor,
                nivel,
                dia_semana,
                hora_inicio,
                hora_fin,
                cupo_maximo
            } = cursoData;

            const [result] = await db.query(`
        INSERT INTO cursos (
          nombre, descripcion, profesor, nivel, dia_semana,
          hora_inicio, hora_fin, cupo_maximo, activo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [nombre, descripcion, profesor, nivel, dia_semana, hora_inicio, hora_fin, cupo_maximo]);

            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar curso
    async update(id, cursoData) {
        try {
            const {
                nombre,
                descripcion,
                profesor,
                nivel,
                dia_semana,
                hora_inicio,
                hora_fin,
                cupo_maximo,
                activo
            } = cursoData;

            const [result] = await db.query(`
                UPDATE cursos 
                SET nombre = ?, descripcion = ?, profesor = ?, nivel = ?, dia_semana = ?,
                    hora_inicio = ?, hora_fin = ?, cupo_maximo = ?, activo = ?
                WHERE id = ?
            `, [nombre, descripcion, profesor, nivel, dia_semana, hora_inicio, hora_fin, cupo_maximo, activo, id]);

            return result.affectedRows > 0;
        } catch (error) {
            throw error;
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

    // Inscribir alumno a curso
    async inscribirAlumno(alumnoId, cursoId) {
        try {
            // Verificar cupo
            const curso = await this.findById(cursoId);
            if (!curso) throw new Error('Curso no encontrado');

            const [inscritos] = await db.query(
                'SELECT COUNT(*) as total FROM inscripciones_curso WHERE curso_id = ? AND activo = 1',
                [cursoId]
            );

            if (inscritos[0].total >= curso.cupo_maximo) {
                throw new Error('Cupo completo');
            }

            // Verificar si ya está inscrito
            const [existe] = await db.query(
                'SELECT id FROM inscripciones_curso WHERE alumno_id = ? AND curso_id = ? AND activo = 1',
                [alumnoId, cursoId]
            );

            if (existe.length > 0) {
                throw new Error('El alumno ya está inscrito en este curso');
            }

            // Inscribir
            const [result] = await db.query(
                'INSERT INTO inscripciones_curso (alumno_id, curso_id, fecha_inscripcion, activo) VALUES (?, ?, CURDATE(), 1)',
                [alumnoId, cursoId]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    // Desinscribir alumno de curso
    async desinscribirAlumno(alumnoId, cursoId) {
        try {
            const [result] = await db.query(
                'UPDATE inscripciones_curso SET activo = 0 WHERE alumno_id = ? AND curso_id = ? AND activo = 1',
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
        SELECT a.*, ic.fecha_inscripcion
        FROM alumnos a
        INNER JOIN inscripciones_curso ic ON a.id = ic.alumno_id
        WHERE ic.curso_id = ? AND ic.activo = 1
        ORDER BY a.apellido, a.nombre
      `, [cursoId]);
            return rows;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = CursosModel;
