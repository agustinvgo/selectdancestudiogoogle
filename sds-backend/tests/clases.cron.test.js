jest.mock('../src/config/db', () => ({ query: jest.fn() }));
jest.mock('../src/services/push.service', () => ({ sendClassReminder: jest.fn() }));

const db = require('../src/config/db');
const PushService = require('../src/services/push.service');
const ClasesCron = require('../src/services/cron/clases.cron');

describe('recordatorios de clases', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('calcula fecha, hora y día en la zona horaria del estudio', () => {
        expect(ClasesCron.getZonedParts(new Date('2026-07-31T20:05:00.000Z'))).toEqual({
            date: '2026-07-31',
            time: '17:05',
            weekday: 'viernes'
        });
    });

    test.each([
        ['17:00 - 18:00', '17:00'],
        [' 9:05 hs', '09:05'],
        ['sin horario', null]
    ])('extrae el inicio de %s', (schedule, expected) => {
        expect(ClasesCron.extractStartTime(schedule)).toBe(expected);
    });

    test('envía a los eventos que comienzan exactamente cinco minutos después', async () => {
        db.query
            .mockResolvedValueOnce([[
                { id: 8, nombre: 'Acro', dia_semana: 'Viernes', hora_inicio: '17:00' },
                { id: 9, nombre: 'Otro día', dia_semana: 'Jueves', hora_inicio: '17:00' }
            ]])
            .mockResolvedValueOnce([[
                { id: 4, nombre: 'Clase de prueba', horario: '17:00 - 18:00' },
                { id: 5, nombre: 'Más tarde', horario: '18:00 - 19:00' }
            ]]);
        PushService.sendClassReminder.mockResolvedValue({ recipients: 1, success: 1, failed: 0 });

        const results = await ClasesCron.processUpcomingClasses(new Date('2026-07-31T19:55:10.000Z'));

        expect(results).toHaveLength(2);
        expect(PushService.sendClassReminder).toHaveBeenCalledTimes(2);
        expect(PushService.sendClassReminder).toHaveBeenNthCalledWith(1, expect.objectContaining({
            key: 'curso:8:2026-07-31:17:00',
            scheduledAt: '2026-07-31 17:00:00'
        }));
        expect(PushService.sendClassReminder).toHaveBeenNthCalledWith(2, expect.objectContaining({
            key: 'clase_prueba:4:2026-07-31:17:00'
        }));
    });
});
