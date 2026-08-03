const { formatPaymentPeriod } = require('../src/utils/paymentPeriod');

describe('formatPaymentPeriod', () => {
    test('muestra el mes y año de una fecha SQL', () => {
        expect(formatPaymentPeriod('2026-09-09')).toBe('Septiembre 2026');
    });

    test('no cambia de mes por el huso horario cuando recibe ISO', () => {
        expect(formatPaymentPeriod('2026-08-01T00:00:00.000Z')).toBe('Agosto 2026');
    });

    test('acepta objetos Date', () => {
        expect(formatPaymentPeriod(new Date(Date.UTC(2026, 6, 30)))).toBe('Julio 2026');
    });

    test('devuelve un guion si no hay una fecha válida', () => {
        expect(formatPaymentPeriod(null)).toBe('-');
        expect(formatPaymentPeriod('fecha-invalida')).toBe('-');
    });
});

