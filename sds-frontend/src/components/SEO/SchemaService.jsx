import { absoluteUrl, SITE } from '../../config/site.js';

const SchemaService = ({ name, description, canonical, audience }) => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name,
        description,
        url: absoluteUrl(canonical),
        provider: {
            '@type': 'EducationalOrganization',
            '@id': `${SITE.url}/#organization`,
            name: SITE.name,
            address: {
                '@type': 'PostalAddress',
                ...SITE.address,
            },
        },
        areaServed: {
            '@type': 'City',
            name: 'Buenos Aires',
        },
        audience: {
            '@type': 'Audience',
            audienceType: audience,
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

export default SchemaService;
