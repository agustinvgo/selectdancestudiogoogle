export const SITE = {
    name: 'Select Dance Studio',
    url: 'https://selectdancestudio.com',
    locale: 'es_AR',
    defaultImage: '/optimized/home/hero-1024.webp',
    defaultImageWidth: 1024,
    defaultImageHeight: 682,
    email: 'selectdancestudio.ar@gmail.com',
    phone: '+541127744309',
    phoneDisplay: '011 2774-4309',
    whatsapp: 'https://wa.me/5491154890120',
    maps: 'https://www.google.com/maps/search/?api=1&query=Honduras+5550%2C+Oficina+105%2C+C1414BND%2C+Buenos+Aires',
    address: {
        streetAddress: 'Honduras 5550, Oficina 105',
        addressLocality: 'Buenos Aires',
        addressRegion: 'Ciudad Autónoma de Buenos Aires',
        postalCode: 'C1414BND',
        addressCountry: 'AR',
    },
    geo: {
        latitude: -34.584464,
        longitude: -58.435898,
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
