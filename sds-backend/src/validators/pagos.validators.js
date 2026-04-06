const { body, param } = require('express-validator');

const pagosValidators = {
    create: [
        body('alumno_id').isInt({ min: 1 }).withMessage('alumno_id debe ser un número entero positivo'),
        body('concepto').trim().notEmpty().isLength({ max: 200 }).withMessage('concepto es requerido (max 200 chars)'),
        body('monto').isFloat({ min: 0 }).withMessage('monto debe ser un número positivo'),
        body('estado').optional().trim().toLowerCase().isIn(['pendiente', 'pagado', 'parcial', 'revision', 'vencido', 'anulado']).withMessage('estado inválido'),
    ],
    update: [
        param('id').isInt({ min: 1 }).withMessage('ID de pago inválido'),
        body('monto').optional().isFloat({ min: 0 }).withMessage('monto debe ser un número positivo'),
        body('estado').optional().trim().toLowerCase().isIn(['pendiente', 'pagado', 'parcial', 'revision', 'vencido', 'anulado']).withMessage('estado inválido'),
    ],
    masivos: [
        body('mes').isInt({ min: 1, max: 12 }).withMessage('mes debe ser entre 1 y 12'),
        body('anio').isInt({ min: 2020, max: 2100 }).withMessage('anio inválido'),
    ]
};

module.exports = pagosValidators;
