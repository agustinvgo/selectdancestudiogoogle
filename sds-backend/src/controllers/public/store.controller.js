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
        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            const productoId = Number.parseInt(req.body.producto_id, 10);
            const cantidad = Number.parseInt(req.body.cantidad, 10);
            const metodosPermitidos = new Set(['Efectivo', 'Transferencia', 'Debito', 'Credito']);
            const metodoPago = metodosPermitidos.has(req.body.metodo_pago)
                ? req.body.metodo_pago
                : 'Efectivo';

            if (!Number.isInteger(productoId) || productoId <= 0 || !Number.isInteger(cantidad) || cantidad <= 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Producto o cantidad invalidos' });
            }

            const [productos] = await connection.query(`
                SELECT id, nombre, precio_venta, stock_actual, activo
                FROM productos
                WHERE id = ?
                FOR UPDATE
            `, [productoId]);
            const producto = productos[0];

            if (!producto || !Number(producto.activo)) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'El producto ya no esta disponible' });
            }
            if (Number(producto.stock_actual) < cantidad) {
                await connection.rollback();
                return res.status(409).json({
                    success: false,
                    message: `Stock insuficiente. Quedan ${producto.stock_actual} unidades.`
                });
            }

            const precioUnitario = Number(producto.precio_venta);
            if (!Number.isFinite(precioUnitario) || precioUnitario < 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'El producto no tiene un precio valido' });
            }

            const totalVenta = Math.round(precioUnitario * cantidad * 100) / 100;
            const userId = req.user.id;
            // Usuario ID debería venir del token, pero lo aceptamos del body por simplicidad si no está en req.user
            // 1. Crear Venta Header
            const [ventaResult] = await connection.query(
                `INSERT INTO ventas (usuario_id, total, metodo_pago) VALUES (?, ?, ?)`,
                [userId, totalVenta, metodoPago]
            );
            const ventaId = ventaResult.insertId;

            // 2. Crear Detalle
            await connection.query(
                `INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)`,
                [ventaId, productoId, cantidad, precioUnitario, totalVenta]
            );

            // 3. Descontar Stock
            const [stockResult] = await connection.query(`
                UPDATE productos
                SET stock_actual = stock_actual - ?
                WHERE id = ? AND stock_actual >= ?
            `, [cantidad, productoId, cantidad]);
            if (!stockResult.affectedRows) throw new Error('No se pudo actualizar el stock del producto');

            await connection.commit();
            res.json({ success: true, message: 'Venta registrada y stock actualizado' });

        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error en venta rápida:', error);
            res.status(500).json({ success: false, message: 'No se pudo registrar la venta. Intenta nuevamente.' });
        } finally {
            if (connection) connection.release();
        }
    }
};

module.exports = StoreController;
