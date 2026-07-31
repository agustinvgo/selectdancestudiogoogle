jest.mock('../src/config/db', () => ({ query: jest.fn() }));

const db = require('../src/config/db');
const PushModel = require('../src/models/push.model');

describe('PushModel', () => {
    beforeEach(() => jest.clearAllMocks());

    test('el envío masivo filtra cuentas activas con rol administrador', async () => {
        db.query.mockResolvedValueOnce([[]]);

        await PushModel.getAdminSubscriptions();

        expect(db.query.mock.calls[0][0]).toContain("u.rol = 'admin'");
        expect(db.query.mock.calls[0][0]).toContain('u.activo = 1');
    });

    test('informa si el dispositivo actual está registrado para el administrador', async () => {
        db.query.mockResolvedValueOnce([[{ total: 2, current_device: 1 }]]);

        await expect(PushModel.getStatus(7, 'https://push.example/device')).resolves.toEqual({
            active: true,
            devices: 2,
            currentDevice: true
        });
        expect(db.query.mock.calls[0][1][1]).toBe(7);
    });

    test('un administrador solo puede desactivar su propia suscripción', async () => {
        db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        await expect(PushModel.disableSubscription(7, 'https://push.example/device')).resolves.toBe(true);

        expect(db.query.mock.calls[0][0]).toContain('usuario_id = ?');
        expect(db.query.mock.calls[0][1][0]).toBe(7);
    });
});
