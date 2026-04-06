/**
 * Schema JSON-LD: Course
 * Usar en páginas individuales por nivel (ej: /cursos/junior).
 * Genera rich snippets de curso en Google con info de precio, edad, etc.
 *
 * @param {string} nivel - Nombre del nivel, ej: "Junior"
 * @param {string} descripcion - Descripción del curso
 * @param {string} rangoEdad - ej: "8-11"
 * @param {string} precio - Precio mensual en ARS
 */
const SchemaCourse = ({ nivel, descripcion, rangoEdad, precio = '0' }) => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: `Danza ${nivel} — Select Dance Studio Palermo`,
        description: descripcion,
        provider: {
            '@type': 'Organization',
            name: 'Select Dance Studio',
            sameAs: 'https://www.selectdancestudio.com',
        },
        courseMode: 'onsite',
        educationalLevel: nivel,
        typicalAgeRange: rangoEdad,
        inLanguage: 'es-AR',
        offers: {
            '@type': 'Offer',
            category: 'Clases de danza',
            priceCurrency: 'ARS',
            price: precio,
            availability: 'https://schema.org/InStock',
            validFrom: new Date().toISOString().split('T')[0],
            url: 'https://www.selectdancestudio.com/clase-de-prueba',
        },
        hasCourseInstance: {
            '@type': 'CourseInstance',
            courseMode: 'onsite',
            location: {
                '@type': 'Place',
                name: 'Select Dance Studio',
                address: {
                    '@type': 'PostalAddress',
                    addressLocality: 'Palermo',
                    addressRegion: 'Ciudad Autónoma de Buenos Aires',
                    addressCountry: 'AR',
                },
            },
            instructor: {
                '@type': 'Person',
                jobTitle: 'Profesora de Danza',
                worksFor: {
                    '@type': 'Organization',
                    name: 'Select Dance Studio',
                },
            },
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
        />
    );
};

export default SchemaCourse;

// Ejemplo de uso en /cursos/junior:
// <SchemaCourse
//   nivel="Junior"
//   descripcion="Clases de danza para niñas de 8 a 11 años en Palermo, Buenos Aires. Ballet, jazz y contemporáneo con metodología de alto rendimiento."
//   rangoEdad="8-11"
//   precio="XXXXX"
// />
