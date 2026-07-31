jest.mock('web-push', () => ({
    generateVAPIDKeys: jest.fn(() => ({ publicKey: 'public', privateKey: 'private' })),
    setVapidDetails: jest.fn(),
    sendNotification: jest.fn()
}));
jest.mock('../src/models/push.model', () => ({
    getConfig: jest.fn(),
    saveConfig: jest.fn(),
    claimEvent: jest.fn(),
    completeEvent: jest.fn(),
    getAdminSubscriptions: jest.fn(),
    disableByHash: jest.fn()
}));

const webPush = require('web-push');
const PushModel = require('../src/models/push.model');
const PushService = require('../src/services/push.service');

const event = {
    key: 'curso:1:2026-07-31:17:00',
    type: 'curso',
    id: 1,
    name: 'Acro',
    date: '2026-07-31',
    time: '17:00',
    scheduledAt: '2026-07-31 17:00:00'
};

describe('PushService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        PushModel.getConfig.mockResolvedValue({
            public_key: 'public',
            private_key: 'private',
            subject: 'mailto:admin@example.com'
        });
    });

    test('no vuelve a enviar un evento ya reclamado', async () => {
        PushModel.claimEvent.mockResolvedValue(false);

        await expect(PushService.sendClassReminder(event)).resolves.toMatchObject({ duplicate: true });
        expect(PushModel.getAdminSubscriptions).not.toHaveBeenCalled();
        expect(webPush.sendNotification).not.toHaveBeenCalled();
    });

    test('envía únicamente las suscripciones administrativas devueltas por el modelo', async () => {
        PushModel.claimEvent.mockResolvedValue(true);
        PushModel.getAdminSubscriptions.mockResolvedValue([{
            endpoint_hash: 'hash',
            endpoint: 'https://push.example/subscription',
            p256dh: 'key',
            auth: 'auth'
        }]);
        webPush.sendNotification.mockResolvedValue({ statusCode: 201 });

        const result = await PushService.sendClassReminder(event);

        expect(result).toEqual({ recipients: 1, success: 1, failed: 0 });
        expect(PushModel.getAdminSubscriptions).toHaveBeenCalledWith();
        expect(webPush.sendNotification).toHaveBeenCalledTimes(1);
        expect(PushModel.completeEvent).toHaveBeenCalledWith(event.key, result);
    });
});
