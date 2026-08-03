const MONTH_NAMES = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
];

const formatPaymentPeriod = (dateValue) => {
    if (!dateValue) return '-';

    const isoMatch = String(dateValue).match(/^(\d{4})-(\d{2})/);
    if (isoMatch) {
        const year = Number(isoMatch[1]);
        const monthIndex = Number(isoMatch[2]) - 1;
        if (MONTH_NAMES[monthIndex]) return `${MONTH_NAMES[monthIndex]} ${year}`;
    }

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return '-';
    return `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
};

module.exports = { formatPaymentPeriod };

