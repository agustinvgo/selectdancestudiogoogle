const express = require('express');
const AgendaController = require('../../controllers/admin/agenda.controller');
const { verifyToken, isProfesor } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.use(verifyToken, isProfesor);
router.get('/', AgendaController.getWeekly);
router.put('/estado', AgendaController.setStatus);
router.put('/asistencia', AgendaController.setAttendance);

module.exports = router;
