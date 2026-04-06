const express = require('express');
const router = express.Router();
const ClasePruebaController = require('../../controllers/admin/clase_prueba.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');

const { publicFormLimiter } = require('../../middlewares/rateLimiters');

// Public
router.post('/', publicFormLimiter, ClasePruebaController.requestTrial);
router.post('/cancel', publicFormLimiter, ClasePruebaController.cancelTrial);

// Admin
router.get('/', verifyToken, isAdmin, ClasePruebaController.getAll);
router.put('/:id/estado', verifyToken, isAdmin, ClasePruebaController.updateStatus);
router.delete('/:id', verifyToken, isAdmin, ClasePruebaController.delete);

// Disponibilidad
router.get('/disponibles', ClasePruebaController.getDisponibles);
router.post('/disponibles', verifyToken, isAdmin, ClasePruebaController.addDisponibilidad);
router.delete('/disponibles/:id', verifyToken, isAdmin, ClasePruebaController.deleteDisponibilidad);

module.exports = router;
