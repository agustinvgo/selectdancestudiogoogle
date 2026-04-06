const GastosModel = require('../../models/gastos.model');

const GastosController = {
    // Obtener todos los gastos
    async getAll(req, res) {
        try {
            const { mes, anio, categoria } = req.query;
            const filters = {};
            if (mes) filters.mes = mes;
            if (anio) filters.anio = anio;
            if (categoria) filters.categoria = categoria;

            const gastos = await GastosModel.findAll(filters);

            // Si piden estadísticas también
            let stats = null;
            if (mes && anio) {
                stats = await GastosModel.getStatsByCategoria(mes, anio);
            }

            res.json({
                success: true,
                data: gastos,
                stats: stats
            });
        } catch (error) {
            console.error('Error al obtener gastos:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener gastos',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Crear gasto
    async create(req, res) {
        try {
            const { fecha, monto, categoria, descripcion } = req.body;

            if (!monto || !categoria) {
                return res.status(400).json({
                    success: false,
                    message: 'Monto y categoría son requeridos'
                });
            }

            let comprobante_url = null;
            if (req.file) {
                // Generate a relative URL for the frontend
                comprobante_url = `/uploads/comprobantes/${req.file.filename}`;
            }

            const nuevoGasto = {
                fecha: fecha || new Date(),
                monto,
                categoria,
                descripcion,
                comprobante_url,
                usuario_id: req.user ? req.user.id : null
            };

            const id = await GastosModel.create(nuevoGasto);

            res.status(201).json({
                success: true,
                message: 'Gasto registrado exitosamente',
                data: { id, ...nuevoGasto }
            });
        } catch (error) {
            console.error('Error al crear gasto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al registrar gasto',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Actualizar gasto
    async update(req, res) {
        try {
            const { id } = req.params;

            const updateData = { ...req.body };

            if (req.file) {
                updateData.comprobante_url = `/uploads/comprobantes/${req.file.filename}`;
            }

            const updated = await GastosModel.update(id, updateData);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Gasto no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Gasto actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error al actualizar gasto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar gasto',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Eliminar gasto
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await GastosModel.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Gasto no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Gasto eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar gasto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar gasto',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Ver archivo de comprobante del gasto
    async verComprobante(req, res) {
        try {
            const { id } = req.params;
            const gasto = await GastosModel.findById(id);

            if (!gasto || !gasto.comprobante_url) {
                return res.status(404).json({
                    success: false,
                    message: 'Comprobante no encontrado'
                });
            }

            const path = require('path');
            const fs = require('fs');

            const relativePath = gasto.comprobante_url.startsWith('/') ? gasto.comprobante_url.substring(1) : gasto.comprobante_url;
            const absolutePath = path.join(__dirname, '../../../', relativePath);

            if (fs.existsSync(absolutePath)) {
                res.sendFile(absolutePath);
            } else {
                res.status(404).json({
                    success: false,
                    message: 'Archivo físico no encontrado'
                });
            }
        } catch (error) {
            console.error('Error sirviendo comprobante de gasto:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener comprobante'
            });
        }
    }
};

module.exports = GastosController;
