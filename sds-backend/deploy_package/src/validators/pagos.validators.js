const { body, param } = require('express-validator');

const pagosValidators = {
    create: [
        body('alumno_id').isInt({ min: 1 }).withMessage('alumno_id debe ser un número entero positivo'),
        body('concepto').trim().notEmpty().isLength({ max: 200 }).withMessage('concepto es requerido (max 200 chars)'),
        body('monto').isFloat({ min: 0.01 }).withMessage('monto debe ser un número positivo mayor a cero'),
        body('estado').optional().trim().toLowerCase().isIn(['pendiente', 'pagado', 'parcial', 'revision', 'vencido', 'anulado']).withMessage('estado inválido'),
        body('impacto_financiero').optional().trim().toLowerCase().isIn(['ingreso', 'ajuste', 'informativo']).withMessage('impacto financiero inválido'),
        body('categoria_movimiento').optional({ nullable: true }).trim().isLength({ max: 50 }).withMessage('categoría demasiado extensa'),
        body('notas_pago').optional({ nullable: true }).trim().isLength({ max: 500 }).withMessage('descripción demasiado extensa'),
    ],
    update: [
        param('id').isInt({ min: 1 }).withMessage('ID de pago inválido'),
        body('monto').optional().isFloat({ min: 0.01 }).withMessage('monto debe ser un número positivo mayor a cero'),
        body('estado').optional().trim().toLowerCase().isIn(['pendiente', 'pagado', 'parcial', 'revision', 'vencido', 'anulado']).withMessage('estado inválido'),
        body('impacto_financiero').optional().trim().toLowerCase().isIn(['ingreso', 'ajuste', 'informativo']).withMessage('impacto financiero inválido'),
        body('categoria_movimiento').optional({ nullable: true }).trim().isLength({ max: 50 }).withMessage('categoría demasiado extensa'),
        body('notas_pago').optional({ nullable: true }).trim().isLength({ max: 500 }).withMessage('descripción demasiado extensa'),
    ],
    masivos: [
        body('mes').isInt({ min: 1, max: 12 }).withMessage('mes debe ser entre 1 y 12'),
        body('anio').isInt({ min: 2020, max: 2100 }).withMessage('anio inválido'),
    ]
};

module.exports = pagosValidators;
