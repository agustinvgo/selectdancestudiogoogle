import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PUBLIC_SEO_ROUTES } from '../src/config/publicSeoRoutes.js';
import { FAQ_ITEMS } from '../src/data/faqData.js';

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
    '@type': ['LocalBusiness', 'EducationalOrganization'],
    '@id': `${siteUrl}/#organization`,
    name: siteName,
    alternateName: ['Select Dance Studio Palermo', 'SDS'],
    description: 'Academia de danza en Palermo, Buenos Aires. Clases de ballet, jazz, contemporáneo, Acro Dance y gimnasia acrobática desde los 3 años y para personas adultas.',
    url: siteUrl,
    email: 'selectdancestudio.ar@gmail.com',
    telephone: '+541127744309',
    priceRange: '$$',
    currenciesAccepted: 'ARS',
    foundingDate: '2024',
    logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo-select-dance-studio.webp`,
        width: 1024,
        height: 1024,
    },
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
    contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'selectdancestudio.ar@gmail.com',
        telephone: '+541127744309',
        url: 'https://wa.me/5491154890120',
        availableLanguage: ['Spanish', 'English', 'Portuguese'],
    },
    openingHoursSpecification: [
        {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '09:00',
            closes: '22:00',
        },
    ],
};

const buildSchema = (route) => {
    const canonical = absoluteUrl(route.canonical);
    const schemas = [
        ['seo-local-business', localBusinessSchema],
        ['seo-webpage', {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': `${canonical}#webpage`,
            url: canonical,
            name: route.title,
            description: route.description,
            inLanguage: 'es-AR',
            isPartOf: { '@id': `${siteUrl}/#website` },
            about: { '@id': `${siteUrl}/#organization` },
            primaryImageOfPage: absoluteUrl(route.image),
        }],
        ['seo-breadcrumb', {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            '@id': `${canonical}#breadcrumb`,
            itemListElement: route.canonical === '/'
                ? [{ '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl }]
                : [
                    { '@type': 'ListItem', position: 1, name: 'Inicio', item: siteUrl },
                    { '@type': 'ListItem', position: 2, name: route.heading, item: canonical },
                ],
        }],
    ];
    if (route.canonical === '/') {
        schemas.splice(1, 0, ['seo-website', {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            url: siteUrl,
            name: siteName,
            alternateName: ['Select Dance Studio Palermo', 'SDS'],
            inLanguage: 'es-AR',
            publisher: { '@id': `${siteUrl}/#organization` },
        }]);
    }
    if (!['/', '/nosotros', '/faq', '/contacto'].includes(route.canonical)) {
        schemas.push(['seo-service', {
            '@context': 'https://schema.org',
            '@type': 'Service',
            '@id': `${canonical}#service`,
            name: route.heading,
            description: route.description,
            url: absoluteUrl(route.canonical),
            image: absoluteUrl(route.image),
            areaServed: 'Palermo, Ciudad Autónoma de Buenos Aires',
            provider: { '@id': `${siteUrl}/#organization` },
            ...(route.audience ? {
                audience: {
                    '@type': 'Audience',
                    audienceType: route.audience,
                },
            } : {}),
        }]);
    }
    if (route.canonical === '/faq') {
        schemas.push(['seo-faq', {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            '@id': `${canonical}#faq`,
            mainEntity: FAQ_ITEMS.map(({ question, answer }) => ({
                '@type': 'Question',
                name: question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: answer,
                },
            })),
        }]);
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
    ['Danza para adultos', '/clases-danza-adultos-palermo'],
    ['Clases particulares', '/clases-particulares-danza-palermo'],
    ['Competencia', '/competencia-danza-palermo'],
    ['Alquiler de sala', '/alquiler-sala-danza-palermo'],
    ['Nosotros', '/nosotros'],
    ['Preguntas frecuentes', '/faq'],
    ['Contacto', '/contacto'],
];

const buildCards = (items = []) => items.map(([title, text]) => `
        <article style="border:1px solid #27272a;border-radius:1rem;padding:1.5rem;background:#111113">
          <h3 style="font-size:1.2rem;margin:0 0 .75rem">${escapeHtml(title)}</h3>
          <p style="color:#d4d4d8;line-height:1.7;margin:0">${escapeHtml(text)}</p>
        </article>`).join('\n');

