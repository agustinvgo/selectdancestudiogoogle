const express = require('express');
const router = express.Router();
const AsistenciasController = require('../../controllers/admin/asistencias.controller');
const { verifyToken, isAdmin, isProfesor, isOwnerOrAdmin } = require('../../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener MIS asistencias (alumno logueado) - no requiere ID param, usa JWT
router.get('/mis-asistencias', AsistenciasController.getMisAsistencias);

// Obtener asistencias de un alumno (admin o el propio alumno)
router.get('/alumno/:id', isOwnerOrAdmin, AsistenciasController.getByAlumno);

// Obtener historia de asistencias de un alumno (admin o el propio alumno)
router.get('/alumno/:id/historia', isOwnerOrAdmin, AsistenciasController.getHistoria);

// Obtener lista de asistencia de un curso en una fecha (admin y profesores)
router.get('/curso/:id', isProfesor, AsistenciasController.getByCurso);

// Marcar asistencia individual (admin y profesores)
router.post('/', isProfesor, AsistenciasController.marcarAsistencia);

// Marcar asistencias masivas (admin y profesores)
router.post('/masivas', isProfesor, AsistenciasController.marcarAsistenciasMasivas);

module.exports = router;
