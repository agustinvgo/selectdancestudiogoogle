export const supportsWebPush = () => typeof window !== 'undefined'
    && window.isSecureContext
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window;

export const registerPushWorker = async () => {
    if (!supportsWebPush()) throw new Error('Este dispositivo no admite notificaciones web');
    return navigator.serviceWorker.register('/sw.js', { scope: '/' });
};

export const getCurrentPushSubscription = async () => {
    if (!supportsWebPush()) return null;
    const registration = await registerPushWorker();
    return registration.pushManager.getSubscription();
};

export const base64UrlToUint8Array = (base64Url) => {
    const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
    const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = window.atob(base64);
    return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
};

export const createPushSubscription = async (publicKey) => {
    const registration = await registerPushWorker();
    const existing = await registration.pushManager.getSubscription();
    if (existing) return existing;
    return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToUint8Array(publicKey)
    });
};
