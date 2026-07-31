jest.mock('../src/config/db', () => ({
    query: jest.fn(),
    getConnection: jest.fn()
}));

const db = require('../src/config/db');
const AsistenciasModel = require('../src/models/asistencias.model');

const attendance = {
    alumno_id: 7,
    curso_id: 11,
    fecha: '2026-07-31',
    presente: 1,
    observaciones: null
};

describe('AsistenciasModel', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    test('guarda individualmente con upsert atómico y conserva el id', async () => {
        db.query
            .mockResolvedValueOnce([[{ alumno_id: 7, curso_id: 11 }]])
            .mockResolvedValueOnce([{ insertId: 42 }]);

        const id = await AsistenciasModel.marcarAsistencia(attendance, { id: 1, rol: 'admin' });

        expect(id).toBe(42);
        expect(db.query).toHaveBeenCalledTimes(2);
        expect(db.query.mock.calls[1][0]).toContain('ON DUPLICATE KEY UPDATE');
        expect(db.query.mock.calls[1][0]).toContain('LAST_INSERT_ID');
    });

    test('un profesor no puede modificar un curso no asignado', async () => {
        db.query.mockResolvedValueOnce([[]]);

        await expect(AsistenciasModel.marcarAsistencia(attendance, { id: 99, rol: 'profesor' }))
            .rejects.toMatchObject({ statusCode: 403 });
        expect(db.query).toHaveBeenCalledTimes(1);
    });

    test('rechaza alumnos sin inscripción activa', async () => {
        db.query.mockResolvedValueOnce([[]]);

        await expect(AsistenciasModel.marcarAsistencia(attendance, { id: 1, rol: 'admin' }))
            .rejects.toMatchObject({ statusCode: 400 });
        expect(db.query).toHaveBeenCalledTimes(1);
    });

    test('el guardado masivo revierte todo si falla una validación', async () => {
        const connection = {
            beginTransaction: jest.fn().mockResolvedValue(),
            query: jest.fn().mockResolvedValueOnce([[]]),
            commit: jest.fn().mockResolvedValue(),
            rollback: jest.fn().mockResolvedValue(),
            release: jest.fn()
        };
        db.getConnection.mockResolvedValue(connection);

        await expect(AsistenciasModel.marcarAsistenciasMasivas([attendance], { id: 1, rol: 'admin' }))
            .rejects.toMatchObject({ statusCode: 400 });

        expect(connection.rollback).toHaveBeenCalledTimes(1);
        expect(connection.commit).not.toHaveBeenCalled();
        expect(connection.release).toHaveBeenCalledTimes(1);
    });
});
