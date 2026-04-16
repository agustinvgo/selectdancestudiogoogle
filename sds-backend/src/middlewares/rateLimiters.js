const rateLimit = require('express-rate-limit');

// Limiter para formularios públicos (Contacto, Solicitud Clase Prueba)
const publicFormLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Has enviado demasiadas solicitudes. Intenta en una hora.', error: 'RATE_LIMIT_EXCEEDED' }
});

// Limiter para acciones de autenticación (Login, Register, Password Reset)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // Aumentado para evitar bloqueos por IP compartida en el estudio
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Demasiados intentos. Intenta en 15 minutos.', error: 'TOO_MANY_LOGIN_ATTEMPTS' }
});

// Limiter para el Chatbot público de WhatsApp
const botLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Demasiadas solicitudes al bot.', error: 'BOT_RATE_LIMIT' }
});

// Limiter para subida de archivos (comprobantes, fotos)
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Demasiadas subidas de archivos. Intenta en 15 minutos.', error: 'UPLOAD_RATE_LIMIT' }
});

// Limiter para endpoints pesados (estadísticas, reportes)
const apiHeavyLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Demasiadas consultas pesadas. Espera un momento.', error: 'HEAVY_API_LIMIT' }
});

module.exports = { publicFormLimiter, authLimiter, botLimiter, uploadLimiter, apiHeavyLimiter };
