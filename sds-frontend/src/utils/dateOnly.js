const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

export const getDateOnlyString = (value) => {
    if (!value) return '';

    if (typeof value === 'string') {
        const match = value.match(DATE_ONLY_PATTERN);
        return match ? `${match[1]}-${match[2]}-${match[3]}` : '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const parseDateOnly = (value) => {
    const dateOnly = getDateOnlyString(value);
    if (!dateOnly) return null;

    const [year, month, day] = dateOnly.split('-').map(Number);
    // Mediodía local: conserva el día independientemente de la zona horaria.
    return new Date(year, month - 1, day, 12, 0, 0, 0);
};

export const formatDateOnly = (value, options) => {
    const date = parseDateOnly(value);
    return date ? date.toLocaleDateString('es-AR', options) : '';
};

export const todayDateOnly = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
