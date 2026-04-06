/**
 * Clases de Error Personalizadas para el Sistema.
 * Permiten lanzar errores semánticos desde los servicios
 * que el error.middleware.js sabe interpretar correctamente.
 */

class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true; // Distingue errores esperados de bugs reales
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends AppError {
    constructor(recurso = 'Recurso') {
        super(`${recurso} no encontrado`, 404);
    }
}

class ValidationError extends AppError {
    constructor(message = 'Datos de entrada inválidos', errors = []) {
        super(message, 400);
        this.errors = errors;
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'No autorizado') {
        super(message, 401);
    }
}

class ForbiddenError extends AppError {
    constructor(message = 'Acceso denegado') {
        super(message, 403);
    }
}

class ConflictError extends AppError {
    constructor(message = 'Conflicto de datos') {
        super(message, 409);
    }
}

module.exports = { AppError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError, ConflictError };
