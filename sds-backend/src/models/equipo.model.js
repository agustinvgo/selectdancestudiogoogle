const db = require('../config/db');

const EquipoModel = {
    // Listar los perfiles públicos activos del equipo.
    async findAll() {
        const [rows] = await db.query(`
            SELECT id, nombre, cargo, descripcion, foto_url, foto_posicion,
                   orden, activo, created_at, updated_at
            FROM equipo_web
            WHERE activo = 1
            ORDER BY
                CASE
                    WHEN LOWER(TRIM(COALESCE(cargo, ''))) LIKE 'directora%' THEN 0
                    ELSE 1
                END ASC,
                orden ASC,
                created_at DESC
        `);
        return rows;
    },

    async findById(id) {
        const [rows] = await db.query(`
            SELECT id, nombre, cargo, descripcion, foto_url, foto_posicion,
                   orden, activo, created_at, updated_at
            FROM equipo_web
            WHERE id = ?
        `, [id]);
        return rows[0];
    },

    // Crear un perfil público. No genera credenciales ni una cuenta de profesor.
    async create(data) {
        const { nombre, cargo, descripcion, foto_url, foto_posicion } = data;
        const [result] = await db.query(
            `INSERT INTO equipo_web (nombre, cargo, descripcion, foto_url, foto_posicion, activo)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [nombre, cargo || null, descripcion || null, foto_url || null, foto_posicion || 'center']
        );
        return result.insertId;
    },

    async update(id, data) {
        const fields = [];
        const params = [];
        const allowedMapping = {
            nombre: 'nombre',
            cargo: 'cargo',
            descripcion: 'descripcion',
            foto_url: 'foto_url',
            foto_posicion: 'foto_posicion',
            activo: 'activo',
            orden: 'orden'
        };

        Object.keys(allowedMapping).forEach((frontField) => {
            if (data[frontField] !== undefined) {
                fields.push(`${allowedMapping[frontField]} = ?`);
                params.push(data[frontField]);
            }
        });

        if (fields.length === 0) return false;

        params.push(id);
        const [result] = await db.query(
            `UPDATE equipo_web SET ${fields.join(', ')} WHERE id = ?`,
            params
        );
        return result.affectedRows > 0;
    },

    // Ocultar el perfil público sin modificar ninguna cuenta del sistema.
    async delete(id) {
        const [result] = await db.query(
            'UPDATE equipo_web SET activo = 0 WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = EquipoModel;
