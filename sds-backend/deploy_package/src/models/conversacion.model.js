const db = require('../config/db');

const ConversacionModel = {
    /**
     * Buscar conversación por teléfono
     */
    async findByTelefono(telefono) {
        const [rows] = await db.query(
            'SELECT * FROM conversaciones WHERE telefono = ?',
            [telefono]
        );
        return rows[0] || null;
    },

    /**
     * Crear nueva conversación
     */
    async create(data) {
        const [result] = await db.query(
            'INSERT INTO conversaciones (telefono, alumno_id, mensajes, metadata) VALUES (?, ?, ?, ?)',
            [
                data.telefono,
                data.alumno_id || null,
                JSON.stringify(data.mensajes || []),
                JSON.stringify(data.metadata || {})
            ]
        );
        return { id: result.insertId, ...data };
    },

    /**
     * Actualizar conversación
     */
    async update(telefono, data) {
        const updates = [];
        const params = [];

        if (data.mensajes !== undefined) {
            updates.push('mensajes = ?');
            params.push(JSON.stringify(data.mensajes));
        }

        if (data.alumno_id !== undefined) {
            updates.push('alumno_id = ?');
            params.push(data.alumno_id);
        }

        if (data.requiere_atencion_humana !== undefined) {
            updates.push('requiere_atencion_humana = ?');
            params.push(data.requiere_atencion_humana);
        }

        if (data.metadata !== undefined) {
            updates.push('metadata = ?');
            params.push(JSON.stringify(data.metadata));
        }

        if (updates.length === 0) return null;

        params.push(telefono);

        await db.query(
            `UPDATE conversaciones SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE telefono = ?`,
            params
        );

        return await this.findByTelefono(telefono);
    }
};

module.exports = ConversacionModel;
