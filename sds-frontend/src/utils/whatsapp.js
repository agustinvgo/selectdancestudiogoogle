import { SITE } from '../config/site.js';

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
