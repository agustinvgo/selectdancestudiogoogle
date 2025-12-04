const express = require('express');
const router = express.Router();
const AsistenciasController = require('../controllers/asistencias.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener asistencias de un alumno
router.get('/alumno/:id', AsistenciasController.getByAlumno);

// Obtener lista de asistencia de un curso en una fecha (admin only)
router.get('/curso/:id', isAdmin, AsistenciasController.getByCurso);

// Marcar asistencia individual (admin only)
router.post('/', isAdmin, AsistenciasController.marcarAsistencia);

// Marcar asistencias masivas (admin only)
router.post('/masivas', isAdmin, AsistenciasController.marcarAsistenciasMasivas);

module.exports = router;
