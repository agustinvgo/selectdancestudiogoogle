jest.mock('../src/config/db', () => ({
    query: jest.fn()
}));

const db = require('../src/config/db');
const EquipoModel = require('../src/models/equipo.model');

describe('EquipoModel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('crea un perfil público sin generar una cuenta de profesor', async () => {
        db.query.mockResolvedValueOnce([{ insertId: 27 }]);

        const id = await EquipoModel.create({
            nombre: 'Integrante Web',
            cargo: 'Asistente',
            descripcion: 'Perfil público',
            foto_url: '/uploads/equipo/foto.webp',
            foto_posicion: '50% 40%'
        });

        expect(id).toBe(27);
        expect(db.query).toHaveBeenCalledTimes(1);
        expect(db.query.mock.calls[0][0]).toContain('INSERT INTO equipo_web');
        expect(db.query.mock.calls[0][0]).not.toContain('INSERT INTO usuarios');
        expect(db.query.mock.calls[0][0]).not.toContain('dummy_hash');
    });

    test('lista únicamente perfiles de la tabla pública', async () => {
        db.query.mockResolvedValueOnce([[{ id: 3, nombre: 'Paz' }]]);

        const rows = await EquipoModel.findAll();

        expect(rows).toEqual([{ id: 3, nombre: 'Paz' }]);
        expect(db.query.mock.calls[0][0]).toContain('FROM equipo_web');
        expect(db.query.mock.calls[0][0]).not.toContain('FROM usuarios');
    });

    test('ocultar un perfil no desactiva usuarios', async () => {
        db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        await expect(EquipoModel.delete(5)).resolves.toBe(true);
        expect(db.query.mock.calls[0][0]).toContain('UPDATE equipo_web');
        expect(db.query.mock.calls[0][0]).not.toContain('UPDATE usuarios');
    });
});
