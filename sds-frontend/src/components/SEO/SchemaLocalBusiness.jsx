/**
 * Schema JSON-LD: LocalBusiness + PerformingArtsTheater
 * Colocar en el componente Home para máximo impacto SEO local.
 *
 * ⚠️ COMPLETAR:
 *  - streetAddress con la dirección exacta
 *  - telephone con el número real
 *  - postalCode con el CP del local
 *  - latitude/longitude con coordenadas GPS exactas
 *  - sameAs con URLs reales de redes sociales
 *  - hasMap con el link real de Google Maps
 *  - openingHoursSpecification según horarios reales
 */
const SchemaLocalBusiness = () => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': ['LocalBusiness', 'PerformingArtsTheater'],
        '@id': 'https://www.selectdancestudio.com/#organization',
        name: 'Select Dance Studio',
        alternateName: 'Select Dance Studio Palermo',
        description:
            'Academia de danza de alto rendimiento en Palermo, Buenos Aires. Clases de ballet, jazz, contemporáneo y gimnasia artística para niñas y adolescentes.',
        url: 'https://www.selectdancestudio.com',
        logo: {
            '@type': 'ImageObject',
            url: 'https://www.selectdancestudio.com/logo.webp',
            width: 400,
            height: 400,
        },
        image: 'https://www.selectdancestudio.com/og-image.webp',
        // ↓ COMPLETAR CON DATOS REALES
        telephone: '+54-11-XXXX-XXXX',
        email: 'selectdancestudio.ar@gmail.com',
        priceRange: '$$',                           // Solo $, $$, $$$, $$$$ — Google rechaza texto libre
        currenciesAccepted: 'ARS',
        paymentAccepted: 'Cash, Credit Card, Bank Transfer',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Honduras 5550',
            addressLocality: 'Palermo',
            addressRegion: 'Ciudad Autónoma de Buenos Aires',
            postalCode: 'C1425',
            addressCountry: 'AR',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: -34.5875,   // Honduras 5550, Palermo, CABA
            longitude: -58.4359,
        },
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '09:00',
                closes: '22:00',
            },
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Saturday',
                opens: '09:00',
                closes: '22:00',
            },
        ],
        sameAs: [
            'https://www.instagram.com/selectdancestudio',  // ← COMPLETAR con URL real
            'https://www.facebook.com/selectdancestudio',   // ← COMPLETAR con URL real
        ],
        // WhatsApp: va en contactPoint, NO en sameAs (Google rechaza wa.me en sameAs)
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            url: 'https://wa.me/message/ZNBV2CLWYU36H1',
            availableLanguage: 'Spanish',
        },
        hasMap: 'https://maps.google.com/?q=Select+Dance+Studio+Palermo+Buenos+Aires',
        areaServed: {
            '@type': 'GeoCircle',
            geoMidpoint: {
                '@type': 'GeoCoordinates',
                latitude: -34.5827,
                longitude: -58.4271,
            },
            geoRadius: '5000',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
        />
    );
};

export default SchemaLocalBusiness;
