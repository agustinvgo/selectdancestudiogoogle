const express = require('express');
const router = express.Router();
const CursosController = require('../controllers/cursos.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Proteger todas las rutas
router.use(verifyToken);

// === Rutas de Cursos ===
// === Rutas de Cursos ===
router.get('/', CursosController.getAll);
router.get('/:id', CursosController.getById);
router.get('/alumno/:id', CursosController.getByAlumno);
router.get('/:id/participantes', CursosController.getParticipantes);
router.post('/', CursosController.create);
router.put('/:id', CursosController.update);
router.delete('/:id', CursosController.delete);

// === Inscripciones ===
// === Inscripciones ===
router.post('/:id/inscribir', CursosController.inscribirAlumno);
router.delete('/:id/alumno/:alumnoId', CursosController.desinscribirAlumno);

module.exports = router;
