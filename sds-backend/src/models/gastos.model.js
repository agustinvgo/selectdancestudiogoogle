const db = require('../config/db');

const GastosModel = {
    // Crear nuevo gasto
    async create(data) {
        try {
            const { fecha, monto, categoria, descripcion, comprobante_url, usuario_id } = data;
            const [result] = await db.query(
                'INSERT INTO gastos (fecha, monto, categoria, descripcion, comprobante_url, usuario_id) VALUES (?, ?, ?, ?, ?, ?)',
                [fecha, monto, categoria, descripcion, comprobante_url, usuario_id]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    // Obtener todos los gastos con filtros opcionales
    async findAll(filters = {}) {
        try {
            let query = 'SELECT g.*, u.nombre as usuario_nombre, u.apellido as usuario_apellido FROM gastos g LEFT JOIN usuarios u ON g.usuario_id = u.id WHERE 1=1';
            const params = [];

            if (filters.mes && filters.anio) {
                query += ' AND MONTH(g.fecha) = ? AND YEAR(g.fecha) = ?';
                params.push(filters.mes, filters.anio);
            }

            if (filters.categoria) {
                query += ' AND g.categoria = ?';
                params.push(filters.categoria);
            }

            query += ' ORDER BY g.fecha DESC';

            const [rows] = await db.query(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Obtener gasto por ID
    async findById(id) {
        try {
            const [rows] = await db.query('SELECT g.*, u.nombre as usuario_nombre FROM gastos g LEFT JOIN usuarios u ON g.usuario_id = u.id WHERE g.id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Actualizar gasto (Dynamic Update)
    async update(id, data) {
        try {
            const allowedFields = ['fecha', 'monto', 'categoria', 'descripcion', 'comprobante_url'];
            const fields = Object.keys(data).filter(key => allowedFields.includes(key) && data[key] !== undefined);
            if (fields.length === 0) return false;

            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const values = fields.map(field => data[field]);
            values.push(id);

            const query = `UPDATE gastos SET ${setClause} WHERE id = ?`;

            const [result] = await db.query(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Eliminar gasto (Definitivo)
    async delete(id) {
        try {
            const [result] = await db.query('DELETE FROM gastos WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Obtener estadísticas de gastos por categoría (mes actual o filtro)
    async getStatsByCategoria(mes, anio) {
        try {
            let query = `
                SELECT categoria, SUM(monto) as total, COUNT(*) as cantidad
                FROM gastos
                WHERE MONTH(fecha) = ? AND YEAR(fecha) = ?
                GROUP BY categoria
                ORDER BY total DESC
            `;
            const [rows] = await db.query(query, [mes, anio]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Obtener total de gastos (mes actual o filtro)
    async getTotal(mes, anio) {
        try {
            const [rows] = await db.query(
                'SELECT SUM(monto) as total FROM gastos WHERE MONTH(fecha) = ? AND YEAR(fecha) = ?',
                [mes, anio]
            );
            return rows[0].total || 0;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = GastosModel;
