import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_SEO_ROUTES } from '../src/config/publicSeoRoutes.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(currentDir, '..');
const distDir = resolve(projectDir, 'dist');
const templatePath = resolve(distDir, 'index.html');
const siteUrl = 'https://selectdancestudio.com';
const siteName = 'Select Dance Studio';

const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const absoluteUrl = (path = '/') => path.startsWith('http') ? path : `${siteUrl}${path}`;

const replaceTag = (html, pattern, replacement) => (
    pattern.test(html) ? html.replace(pattern, replacement) : html.replace('</head>', `  ${replacement}\n</head>`)
);

const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['DanceSchool', 'LocalBusiness'],
    '@id': `${siteUrl}/#business`,
    name: siteName,
    url: siteUrl,
    email: 'selectdancestudio.ar@gmail.com',
    image: `${siteUrl}/optimized/home/hero-1024.webp`,
    hasMap: 'https://www.google.com/maps/search/?api=1&query=Honduras+5550%2C+Oficina+105%2C+C1414BND%2C+Buenos+Aires',
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'Honduras 5550, Oficina 105',
        addressLocality: 'Buenos Aires',
        addressRegion: 'Ciudad Autónoma de Buenos Aires',
        postalCode: 'C1414BND',
        addressCountry: 'AR',
    },
    geo: {
        '@type': 'GeoCoordinates',
        latitude: -34.584464,
        longitude: -58.435898,
    },
    areaServed: {
        '@type': 'AdministrativeArea',
        name: 'Palermo, Ciudad Autónoma de Buenos Aires',
    },
    sameAs: [
        'https://www.instagram.com/selectdance.studio/',
        'https://www.tiktok.com/@selectdance.studio',
    ],
};

const buildSchema = (route) => {
    const schemas = [localBusinessSchema];
    if (!['/', '/nosotros', '/faq', '/contacto'].includes(route.canonical)) {
        schemas.push({
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: route.heading,
            description: route.description,
            url: absoluteUrl(route.canonical),
            image: absoluteUrl(route.image),
            areaServed: 'Palermo, Ciudad Autónoma de Buenos Aires',
            provider: { '@id': `${siteUrl}/#business` },
        });
    }
    return schemas;
};

const navigation = [
    ['Inicio', '/'],
    ['Cursos', '/cursos'],
    ['Danza infantil', '/danza-infantil-palermo'],
    ['Acro Dance', '/acro-dance-palermo'],
    ['Gimnasia acrobática', '/gimnasia-acrobatica-palermo'],
    ['Ballet y jazz', '/ballet-jazz-palermo'],
    ['Competencia', '/competencia-danza-palermo'],
    ['Alquiler de sala', '/alquiler-sala-danza-palermo'],
    ['Contacto', '/contacto'],
];

const buildFallback = (route) => `
    <main data-prerendered-seo style="min-height:100vh;background:#050505;color:#fff;font-family:Inter,Arial,sans-serif;padding:clamp(5rem,12vw,9rem) clamp(1.5rem,8vw,8rem);box-sizing:border-box">
      <p style="color:#ef4444;text-transform:uppercase;letter-spacing:.2em;font-weight:700">Select Dance Studio · Palermo</p>
      <h1 style="font-size:clamp(2.5rem,7vw,6rem);line-height:1;max-width:1050px;margin:1rem 0 1.5rem">${escapeHtml(route.heading)}</h1>
      <p style="font-size:clamp(1rem,2vw,1.35rem);line-height:1.7;max-width:780px;color:#d4d4d8">${escapeHtml(route.summary)}</p>
      <p style="margin:2rem 0"><a href="/contacto" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:1rem 1.5rem;font-weight:700">Consultar por WhatsApp</a></p>
      <nav aria-label="Servicios de Select Dance Studio" style="display:flex;flex-wrap:wrap;gap:.75rem 1.25rem;max-width:1000px;margin-top:3rem">
        ${navigation.map(([label, href]) => `<a href="${href}" style="color:#e4e4e7">${escapeHtml(label)}</a>`).join('\n        ')}
      </nav>
      <p style="margin-top:3rem;color:#a1a1aa">Honduras 5550, Oficina 105, C1414BND, Palermo, Buenos Aires.</p>
    </main>`;

const renderRoute = (template, route) => {
    const fullTitle = `${route.title} | ${siteName}`;
    const canonical = absoluteUrl(route.canonical);
    const image = absoluteUrl(route.image);
    let html = template;

    html = replaceTag(html, /<title[^>]*>[\s\S]*?<\/title>/i, `<title data-rh="true">${escapeHtml(fullTitle)}</title>`);
    html = replaceTag(html, /<meta[^>]*\bname="description"[^>]*>/i, `<meta data-rh="true" name="description" content="${escapeHtml(route.description)}" />`);
    html = replaceTag(html, /<meta[^>]*\bproperty="og:title"[^>]*>/i, `<meta data-rh="true" property="og:title" content="${escapeHtml(fullTitle)}" />`);
    html = replaceTag(html, /<meta[^>]*\bproperty="og:description"[^>]*>/i, `<meta data-rh="true" property="og:description" content="${escapeHtml(route.description)}" />`);
    html = replaceTag(html, /<meta[^>]*\bproperty="og:image"[^>]*>/i, `<meta data-rh="true" property="og:image" content="${image}" />`);
    html = replaceTag(html, /<meta[^>]*\bproperty="og:image:alt"[^>]*>/i, `<meta data-rh="true" property="og:image:alt" content="${escapeHtml(route.imageAlt || `${siteName}, academia de danza en Palermo`)}" />`);
    html = replaceTag(html, /<meta[^>]*\bname="twitter:title"[^>]*>/i, `<meta data-rh="true" name="twitter:title" content="${escapeHtml(fullTitle)}" />`);
    html = replaceTag(html, /<meta[^>]*\bname="twitter:description"[^>]*>/i, `<meta data-rh="true" name="twitter:description" content="${escapeHtml(route.description)}" />`);
    html = replaceTag(html, /<meta[^>]*\bname="twitter:image"[^>]*>/i, `<meta data-rh="true" name="twitter:image" content="${image}" />`);
    html = html.replace(/\s*<link[^>]*\brel="canonical"[^>]*>/gi, '');
    html = html.replace(/\s*<meta[^>]*\bproperty="og:url"[^>]*>/gi, '');
    html = html.replace(/\s*<script[^>]*\bid="seo-structured-data"[\s\S]*?<\/script>/gi, '');
    html = html.replace('</head>', [
        `  <link data-rh="true" rel="canonical" href="${canonical}" />`,
        `  <meta data-rh="true" property="og:url" content="${canonical}" />`,
        `  <script data-rh="true" id="seo-structured-data" type="application/ld+json">${JSON.stringify(buildSchema(route)).replaceAll('<', '\\u003c')}</script>`,
        '</head>',
    ].join('\n'));
    html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${buildFallback(route)}\n  </div>`);
    return html;
};

const template = await readFile(templatePath, 'utf8');

for (const route of PUBLIC_SEO_ROUTES) {
    const outputPath = route.canonical === '/'
        ? templatePath
        : resolve(distDir, route.canonical.slice(1), 'index.html');
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, renderRoute(template, route), 'utf8');
}

console.log(`SEO prerender: ${PUBLIC_SEO_ROUTES.length} rutas generadas.`);
