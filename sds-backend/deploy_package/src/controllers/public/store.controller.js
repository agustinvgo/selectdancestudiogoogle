const ProductosModel = require('../../models/productos.model');
const db = require('../../config/db');

const StoreController = {
    // === PRODUCTOS ===
    async getProductos(req, res) {
        try {
            const productos = await ProductosModel.findAll();
            res.json({ success: true, data: productos });
        } catch (error) {
            console.error('Error getting productos:', error);
            res.status(500).json({ success: false, message: 'Error interno' });
        }
    },

    async createProducto(req, res) {
        try {
            const productData = { ...req.body };
            if (req.file) {
                productData.imagen_url = `/uploads/productos/${req.file.filename}`;
            }

            const insertId = await ProductosModel.create(productData);
            res.status(201).json({ success: true, data: { id: insertId, ...productData } });
        } catch (error) {
            console.error('Error creating producto:', error);
            res.status(500).json({ success: false, message: 'Error al crear producto' });
        }
    },

    async updateProducto(req, res) {
        try {
            const { id } = req.params;
            const productData = { ...req.body };

            if (req.file) {
                productData.imagen_url = `/uploads/productos/${req.file.filename}`;
            }

            const success = await ProductosModel.update(id, productData);
            if (!success) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            res.json({ success: true, message: 'Producto actualizado' });
        } catch (error) {
            console.error('Error updating producto:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar' });
        }
    },

    async deleteProducto(req, res) {
        try {
            const { id } = req.params;
            const success = await ProductosModel.delete(id);
            if (!success) return res.status(404).json({ success: false, message: 'Producto no encontrado' });
            res.json({ success: true, message: 'Producto eliminado' });
        } catch (error) {
            console.error('Error deleting producto:', error);
            res.status(500).json({ success: false, message: 'Error al eliminar' });
        }
    },

    // === VENTAS RÁPIDAS ===
    async registrarVentaRapida(req, res) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { producto_id, cantidad, precio_venta, precio_final, metodo_pago, usuario_id } = req.body;
            // Usuario ID debería venir del token, pero lo aceptamos del body por simplicidad si no está en req.user
            const userId = req.user ? req.user.id : (usuario_id || 1);

            // Use provided 'precio_final' (Total) or calculate default
            const totalVenta = precio_final ? parseFloat(precio_final) : (parseFloat(precio_venta) * parseInt(cantidad));

            // 1. Crear Venta Header
            const [ventaResult] = await connection.query(
                `INSERT INTO ventas (usuario_id, total, metodo_pago) VALUES (?, ?, ?)`,
                [userId, totalVenta, metodo_pago || 'Efectivo']
            );
            const ventaId = ventaResult.insertId;

            // 2. Crear Detalle
            await connection.query(
                `INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)`,
                [ventaId, producto_id, cantidad, precio_venta, totalVenta]
            );

            // 3. Descontar Stock
            await ProductosModel.updateStock(producto_id, -Math.abs(cantidad), connection);

            await connection.commit();
            res.json({ success: true, message: 'Venta registrada y stock actualizado' });

        } catch (error) {
            await connection.rollback();
            console.error('Error en venta rápida:', error);
            res.status(500).json({ success: false, message: 'Error al procesar venta' });
        } finally {
            connection.release();
        }
    }
};

module.exports = StoreController;
