const express = require('express');
const router = express.Router();
const EstadisticasController = require('../../controllers/admin/estadisticas.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');

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

// Obtener balance neto (ingresos - gastos)
router.get('/balance-financiero', EstadisticasController.getBalanceFinanciero);

// Obtener mejores alumnos por asistencia
router.get('/mejores-asistencias', EstadisticasController.getMejoresAsistencias);

// Obtener distribución de edades
router.get('/distribucion-edades', EstadisticasController.getDistribucionEdades);

// Obtener asistencia por día de la semana
router.get('/asistencia-por-dia', EstadisticasController.getAsistenciaPorDia);

module.exports = router;
