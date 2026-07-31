export const toLocalIsoDate = (date = new Date()) => {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
};

export const addIsoDays = (isoDate, days) => {
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12);
    date.setDate(date.getDate() + days);
    return toLocalIsoDate(date);
};

export const getMonday = (isoDate = toLocalIsoDate()) => {
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12);
    const weekday = date.getDay();
    return addIsoDays(isoDate, weekday === 0 ? -6 : 1 - weekday);
};

export const formatShortDate = (isoDate) => new Date(`${isoDate}T12:00:00`)
    .toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });

export const formatLongDate = (isoDate) => new Date(`${isoDate}T12:00:00`)
    .toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
