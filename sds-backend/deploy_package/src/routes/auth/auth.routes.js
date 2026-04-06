const express = require('express');
const router = express.Router();
const AuthController = require('../../controllers/auth/auth.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');
const { authLimiter } = require('../../middlewares/rateLimiters');
const { commonValidations, handleValidationErrors } = require('../../middlewares/validate.middleware');

// Rutas públicas
router.post('/login',
    authLimiter,
    [
        commonValidations.sanitizeText('email'),
        commonValidations.email,
        commonValidations.password
    ],
    handleValidationErrors,
    AuthController.login
);

router.post('/register',
    verifyToken,
    [
        commonValidations.sanitizeText('nombre'),
        commonValidations.sanitizeText('apellido'),
        commonValidations.email,
        commonValidations.password,
        // Rol validate is specific here, so we keep it inline or add to common if reused
        require('express-validator').body('rol').isIn(['admin', 'profesor', 'alumno']).withMessage('Rol inválido')
    ],
    handleValidationErrors,
    AuthController.register
);

router.post('/forgot-password',
    authLimiter,
    [commonValidations.email],
    handleValidationErrors,
    AuthController.forgotPassword
);

router.post('/reset-password',
    authLimiter,
    [
        commonValidations.password,
        require('express-validator').body('token').notEmpty()
    ],
    handleValidationErrors,
    AuthController.resetPassword
);

// Rutas protegidas
router.get('/me', verifyToken, AuthController.me);
router.post('/logout', verifyToken, AuthController.logout);
router.put('/change-password',
    verifyToken,
    [
        require('express-validator').body('oldPassword').notEmpty(),
        require('express-validator').body('newPassword').isLength({ min: 6 })
    ],
    handleValidationErrors,
    AuthController.changePassword
);

module.exports = router;
