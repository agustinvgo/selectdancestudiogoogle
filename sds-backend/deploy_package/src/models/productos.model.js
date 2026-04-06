const db = require('../config/db');

const ProductosModel = {
    // Obtener todos los productos
    async findAll() {
        try {
            const query = `
                SELECT * FROM productos 
                WHERE activo = TRUE 
                ORDER BY categoria, nombre
            `;
            const [rows] = await db.query(query);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Crear producto
    async create(data) {
        try {
            const { nombre, descripcion, precio_costo, precio_venta, stock_actual, stock_minimo, categoria, imagen_url } = data;
            const [result] = await db.query(
                `INSERT INTO productos 
                (nombre, descripcion, precio_costo, precio_venta, stock_actual, stock_minimo, categoria, imagen_url) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [nombre, descripcion, precio_costo, precio_venta, stock_actual, stock_minimo, categoria, imagen_url]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar producto
    async update(id, data) {
        try {
            const allowedFields = ['nombre', 'descripcion', 'precio_costo', 'precio_venta', 'stock_actual', 'stock_minimo', 'categoria', 'imagen_url', 'activo'];
            const fields = Object.keys(data).filter(key => allowedFields.includes(key) && data[key] !== undefined);
            if (fields.length === 0) return false;

            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const values = fields.map(field => data[field]);
            values.push(id);

            const query = `UPDATE productos SET ${setClause} WHERE id = ?`;
            const [result] = await db.query(query, values);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Soft Delete (Desactivar)
    async delete(id) {
        try {
            const [result] = await db.query('UPDATE productos SET activo = FALSE WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar Stock (para ventas)
    async updateStock(id, cantidadCambio, connection = null) {
        try {
            const dbRef = connection || db;
            // cantidadCambio puede ser negativo (venta) o positivo (reposición)
            const query = `UPDATE productos SET stock_actual = stock_actual + ? WHERE id = ?`;
            const [result] = await dbRef.query(query, [cantidadCambio, id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = ProductosModel;
