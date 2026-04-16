const db = require('../config/db');

const EquipoModel = {
    // Listar todos los miembros activos que deben mostrarse en la web
    async findAll() {
        try {
            const [rows] = await db.query(`
                SELECT id, nombre, rol_display as cargo, descripcion, foto_perfil as foto_url, orden, activo, created_at, updated_at 
                FROM usuarios 
                WHERE rol = 'profesor' AND activo = 1 AND mostrar_en_web = 1
                ORDER BY orden ASC, created_at DESC
            `);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Obtener miembro por ID
    async findById(id) {
        try {
            const [rows] = await db.query(`
                SELECT id, nombre, rol_display as cargo, descripcion, foto_perfil as foto_url, orden, activo, created_at, updated_at 
                FROM usuarios 
                WHERE id = ? AND rol = 'profesor' AND mostrar_en_web = 1
            `, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Crear miembro (específicamente destinado a mostrarse en la web)
    async create(data) {
        try {
            const { nombre, cargo, descripcion, foto_url } = data;
            const [result] = await db.query(
                `INSERT INTO usuarios (nombre, rol_display, descripcion, foto_perfil, email, password_hash, rol, activo, mostrar_en_web) 
                 VALUES (?, ?, ?, ?, CONCAT('staff_', UUID(), '@selectdance.com'), 'dummy_hash', 'profesor', 1, 1)`,
                [nombre, cargo || null, descripcion || null, foto_url || null]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar miembro
    async update(id, data) {
        try {
            const fields = [];
            const params = [];

            // Campos permitidos para actualización (mapeados a la DB real)
            const allowedMapping = {
                'nombre': 'nombre',
                'cargo': 'rol_display',
                'descripcion': 'descripcion',
                'foto_url': 'foto_perfil',
                'activo': 'activo',
                'orden': 'orden' // si el order existía en el body anterior
            };

            Object.keys(allowedMapping).forEach(frontField => {
                if (data[frontField] !== undefined) {
                    fields.push(`${allowedMapping[frontField]} = ?`);
                    params.push(data[frontField]);
                }
            });

            if (fields.length === 0) return false;

            params.push(id);
            const query = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`;

            const [result] = await db.query(query, params);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Eliminar miembro (soft delete) - Protege administradores
    async delete(id) {
        try {
            const [result] = await db.query("UPDATE usuarios SET activo = 0 WHERE id = ? AND rol != 'admin'", [id]);
            if (result.affectedRows === 0) {
                // Verificamos si realmente no existe o si es administrador
                const [check] = await db.query("SELECT rol FROM usuarios WHERE id = ?", [id]);
                if (check.length > 0 && check[0].rol === 'admin') {
                    throw new Error('PROTECTED_ADMIN');
                }
            }
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = EquipoModel;
