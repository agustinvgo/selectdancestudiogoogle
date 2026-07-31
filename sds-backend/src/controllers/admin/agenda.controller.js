const AgendaModel = require('../../models/agenda.model');

const sendError = (res, error, fallbackMessage) => {
    console.error(`[Agenda] ${fallbackMessage}:`, error);
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.statusCode ? error.message : fallbackMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
};

const AgendaController = {
    async getWeekly(req, res) {
        try {
            const agenda = await AgendaModel.getWeekly(req.user, req.query.fecha);
            res.json({ success: true, data: agenda });
        } catch (error) {
            sendError(res, error, 'Error al obtener la agenda semanal');
        }
    },

    async setStatus(req, res) {
        try {
            await AgendaModel.setStatus(req.user, req.body);
            res.json({ success: true, message: 'Estado actualizado correctamente' });
        } catch (error) {
            sendError(res, error, 'Error al actualizar la confirmación');
        }
    },

    async setAttendance(req, res) {
        try {
            await AgendaModel.setAttendance(req.user, req.body);
            res.json({ success: true, message: 'Asistencia actualizada correctamente' });
        } catch (error) {
            sendError(res, error, 'Error al actualizar la asistencia');
        }
    }
};

module.exports = AgendaController;
