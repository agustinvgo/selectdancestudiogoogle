const express = require('express');
const router = express.Router();
const AlumnosController = require('../../controllers/admin/alumnos.controller');
const { verifyToken, isAdmin, isOwnerOrAdmin, isProfesor } = require('../../middlewares/auth.middleware');
const profileUpload = require('../../middlewares/profileUpload.middleware');
const { compress: compressImage } = require('../../middlewares/profileUpload.middleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Listar todos los alumnos (admin y profesores)
router.get('/', isProfesor, AlumnosController.getAll);

const { body, validationResult } = require('express-validator');

const validateAlumno = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 9 }).withMessage('La contraseña debe tener al menos 9 caracteres, una mayúscula, un número y un símbolo'),
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('apellido').notEmpty().withMessage('El apellido es requerido'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    }
];

// Crear alumno (solo admin) - Soporte para foto de perfil con compresión WebP
router.post('/', isAdmin, profileUpload.single('foto_perfil'), compressImage, validateAlumno, AlumnosController.create);

// Obtener ficha completa
router.get('/:id/ficha-completa', AlumnosController.getFichaCompleta);

// Obtener alumno específico (admin o el mismo alumno)
router.get('/:id', AlumnosController.getById);

// Actualizar alumno (solo admin) - Soporte para foto de perfil con compresión WebP
router.put('/:id', isAdmin, profileUpload.single('foto_perfil'), compressImage, AlumnosController.update);

// Eliminar alumno (solo admin)
router.delete('/:id', isAdmin, AlumnosController.delete);

module.exports = router;
