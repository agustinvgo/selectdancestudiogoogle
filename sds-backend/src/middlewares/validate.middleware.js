const { validationResult, body, query } = require('express-validator');

// Conserva la dirección tal como fue registrada (incluidos puntos y alias con +).
// normalizeEmail() aplica reglas propias de proveedores como Gmail y puede convertir
// un correo válido en otro distinto antes de buscarlo en la base de datos.
const normalizeEmailAddress = (value) => (
    typeof value === 'string' ? value.trim().toLowerCase() : value
);

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors: errors.array()
        });
    }
    next();
};

// Reglas de validación comunes
const commonValidations = {
    // Sanitizar cualquier entrada de texto para evitar XSS básico
    sanitizeText: (field) => body(field).trim().escape(),

    // Validar emails
    email: body('email')
        .trim()
        .isEmail()
        .withMessage('Email inválido')
        .bail()
        .customSanitizer(normalizeEmailAddress),

    // Validar contraseñas fuertes
    password: body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),

    // Validar IDs numéricos comunes
    idParam: query('id').optional().toInt().isInt().withMessage('ID debe ser un número entero')
};

module.exports = {
    handleValidationErrors,
    commonValidations,
    normalizeEmailAddress
};
