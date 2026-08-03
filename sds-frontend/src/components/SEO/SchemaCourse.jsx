import { absoluteUrl, SITE } from '../../config/site.js';

const SchemaCourse = ({ nivel, descripcion, rangoEdad, precio }) => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: `Danza ${nivel} — Select Dance Studio Palermo`,
        description: descripcion,
        provider: {
            '@type': 'Organization',
            name: SITE.name,
            sameAs: SITE.url,
        },
        courseMode: 'onsite',
        educationalLevel: nivel,
        typicalAgeRange: rangoEdad,
        inLanguage: 'es-AR',
        ...(precio ? {
            offers: {
                '@type': 'Offer',
                category: 'Clases de danza',
                priceCurrency: 'ARS',
                price: precio,
                availability: 'https://schema.org/InStock',
                url: absoluteUrl('/clase-de-prueba'),
            },
        } : {}),
        hasCourseInstance: {
            '@type': 'CourseInstance',
            courseMode: 'onsite',
            location: {
                '@type': 'Place',
                name: SITE.name,
                address: {
                    '@type': 'PostalAddress',
                    ...SITE.address,
                },
            },
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

export default SchemaCourse;
