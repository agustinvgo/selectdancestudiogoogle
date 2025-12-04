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

    // Buscar usuario por ID
    async findById(id) {
        try {
            const [rows] = await db.query(
                'SELECT id, email, rol, activo, created_at FROM usuarios WHERE id = ?',
                [id]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Crear nuevo usuario
    async create(userData) {
        try {
            const { email, password_hash, rol } = userData;
            const [result] = await db.query(
                'INSERT INTO usuarios (email, password_hash, rol, activo) VALUES (?, ?, ?, 1)',
                [email, password_hash, rol]
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

            if (fields.length === 0) return false;

            values.push(id);
            const [result] = await db.query(
                `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`,
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
    }
};

module.exports = UsuariosModel;
