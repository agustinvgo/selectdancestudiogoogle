const express = require('express');
const router = express.Router();
const NotificacionesController = require('../../controllers/common/notificaciones.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/notificationUpload.middleware');

const uploadNotificationImage = (req, res, next) => {
    upload.single('imagen')(req, res, (error) => {
        if (!error) return next();

        const message = error.code === 'LIMIT_FILE_SIZE'
            ? 'La imagen supera el máximo permitido de 10 MB.'
            : error.message;
        return res.status(400).json({ success: false, message });
    });
};

// Rutas base: /api/notificaciones

// Admin Only (Rutas específicas PRIMERO)
router.get('/pausa', verifyToken, isAdmin, NotificacionesController.getPausa);
router.put('/pausa', verifyToken, isAdmin, NotificacionesController.setPausa);
router.post('/send', verifyToken, isAdmin, uploadNotificationImage, NotificacionesController.sendNotification);
router.get('/sent-history', verifyToken, isAdmin, NotificacionesController.getSentHistory);
router.get('/batch/:batch_id/recipients', verifyToken, isAdmin, NotificacionesController.getBatchRecipients);
router.delete('/batch/:batch_id', verifyToken, isAdmin, NotificacionesController.deleteBatch);

// Public (Autenticados)
router.get('/counts', verifyToken, NotificacionesController.getPendingCounts);
router.get('/', verifyToken, NotificacionesController.getMyNotifications);
router.put('/read-all', verifyToken, NotificacionesController.markAllAsRead);
router.put('/:id/read', verifyToken, NotificacionesController.markAsRead);
router.delete('/:id', verifyToken, NotificacionesController.delete);

module.exports = router;

