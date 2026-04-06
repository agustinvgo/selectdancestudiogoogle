const express = require('express');
const router = express.Router();
const { EventosController } = require('../../controllers/admin/eventos.controller');
const { verifyToken, isAdmin, isOwnerOrAdmin } = require('../../middlewares/auth.middleware');
const eventosValidators = require('../../validators/eventos.validators');
const { handleValidationErrors } = require('../../middlewares/validate.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// ===== EVENTOS =====
// Listar todos los eventos
router.get('/', EventosController.getAll);

// Obtener próximos eventos
router.get('/proximos', EventosController.getProximos);

// Obtener eventos de un alumno (admin o el propio alumno)
// ⚠️ Debe ir ANTES de /:id para evitar que Express lo interprete como /:id con id='alumno'
router.get('/alumno/:id', isOwnerOrAdmin, EventosController.getByAlumno);

// Actualizar checklist de inscripción — también antes de /:id para evitar conflictos
router.put('/inscripcion/:id/checklist', isAdmin, EventosController.updateChecklist);

// Obtener evento por ID
router.get('/:id', EventosController.getById);

// Crear evento (admin only)
router.post('/', isAdmin, eventosValidators.create, handleValidationErrors, EventosController.create);

// Actualizar evento (admin only)
router.put('/:id', isAdmin, eventosValidators.update, handleValidationErrors, EventosController.update);

// Inscribir alumno a evento (admin only)
router.post('/:id/inscribir', isAdmin, eventosValidators.inscribir, handleValidationErrors, EventosController.inscribirAlumno);

// Desinscribir alumno de evento (admin only)
router.delete('/:id/inscripcion/:inscripcionId', isAdmin, EventosController.desinscribirAlumno);

// Eliminar evento (admin only)
router.delete('/:id', isAdmin, EventosController.delete);

// ===== CURSOS =====
// Las rutas de cursos se manejan en cursos.routes.js

module.exports = router;
