const webPush = require('web-push');
const PushModel = require('../models/push.model');

let configured = false;
let publicKey = null;

const getSubject = () => {
    if (process.env.VAPID_SUBJECT?.startsWith('mailto:') || process.env.VAPID_SUBJECT?.startsWith('https://')) {
        return process.env.VAPID_SUBJECT;
    }
    const adminEmail = process.env.ADMIN_EMAIL?.includes('@')
        ? process.env.ADMIN_EMAIL
        : 'admin@selectdancestudio.com';
    return `mailto:${adminEmail}`;
};

const PushService = {
    async ensureConfigured() {
        if (configured) return publicKey;

        let config = await PushModel.getConfig();
        if (!config) {
            const keys = webPush.generateVAPIDKeys();
            await PushModel.saveConfig({ ...keys, subject: getSubject() });
            config = await PushModel.getConfig();
        }

        webPush.setVapidDetails(config.subject, config.public_key, config.private_key);
        publicKey = config.public_key;
        configured = true;
        return publicKey;
    },

    async getPublicKey() {
        return this.ensureConfigured();
    },

    async subscribe(usuarioId, subscription, userAgent) {
        await this.ensureConfigured();
        return PushModel.saveSubscription(usuarioId, subscription, userAgent);
    },

    async unsubscribe(usuarioId, endpoint) {
        return PushModel.disableSubscription(usuarioId, endpoint);
    },

    async getStatus(usuarioId, endpoint = null) {
        return PushModel.getStatus(usuarioId, endpoint);
    },

    async sendPayload(subscriptions, payload) {
        await this.ensureConfigured();
        let success = 0;
        let failed = 0;

        await Promise.all(subscriptions.map(async (item) => {
            try {
                await webPush.sendNotification({
                    endpoint: item.endpoint,
                    keys: { p256dh: item.p256dh, auth: item.auth }
                }, JSON.stringify(payload), {
                    TTL: 300,
                    urgency: 'high'
                });
                success += 1;
            } catch (error) {
                failed += 1;
                if (error.statusCode === 404 || error.statusCode === 410) {
                    await PushModel.disableByHash(item.endpoint_hash);
                } else {
                    console.error('[Push] Error enviando notificación:', error.message);
                }
            }
        }));

        return { recipients: subscriptions.length, success, failed };
    },

    async sendClassReminder(event) {
        if (!(await PushModel.claimEvent(event))) {
            return { duplicate: true, recipients: 0, success: 0, failed: 0 };
        }

        const subscriptions = await PushModel.getAdminSubscriptions();
        const result = await this.sendPayload(subscriptions, {
            title: 'Clase por comenzar',
            body: `${event.name} comienza en 5 minutos, a las ${event.time}.`,
            icon: '/android-chrome-192x192.png',
            badge: '/favicon-32x32.png',
            tag: event.key,
            data: { url: `/admin/agenda?fecha=${event.date}` }
        });
        await PushModel.completeEvent(event.key, result);
        return result;
    },

    async sendTest(usuarioId) {
        const subscriptions = await PushModel.getAdminSubscriptions(usuarioId);
        return this.sendPayload(subscriptions, {
            title: 'Notificaciones activadas',
            body: 'Recibirás un aviso 5 minutos antes de cada clase.',
            icon: '/android-chrome-192x192.png',
            badge: '/favicon-32x32.png',
            tag: `push-test-${usuarioId}`,
            data: { url: '/admin/agenda' }
        });
    }
};

module.exports = PushService;
