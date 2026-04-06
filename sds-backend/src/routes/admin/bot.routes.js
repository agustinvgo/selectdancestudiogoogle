
const express = require('express');
const router = express.Router();
const BotController = require('../../controllers/admin/bot.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');

// Rutas protegidas (Solo Admin)
router.use(verifyToken, isAdmin);

// Configuración (Prompt)
router.get('/prompt', BotController.getSystemPrompt);
router.put('/prompt', BotController.updateSystemPrompt);

// Conocimiento (Knowledge Base)
router.get('/knowledge', BotController.getAllKnowledge);
router.post('/knowledge', BotController.createKnowledge);
router.put('/knowledge/:id', BotController.updateKnowledge);
router.delete('/knowledge/:id', BotController.deleteKnowledge);

// Conexión
router.get('/status', BotController.getStatus);
router.post('/logout', BotController.logout);
router.post('/reset', BotController.hardReset);

module.exports = router;
