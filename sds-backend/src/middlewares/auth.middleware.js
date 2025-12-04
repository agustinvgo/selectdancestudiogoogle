const jwt = require('jsonwebtoken');

// Verificar token JWT
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

// Verificar que el usuario sea admin
const isAdmin = (req, res, next) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de administrador'
        });
    }
    next();
};

// Verificar que el usuario sea alumno
const isAlumno = (req, res, next) => {
    if (req.user.rol !== 'alumno') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de alumno'
        });
    }
    next();
};

// Verificar que sea el dueño de los datos o admin
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
