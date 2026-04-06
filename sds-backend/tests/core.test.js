const { AppError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError, ConflictError } = require('../src/utils/AppError');

describe('AppError Classes', () => {
    test('AppError base tiene statusCode 500 por defecto', () => {
        const error = new AppError('algo falló');
        expect(error.message).toBe('algo falló');
        expect(error.statusCode).toBe(500);
        expect(error.isOperational).toBe(true);
        expect(error instanceof Error).toBe(true);
    });

    test('AppError acepta statusCode personalizado', () => {
        const error = new AppError('custom', 418);
        expect(error.statusCode).toBe(418);
    });

    test('NotFoundError devuelve 404', () => {
        const error = new NotFoundError('Alumno');
        expect(error.statusCode).toBe(404);
        expect(error.message).toBe('Alumno no encontrado');
    });

    test('NotFoundError sin argumento usa "Recurso"', () => {
        const error = new NotFoundError();
        expect(error.message).toBe('Recurso no encontrado');
    });

    test('ValidationError devuelve 400 con lista de errores', () => {
        const errors = [{ field: 'email', msg: 'inválido' }];
        const error = new ValidationError('Datos mal', errors);
        expect(error.statusCode).toBe(400);
        expect(error.errors).toEqual(errors);
    });

    test('UnauthorizedError devuelve 401', () => {
        const error = new UnauthorizedError();
        expect(error.statusCode).toBe(401);
    });

    test('ForbiddenError devuelve 403', () => {
        const error = new ForbiddenError();
        expect(error.statusCode).toBe(403);
    });

    test('ConflictError devuelve 409', () => {
        const error = new ConflictError();
        expect(error.statusCode).toBe(409);
    });
});

describe('Env Validator', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    test('No crashea cuando todas las variables requeridas están presentes', () => {
        process.env.DB_HOST = 'localhost';
        process.env.DB_USER = 'root';
        process.env.DB_NAME = 'test';
        process.env.DB_PASSWORD = 'test';
        process.env.JWT_SECRET = 'secret';

        const validateEnv = require('../src/config/env.validator');
        expect(() => validateEnv()).not.toThrow();
    });
});
