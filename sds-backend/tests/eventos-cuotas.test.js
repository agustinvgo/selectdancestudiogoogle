jest.mock('../src/models/eventos.model', () => ({
    findById: jest.fn(),
    inscribirAlumno: jest.fn()
}));
jest.mock('../src/models/alumnos.model', () => ({
    findById: jest.fn()
}));
jest.mock('../src/models/pagos.model', () => ({
    create: jest.fn()
}));
jest.mock('../src/services/pagos.service', () => ({
    crearPlanDeCuotas: jest.fn()
}));
jest.mock('../src/services/email.service', () => ({
    enviarConfirmacionInscripcionEvento: jest.fn()
}));

const EventosModel = require('../src/models/eventos.model');
const AlumnosModel = require('../src/models/alumnos.model');
const PagosModel = require('../src/models/pagos.model');
const PagosService = require('../src/services/pagos.service');
const EventosService = require('../src/services/eventos.service');

describe('EventosService.inscribirAlumnoConPagos', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        EventosModel.inscribirAlumno.mockResolvedValue(55);
        AlumnosModel.findById.mockResolvedValue(null);
    });

    test('genera cuotas para el costo principal y mantiene los adicionales separados', async () => {
        EventosModel.findById.mockResolvedValue({
            id: 9,
            nombre: 'Competencia Nacional',
            fecha: '2026-11-30',
            costo_inscripcion: 100,
            costo_vestuario: 20,
            costo_maquillaje: 0,
            costo_peinado: 0,
            modalidad_pago: 'cuotas',
            cantidad_cuotas: 3,
            fecha_primera_cuota: '2026-08-15'
        });
        PagosService.crearPlanDeCuotas.mockResolvedValue({
            cuotas: 3,
            pagosCreados: [101, 102, 103],
            montosCuotas: [33.33, 33.33, 33.34]
        });
        PagosModel.create.mockResolvedValue(104);

        const result = await EventosService.inscribirAlumnoConPagos(7, 9);

        expect(PagosService.crearPlanDeCuotas).toHaveBeenCalledWith(expect.objectContaining({
            alumno_id: 7,
            monto_total: 100,
            cuotas: 3,
            fecha_primera_cuota: '2026-08-15',
            referencia_externa: 'EVENTO-9-INSCRIPCION-55'
        }));
        expect(PagosModel.create).toHaveBeenCalledTimes(1);
        expect(PagosModel.create).toHaveBeenCalledWith(expect.objectContaining({
            concepto: 'Vestuario - Competencia Nacional',
            monto: 20
        }));
        expect(result.pagos_creados).toHaveLength(4);
        expect(result.total_pagos).toBeCloseTo(120, 2);
    });

    test('mantiene un cobro único cuando el evento no usa cuotas', async () => {
        EventosModel.findById.mockResolvedValue({
            id: 10,
            nombre: 'Presentación Anual',
            fecha: '2026-12-10',
            costo_inscripcion: 80,
            costo_vestuario: 0,
            costo_maquillaje: 0,
            costo_peinado: 0,
            modalidad_pago: 'unico',
            cantidad_cuotas: 1
        });
        PagosModel.create.mockResolvedValue(201);

        const result = await EventosService.inscribirAlumnoConPagos(8, 10);

        expect(PagosService.crearPlanDeCuotas).not.toHaveBeenCalled();
        expect(PagosModel.create).toHaveBeenCalledTimes(1);
        expect(result.total_pagos).toBe(80);
    });
});
