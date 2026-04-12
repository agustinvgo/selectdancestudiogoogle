const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    try {
        // Leer token desde cookie HttpOnly (seguro) o header Authorization (compatibilidad)
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, email, rol }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

// Verificar que el usuario sea admin
// Bug #7 fix: guard contra req.user undefined si se usa isAdmin sin verifyToken antes
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.rol !== 'admin') {
        const userId = req.user ? req.user.id : 'unknown';
        const userRol = req.user ? req.user.rol : 'none';
        console.log(`[Auth] Access denied to isAdmin route. User: ${userId}, Role: ${userRol}`);
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de administrador'
        });
    }
    next();
};

// Verificar que el usuario sea alumno
// Bug #7 fix: guard contra req.user undefined
const isAlumno = (req, res, next) => {
    if (!req.user || req.user.rol !== 'alumno') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de alumno'
        });
    }
    next();
};

// Verificar que sea el dueño de los datos o admin
const isOwnerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }
    const userId = parseInt(req.params.id);

    if (req.user.rol === 'admin' || req.user.id === userId) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. No tienes permisos para acceder a estos datos'
        });
    }
};

// Verificar que el usuario sea profesor o admin
// Bug #7 fix: guard contra req.user undefined
const isProfesor = (req, res, next) => {
    if (!req.user || (req.user.rol !== 'profesor' && req.user.rol !== 'admin')) {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de profesor'
        });
    }
    next();
};

// Bug #8: Rate limiter estricto para el endpoint de login (anti brute-force)
const rateLimit = require('express-rate-limit');
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 intentos por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos.'
    }
});

module.exports = {
    verifyToken,
    isAdmin,
    isAlumno,
    isProfesor,
    isOwnerOrAdmin,
    loginRateLimiter
};
