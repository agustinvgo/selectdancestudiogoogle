const EquipoModel = require('../../models/equipo.model');

const EquipoController = {
    async getAll(req, res) {
        try {
            const equipo = await EquipoModel.findAll();
            res.json({
                success: true,
                data: equipo,
                message: 'Equipo obtenido correctamente'
            });
        } catch (error) {
            console.error('Error en getAll:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener equipo',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    async create(req, res) {
        try {
            const { nombre, cargo, descripcion } = req.body;
            // Multer saves file info in req.file
            const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

            if (!nombre) {
                return res.status(400).json({ success: false, message: 'El nombre es requerido' });
            }

            const id = await EquipoModel.create({ nombre, cargo, descripcion, foto_url });

            res.json({
                success: true,
                data: { id, nombre, cargo, descripcion, foto_url },
                message: 'Miembro creado correctamente'
            });
        } catch (error) {
            console.error('Error en create:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear miembro',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, cargo, descripcion, activo } = req.body;
            const foto_url = req.file ? `/uploads/${req.file.filename}` : undefined;

            const updated = await EquipoModel.update(id, { nombre, cargo, descripcion, foto_url, activo });

            if (!updated) {
                return res.status(404).json({ success: false, message: 'Miembro no encontrado' });
            }

            res.json({
                success: true,
                message: 'Miembro actualizado correctamente'
            });
        } catch (error) {
            console.error('Error en update:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar miembro',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await EquipoModel.delete(id);

            if (!deleted) {
                return res.status(404).json({ success: false, message: 'Miembro no encontrado' });
            }

            res.json({
                success: true,
                message: 'Miembro eliminado correctamente'
            });
        } catch (error) {
            console.error('Error en delete:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar miembro',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = EquipoController;
