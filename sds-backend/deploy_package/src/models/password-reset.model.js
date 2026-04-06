const db = require('../config/db');
const crypto = require('crypto');

// Helper: SHA-256 hash de un token
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

class PasswordResetModel {
    // Crear un nuevo token de reset.
    // Guarda SOLO el hash en la BD — el token raw viaja únicamente en el email.
    async create(email, expirationHours = 1) {
        try {
            const token = crypto.randomBytes(32).toString('hex'); // token raw (para el email)
            const tokenHash = hashToken(token);                   // hash (para la BD)

            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + expirationHours);

            // Invalidar tokens anteriores del mismo email antes de crear uno nuevo
            await db.query(
                'UPDATE password_resets SET used = TRUE WHERE email = ? AND used = FALSE',
                [email]
            );

            const [result] = await db.query(
                'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
                [email, tokenHash, expiresAt]
            );

            // Devolvemos el token RAW para incluirlo en el email
            return { id: result.insertId, token, expiresAt };
        } catch (error) {
            throw error;
        }
    }

    // Buscar token válido. Recibe el token RAW del query param y hashea internamente.
    async findValidToken(token) {
        try {
            const tokenHash = hashToken(token);
            const [rows] = await db.query(
                `SELECT * FROM password_resets
                 WHERE token = ?
                 AND used = FALSE
                 AND expires_at > NOW()
                 ORDER BY created_at DESC
                 LIMIT 1`,
                [tokenHash]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    // Marcar token como usado. Recibe el token RAW y hashea internamente.
    async markAsUsed(token) {
        try {
            const tokenHash = hashToken(token);
            await db.query(
                'UPDATE password_resets SET used = TRUE WHERE token = ?',
                [tokenHash]
            );
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Limpiar tokens expirados
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
