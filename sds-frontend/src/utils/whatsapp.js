import { SITE } from '../config/site.js';

export const WHATSAPP_MESSAGES = {
    general: 'Hola, vi la web de Select Dance Studio. Quisiera consultar por clases. Edad de la alumna: __. Disciplina de interés: __. ¿Me pueden informar horarios, vacantes y aranceles?',
    roomRental: 'Hola, vi la web de Select Dance Studio y quisiera consultar por el alquiler de sala. Actividad: __. Día y horario: __. Duración: __. Cantidad de personas: __.',
};

export const buildWhatsAppUrl = (message = '') => {
    if (!message) return SITE.whatsapp;
    const separator = SITE.whatsapp.includes('?') ? '&' : '?';
    return `${SITE.whatsapp}${separator}text=${encodeURIComponent(message)}`;
};

export const trackWhatsAppClick = ({ source = 'website', service = 'general' } = {}) => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    window.gtag('event', 'whatsapp_click', {
        event_category: 'conversion',
        source,
        service,
    });
};
