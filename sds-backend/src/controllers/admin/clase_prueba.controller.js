const ClasePruebaModel = require('../../models/clase_prueba.model');
const { formatSchedule } = require('../../utils/formatters');

const ClasePruebaController = {
    async requestTrial(req, res) {
        try {
            const { nombre, apellido, email, telefono, interes, horario } = req.body;

            if (!nombre || !apellido || !email || !telefono) {
                return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
            }

            // Validar que no haya solicitado antes
            const existingRequest = await ClasePruebaModel.findByEmail(email);
            if (existingRequest) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe una solicitud registrada con este email. Solo se permite una clase de prueba por persona.'
                });
            }

            // Validar cupos si es un horario gestionado
            let disponibilidadId = null;
            if (horario.includes(' - ')) {
                // Formato esperado: YYYY-MM-DD - HH:mm
                const parts = horario.split(' - ');
                if (parts.length >= 2) {
                    const fecha = parts[0].trim();
                    // Si el horario tiene 'hs' al final, quitarlo para la búsqueda
                    const horaStr = parts[1].replace('hs', '').trim();

                    const disponibilidad = await ClasePruebaModel.findDisponibilidadByDetails(interes, fecha, horaStr);

                    if (disponibilidad) {
                        if (disponibilidad.cupos <= 0) {
                            return res.status(400).json({ success: false, message: 'Lo sentimos, este horario ya no tiene cupos disponibles.' });
                        }
                        disponibilidadId = disponibilidad.id;
                    }
                }
            }

            const { id, token } = await ClasePruebaModel.create({ nombre, apellido, email, telefono, interes, horario });

            // Decrementar cupo si corresponde
            if (disponibilidadId) {
                await ClasePruebaModel.decrementCupo(disponibilidadId);
            }

            // Enviar email de confirmación (no bloqueante)
            const EmailService = require('../../services/email.service');
            const cancelLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancelar-clase?token=${token}`;
            
            EmailService.enviarConfirmacionSolicitudPrueba(email, nombre, interes, formatSchedule(horario), cancelLink)
                .catch(err => console.error('Error enviando email confirmación prueba:', err));

            res.json({
                success: true,
                message: 'Solicitud enviada correctamente',
                data: { id }
            });
        } catch (error) {
            console.error('Error requestTrial:', error);
            res.status(500).json({ success: false, message: 'Error al enviar solicitud' });
        }
    },

    async getAll(req, res) {
        try {
            const solicitudes = await ClasePruebaModel.findAll();
            res.json({ success: true, data: solicitudes });
        } catch (error) {
            console.error('Error getAll trial requests:', error);
            res.status(500).json({ success: false, message: 'Error al obtener solicitudes' });
        }
    },

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;

            // Obtener datos actuales para enviar email si es necesario
            const solicitud = await ClasePruebaModel.findById(id);

            await ClasePruebaModel.updateStatus(id, estado);

            // Enviar emails automáticos según el nuevo estado
            if (solicitud) {
                const EmailService = require('../../services/email.service');
                const estadoLower = estado ? estado.toLowerCase() : '';

                if (estadoLower === 'agendado') {
                    EmailService.enviarConfirmacionAgendamiento(solicitud.email, solicitud.nombre, solicitud.interes, formatSchedule(solicitud.horario))
                        .catch(err => console.error('Error email agendado:', err));
                } else if (estadoLower === 'completado') {
                    EmailService.enviarAgradecimientoAsistencia(solicitud.email, solicitud.nombre)
                        .catch(err => console.error('Error email agradecimiento:', err));
                }
            }

            res.json({ success: true, message: 'Estado actualizado correctamente' });
        } catch (error) {
            console.error('Error updateStatus:', error);
            res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
        }
    },

    async delete(req, res) {
        try {
            const { id } = req.params;
            await ClasePruebaModel.delete(id);
            res.json({ success: true, message: 'Solicitud eliminada correctamente' });
        } catch (error) {
            console.error('Error delete request:', error);
            res.status(500).json({ success: false, message: 'Error al eliminar solicitud' });
        }
    },

    // --- Disponibilidad ---

    async getDisponibles(req, res) {
        try {
            const disponibles = await ClasePruebaModel.getDisponibles();
            res.json({ success: true, data: disponibles });
        } catch (error) {
            console.error('Error fetching available slots:', error);
            res.status(500).json({ success: false, message: 'Error al obtener disponibilidad' });
        }
    },

    async addDisponibilidad(req, res) {
        try {
            const { curso_id, fecha, horario, cupos = 10, weeks = 1, descripcion = null, titulo = null } = req.body;

            // Validate: Either curso_id OR titulo must be present
            if ((!curso_id && !titulo) || !fecha || !horario) {
                return res.status(400).json({ success: false, message: 'Faltan datos requeridos (Curso o Título)' });
            }

            const addedIds = [];
            let currentDate = new Date(fecha);

            for (let i = 0; i < weeks; i++) {
                // Generación de fecha robusta YYYY-MM-DD evitando desfases de zona horaria
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const day = String(currentDate.getDate()).padStart(2, '0');
                const dateStr = `${year}-${month}-${day}`;
 
                const id = await ClasePruebaModel.addDisponibilidad(curso_id || null, dateStr, horario, cupos, descripcion, titulo);
                addedIds.push(id);

                // Add 7 days for next iteration
                currentDate.setDate(currentDate.getDate() + 7);
            }

            res.json({ success: true, message: 'Disponibilidad agregada', data: { ids: addedIds } });
        } catch (error) {
            console.error('Error adding availability:', error);
            res.status(500).json({ success: false, message: 'Error al agregar disponibilidad' });
        }
    },

    async deleteDisponibilidad(req, res) {
        try {
            const { id } = req.params;
            await ClasePruebaModel.deleteDisponibilidad(id);
            res.json({ success: true, message: 'Disponibilidad eliminada' });
        } catch (error) {
            console.error('Error deleting availability:', error);
            res.status(500).json({ success: false, message: 'Error al eliminar disponibilidad' });
        }
    },

    async cancelTrial(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                return res.status(400).json({ success: false, message: 'Token requerido' });
            }

            const solicitud = await ClasePruebaModel.findByToken(token);
            if (!solicitud) {
                return res.status(404).json({ success: false, message: 'Solicitud no encontrada o enlace inválido' });
            }

            if (solicitud.estado === 'cancelada') {
                return res.status(400).json({ success: false, message: 'Esta clase ya ha sido cancelada' });
            }

            // 1. Update status
            await ClasePruebaModel.updateStatus(solicitud.id, 'cancelada');

            // 2. Restore cupo if applicable
            // Parse horario to find availability ID as done in requestTrial
            if (solicitud.horario && solicitud.horario.includes(' - ')) {
                const parts = solicitud.horario.split(' - ');
                if (parts.length >= 2) {
                    const fecha = parts[0].trim();
                    const horaStr = parts[1].replace('hs', '').trim();

                    const disponibilidad = await ClasePruebaModel.findDisponibilidadByDetails(solicitud.interes, fecha, horaStr);
                    if (disponibilidad) {
                        await ClasePruebaModel.incrementCupo(disponibilidad.id);
                    }
                }
            }

            res.json({ success: true, message: 'Clase cancelada correctamente. Esperamos verte pronto en otra oportunidad.' });

        } catch (error) {
            console.error('Error canceling trial:', error);
            res.status(500).json({ success: false, message: 'Error al cancelar la clase' });
        }
    }
};

module.exports = ClasePruebaController;