const buildFallback = (route) => {
    const whatsappText = route.whatsappMessage || 'Hola, vi la web de Select Dance Studio. Quisiera consultar por clases, horarios, vacantes y aranceles.';
    const whatsappUrl = `https://wa.me/5491154890120?text=${encodeURIComponent(whatsappText)}`;
    const highlights = route.highlights || [];
    const sections = route.sections || [];
    const questions = route.questions || [];

    return `
    <main data-prerendered-seo style="min-height:100vh;background:#050505;color:#fff;font-family:Inter,Arial,sans-serif;padding:clamp(5rem,12vw,9rem) clamp(1.5rem,8vw,8rem);box-sizing:border-box">
      <p style="color:#ef4444;text-transform:uppercase;letter-spacing:.2em;font-weight:700">Select Dance Studio · Palermo, Buenos Aires</p>
      <h1 style="font-size:clamp(2.5rem,7vw,6rem);line-height:1;max-width:1050px;margin:1rem 0 1.5rem">${escapeHtml(route.heading)}</h1>
      <p style="font-size:clamp(1rem,2vw,1.35rem);line-height:1.7;max-width:780px;color:#d4d4d8">${escapeHtml(route.summary)}</p>
      <p style="margin:2rem 0"><a href="${whatsappUrl}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:1rem 1.5rem;font-weight:700">Consultar horarios, vacantes y aranceles por WhatsApp</a></p>
      <img src="${escapeHtml(route.image)}" alt="${escapeHtml(route.imageAlt || `${siteName}, academia de danza en Palermo, Buenos Aires`)}" style="display:block;width:min(100%,1100px);max-height:620px;object-fit:cover;border-radius:1.25rem;margin:3rem 0" />
      ${highlights.length ? `
      <section aria-labelledby="seo-propuesta" style="max-width:1100px;margin:4rem 0">
        <h2 id="seo-propuesta" style="font-size:clamp(1.8rem,4vw,3rem);margin-bottom:1.5rem">${escapeHtml(route.proposalHeading || 'Nuestra propuesta')}</h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem">
${buildCards(highlights)}
        </div>
      </section>` : ''}
      ${sections.length ? `
      <section aria-label="Información del programa" style="max-width:1100px;margin:4rem 0;display:grid;gap:1rem">
${buildCards(sections)}
      </section>` : ''}
      ${questions.length ? `
      <section aria-labelledby="seo-preguntas" style="max-width:900px;margin:4rem 0">
        <h2 id="seo-preguntas" style="font-size:clamp(1.8rem,4vw,3rem)">Preguntas frecuentes</h2>
        <div style="display:grid;gap:1rem;margin-top:1.5rem">
${buildCards(questions)}
        </div>
      </section>` : ''}
      <nav aria-label="Servicios de Select Dance Studio" style="display:flex;flex-wrap:wrap;gap:.75rem 1.25rem;max-width:1000px;margin-top:3rem">
        ${navigation.map(([label, href]) => `<a href="${href}" style="color:#e4e4e7">${escapeHtml(label)}</a>`).join('\n        ')}
      </nav>
      <address style="margin-top:3rem;color:#a1a1aa;font-style:normal">Honduras 5550, Oficina 105, C1414BND, Palermo, Ciudad Autónoma de Buenos Aires. Atención en español, inglés y portugués.</address>
    </main>`;
};

const renderRoute = (template, route) => {
    const fullTitle = `${route.title} | ${siteName}`;
    const canonical = absoluteUrl(route.canonical);
    const image = absoluteUrl(route.image);
    const responsivePreload = route.image.endsWith('-1280.webp')
        ? ` imagesrcset="${absoluteUrl(route.image.replace('-1280.webp', '-480.webp'))} 480w, ${absoluteUrl(route.image.replace('-1280.webp', '-768.webp'))} 768w, ${image} ${route.imageWidth || 1280}w" imagesizes="100vw"`
        : '';
    let html = template;

    html = replaceTag(html, /<title[^>]*>[\s\S]*?<\/title>/i, `<title data-rh="true">${escapeHtml(fullTitle)}</title>`);
    html = replaceTag(html, /<meta[^>]*\bname="description"[^>]*>/i, `<meta data-rh="true" name="description" content="${escapeHtml(route.description)}" />`);
    html = replaceTag(html, /<meta[^>]*\bproperty="og:title"[^>]*>/i, `<meta data-rh="true" property="og:title" content="${escapeHtml(fullTitle)}" />`);
    html = replaceTag(html, /<meta[^>]*\bproperty="og:description"[^>]*>/i, `<meta data-rh="true" property="og:description" content="${escapeHtml(route.description)}" />`);
    html = replaceTag(html, /<meta[^>]*\bproperty="og:image"[^>]*>/i, `<meta data-rh="true" property="og:image" content="${image}" />`);
    html = replaceTag(html, /<meta[^>]*\bproperty="og:image:alt"[^>]*>/i, `<meta data-rh="true" property="og:image:alt" content="${escapeHtml(route.imageAlt || `${siteName}, academia de danza en Palermo`)}" />`);
    html = replaceTag(html, /<meta[^>]*\bproperty="og:image:width"[^>]*>/i, `<meta data-rh="true" property="og:image:width" content="${route.imageWidth || 1024}" />`);
    html = replaceTag(html, /<meta[^>]*\bproperty="og:image:height"[^>]*>/i, `<meta data-rh="true" property="og:image:height" content="${route.imageHeight || 682}" />`);
    html = replaceTag(html, /<meta[^>]*\bname="twitter:title"[^>]*>/i, `<meta data-rh="true" name="twitter:title" content="${escapeHtml(fullTitle)}" />`);
    html = replaceTag(html, /<meta[^>]*\bname="twitter:description"[^>]*>/i, `<meta data-rh="true" name="twitter:description" content="${escapeHtml(route.description)}" />`);
    html = replaceTag(html, /<meta[^>]*\bname="twitter:image"[^>]*>/i, `<meta data-rh="true" name="twitter:image" content="${image}" />`);
    html = replaceTag(html, /<link[^>]*\brel="preload"[^>]*\bas="image"[^>]*>/i, `<link rel="preload" as="image" href="${image}"${responsivePreload} fetchpriority="high" type="image/webp" />`);
    html = html.replace(/\s*<link[^>]*\brel="canonical"[^>]*>/gi, '');
    html = html.replace(/\s*<meta[^>]*\bproperty="og:url"[^>]*>/gi, '');
    html = html.replace(/\s*<script[^>]*\bid="seo-[^"]+"[\s\S]*?<\/script>/gi, '');
    const schemaScripts = buildSchema(route).map(([id, schema]) => (
        `  <script data-rh="true" id="${id}" type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>`
    ));
    html = html.replace('</head>', () => [
        `  <link data-rh="true" rel="canonical" href="${canonical}" />`,
        `  <meta data-rh="true" property="og:url" content="${canonical}" />`,
        ...schemaScripts,
        '</head>',
    ].join('\n'));
    html = html.replace(/<div id="root">[\s\S]*?<\/div>/i, () => `<div id="root">${buildFallback(route)}\n  </div>`);
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
