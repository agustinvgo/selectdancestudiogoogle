const express = require('express');
const router = express.Router();
const UsuariosController = require('../../controllers/admin/usuarios.controller');
const { verifyToken, isProfesor, isAdmin } = require('../../middlewares/auth.middleware');

// Proteger rutas
router.use(verifyToken);

// Rutas de gestión de profesores
router.get('/profesores', isProfesor, UsuariosController.getProfesores);
router.post('/profesores', isAdmin, UsuariosController.createProfesor);
router.put('/profesores/:id', isAdmin, UsuariosController.updateProfesor);
router.delete('/profesores/:id', isAdmin, UsuariosController.deleteProfesor);

module.exports = router;
