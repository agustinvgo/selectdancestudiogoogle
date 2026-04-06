const express = require('express');
const router = express.Router();
const ConsultasController = require('../../controllers/admin/consultas.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');

const { publicFormLimiter } = require('../../middlewares/rateLimiters');

// Public route for receiving form submissions
router.post('/', publicFormLimiter, ConsultasController.create);

// Protected routes for admin
router.get('/', verifyToken, isAdmin, ConsultasController.getAll);
router.delete('/:id', verifyToken, isAdmin, ConsultasController.delete);
router.put('/:id/leido', verifyToken, isAdmin, ConsultasController.markAsRead);

module.exports = router;
