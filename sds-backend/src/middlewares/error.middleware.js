const { AppError } = require('../utils/AppError');
const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
    // Si ya se enviaron cabeceras, delegar a Express
    if (res.headersSent) return next(err);

    // Errores de JSON malformado (body-parser)
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ success: false, message: 'JSON malformado' });
    }

    // Errores operacionales (AppError) - esperados y controlados
    if (err instanceof AppError) {
        logger.warn(`[${err.statusCode}] ${err.message}`, {
            path: req.originalUrl,
            method: req.method,
            ip: req.ip
        });

        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            ...(err.errors && { errors: err.errors })
        });
    }

    // Errores de MySQL conocidos
    if (err.code === 'ER_DUP_ENTRY') {
        logger.warn(`Duplicado DB: ${err.message}`, { path: req.originalUrl });
        return res.status(409).json({ success: false, message: 'El registro ya existe' });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
        logger.warn(`FK violation: ${err.message}`, { path: req.originalUrl });
        return res.status(400).json({ success: false, message: 'Referencia de datos inválida' });
    }

    // Errores NO esperados (bugs reales) - loguear completos
    const statusCode = err.status || 500;
    logger.error(`[BUG] Error no controlado: ${err.message}`, {
        stack: err.stack,
        path: req.originalUrl,
        method: req.method,
        body: req.body,
        ip: req.ip
    });

    const isDev = process.env.NODE_ENV === 'development';
    res.status(statusCode).json({
        success: false,
        message: isDev ? err.message : 'Error interno del servidor',
        ...(isDev && { stack: err.stack })
    });
};

module.exports = errorHandler;
