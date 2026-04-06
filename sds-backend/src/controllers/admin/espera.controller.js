const EsperaModel = require('../../models/espera.model');
const ClasePruebaModel = require('../../models/clase_prueba.model');

const EsperaController = {
    async joinWaitingList(req, res) {
        try {
            const { curso_nombre, fecha, horario, nombre, email, telefono } = req.body;

            if (!curso_nombre || !fecha || !horario || !nombre || !email) {
                return res.status(400).json({ success: false, message: 'Faltan datos requeridos (nombre, email, curso, fecha, horario)' });
            }

            // 1. Find disponibilidad ID
            const disponibilidad = await ClasePruebaModel.findDisponibilidadByDetails(curso_nombre, fecha, horario);

            if (!disponibilidad) {
                return res.status(404).json({ success: false, message: 'La clase seleccionada no existe.' });
            }

            // 2. Add to waiting list
            await EsperaModel.create({
                disponibilidad_id: disponibilidad.id,
                nombre,
                email,
                telefono
            });

            // TODO: Send confirmation email to user specific for waiting list?

            res.status(201).json({ success: true, message: 'Te has unido a la lista de espera correctamente.' });

        } catch (error) {
            console.error('Error joining waiting list:', error);
            res.status(500).json({ success: false, message: 'Error al unirse a la lista de espera' });
        }
    }
};

module.exports = EsperaController;
