const express = require('express');
const router = express.Router();
const { EventosController } = require('../controllers/eventos.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// ===== EVENTOS =====
// Listar todos los eventos
router.get('/', EventosController.getAll);

// Obtener próximos eventos
router.get('/proximos', EventosController.getProximos);

// Obtener evento por ID
router.get('/:id', EventosController.getById);

// Crear evento (admin only)
router.post('/', isAdmin, EventosController.create);

// Inscribir alumno a evento (admin only)
router.post('/:id/inscribir', isAdmin, EventosController.inscribirAlumno);

// Actualizar checklist de inscripción
router.put('/inscripcion/:id/checklist', EventosController.updateChecklist);

// Eliminar evento (admin only)
router.delete('/:id', isAdmin, EventosController.delete);

// Obtener eventos de un alumno
router.get('/alumno/:id', EventosController.getByAlumno);

// ===== CURSOS =====
// Las rutas de cursos se manejan en cursos.routes.js

module.exports = router;
