const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { verifyToken, isAlumno, isAdmin } = require('../../middlewares/auth.middleware');
const ctrl = require('../../controllers/common/transmisiones.controller');

const cameraReconnectLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => `admin:${req.user.id}`,
    message: {
        success: false,
        message: 'Se hicieron demasiados intentos. Esperá unos minutos antes de volver a probar.',
    },
});

// Usado por nginx (auth_request) para proteger la lectura del video. Hace su propia
// validación del token, por eso no lleva verifyToken.
router.get('/authorize', ctrl.authorizeRead);

// Alumno (padre): ve la clase en vivo de su hijo
router.get('/en-vivo', verifyToken, isAlumno, ctrl.enVivoAlumno);

// Admin: panel de control de transmisiones
router.get('/', verifyToken, isAdmin, ctrl.listAdmin);
router.get('/camara', verifyToken, isAdmin, ctrl.estadoCamara);
router.post('/camara/reconectar', verifyToken, isAdmin, cameraReconnectLimiter, ctrl.reconectarCamara);
router.post('/:cursoId/iniciar', verifyToken, isAdmin, ctrl.iniciar);
router.post('/:cursoId/detener', verifyToken, isAdmin, ctrl.detener);

module.exports = router;
