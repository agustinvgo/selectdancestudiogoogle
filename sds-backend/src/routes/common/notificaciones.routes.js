const express = require('express');
const router = express.Router();
const NotificacionesController = require('../../controllers/common/notificaciones.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/notificationUpload.middleware');

// Rutas base: /api/notificaciones

// Public (Authenticados)
router.get('/counts', verifyToken, NotificacionesController.getPendingCounts);
router.get('/', verifyToken, NotificacionesController.getMyNotifications);
router.put('/:id/read', verifyToken, NotificacionesController.markAsRead);
router.put('/read-all', verifyToken, NotificacionesController.markAllAsRead);
router.delete('/:id', verifyToken, NotificacionesController.delete);

// Admin Only
router.post('/send', verifyToken, isAdmin, upload.single('imagen'), NotificacionesController.sendNotification);
router.get('/sent-history', verifyToken, isAdmin, NotificacionesController.getSentHistory);
router.delete('/batch/:batch_id', verifyToken, isAdmin, NotificacionesController.deleteBatch);

module.exports = router;
