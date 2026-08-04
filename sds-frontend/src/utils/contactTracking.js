export const trackPhoneClick = ({ source = 'website' } = {}) => {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

    window.gtag('event', 'phone_click', {
        event_category: 'conversion',
        source,
    });
};
