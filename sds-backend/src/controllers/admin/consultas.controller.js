const ConsultasModel = require('../../models/consultas.model');
const emailService = require('../../services/email.service');

const ConsultasController = {
    async create(req, res) {
        try {
            const { nombre, email, telefono, mensaje } = req.body;

            if (!nombre || !email || !mensaje) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos obligatorios'
                });
            }

            const id = await ConsultasModel.create({ nombre, email, telefono, mensaje });

            // Enviar email de notificación automática al admin
            emailService.notificarAdminNuevaConsulta({ nombre, email, telefono, mensaje })
                .catch(err => console.error('Error enviando notificación consulta:', err));

            // Enviar respuesta
            res.status(201).json({
                success: true,
                message: 'Consulta enviada correctamente',
                data: { id }
            });

        } catch (error) {
            console.error('Error creando consulta:', error);
            res.status(500).json({
                success: false,
                message: 'Error al enviar la consulta'
            });
        }
    },

    async getAll(req, res) {
        try {
            const consultas = await ConsultasModel.getAll();
            res.json({
                success: true,
                data: consultas
            });
        } catch (error) {
            console.error('Error obteniendo consultas:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener consultas'
            });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            await ConsultasModel.delete(id);
            res.json({
                success: true,
                message: 'Consulta eliminada'
            });
        } catch (error) {
            console.error('Error eliminando consulta:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar consulta'
            });
        }
    },

    async markAsRead(req, res) {
        try {
            const { id } = req.params;
            await ConsultasModel.markAsRead(id);
            res.json({
                success: true,
                message: 'Consulta marcada como leída'
            });
        } catch (error) {
            console.error('Error actualizando consulta:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar consulta'
            });
        }
    }
};

module.exports = ConsultasController;
