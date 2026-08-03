import { absoluteUrl, SITE } from '../../config/site.js';

const SchemaEvent = ({
    nombre,
    descripcion,
    fechaInicio,
    fechaFin,
    imagen = SITE.defaultImage,
    precio,
}) => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: nombre,
        description: descripcion,
        startDate: fechaInicio,
        endDate: fechaFin,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
            '@type': 'Place',
            name: SITE.name,
            address: {
                '@type': 'PostalAddress',
                ...SITE.address,
            },
            geo: {
                '@type': 'GeoCoordinates',
                ...SITE.geo,
            },
        },
        organizer: {
            '@type': 'Organization',
            name: SITE.name,
            url: SITE.url,
        },
        image: absoluteUrl(imagen),
        ...(precio !== undefined ? {
            offers: {
                '@type': 'Offer',
                price: precio,
                priceCurrency: 'ARS',
                availability: 'https://schema.org/InStock',
                url: absoluteUrl('/competencia-danza-palermo'),
            },
        } : {}),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

export default SchemaEvent;
