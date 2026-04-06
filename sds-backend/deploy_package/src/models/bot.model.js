
const db = require('../config/db');

const BotModel = {
    // --- Configuración (System Prompt) ---

    // Obtener configuración por clave
    async getConfig(clave) {
        const [rows] = await db.query('SELECT valor FROM bot_config WHERE clave = ?', [clave]);
        return rows[0] ? rows[0].valor : null;
    },

    // Guardar/Actualizar configuración
    async setConfig(clave, valor) {
        // Upsert (Insert or Update)
        await db.query(
            'INSERT INTO bot_config (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?',
            [clave, valor, valor]
        );
        return true;
    },

    // --- Base de Conocimiento ---

    // Obtener todos los temas activos
    async getAllKnowledge(soloActivos = true) {
        let query = 'SELECT * FROM bot_knowledge';
        if (soloActivos) query += ' WHERE activo = 1';
        query += ' ORDER BY tema ASC';

        const [rows] = await db.query(query);
        return rows;
    },

    // Crear tema
    async createKnowledge(data) {
        const [result] = await db.query(
            'INSERT INTO bot_knowledge (tema, contenido, activo) VALUES (?, ?, ?)',
            [data.tema, data.contenido, data.activo !== undefined ? data.activo : true]
        );
        return result.insertId;
    },

    // Actualizar tema
    async updateKnowledge(id, data) {
        const updates = [];
        const params = [];

        if (data.tema) { updates.push('tema = ?'); params.push(data.tema); }
        if (data.contenido) { updates.push('contenido = ?'); params.push(data.contenido); }
        if (data.activo !== undefined) { updates.push('activo = ?'); params.push(data.activo); }

        if (updates.length === 0) return false;

        params.push(id);
        await db.query(`UPDATE bot_knowledge SET ${updates.join(', ')} WHERE id = ?`, params);
        return true;
    },

    // Eliminar tema
    async deleteKnowledge(id) {
        await db.query('DELETE FROM bot_knowledge WHERE id = ?', [id]);
        return true;
    }
};

module.exports = BotModel;
