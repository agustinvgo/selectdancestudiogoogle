const PushService = require('../../services/push.service');

const validSubscription = (subscription) => subscription
    && typeof subscription.endpoint === 'string'
    && subscription.endpoint.startsWith('https://')
    && subscription.endpoint.length <= 4096
    && typeof subscription.keys?.p256dh === 'string'
    && subscription.keys.p256dh.length <= 255
    && typeof subscription.keys?.auth === 'string'
    && subscription.keys.auth.length <= 255;

const PushController = {
    async getPublicKey(req, res) {
        try {
            const key = await PushService.getPublicKey();
            res.json({ success: true, data: { publicKey: key } });
        } catch (error) {
            console.error('[Push] Error obteniendo clave pública:', error);
            res.status(500).json({ success: false, message: 'No se pudo preparar Web Push' });
        }
    },

    async getStatus(req, res) {
        try {
            const endpoint = typeof req.body.endpoint === 'string' && req.body.endpoint.length <= 4096
                ? req.body.endpoint
                : null;
            const status = await PushService.getStatus(req.user.id, endpoint);
            res.json({ success: true, data: status });
        } catch (error) {
            console.error('[Push] Error obteniendo estado:', error);
            res.status(500).json({ success: false, message: 'No se pudo consultar el estado' });
        }
    },

    async subscribe(req, res) {
        try {
            if (!validSubscription(req.body.subscription)) {
                return res.status(400).json({ success: false, message: 'Suscripción push inválida' });
            }
            await PushService.subscribe(req.user.id, req.body.subscription, req.get('user-agent'));
            res.json({ success: true, message: 'Notificaciones activadas' });
        } catch (error) {
            console.error('[Push] Error guardando suscripción:', error);
            res.status(500).json({ success: false, message: 'No se pudieron activar las notificaciones' });
        }
    },

    async unsubscribe(req, res) {
        try {
            if (typeof req.body.endpoint !== 'string') {
                return res.status(400).json({ success: false, message: 'Endpoint requerido' });
            }
            await PushService.unsubscribe(req.user.id, req.body.endpoint);
            res.json({ success: true, message: 'Notificaciones desactivadas' });
        } catch (error) {
            console.error('[Push] Error desactivando suscripción:', error);
            res.status(500).json({ success: false, message: 'No se pudieron desactivar las notificaciones' });
        }
    },

    async test(req, res) {
        try {
            const result = await PushService.sendTest(req.user.id);
            if (result.recipients === 0) {
                return res.status(409).json({ success: false, message: 'Primero debes activar las notificaciones en este dispositivo' });
            }
            res.json({ success: true, data: result, message: 'Notificación de prueba enviada' });
        } catch (error) {
            console.error('[Push] Error enviando prueba:', error);
            res.status(500).json({ success: false, message: 'No se pudo enviar la notificación de prueba' });
        }
    }
};

module.exports = PushController;
