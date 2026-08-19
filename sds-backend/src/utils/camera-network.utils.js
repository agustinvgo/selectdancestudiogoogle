const net = require('net');

function normalizeClientIp(value) {
    if (!value || typeof value !== 'string') return '';

    const first = value.split(',')[0].trim();
    if (first.startsWith('::ffff:')) return first.slice(7);
    return first;
}

function isPublicIPv4(value) {
    const ip = normalizeClientIp(value);
    if (net.isIP(ip) !== 4) return false;

    const [a, b, c] = ip.split('.').map(Number);

    if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
    if (a === 169 && b === 254) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 198 && (b === 18 || b === 19)) return false;

    // Rangos reservados para documentación o protocolos especiales.
    if (a === 192 && b === 0 && (c === 0 || c === 2)) return false;
    if (a === 198 && b === 51 && c === 100) return false;
    if (a === 203 && b === 0 && c === 113) return false;

    return true;
}

function buildCameraSource(ip, template) {
    if (!isPublicIPv4(ip)) {
        throw new Error('La dirección detectada no es una IPv4 pública válida');
    }
    if (!template) {
        throw new Error('No está configurada la URL base de la cámara');
    }

    let url;
    try {
        url = new URL(template);
    } catch {
        throw new Error('La URL base de la cámara no es válida');
    }

    if (url.protocol !== 'rtsp:' && url.protocol !== 'rtsps:') {
        throw new Error('La URL base de la cámara debe usar RTSP');
    }

    url.hostname = normalizeClientIp(ip);
    return url.toString();
}

function sourceHostname(source) {
    try {
        return new URL(source).hostname;
    } catch {
        return '';
    }
}

module.exports = {
    normalizeClientIp,
    isPublicIPv4,
    buildCameraSource,
    sourceHostname,
};
