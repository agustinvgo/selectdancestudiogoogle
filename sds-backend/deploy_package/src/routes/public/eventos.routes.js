const express = require('express');
const router = express.Router();
const { EventosController } = require('../../controllers/admin/eventos.controller');

// Obtener próximas competencias (público)
router.get('/proximas', EventosController.getPublicCompetencias);

module.exports = router;
