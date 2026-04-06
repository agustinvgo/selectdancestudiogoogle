const { body, param } = require('express-validator');

const alumnosValidators = {
    create: [
        body('nombre').trim().notEmpty().isLength({ max: 100 }).withMessage('nombre es requerido (max 100 chars)'),
        body('apellido').trim().notEmpty().isLength({ max: 100 }).withMessage('apellido es requerido (max 100 chars)'),
        body('email').isEmail().normalizeEmail().withMessage('email inválido'),
        body('telefono').optional().trim().matches(/^[\d\s\-+()]+$/).withMessage('teléfono con formato inválido'),
        body('fecha_nacimiento').optional().isISO8601().withMessage('fecha_nacimiento debe ser formato ISO (YYYY-MM-DD)'),
    ],
    update: [
        param('id').isInt({ min: 1 }).withMessage('ID de alumno inválido'),
        body('nombre').optional().trim().notEmpty().isLength({ max: 100 }).withMessage('nombre inválido'),
        body('email').optional().isEmail().normalizeEmail().withMessage('email inválido'),
    ]
};

module.exports = alumnosValidators;
