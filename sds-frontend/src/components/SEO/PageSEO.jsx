import { Helmet } from 'react-helmet-async';

/**
 * Componente SEO central para todas las páginas públicas.
 * Gestiona title, description, canonical, Open Graph, geo-tags y robots.
 *
 * @param {string} title - Título de la página (sin el nombre del sitio)
 * @param {string} description - Meta descripción (max 160 caracteres)
 * @param {string} canonical - Path canónico, ej: "/cursos"
 * @param {string} ogImage - Path a la imagen OG (1200x630px WebP recomendado)
 * @param {boolean} noIndex - true para páginas privadas/admin
 */
export const PageSEO = ({
    title,
    description,
    canonical,
    ogImage = '/og-image.webp',
    noIndex = false,
}) => {
    const BASE_URL = 'https://www.selectdancestudio.com';
    const fullCanonical = `${BASE_URL}${canonical}`;
    const fullTitle = title === 'Select Dance Studio' ? title : `${title} | Select Dance Studio`;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta
                name="robots"
                content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}
            />
            <link rel="canonical" href={fullCanonical} />

            {/* Open Graph */}
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={fullCanonical} />
            <meta property="og:image" content={`${BASE_URL}${ogImage}`} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:locale" content="es_AR" />
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Select Dance Studio" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={`${BASE_URL}${ogImage}`} />

            {/* Geo meta tags — SEO Local Buenos Aires */}
            <meta name="geo.region" content="AR-C" />
            <meta name="geo.placename" content="Palermo, Buenos Aires, Argentina" />
            <meta name="geo.position" content="-34.5827;-58.4271" />
            <meta name="ICBM" content="-34.5827, -58.4271" />
        </Helmet>
    );
};

export default PageSEO;
