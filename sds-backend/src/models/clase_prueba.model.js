const db = require('../config/db');

const ClasePruebaModel = {
    async findAll() {
        try {
            const [rows] = await db.query('SELECT * FROM clases_prueba ORDER BY created_at DESC');
            return rows;
        } catch (error) {
            throw error;
        }
    },

    async findById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM clases_prueba WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    async findByEmail(email) {
        try {
            const [rows] = await db.query('SELECT * FROM clases_prueba WHERE email = ?', [email]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    async create(data) {
        try {
            const { nombre, apellido, email, telefono, interes, horario } = data;
            const token = require('crypto').randomBytes(32).toString('hex');

            const [result] = await db.query(
                'INSERT INTO clases_prueba (nombre, apellido, email, telefono, interes, horario, token_cancelacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [nombre, apellido, email, telefono, interes, horario, token]
            );
            return { id: result.insertId, token };
        } catch (error) {
            throw error;
        }
    },

    // ... existing methods ...

    async findByToken(token) {
        try {
            const [rows] = await db.query('SELECT * FROM clases_prueba WHERE token_cancelacion = ?', [token]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    async findByCodigo(codigo) {
        try {
            const [rows] = await db.query('SELECT * FROM clases_prueba WHERE codigo_reserva = ?', [codigo]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    async updateStatus(id, estado) {
        try {
            const [result] = await db.query(
                'UPDATE clases_prueba SET estado = ? WHERE id = ?',
                [estado, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    async delete(id) {
        try {
            const [result] = await db.query('DELETE FROM clases_prueba WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // --- Disponibilidad Manual ---

    // ... existing availability methods ...

    async findDisponibilidadByDetails(curso_nombre, fecha, horario) {
        try {
            // Find by course name OR title
            const [rows] = await db.query(`
                SELECT cpd.id, cpd.cupos 
                FROM clases_prueba_disponibles cpd
                LEFT JOIN cursos c ON cpd.curso_id = c.id
                WHERE (c.nombre = ? OR cpd.titulo = ?) 
                AND cpd.fecha = ? 
                AND cpd.horario LIKE ?
            `, [curso_nombre, curso_nombre, fecha, horario + '%']);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    async getDisponibles() {
        try {
            const [rows] = await db.query(`
                SELECT cpd.*, COALESCE(c.nombre, cpd.titulo) as curso_nombre 
                FROM clases_prueba_disponibles cpd
                LEFT JOIN cursos c ON cpd.curso_id = c.id
                WHERE cpd.fecha >= CURDATE()
                ORDER BY cpd.fecha ASC, cpd.horario ASC
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    async addDisponibilidad(curso_id, fecha, horario, cupos = 10, descripcion = null, titulo = null) {
        try {
            const [result] = await db.query(
                'INSERT INTO clases_prueba_disponibles (curso_id, fecha, horario, cupos, descripcion, titulo) VALUES (?, ?, ?, ?, ?, ?)',
                [curso_id, fecha, horario, cupos, descripcion, titulo]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    async decrementCupo(id) {
        try {
            const [result] = await db.query(
                'UPDATE clases_prueba_disponibles SET cupos = cupos - 1 WHERE id = ? AND cupos > 0',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    async incrementCupo(id) {
        try {
            const [result] = await db.query(
                'UPDATE clases_prueba_disponibles SET cupos = cupos + 1 WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    async deleteDisponibilidad(id) {
        try {
            const [result] = await db.query('DELETE FROM clases_prueba_disponibles WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = ClasePruebaModel;
