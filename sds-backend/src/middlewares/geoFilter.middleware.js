const geoip = require('geoip-country');
const requestIp = require('request-ip');

const ALLOWED_COUNTRIES = ['AR', 'UY', 'CL', 'BR'];

const geoFilter = (req, res, next) => {
    try {
        // 1. Obtener IP real del cliente (revisa headers X-Forwarded-For automáticamente)
        let ip = requestIp.getClientIp(req);

        // 2. Si no hay IP, bloqueamos por seguridad
        if (!ip) {
            console.warn('[GeoFilter] ⚠️ No se pudo determinar la IP del cliente.');
            return res.status(403).json({
                success: false,
                message: 'Access denied: Unable to determine IP.'
            });
        }

        // 3. Normalizar IP (quitar prefijo IPv6 mapeado a IPv4)
        if (ip.startsWith('::ffff:')) {
            ip = ip.substring(7);
        }

        // 4. Permitir localhost y rangos privados (RFC 1918) — siempre pasar en desarrollo
        const isLocalHost = ip === '127.0.0.1' || ip === '::1';
        const isPrivateNet = ip.startsWith('192.168.') ||
            ip.startsWith('10.') ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip);

        if (isLocalHost || isPrivateNet) {
            return next();
        }

        // 5. Lookup de país (geoip-country — sin vulnerabilidades)
        const geo = geoip.lookup(ip);

        // 6. Validar país permitido
        if (geo && ALLOWED_COUNTRIES.includes(geo.country)) {
            return next();
        }

        // 7. País no permitido — bloquear y loguear
        console.warn(`[GeoFilter] 🚫 Bloqueado: IP=${ip} País=${geo ? geo.country : 'Desconocido'}`);

        return res.status(403).json({
            success: false,
            message: 'Access denied: Region restricted.'
        });

    } catch (error) {
        console.error('[GeoFilter] ❌ Error inesperado:', error.message);
        // Fail-open: en caso de error de lookup, no bloquear
        return next();
    }
};

module.exports = geoFilter;
