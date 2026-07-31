self.addEventListener('push', (event) => {
    let payload = {};
    try {
        payload = event.data?.json() || {};
    } catch (_) {
        payload = { body: event.data?.text() || 'Tienes una clase próxima.' };
    }

    event.waitUntil(self.registration.showNotification(
        payload.title || 'Select Dance Studio',
        {
            body: payload.body || '',
            icon: payload.icon || '/android-chrome-192x192.png',
            badge: payload.badge || '/favicon-32x32.png',
            tag: payload.tag || 'select-dance-notification',
            renotify: false,
            data: payload.data || { url: '/admin/agenda' }
        }
    ));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const destination = new URL(event.notification.data?.url || '/admin/agenda', self.location.origin).href;

    event.waitUntil((async () => {
        const windows = await clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of windows) {
            if (new URL(client.url).origin === self.location.origin) {
                await client.navigate(destination);
                return client.focus();
            }
        }
        return clients.openWindow(destination);
    })());
});
