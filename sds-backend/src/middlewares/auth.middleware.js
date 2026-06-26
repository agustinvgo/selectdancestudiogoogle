const jwt = require('jsonwebtoken');
const db = require('../config/db');

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

// Verificar que sea el dueño de los datos o admin (compara req.user.id con req.params.id directamente — solo válido cuando :id ES el usuario_id)
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

// Verificar que sea el dueño del registro de alumno (req.params.id es alumnos.id) o admin.
// Hace un lookup en DB para obtener el usuario_id del alumno y compararlo con el JWT.
const isAlumnoOwnerOrAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }
    if (req.user.rol === 'admin') return next();

    try {
        const alumnoId = parseInt(req.params.id);
        const [rows] = await db.query('SELECT usuario_id FROM alumnos WHERE id = ?', [alumnoId]);
        if (!rows.length) {
            return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
        }
        if (rows[0].usuario_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Acceso denegado. No tienes permisos para acceder a estos datos' });
        }
        next();
    } catch (err) {
        console.error('[isAlumnoOwnerOrAdmin]', err);
        return res.status(500).json({ success: false, message: 'Error al verificar permisos' });
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

module.exports = {
    verifyToken,
    isAdmin,
    isAlumno,
    isProfesor,
    isOwnerOrAdmin,
    isAlumnoOwnerOrAdmin
};
