const db = require('../config/db');

const AlumnosModel = {
    // Listar todos los alumnos
    async findAll() {
        try {
            const [rows] = await db.query(`
        SELECT a.*, u.email, u.activo as usuario_activo
        FROM alumnos a
        INNER JOIN usuarios u ON a.usuario_id = u.id
        ORDER BY a.apellido, a.nombre
      `);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Obtener alumno por ID
    async findById(id) {
        try {
            const [rows] = await db.query(`
        SELECT a.*, u.email, u.rol
        FROM alumnos a
        INNER JOIN usuarios u ON a.usuario_id = u.id
        WHERE a.id = ?
      `, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Buscar alumno por usuario_id
    async findByUsuarioId(usuarioId) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM alumnos WHERE usuario_id = ?',
                [usuarioId]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Crear nuevo alumno
    async create(alumnoData) {
        try {
            const {
                usuario_id,
                nombre,
                apellido,
                fecha_nacimiento,
                dni,
                telefono,
                email_padre,
                direccion,
                foto_perfil
            } = alumnoData;

            const [result] = await db.query(`
        INSERT INTO alumnos (
          usuario_id, nombre, apellido, fecha_nacimiento, dni,
          telefono, email_padre, direccion, foto_perfil
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [usuario_id, nombre, apellido, fecha_nacimiento, dni, telefono, email_padre, direccion, foto_perfil || null]);

            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar alumno
    async update(id, alumnoData) {
        try {
            const fields = [];
            const values = [];

            const allowedFields = [
                'nombre', 'apellido', 'fecha_nacimiento', 'dni', 'telefono',
                'email_padre', 'direccion', 'foto_perfil'
            ];

            allowedFields.forEach(field => {
                if (alumnoData[field] !== undefined) {
                    fields.push(`${field} = ?`);
                    values.push(alumnoData[field]);
                }
            });

            if (fields.length === 0) return false;

            values.push(id);
            const [result] = await db.query(
                `UPDATE alumnos SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Eliminar alumno (soft delete desactivando el usuario)
    async delete(id) {
        try {
            // Obtener usuario_id del alumno
            const alumno = await this.findById(id);
            if (!alumno) return false;

            // Desactivar el usuario
            const [result] = await db.query(
                'UPDATE usuarios SET activo = 0 WHERE id = ?',
                [alumno.usuario_id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Buscar alumnos por email del padre (para descuentos familiares)
    async findByEmailPadre(emailPadre) {
        try {
            const [rows] = await db.query(`
                SELECT a.*, u.email, u.activo as usuario_activo
                FROM alumnos a
                INNER JOIN usuarios u ON a.usuario_id = u.id
                WHERE a.email_padre = ?
                ORDER BY a.apellido, a.nombre
            `, [emailPadre]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Obtener ficha completa del alumno
    async getFichaCompleta(id) {
        try {
            // Datos del alumno
            const alumno = await this.findById(id);
            if (!alumno) return null;

            // Cursos inscritos
            const [cursos] = await db.query(`
        SELECT c.*, ic.fecha_inscripcion
        FROM cursos c
        INNER JOIN inscripciones_curso ic ON c.id = ic.curso_id
        WHERE ic.alumno_id = ? AND ic.activo = 1
      `, [id]);

            // Asistencias (últimos 3 meses)
            const [asistencias] = await db.query(`
        SELECT a.*, c.nombre as curso_nombre
        FROM asistencias a
        INNER JOIN cursos c ON a.curso_id = c.id
        WHERE a.alumno_id = ? 
        AND a.fecha >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
        ORDER BY a.fecha DESC
      `, [id]);

            // Pagos
            const [pagos] = await db.query(`
        SELECT * FROM pagos
        WHERE alumno_id = ?
        ORDER BY fecha_vencimiento DESC
      `, [id]);

            // Eventos inscritos
            const [eventos] = await db.query(`
        SELECT e.*, ie.fecha_inscripcion, ie.pago_realizado,
               ie.checklist_vestuario, ie.checklist_peinado, ie.checklist_maquillaje
        FROM eventos e
        INNER JOIN inscripciones_evento ie ON e.id = ie.evento_id
        WHERE ie.alumno_id = ?
        ORDER BY e.fecha DESC
      `, [id]);

            // Uniformes
            const [uniformes] = await db.query(`
        SELECT * FROM uniformes
        WHERE alumno_id = ?
        ORDER BY created_at DESC
      `, [id]);

            return {
                alumno,
                cursos,
                asistencias,
                pagos,
                eventos,
                uniformes
            };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = AlumnosModel;
