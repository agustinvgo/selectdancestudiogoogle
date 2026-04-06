const db = require('../config/db');

const EsperaModel = {
    async create(data) {
        try {
            const { disponibilidad_id, nombre, email, telefono } = data;
            const [result] = await db.query(
                'INSERT INTO clases_prueba_espera (disponibilidad_id, nombre, email, telefono) VALUES (?, ?, ?, ?)',
                [disponibilidad_id, nombre, email, telefono]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    async getByDisponibilidad(disponibilidadId) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM clases_prueba_espera WHERE disponibilidad_id = ? ORDER BY created_at ASC',
                [disponibilidadId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = EsperaModel;
