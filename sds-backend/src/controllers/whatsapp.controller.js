/**
 * @file whatsapp.controller.js
 * @description Controlador REST para gestionar el bot de WhatsApp desde el panel de admin.
 * Expone endpoints para: obtener estado, obtener QR, enviar mensajes y desconectar.
 */
const whatsappService = require('../services/whatsapp.service');

const WhatsAppController = {
    /**
     * GET /api/whatsapp/status
     * @description Devuelve el estado actual del bot (connected, qr_pending, disconnected).
     */
    async getStatus(req, res) {
        try {
            const statusInfo = whatsappService.getStatus();
            res.json({
                success: true,
                data: statusInfo
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error obteniendo estado del bot',
                error: error.message
            });
        }
    },

    /**
     * GET /api/whatsapp/qr
     * @description Devuelve el QR como Data URI base64 para renderizar en el frontend.
     * Si no hay QR pendiente devuelve null.
     */
    async getQR(req, res) {
        try {
            const qr = whatsappService.getQR();
            const status = whatsappService.getStatus();
            res.json({
                success: true,
                data: {
                    qr,
                    status: status.status
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error obteniendo QR',
                error: error.message
            });
        }
    },

    /**
     * POST /api/whatsapp/initialize
     * @description Arranca el cliente de WhatsApp. Genera el QR si no hay sesión guardada.
     */
    async initialize(req, res) {
        try {
            // Lanzamos la inicialización en background (no await completo)
            // porque puede tardar varios segundos en arrancar Puppeteer
            whatsappService.initialize().catch(err => {
                console.error('[WhatsApp Controller] Error en inicialización:', err.message);
            });

            res.json({
                success: true,
                message: 'Inicialización del bot en progreso. El QR aparecerá en unos segundos.'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error iniciando el bot',
                error: error.message
            });
        }
    },

    /**
     * POST /api/whatsapp/send
     * @description Envía un mensaje de texto a un número de WhatsApp.
     * @body { phone: string, message: string }
     */
    async sendMessage(req, res) {
        try {
            const { phone, message } = req.body;

            if (!phone || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere un número de teléfono y un mensaje.'
                });
            }

            const result = await whatsappService.sendMessage(phone, message);
            res.json({
                success: true,
                message: `Mensaje enviado exitosamente a ${result.phone}`,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Error enviando mensaje'
            });
        }
    },

    /**
     * POST /api/whatsapp/logout
     * @description Desconecta el bot y borra la sesión de autenticación.
     */
    async logout(req, res) {
        try {
            await whatsappService.logout();
            res.json({
                success: true,
                message: 'Bot desconectado correctamente.'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error desconectando el bot',
                error: error.message
            });
        }
    }
};

module.exports = WhatsAppController;
