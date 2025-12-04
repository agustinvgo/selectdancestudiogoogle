const db = require('../config/db');

const EventosModel = {
    // Listar todos los eventos
    async findAll() {
        try {
            const [rows] = await db.query(`
        SELECT e.*,
        (SELECT COUNT(*) FROM inscripciones_evento ie WHERE ie.evento_id = e.id) as inscritos
        FROM eventos e
        ORDER BY e.fecha DESC
      `);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Obtener evento por ID con detalles completos
    async findById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM eventos WHERE id = ?', [id]);
            if (rows.length === 0) return null;

            const evento = rows[0];

            // Obtener alumnos inscritos
            const [inscritos] = await db.query(`
        SELECT a.*, ie.fecha_inscripcion, ie.pago_realizado,
               ie.checklist_vestuario, ie.checklist_peinado, ie.checklist_maquillaje,
               ie.id as inscripcion_id
        FROM alumnos a
        INNER JOIN inscripciones_evento ie ON a.id = ie.alumno_id
        WHERE ie.evento_id = ?
        ORDER BY a.apellido, a.nombre
      `, [id]);

            evento.inscritos = inscritos;
            return evento;
        } catch (error) {
            throw error;
        }
    },

    // Eventos de un alumno
    async findByAlumno(alumnoId) {
        try {
            const [rows] = await db.query(`
        SELECT e.*, ie.fecha_inscripcion, ie.pago_realizado,
               ie.checklist_vestuario, ie.checklist_peinado, ie.checklist_maquillaje
        FROM eventos e
        INNER JOIN inscripciones_evento ie ON e.id = ie.evento_id
        WHERE ie.alumno_id = ?
        ORDER BY e.fecha DESC
      `, [alumnoId]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Crear evento
    async create(eventoData) {
        try {
            const {
                nombre,
                descripcion,
                fecha,
                lugar,
                costo_inscripcion,
                vestuario_requerido,
                peinado_instrucciones,
                maquillaje_instrucciones
            } = eventoData;

            const [result] = await db.query(`
        INSERT INTO eventos (
          nombre, descripcion, fecha, lugar, costo_inscripcion,
          vestuario_requerido, peinado_instrucciones, maquillaje_instrucciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
                nombre,
                descripcion,
                fecha,
                lugar,
                costo_inscripcion || 0,
                vestuario_requerido || null,
                peinado_instrucciones || null,
                maquillaje_instrucciones || null
            ]);

            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    // Inscribir alumno a evento
    async inscribirAlumno(alumnoId, eventoId) {
        try {
            // Verificar si ya está inscrito
            const [existe] = await db.query(
                'SELECT id FROM inscripciones_evento WHERE alumno_id = ? AND evento_id = ?',
                [alumnoId, eventoId]
            );

            if (existe.length > 0) {
                throw new Error('El alumno ya está inscrito en este evento');
            }

            const [result] = await db.query(
                'INSERT INTO inscripciones_evento (alumno_id, evento_id, fecha_inscripcion, pago_realizado) VALUES (?, ?, CURDATE(), 0)',
                [alumnoId, eventoId]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar checklist de inscripción
    async updateChecklist(inscripcionId, checklistData) {
        try {
            const fields = [];
            const values = [];

            if (checklistData.checklist_vestuario !== undefined) {
                fields.push('checklist_vestuario = ?');
                values.push(checklistData.checklist_vestuario);
            }
            if (checklistData.checklist_peinado !== undefined) {
                fields.push('checklist_peinado = ?');
                values.push(checklistData.checklist_peinado);
            }
            if (checklistData.checklist_maquillaje !== undefined) {
                fields.push('checklist_maquillaje = ?');
                values.push(checklistData.checklist_maquillaje);
            }
            if (checklistData.pago_realizado !== undefined) {
                fields.push('pago_realizado = ?');
                values.push(checklistData.pago_realizado);
            }

            if (fields.length === 0) return false;

            values.push(inscripcionId);
            const [result] = await db.query(
                `UPDATE inscripciones_evento SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Próximos eventos (futuro)
    async getProximosEventos() {
        try {
            const [rows] = await db.query(`
        SELECT e.*,
        (SELECT COUNT(*) FROM inscripciones_evento ie WHERE ie.evento_id = e.id) as inscritos
        FROM eventos e
        WHERE e.fecha >= CURDATE()
        ORDER BY e.fecha ASC
        LIMIT 5
      `);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Eliminar evento
    async delete(id) {
        try {
            // Primero eliminar inscripciones del evento
            await db.query('DELETE FROM inscripciones_evento WHERE evento_id = ?', [id]);

            // Luego eliminar el evento
            const [result] = await db.query('DELETE FROM eventos WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = EventosModel;
