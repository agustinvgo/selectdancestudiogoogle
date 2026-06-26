const express = require('express');
const router = express.Router();
const PagosController = require('../../controllers/admin/pagos.controller');
const { verifyToken, isAdmin, isOwnerOrAdmin, isAlumnoOwnerOrAdmin } = require('../../middlewares/auth.middleware');
const { uploadLimiter } = require('../../middlewares/rateLimiters');
const pagosValidators = require('../../validators/pagos.validators');
const { handleValidationErrors } = require('../../middlewares/validate.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener todos los pagos con filtros (admin only)
router.get('/', isAdmin, PagosController.getAll);

// Obtener pagos pendientes (admin only)
router.get('/pendientes', isAdmin, PagosController.getPendientes);

// Obtener estado financiero (admin only)
router.get('/estado-financiero', isAdmin, PagosController.getEstadoFinanciero);

// Obtener MIS pagos (alumno logueado) - no requiere ID param, usa JWT
router.get('/mis-pagos', PagosController.getMisPagos);

// Obtener pagos de un alumno (admin o el propio alumno — :id es alumnos.id)
router.get('/alumno/:id', isAlumnoOwnerOrAdmin, PagosController.getByAlumno);

// Crear pago (admin only)
router.post('/', isAdmin, pagosValidators.create, handleValidationErrors, PagosController.create);

// Generar masivos (admin only)
router.post('/masivos', isAdmin, pagosValidators.masivos, handleValidationErrors, PagosController.generarMasivos);

// Aplicar descuento familiar (admin only)
router.post('/aplicar-descuento', isAdmin, PagosController.aplicarDescuentoFamiliar);

// Crear plan de cuotas (admin only)
router.post('/plan-cuotas', isAdmin, PagosController.crearPlanCuotas);

// Obtener estadísticas avanzadas para dashboard (admin only) — debe ir ANTES de /:id
router.get('/estadisticas-avanzadas', isAdmin, PagosController.getEstadisticasAvanzadas);

// Generar comprobante PDF (requiere ser dueño o admin) — debe ir ANTES de /:id
router.get('/:id/comprobante', isOwnerOrAdmin, PagosController.generarComprobante);

// Actualizar pago (admin only)
router.put('/:id', isAdmin, pagosValidators.update, handleValidationErrors, PagosController.update);

// Eliminar pago (admin only)
router.delete('/:id', isAdmin, PagosController.delete);

// Calcular recargo por mora (admin only)
router.post('/calcular-recargo/:id', isAdmin, PagosController.calcularRecargo);

// Importar middleware de upload centralizado
const upload = require('../../middlewares/upload.middleware');
const multer = require('multer'); // Necesario para multer.MulterError en el handler de error

// Subir comprobante (Alumno) - Fix #6: rate limiter en uploads
router.post('/:id/comprobante', uploadLimiter, (req, res, next) => {
    upload.single('comprobante')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.error('Multer error:', err);
            return res.status(400).json({ success: false, message: `Error de subida: ${err.message}` });
        } else if (err) {
            console.error('Unknown upload error:', err);
            return res.status(400).json({ success: false, message: err.message });
        }
        next();
    });
}, PagosController.subirComprobante);

// Ver comprobante (Admin/Alumno) - Fix #1: requiere ser dueño o admin
router.get('/:id/archivo-comprobante', isOwnerOrAdmin, PagosController.verComprobante);

// Validar o Rechazar comprobante (Admin only) - Se usa el update general pero podemos hacer uno especifico si se necesita logica extra
// router.post('/:id/validar-comprobante', isAdmin, PagosController.validarComprobante);

module.exports = router;
