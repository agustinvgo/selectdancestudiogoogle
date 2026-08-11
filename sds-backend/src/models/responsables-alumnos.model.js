const db = require('../config/db');

/**
 * Relación entre las cuentas que ingresan al portal y los alumnos que pueden
 * consultar. Una cuenta puede representar a varios hijos y un alumno puede
 * tener varios responsables.
 */
const ResponsablesAlumnosModel = {
    async findAlumnosByUsuarioId(usuarioId) {
        const [rows] = await db.query(`
            SELECT a.*, u.email, u.nombre, u.apellido, u.telefono, u.foto_perfil,
                   ra.parentesco, ra.es_principal, ra.puede_ver_pagos,
                   ra.puede_confirmar_asistencia, ra.recibe_notificaciones
            FROM responsables_alumnos ra
            INNER JOIN alumnos a ON a.id = ra.alumno_id
            INNER JOIN usuarios u ON u.id = a.usuario_id
            WHERE ra.usuario_id = ?
              AND COALESCE(a.activo, 1) = 1
              AND u.activo = 1
            ORDER BY ra.es_principal DESC, u.apellido ASC, u.nombre ASC
        `, [usuarioId]);
        return rows;
    },

    async canAccessAlumno(usuarioId, alumnoId, permission = null) {
        const permissionColumns = new Set(['puede_ver_pagos', 'puede_confirmar_asistencia']);
        const permissionClause = permission && permissionColumns.has(permission)
            ? ` AND COALESCE(ra.${permission}, 1) = 1`
            : '';
        const [rows] = await db.query(`
            SELECT a.id
            FROM alumnos a
            LEFT JOIN responsables_alumnos ra
                ON ra.alumno_id = a.id AND ra.usuario_id = ?
            WHERE a.id = ? AND (a.usuario_id = ? OR ra.usuario_id IS NOT NULL)${permissionClause}
            LIMIT 1
        `, [usuarioId, alumnoId, usuarioId]);
        return rows.length > 0;
    },

    async findResponsablesByAlumnoId(alumnoId) {
        const [rows] = await db.query(`
            SELECT ra.usuario_id, ra.parentesco, ra.es_principal,
                   ra.recibe_notificaciones, ra.puede_ver_pagos,
                   ra.puede_confirmar_asistencia, ra.created_at,
                   u.email, u.nombre, u.apellido, u.telefono, u.activo
            FROM responsables_alumnos ra
            INNER JOIN usuarios u ON u.id = ra.usuario_id
            WHERE ra.alumno_id = ?
            ORDER BY ra.es_principal DESC, u.apellido ASC, u.nombre ASC
        `, [alumnoId]);
        return rows;
    },

    async findNotificationRecipientsByAlumnoId(alumnoId) {
        const [rows] = await db.query(`
            SELECT DISTINCT u.email, u.nombre, u.apellido
            FROM responsables_alumnos ra
            INNER JOIN usuarios u ON u.id = ra.usuario_id
            WHERE ra.alumno_id = ?
              AND COALESCE(ra.recibe_notificaciones, 1) = 1
              AND u.activo = 1
              AND u.email IS NOT NULL
              AND TRIM(u.email) <> ''
            ORDER BY ra.es_principal DESC, u.apellido ASC, u.nombre ASC
        `, [alumnoId]);
        return rows;
    },

    async link(data, connection = null) {
        const dbRef = connection || db;
        const {
            alumno_id,
            usuario_id,
            parentesco = null,
            es_principal = false,
            recibe_notificaciones = true,
            puede_ver_pagos = true,
            puede_confirmar_asistencia = true
        } = data;

        if (es_principal) {
            await dbRef.query(
                'UPDATE responsables_alumnos SET es_principal = 0 WHERE alumno_id = ?',
                [alumno_id]
            );
        }

        await dbRef.query(`
            INSERT INTO responsables_alumnos (
                usuario_id, alumno_id, parentesco, es_principal,
                recibe_notificaciones, puede_ver_pagos, puede_confirmar_asistencia
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                parentesco = VALUES(parentesco),
                es_principal = VALUES(es_principal),
                recibe_notificaciones = VALUES(recibe_notificaciones),
                puede_ver_pagos = VALUES(puede_ver_pagos),
                puede_confirmar_asistencia = VALUES(puede_confirmar_asistencia)
        `, [
            usuario_id,
            alumno_id,
            parentesco || null,
            es_principal ? 1 : 0,
            recibe_notificaciones ? 1 : 0,
            puede_ver_pagos ? 1 : 0,
            puede_confirmar_asistencia ? 1 : 0
        ]);
    },

    async updateLink(alumnoId, usuarioId, data) {
        const [existingRows] = await db.query(
            'SELECT 1 FROM responsables_alumnos WHERE alumno_id = ? AND usuario_id = ? LIMIT 1',
            [alumnoId, usuarioId]
        );
        if (!existingRows.length) return false;

        const fields = [];
        const values = [];
        const allowed = [
            'parentesco',
            'recibe_notificaciones',
            'puede_ver_pagos',
            'puede_confirmar_asistencia'
        ];

        allowed.forEach((field) => {
            if (data[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(field === 'parentesco' ? (data[field] || null) : (data[field] ? 1 : 0));
            }
        });

        if (data.es_principal !== undefined && data.es_principal) {
            await db.query('UPDATE responsables_alumnos SET es_principal = 0 WHERE alumno_id = ?', [alumnoId]);
            fields.push('es_principal = 1');
        }

        if (!fields.length) return false;
        values.push(alumnoId, usuarioId);
        const [result] = await db.query(
            `UPDATE responsables_alumnos SET ${fields.join(', ')} WHERE alumno_id = ? AND usuario_id = ?`,
            values
        );
        return result.affectedRows > 0;
    },

    async unlink(alumnoId, usuarioId) {
        const [result] = await db.query(
            'DELETE FROM responsables_alumnos WHERE alumno_id = ? AND usuario_id = ?',
            [alumnoId, usuarioId]
        );
        return result.affectedRows > 0;
    },

    async ensurePrimaryLink(usuarioId, alumnoId, connection = null) {
        const dbRef = connection || db;
        await dbRef.query(`
            INSERT IGNORE INTO responsables_alumnos
                (usuario_id, alumno_id, parentesco, es_principal)
            VALUES (?, ?, 'Cuenta principal', 1)
        `, [usuarioId, alumnoId]);
    }
};

module.exports = ResponsablesAlumnosModel;
