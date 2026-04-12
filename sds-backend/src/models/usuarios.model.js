const db = require('../config/db');

const UsuariosModel = {
    // Buscar usuario por email
    async findByEmail(email) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM usuarios WHERE email = ? AND activo = 1',
                [email]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Buscar usuario por email (incluyendo inactivos)
    async findByEmailIncludeInactive(email) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM usuarios WHERE email = ?',
                [email]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Buscar usuario por ID
    async findById(id) {
        try {
            const [rows] = await db.query(
                'SELECT id, email, rol, activo, primer_login, created_at, nombre, apellido, telefono, foto_perfil, rol_display, orden FROM usuarios WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Crear nuevo usuario
    async create(userData, connection = null) {
        try {
            const dbRef = connection || db;
            const { email, password_hash, rol, nombre, apellido, telefono, foto_perfil } = userData;
            const [result] = await dbRef.query(
                'INSERT INTO usuarios (email, password_hash, rol, activo, primer_login, nombre, apellido, telefono, foto_perfil) VALUES (?, ?, ?, 1, 1, ?, ?, ?, ?)',
                [email, password_hash, rol, nombre || null, apellido || null, telefono || null, foto_perfil || null]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar usuario
    async update(id, userData) {
        try {
            const fields = [];
            const values = [];

            if (userData.email) {
                fields.push('email = ?');
                values.push(userData.email);
            }
            if (userData.password_hash) {
                fields.push('password_hash = ?');
                values.push(userData.password_hash);
            }
            if (userData.rol) {
                fields.push('rol = ?');
                values.push(userData.rol);
            }
            if (userData.activo !== undefined) {
                fields.push('activo = ?');
                values.push(userData.activo);
            }
            if (userData.primer_login !== undefined) {
                fields.push('primer_login = ?');
                values.push(userData.primer_login ? 1 : 0);
            }
            if (userData.nombre !== undefined) {
                fields.push('nombre = ?');
                values.push(userData.nombre);
            }
            if (userData.apellido !== undefined) {
                fields.push('apellido = ?');
                values.push(userData.apellido);
            }
            if (userData.telefono !== undefined) {
                fields.push('telefono = ?');
                values.push(userData.telefono);
            }
            if (userData.foto_perfil !== undefined) {
                fields.push('foto_perfil = ?');
                values.push(userData.foto_perfil);
            }

            if (fields.length === 0) return false;

            values.push(id);
            const isDeactivating = (userData.activo === 0 || userData.activo === false || userData.activo === '0' || userData.activo === 'false');
            const [result] = await db.query(
                `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ? ${isDeactivating ? "AND rol != 'admin'" : ""}`,
                values
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar solo la contraseña
    async updatePassword(id, password_hash) {
        try {
            const [result] = await db.query(
                'UPDATE usuarios SET password_hash = ? WHERE id = ?',
                [password_hash, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Buscar usuario por ID con contraseña (para cambio de contraseña)
    async findByIdWithPassword(id) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM usuarios WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    }
};

module.exports = UsuariosModel;
