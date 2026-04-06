const db = require('../config/db');

const NotificacionModel = {
    // Crear notificación
    async create(data) {
        try {
            const { usuario_id, titulo, mensaje, tipo, imagen_url, remitente, batch_id } = data;
            const [result] = await db.query(
                'INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, imagen_url, remitente, leido, created_at, batch_id) VALUES (?, ?, ?, ?, ?, ?, 0, NOW(), ?)',
                [usuario_id, titulo, mensaje, tipo || 'info', imagen_url || null, remitente || 'Select Dance Studio', batch_id || null]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    // Crear múltiples notificaciones (Bulk Insert)
    async createBulk(notificationsData) {
        try {
            if (!notificationsData || notificationsData.length === 0) return 0;

            // Preparar valores para el insert múltiple
            // (usuario_id, titulo, mensaje, tipo, imagen_url, remitente, leido, created_at, batch_id)
            const values = notificationsData.map(n => [
                n.usuario_id,
                n.titulo,
                n.mensaje,
                n.tipo || 'info',
                n.imagen_url || null,
                n.remitente || 'Select Dance Studio',
                0, // leido
                new Date(), // created_at (se puede usar NOW() en SQL, pero aquí pasamos fecha JS para uniformidad si el driver lo maneja bien, o mejor dejamos que SQL use NOW())
                n.batch_id || null
            ]);

            // NOTA: Para NOW() en bulk insert con array de arrays, mysql2 espera valores exactos.
            // Es mejor construir la query manualmente o usar un query builder, pero mysql2 soporta bulk insert así:
            // db.query('INSERT INTO ... VALUES ?', [values])

            const query = 'INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, imagen_url, remitente, leido, created_at, batch_id) VALUES ?';

            const [result] = await db.query(query, [values]);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    },

    // Historial de envíos (agrupados por batch_id)
    async getSentHistory(limit = 20) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    batch_id, 
                    MAX(created_at) as fecha, 
                    MAX(titulo) as titulo, 
                    MAX(mensaje) as mensaje, 
                    MAX(tipo) as tipo, 
                    MAX(remitente) as remitente,
                    COUNT(*) as total_destinatarios,
                    SUM(CASE WHEN leido = 1 THEN 1 ELSE 0 END) as leidos
                FROM notificaciones 
                WHERE batch_id IS NOT NULL 
                GROUP BY batch_id 
                ORDER BY fecha DESC 
                LIMIT ?
            `, [limit]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Eliminar batch completo
    async deleteBatch(batch_id) {
        try {
            const [result] = await db.query('DELETE FROM notificaciones WHERE batch_id = ?', [batch_id]);
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    },

    // Obtener notificaciones de un usuario
    async findByUsuario(usuario_id, limit = 50) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM notificaciones WHERE usuario_id = ? ORDER BY created_at DESC LIMIT ?',
                [usuario_id, limit]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Obtener notificaciones no leídas de un usuario
    async findUnreadByUsuario(usuario_id) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM notificaciones WHERE usuario_id = ? AND leido = 0 ORDER BY created_at DESC',
                [usuario_id]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Contar notificaciones no leídas
    async countUnread(usuario_id) {
        try {
            const [rows] = await db.query(
                'SELECT COUNT(*) as count FROM notificaciones WHERE usuario_id = ? AND leido = 0',
                [usuario_id]
            );
            return rows[0].count;
        } catch (error) {
            throw error;
        }
    },

    // Marcar como leída
    async markAsRead(id, usuario_id) {
        try {
            const [result] = await db.query(
                'UPDATE notificaciones SET leido = 1 WHERE id = ? AND usuario_id = ?',
                [id, usuario_id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Marcar todas como leídas
    async markAllAsRead(usuario_id) {
        try {
            const [result] = await db.query(
                'UPDATE notificaciones SET leido = 1 WHERE usuario_id = ?',
                [usuario_id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Eliminar notificación
    async delete(id, usuario_id) {
        try {
            // Solo permitir que el usuario elimine sus propias notificaciones
            const [result] = await db.query(
                'DELETE FROM notificaciones WHERE id = ? AND usuario_id = ?',
                [id, usuario_id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = NotificacionModel;
