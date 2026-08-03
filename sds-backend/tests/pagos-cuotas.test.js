jest.mock('../src/models/pagos.model', () => ({
    create: jest.fn()
}));
jest.mock('../src/models/alumnos.model', () => ({}));
jest.mock('../src/services/email.service', () => ({}));
jest.mock('../src/services/pdf.service', () => ({}));
jest.mock('../src/config/db', () => ({
    getConnection: jest.fn()
}));

const PagosModel = require('../src/models/pagos.model');
const db = require('../src/config/db');
const PagosService = require('../src/services/pagos.service');

describe('PagosService.crearPlanDeCuotas', () => {
    let connection;

    beforeEach(() => {
        jest.clearAllMocks();
        connection = {
            beginTransaction: jest.fn().mockResolvedValue(),
            commit: jest.fn().mockResolvedValue(),
            rollback: jest.fn().mockResolvedValue(),
            release: jest.fn()
        };
        db.getConnection.mockResolvedValue(connection);
        PagosModel.create
            .mockResolvedValueOnce(101)
            .mockResolvedValueOnce(102)
            .mockResolvedValueOnce(103);
    });

    test('divide exactamente el total y conserva el día cuando el mes lo permite', async () => {
        const result = await PagosService.crearPlanDeCuotas({
            alumno_id: 7,
            curso_id: 4,
            concepto: 'Mensualidad',
            monto_total: 100,
            cuotas: 3,
            fecha_primera_cuota: '2026-01-31',
            descripcion: 'Plan acordado'
        });

        expect(result.montosCuotas).toEqual([33.33, 33.33, 33.34]);
        expect(result.montosCuotas.reduce((total, monto) => total + monto, 0)).toBeCloseTo(100, 2);
        expect(PagosModel.create).toHaveBeenCalledTimes(3);

        const cuotas = PagosModel.create.mock.calls.map(([pago]) => pago);
        expect(cuotas.map((pago) => pago.fecha_vencimiento)).toEqual([
            '2026-01-31',
            '2026-02-28',
            '2026-03-31'
        ]);
        expect(cuotas.map((pago) => pago.concepto)).toEqual([
            'Mensualidad (Cuota 1/3)',
            'Mensualidad (Cuota 2/3)',
            'Mensualidad (Cuota 3/3)'
        ]);
        expect(cuotas.every((pago) => pago.curso_id === 4 && pago.notas_pago === 'Plan acordado')).toBe(true);
        expect(connection.commit).toHaveBeenCalledTimes(1);
        expect(connection.release).toHaveBeenCalledTimes(1);
    });

    test('rechaza cantidades de cuotas fuera del rango permitido', async () => {
        await expect(PagosService.crearPlanDeCuotas({
            alumno_id: 7,
            concepto: 'Uniforme',
            monto_total: 100,
            cuotas: 1,
            fecha_primera_cuota: '2026-08-10'
        })).rejects.toThrow('entre 2 y 24');

        expect(db.getConnection).not.toHaveBeenCalled();
    });
});
