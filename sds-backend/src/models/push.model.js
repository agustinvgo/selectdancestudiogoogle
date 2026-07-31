const crypto = require('crypto');
const db = require('../config/db');

const endpointHash = (endpoint) => crypto.createHash('sha256').update(endpoint).digest('hex');

const PushModel = {
    async getConfig() {
        const [rows] = await db.query('SELECT * FROM push_config WHERE id = 1 LIMIT 1');
        return rows[0] || null;
    },

    async saveConfig(config) {
        await db.query(`
            INSERT INTO push_config (id, public_key, private_key, subject)
            VALUES (1, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                public_key = VALUES(public_key),
                private_key = VALUES(private_key),
                subject = VALUES(subject)
        `, [config.publicKey, config.privateKey, config.subject]);
    },

    async saveSubscription(usuarioId, subscription, userAgent = null) {
        const hash = endpointHash(subscription.endpoint);
        await db.query(`
            INSERT INTO push_subscriptions
                (usuario_id, endpoint_hash, endpoint, p256dh, auth, user_agent, activo)
            VALUES (?, ?, ?, ?, ?, ?, 1)
            ON DUPLICATE KEY UPDATE
                usuario_id = VALUES(usuario_id),
                endpoint = VALUES(endpoint),
                p256dh = VALUES(p256dh),
                auth = VALUES(auth),
                user_agent = VALUES(user_agent),
                activo = 1
        `, [
            usuarioId,
            hash,
            subscription.endpoint,
            subscription.keys.p256dh,
            subscription.keys.auth,
            userAgent ? String(userAgent).slice(0, 500) : null
        ]);
        return hash;
    },

    async disableSubscription(usuarioId, endpoint) {
        const [result] = await db.query(
            'UPDATE push_subscriptions SET activo = 0 WHERE usuario_id = ? AND endpoint_hash = ?',
            [usuarioId, endpointHash(endpoint)]
        );
        return result.affectedRows > 0;
    },

    async disableByHash(hash) {
        await db.query('UPDATE push_subscriptions SET activo = 0 WHERE endpoint_hash = ?', [hash]);
    },

    async getStatus(usuarioId, endpoint = null) {
        const currentHash = endpoint ? endpointHash(endpoint) : null;
        const [[row]] = await db.query(`
            SELECT COUNT(*) AS total,
                   SUM(CASE WHEN endpoint_hash = ? THEN 1 ELSE 0 END) AS current_device
            FROM push_subscriptions
            WHERE usuario_id = ? AND activo = 1
        `, [currentHash, usuarioId]);
        return {
            active: Number(row?.total || 0) > 0,
            devices: Number(row?.total || 0),
            currentDevice: Number(row?.current_device || 0) > 0
        };
    },

    async getAdminSubscriptions(usuarioId = null) {
        const params = [];
        let userFilter = '';
        if (usuarioId) {
            userFilter = 'AND ps.usuario_id = ?';
            params.push(usuarioId);
        }
        const [rows] = await db.query(`
            SELECT ps.endpoint_hash, ps.endpoint, ps.p256dh, ps.auth
            FROM push_subscriptions ps
            INNER JOIN usuarios u ON u.id = ps.usuario_id
            WHERE ps.activo = 1
              AND u.activo = 1
              AND u.rol = 'admin'
              ${userFilter}
        `, params);
        return rows;
    },

    async claimEvent(event) {
        const [result] = await db.query(`
            INSERT IGNORE INTO push_notification_log
                (event_key, event_type, event_id, scheduled_at)
            VALUES (?, ?, ?, ?)
        `, [event.key, event.type, event.id, event.scheduledAt]);
        return result.affectedRows === 1;
    },

    async completeEvent(eventKey, result) {
        await db.query(`
            UPDATE push_notification_log
            SET recipients = ?, success_count = ?, failed_count = ?
            WHERE event_key = ?
        `, [result.recipients, result.success, result.failed, eventKey]);
    }
};

module.exports = PushModel;
