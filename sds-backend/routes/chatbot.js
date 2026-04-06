const express = require('express');
const router = express.Router();
const whatsappBot = require('../services/whatsappBot');

/**
 * Webhook para recibir mensajes de WhatsApp desde Twilio
 * POST /api/chatbot/webhook/whatsapp
 */
router.post('/webhook/whatsapp', async (req, res) => {
    try {
        const { From, Body } = req.body;

        console.log(`📱 Mensaje recibido de ${From}: "${Body}"`);

        // Procesar mensaje con el bot
        const respuesta = await whatsappBot.procesarMensaje(From, Body);

        // Enviar respuesta
        await whatsappBot.enviarMensaje(From, respuesta);

        console.log(`🤖 Bot respondió: "${respuesta}"`);

        // Twilio espera una respuesta vacía o TwiML
        res.status(200).send('');

    } catch (error) {
        console.error('❌ Error en webhook:', error);

        // Enviar mensaje de error genérico al usuario
        try {
            await whatsappBot.enviarMensaje(
                req.body.From,
                'Disculpá, tuve un problema técnico 😅 Por favor escribí a 11-1234-5678 o intentá de nuevo en unos minutos.'
            );
        } catch (sendError) {
            console.error('Error enviando mensaje de error:', sendError);
        }

        res.status(500).send('');
    }
});

/**
 * Webhook para recibir status de mensajes
 * POST /api/chatbot/webhook/status
 */
router.post('/webhook/status', async (req, res) => {
    try {
        const { MessageStatus, MessageSid, To } = req.body;
        console.log(`📨 Status de mensaje ${MessageSid} a ${To}: ${MessageStatus}`);
        res.status(200).send('');
    } catch (error) {
        console.error('Error procesando status:', error);
        res.status(500).send('');
    }
});

/**
 * Endpoint de prueba para verificar que el bot funciona
 * GET /api/chatbot/test
 */
router.get('/test', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Bot de WhatsApp está funcionando',
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
