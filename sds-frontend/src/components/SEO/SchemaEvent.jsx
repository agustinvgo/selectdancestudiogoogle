/**
 * Schema JSON-LD: Event
 * Usar para audiciones, recitales y eventos especiales.
 * Genera rich snippets con fecha, lugar y precio en Google.
 *
 * @param {string} nombre - Nombre del evento
 * @param {string} descripcion - Descripción del evento
 * @param {string} fechaInicio - ISO 8601, ej: "2025-07-15T10:00:00-03:00"
 * @param {string} fechaFin - ISO 8601
 * @param {string} imagen - URL absoluta de imagen del evento
 * @param {number} precio - 0 para eventos gratuitos
 */
const SchemaEvent = ({
    nombre,
    descripcion,
    fechaInicio,
    fechaFin,
    imagen = 'https://www.selectdancestudio.com/og-image.webp',
    precio = 0,
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
            name: 'Select Dance Studio',
            address: {
                '@type': 'PostalAddress',
                streetAddress: 'COMPLETAR',  // ← Completar con dirección real
                addressLocality: 'Palermo',
                addressRegion: 'Ciudad Autónoma de Buenos Aires',
                addressCountry: 'AR',
            },
            geo: {
                '@type': 'GeoCoordinates',
                latitude: -34.5827,
                longitude: -58.4271,
            },
        },
        organizer: {
            '@type': 'Organization',
            name: 'Select Dance Studio',
            url: 'https://www.selectdancestudio.com',
        },
        image: imagen,
        offers: {
            '@type': 'Offer',
            price: precio,
            priceCurrency: 'ARS',
            availability: 'https://schema.org/InStock',
            url: 'https://www.selectdancestudio.com/competition',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
        />
    );
};

export default SchemaEvent;

// Ejemplo de uso:
// <SchemaEvent
//   nombre="Audición Select Dance Studio 2025"
//   descripcion="Audiciones abiertas para el equipo de competición 2025. Niñas de 8 a 16 años."
//   fechaInicio="2025-08-10T10:00:00-03:00"
//   fechaFin="2025-08-10T13:00:00-03:00"
//   precio={0}
// />
