const express = require('express');
const router = express.Router();
const EstadisticasController = require('../controllers/estadisticas.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación y rol de admin
router.use(verifyToken, isAdmin);

// Obtener asistencia promedio general
router.get('/asistencia-promedio', EstadisticasController.getAsistenciaPromedio);

// Obtener asistencias por mes (últimos 12 meses)
router.get('/asistencias-por-mes', EstadisticasController.getAsistenciasPorMes);

// Obtener cursos más populares (top 5)
router.get('/cursos-populares', EstadisticasController.getCursosPopulares);

// Obtener tasa de retención de alumnos
router.get('/tasa-retencion', EstadisticasController.getTasaRetencion);

// Obtener nuevos alumnos por mes (últimos 6 meses)
router.get('/nuevos-alumnos', EstadisticasController.getNuevosAlumnosPorMes);

// Obtener distribución de alumnos por curso
router.get('/distribucion-cursos', EstadisticasController.getDistribucionPorCurso);

module.exports = router;
