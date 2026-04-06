const db = require('../config/db');

class ConsultasModel {
    static async create(data) {
        const { nombre, email, telefono, mensaje } = data;
        const [result] = await db.query(
            'INSERT INTO consultas (nombre, email, telefono, mensaje) VALUES (?, ?, ?, ?)',
            [nombre, email, telefono, mensaje]
        );
        return result.insertId;
    }

    static async getAll() {
        const [rows] = await db.query('SELECT * FROM consultas ORDER BY fecha_envio DESC');
        return rows;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM consultas WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async markAsRead(id) {
        const [result] = await db.query(
            'UPDATE consultas SET estado = "leido" WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Count pending
    static async countPending() {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM consultas WHERE estado = "pendiente"');
        return rows[0].count;
    }
}

module.exports = ConsultasModel;
