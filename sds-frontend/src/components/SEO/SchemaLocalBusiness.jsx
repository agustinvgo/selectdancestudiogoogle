import { absoluteUrl, SITE } from '../../config/site.js';
import StructuredDataScript from './StructuredDataScript.jsx';

const SchemaLocalBusiness = () => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': ['LocalBusiness', 'EducationalOrganization'],
        '@id': `${SITE.url}/#organization`,
        name: SITE.name,
        alternateName: ['Select Dance Studio Palermo', 'SDS'],
        description: 'Academia de danza en Palermo, Buenos Aires. Clases de ballet, jazz, contemporáneo, Acro Dance y gimnasia acrobática desde los 3 años y para personas adultas.',
        url: SITE.url,
        logo: {
            '@type': 'ImageObject',
            url: absoluteUrl('/logo-select-dance-studio.webp'),
            width: 1024,
            height: 1024,
        },
        image: absoluteUrl(SITE.defaultImage),
        email: SITE.email,
        telephone: SITE.phone,
        priceRange: '$$',
        currenciesAccepted: 'ARS',
        foundingDate: '2024',
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
            telephone: SITE.phone,
            url: SITE.whatsapp,
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
        hasMap: SITE.maps,
        areaServed: {
            '@type': 'AdministrativeArea',
            name: 'Palermo, Ciudad Autónoma de Buenos Aires',
        },
    };

    return <StructuredDataScript id="seo-local-business" schema={schema} />;
};

export default SchemaLocalBusiness;
