export const SITE = {
    name: 'Select Dance Studio',
    url: 'https://selectdancestudio.com',
    locale: 'es_AR',
    defaultImage: '/optimized/home/hero-1024.webp',
    defaultImageWidth: 1024,
    defaultImageHeight: 682,
    email: 'selectdancestudio.ar@gmail.com',
    whatsapp: 'https://wa.me/message/ZNBV2CLWYU36H1',
    address: {
        streetAddress: 'Honduras 5550, Of. 105',
        addressLocality: 'Palermo',
        addressRegion: 'Ciudad Autónoma de Buenos Aires',
        postalCode: 'C1425',
        addressCountry: 'AR',
    },
    geo: {
        latitude: -34.5875,
        longitude: -58.4359,
    },
    social: {
        instagram: 'https://www.instagram.com/selectdance.studio/',
        tiktok: 'https://www.tiktok.com/@selectdance.studio',
    },
};

export const absoluteUrl = (path = '/') => {
    if (/^https?:\/\//i.test(path)) return path;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${SITE.url}${normalizedPath}`;
};

