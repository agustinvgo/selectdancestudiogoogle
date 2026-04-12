const express = require('express');
const router = express.Router();
const WhatsAppController = require('../../controllers/common/whatsapp.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');

// Rutas públicas (solo requieren autenticación básica, o test local)
router.get('/templates', verifyToken, WhatsAppController.obtenerTemplates);
router.get('/variables', verifyToken, WhatsAppController.obtenerVariables);
router.get('/send-summary', WhatsAppController.enviarResumenClases);  // cron interno (sin auth)
router.post('/send-summary', verifyToken, isAdmin, WhatsAppController.enviarResumenManual); // trigger manual (admin)

// Todas las demás rutas requieren autenticación y permisos de admin
router.use(verifyToken);
router.use(isAdmin);

// Enviar mensaje individual
router.post('/send', WhatsAppController.enviarMensaje);

// Enviar recordatorio de pago
router.post('/reminder', WhatsAppController.enviarRecordatorio);

// Enviar mensaje masivo
router.post('/broadcast', WhatsAppController.enviarMasivo);

// Enviar notificación de evento
router.post('/event-notification', WhatsAppController.enviarNotificacionEvento);

// Test manual de cron jobs
router.post('/test-cron', WhatsAppController.testCron);

// Estado de conexión y QR
router.get('/status', WhatsAppController.getStatus);

module.exports = router;
