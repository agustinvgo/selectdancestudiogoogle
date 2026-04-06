const { body, param } = require('express-validator');

const eventosValidators = {
    create: [
        body('nombre').trim().notEmpty().isLength({ max: 200 }).withMessage('nombre es requerido (max 200 chars)'),
        body('fecha').isISO8601().withMessage('fecha debe ser formato ISO (YYYY-MM-DD)'),
        body('lugar').trim().notEmpty().withMessage('lugar es requerido'),
        body('tipo').optional().isIn(['Competencia', 'Presentación', 'Examen', 'Otro']).withMessage('tipo de evento inválido'),
        body('costo').optional().isFloat({ min: 0 }).withMessage('costo debe ser positivo'),
    ],
    update: [
        param('id').isInt({ min: 1 }).withMessage('ID de evento inválido'),
        body('nombre').trim().notEmpty().withMessage('nombre es requerido'),
    ],
    inscribir: [
        param('id').isInt({ min: 1 }).withMessage('ID de evento inválido'),
        body('alumno_id').isInt({ min: 1 }).withMessage('alumno_id debe ser un número entero positivo'),
    ]
};

module.exports = eventosValidators;
