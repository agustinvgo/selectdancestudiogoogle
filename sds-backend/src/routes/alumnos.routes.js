const express = require('express');
const router = express.Router();
const AlumnosController = require('../controllers/alumnos.controller');
const { verifyToken, isAdmin, isOwnerOrAdmin } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Listar todos los alumnos (solo admin)
router.get('/', isAdmin, AlumnosController.getAll);

// Crear alumno (solo admin)
router.post('/', isAdmin, AlumnosController.create);

// Obtener alumno específico (admin o el mismo alumno)
router.get('/:id', AlumnosController.getById);

// Obtener ficha completa
router.get('/:id/ficha-completa', AlumnosController.getFichaCompleta);

// Actualizar alumno (solo admin)
router.put('/:id', isAdmin, AlumnosController.update);

// Eliminar alumno (solo admin)
router.delete('/:id', isAdmin, AlumnosController.delete);

module.exports = router;
