const {
    normalizeClientIp,
    isPublicIPv4,
    buildCameraSource,
    sourceHostname,
} = require('../src/utils/camera-network.utils');

describe('Utilidades de reconexión de cámara', () => {
    test('normaliza IPv4 mapeada desde IPv6 y cadenas de proxy', () => {
        expect(normalizeClientIp('::ffff:190.229.32.129')).toBe('190.229.32.129');
        expect(normalizeClientIp('190.229.32.129, 172.18.0.2')).toBe('190.229.32.129');
    });

    test('acepta IPv4 pública y rechaza redes privadas o reservadas', () => {
        expect(isPublicIPv4('190.229.32.129')).toBe(true);
        expect(isPublicIPv4('192.168.0.10')).toBe(false);
        expect(isPublicIPv4('10.0.0.5')).toBe(false);
        expect(isPublicIPv4('100.64.1.2')).toBe(false);
        expect(isPublicIPv4('127.0.0.1')).toBe(false);
        expect(isPublicIPv4('203.0.113.8')).toBe(false);
        expect(isPublicIPv4('2001:db8::1')).toBe(false);
    });

    test('cambia únicamente el host de la URL RTSP', () => {
        const template = 'rtsp://camera:secret@190.31.54.249:554/live/ch00_1';
        const result = buildCameraSource('190.229.32.129', template);

        expect(sourceHostname(result)).toBe('190.229.32.129');
        expect(result).toContain('camera:secret@');
        expect(result).toContain(':554/live/ch00_1');
    });

    test('rechaza una plantilla que no sea RTSP', () => {
        expect(() => buildCameraSource('190.229.32.129', 'https://example.com/video'))
            .toThrow('debe usar RTSP');
    });
});
