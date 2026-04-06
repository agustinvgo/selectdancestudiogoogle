const winston = require('winston');
const path = require('path');

// Directorio de logs en la raíz del backend
const logsDir = path.join(__dirname, '../../logs');

// Formato personalizado para desarrollo (coloreado y legible)
const devFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} ${level}: ${message}${metaStr}`;
    })
);

// Formato para producción (JSON estructurado para análisis)
const prodFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const isProduction = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
    level: isProduction ? 'info' : 'debug',
    format: isProduction ? prodFormat : devFormat,
    defaultMeta: { service: 'sds-backend' },
    transports: [
        // Consola siempre activa
        new winston.transports.Console(),

        // Archivo general (info + warn + error)
        new winston.transports.File({
            filename: path.join(logsDir, 'app.log'),
            maxsize: 5242880,  // 5MB
            maxFiles: 5,       // Rotar cada 5 archivos
            level: 'info'
        }),

        // Archivo solo de errores
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            maxsize: 5242880,
            maxFiles: 10,
            level: 'error'
        })
    ],
    // No crashear por errores internos del logger
    exitOnError: false
});

module.exports = logger;
