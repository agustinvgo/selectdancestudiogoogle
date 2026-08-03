import { absoluteUrl, SITE } from '../../config/site.js';

const SchemaLocalBusiness = () => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': ['LocalBusiness', 'EducationalOrganization'],
        '@id': `${SITE.url}/#organization`,
        name: SITE.name,
        alternateName: 'Select Dance Studio Palermo',
        description: 'Academia de danza en Palermo, Buenos Aires. Clases de ballet, jazz, contemporáneo y gimnasia artística para niñas y adolescentes.',
        url: SITE.url,
        logo: {
            '@type': 'ImageObject',
            url: absoluteUrl('/logo-select-dance-studio.webp'),
            width: 1024,
            height: 1024,
        },
        image: absoluteUrl(SITE.defaultImage),
        email: SITE.email,
        priceRange: '$$',
        currenciesAccepted: 'ARS',
        address: {
            '@type': 'PostalAddress',
            ...SITE.address,
        },
        geo: {
            '@type': 'GeoCoordinates',
            ...SITE.geo,
        },
        sameAs: [SITE.social.instagram, SITE.social.tiktok],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: SITE.email,
            url: SITE.whatsapp,
            availableLanguage: 'Spanish',
        },
        hasMap: SITE.maps,
        areaServed: {
            '@type': 'AdministrativeArea',
            name: 'Palermo y Ciudad Autónoma de Buenos Aires',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

export default SchemaLocalBusiness;
