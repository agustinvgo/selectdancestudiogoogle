const express = require('express');
const router = express.Router();
const { verifyToken, isAlumno, isAdmin } = require('../../middlewares/auth.middleware');
const ctrl = require('../../controllers/common/transmisiones.controller');

// Usado por nginx (auth_request) para proteger la lectura del video. Hace su propia
// validación del token, por eso no lleva verifyToken.
router.get('/authorize', ctrl.authorizeRead);

// Alumno (padre): ve la clase en vivo de su hijo
router.get('/en-vivo', verifyToken, isAlumno, ctrl.enVivoAlumno);

// Admin: panel de control de transmisiones
router.get('/', verifyToken, isAdmin, ctrl.listAdmin);
router.post('/:cursoId/iniciar', verifyToken, isAdmin, ctrl.iniciar);
router.post('/:cursoId/detener', verifyToken, isAdmin, ctrl.detener);

module.exports = router;
