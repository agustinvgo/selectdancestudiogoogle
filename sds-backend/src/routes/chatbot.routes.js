const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

/**
 * Endpoint de prueba para verificar que el bot funciona - ADMIN ONLY
 * GET /api/chatbot/test
 */
router.get('/test', verifyToken, isAdmin, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Bot de WhatsApp está funcionando',
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error interno'
        });
    }
});

module.exports = router;
