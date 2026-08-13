const { body, param } = require('express-validator');

const eventosValidators = {
    create: [
        body('nombre')
            .trim()
            .notEmpty().withMessage('Ingresa el nombre del evento')
            .bail()
            .isLength({ max: 200 }).withMessage('El nombre no puede superar los 200 caracteres'),
        body('fecha')
            .trim()
            .notEmpty().withMessage('Selecciona la fecha del evento')
            .bail()
            .isISO8601({ strict: true }).withMessage('La fecha del evento no es válida'),
        body('lugar')
            .trim()
            .notEmpty().withMessage('Ingresa el lugar del evento'),
        body('tipo')
            .optional({ values: 'falsy' })
            .isIn(['Competencia', 'Presentación', 'Ensayo', 'Examen', 'Otro'])
            .withMessage('El tipo de evento no es válido'),
        body('costo')
            .optional({ values: 'falsy' })
            .isFloat({ min: 0 }).withMessage('El costo debe ser un número igual o mayor a cero'),
        body('cupo_maximo')
            .optional({ values: 'falsy' })
            .isInt({ min: 0 }).withMessage('El cupo máximo debe ser un número entero igual o mayor a cero'),
        body('costo_vestuario')
            .optional({ values: 'falsy' })
            .isFloat({ min: 0 }).withMessage('El costo de vestuario debe ser igual o mayor a cero'),
        body('costo_maquillaje')
            .optional({ values: 'falsy' })
            .isFloat({ min: 0 }).withMessage('El costo de maquillaje debe ser igual o mayor a cero'),
        body('costo_peinado')
            .optional({ values: 'falsy' })
            .isFloat({ min: 0 }).withMessage('El costo de peinado debe ser igual o mayor a cero'),
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
