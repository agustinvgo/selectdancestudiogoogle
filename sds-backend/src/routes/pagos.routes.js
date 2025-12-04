const express = require('express');
const router = express.Router();
const PagosController = require('../controllers/pagos.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener todos los pagos con filtros (admin only)
router.get('/', isAdmin, PagosController.getAll);

// Obtener pagos pendientes (admin only)
router.get('/pendientes', isAdmin, PagosController.getPendientes);

// Obtener estado financiero (admin only)
router.get('/estado-financiero', isAdmin, PagosController.getEstadoFinanciero);

// Obtener pagos de un alumno
router.get('/alumno/:id', PagosController.getByAlumno);

// Crear pago (admin only)
router.post('/', isAdmin, PagosController.create);

// Generar masivos (admin only)
router.post('/masivos', isAdmin, PagosController.generarMasivos);

// Actualizar pago
router.put('/:id', PagosController.update);

// Calcular recargo por mora (admin only)
router.post('/calcular-recargo/:id', isAdmin, PagosController.calcularRecargo);

// Aplicar descuento familiar (admin only)
router.post('/aplicar-descuento', isAdmin, PagosController.aplicarDescuentoFamiliar);

// Crear plan de cuotas (admin only)
router.post('/plan-cuotas', isAdmin, PagosController.crearPlanCuotas);

// Generar comprobante PDF
router.get('/:id/comprobante', PagosController.generarComprobante);

// Obtener estadísticas avanzadas para dashboard (admin only)
router.get('/estadisticas-avanzadas', isAdmin, PagosController.getEstadisticasAvanzadas);

module.exports = router;
