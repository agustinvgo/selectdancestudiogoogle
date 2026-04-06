const express = require('express');
const router = express.Router();
const CursosController = require('../../controllers/admin/cursos.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');
const { cacheMiddleware, invalidateCache } = require('../../middlewares/cache.middleware');

// Proteger todas las rutas
router.use(verifyToken);

// === Rutas de Cursos (Protegidas) ===
// ⚠️ Las rutas específicas deben ir ANTES de /:id para evitar route conflicts en Express
router.get('/', cacheMiddleware('cursos-list', 120), CursosController.getAll);
router.get('/mis-cursos', CursosController.getMyCourses);
router.get('/alumno/:id', CursosController.getByAlumno);      // Antes de /:id
router.get('/:id/participantes', CursosController.getParticipantes); // Antes de /:id
router.get('/:id', CursosController.getById);

router.post('/', isAdmin, invalidateCache('cursos-list'), CursosController.create);
router.put('/:id', isAdmin, invalidateCache('cursos-list'), CursosController.update);
router.delete('/:id', isAdmin, invalidateCache('cursos-list'), CursosController.delete);

// === Inscripciones ===
router.post('/:id/inscribir', isAdmin, invalidateCache('cursos-list'), CursosController.inscribirAlumno);
router.delete('/:id/alumno/:alumnoId', isAdmin, invalidateCache('cursos-list'), CursosController.desinscribirAlumno);

module.exports = router;
