/**
 * @file auth.middleware.js
 * @description Middlewares encargados de la validación de tokens y 
 * comprobación de roles para proteger rutas de la API.
 */
const jwt = require('jsonwebtoken');

/**
 * @function verifyToken
 * @description Valida la existencia y vigencia de un JWT pasado por Cabeceras (Bearer).
 * Si es válido, inyecta el usuario decodificado en `req.user` para su uso en los controladores.
 */
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

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

/**
 * @function isAdmin
 * @description Middleware para bloquear el acceso a cualquier usuario que no tenga
 * el rol de 'admin'. Debe usarse inmediatamente después de `verifyToken`.
 */
const isAdmin = (req, res, next) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de administrador'
        });
    }
    next();
};

/**
 * @function isAlumno
 * @description Middleware para bloquear el acceso a usuarios que no tengan rol 'alumno'.
 */
const isAlumno = (req, res, next) => {
    if (req.user.rol !== 'alumno') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de alumno'
        });
    }
    next();
};

/**
 * @function isOwnerOrAdmin
 * @description Asegura que el recurso solicitado pertenezca al usuario que hace 
 * la petición, a menos que el solicitante sea un 'admin' (quien tiene acceso total).
 */
const isOwnerOrAdmin = (req, res, next) => {
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

module.exports = {
    verifyToken,
    isAdmin,
    isAlumno,
    isOwnerOrAdmin
};
