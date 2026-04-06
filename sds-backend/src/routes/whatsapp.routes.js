/**
 * @file whatsapp.routes.js
 * @description Rutas protegidas (solo admin) para la gestión del bot de WhatsApp.
 */
const express = require('express');
const router = express.Router();
const WhatsAppController = require('../controllers/whatsapp.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación + rol admin
router.use(verifyToken, isAdmin);

// GET  /api/whatsapp/status     → Estado actual del bot
router.get('/status', WhatsAppController.getStatus);

// GET  /api/whatsapp/qr         → Obtener QR como base64
router.get('/qr', WhatsAppController.getQR);

// POST /api/whatsapp/initialize → Arrancar el bot (genera QR)
router.post('/initialize', WhatsAppController.initialize);

// POST /api/whatsapp/send       → Enviar mensaje { phone, message }
router.post('/send', WhatsAppController.sendMessage);

// POST /api/whatsapp/logout     → Desconectar y borrar sesión
router.post('/logout', WhatsAppController.logout);

module.exports = router;
