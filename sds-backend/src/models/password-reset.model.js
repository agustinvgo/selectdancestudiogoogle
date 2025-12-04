const db = require('../config/db');
const crypto = require('crypto');

class PasswordResetModel {
    // Crear un nuevo token de reset
    async create(email, expirationHours = 1) {
        try {
            // Generar token seguro
            const token = crypto.randomBytes(32).toString('hex');

            // Calcular fecha de expiración
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + expirationHours);

            const [result] = await db.query(
                'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
                [email, token, expiresAt]
            );

            return { id: result.insertId, token, expiresAt };
        } catch (error) {
            throw error;
        }
    }

    // Buscar token válido
    async findValidToken(token) {
        try {
            const [rows] = await db.query(
                `SELECT * FROM password_resets 
                 WHERE token = ? 
                 AND used = FALSE 
                 AND expires_at > NOW()
                 ORDER BY created_at DESC 
                 LIMIT 1`,
                [token]
            );

            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Marcar token como usado
    async markAsUsed(token) {
        try {
            await db.query(
                'UPDATE password_resets SET used = TRUE WHERE token = ?',
                [token]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Limpiar tokens expirados (ejecutar periódicamente)
    async deleteExpired() {
        try {
            const [result] = await db.query(
                'DELETE FROM password_resets WHERE expires_at < NOW() OR used = TRUE'
            );
            return result.affectedRows;
        } catch (error) {
            throw error;
        }
    }

    // Invalidar todos los tokens de un usuario
    async invalidateAllForEmail(email) {
        try {
            await db.query(
                'UPDATE password_resets SET used = TRUE WHERE email = ? AND used = FALSE',
                [email]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new PasswordResetModel();
