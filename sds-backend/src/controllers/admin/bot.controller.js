

const BotModel = require('../../models/bot.model');
const whatsappBot = require('../../services/whatsappBot');

const BotController = {
    // --- Configuración ---

    async getSystemPrompt(req, res) {
        try {
            const prompt = await BotModel.getConfig('system_prompt');
            res.json({ success: true, data: prompt });
        } catch (error) {
            console.error('Error getting prompt:', error);
            res.status(500).json({ success: false, message: 'Error al obtener prompt.' });
        }
    },

    async updateSystemPrompt(req, res) {
        try {
            const { prompt } = req.body;
            await BotModel.setConfig('system_prompt', prompt);
            res.json({ success: true, message: 'Prompt actualizado correctamente.' });
        } catch (error) {
            console.error('Error updating prompt:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar prompt.' });
        }
    },

    // --- Conocimiento ---

    async getAllKnowledge(req, res) {
        try {
            // Admin quiere ver todos, incluidos inactivos
            const knowledge = await BotModel.getAllKnowledge(false);
            res.json({ success: true, data: knowledge });
        } catch (error) {
            console.error('Error getting knowledge:', error);
            res.status(500).json({ success: false, message: 'Error al obtener conocimiento.' });
        }
    },

    async createKnowledge(req, res) {
        try {
            const id = await BotModel.createKnowledge(req.body);
            res.json({ success: true, message: 'Tema creado.', data: { id } });
        } catch (error) {
            console.error('Error creating knowledge:', error);
            res.status(500).json({ success: false, message: 'Error al crear tema.' });
        }
    },

    async updateKnowledge(req, res) {
        try {
            const { id } = req.params;
            await BotModel.updateKnowledge(id, req.body);
            res.json({ success: true, message: 'Tema actualizado.' });
        } catch (error) {
            console.error('Error updating knowledge:', error);
            res.status(500).json({ success: false, message: 'Error al actualizar tema.' });
        }
    },

    async deleteKnowledge(req, res) {
        try {
            const { id } = req.params;
            await BotModel.deleteKnowledge(id);
            res.json({ success: true, message: 'Tema eliminado.' });
        } catch (error) {
            console.error('Error deleting knowledge:', error);
            res.status(500).json({ success: false, message: 'Error al eliminar tema.' });
        }
    },

    // --- Conexión WhatsApp ---

    async getStatus(req, res) {
        try {
            const status = await whatsappBot.getStatus();
            res.json({ success: true, data: status });
        } catch (error) {
            console.error('Error getting status:', error);
            res.status(500).json({ success: false, message: 'Error al obtener estado.' });
        }
    },

    async logout(req, res) {
        try {
            await whatsappBot.logout();
            res.json({ success: true, message: 'Sesión cerrada. Escanea el QR nuevamente.' });
        } catch (error) {
            console.error('Error logging out:', error);
            res.status(500).json({ success: false, message: 'Error al cerrar sesión.' });
        }
    },

    async hardReset(req, res) {
        try {
            const result = await whatsappBot.hardReset();
            res.json(result);
        } catch (error) {
            console.error('Error en Hard Reset:', error);
            res.status(500).json({ success: false, message: 'Error al reiniciar el bot de WhatsApp.' });
        }
    }
};

module.exports = BotController;
