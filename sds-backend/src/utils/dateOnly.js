const getDateOnlyString = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.split('T')[0].split(' ')[0];

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const parseDateOnly = (value) => {
    const dateOnly = getDateOnlyString(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null;

    const [year, month, day] = dateOnly.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
};

const formatDateOnly = (value, locale = 'es-AR', options) => {
    const date = parseDateOnly(value);
    return date ? date.toLocaleDateString(locale, options) : '';
};

module.exports = { getDateOnlyString, parseDateOnly, formatDateOnly };
