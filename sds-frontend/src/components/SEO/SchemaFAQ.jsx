/**
 * Schema JSON-LD: FAQPage
 * Implementar en una página /faq o como sección en Home.
 * Genera rich snippets en Google: respuestas expandibles en los resultados.
 */
const SchemaFAQ = () => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: '¿Desde qué edad pueden empezar los niños a bailar en Select Dance Studio?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'En Select Dance Studio aceptamos niñas desde los 2 años en nuestro programa Baby Dance, que combina movimiento y expresión a través del juego. A partir de los 5 años comienza el programa Mini, con técnica inicial de danza.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Dónde está ubicada la academia de danza Select Dance Studio?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Estamos ubicados en el barrio de Palermo, Ciudad Autónoma de Buenos Aires, Argentina. Contamos con acceso fácil desde toda la ciudad.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Qué estilos de danza enseñan?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Enseñamos ballet clásico, jazz, danza contemporánea y gimnasia artística, organizados en niveles: Baby (2-4 años), Mini (5-7 años), Junior (8-11 años), Teen (12-15 años), Senior (16+) y Recreativo.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Puedo pedir una clase de prueba antes de inscribirme?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Sí. Ofrecemos clases de prueba gratuitas sujetas a disponibilidad. Podés solicitar la tuya desde nuestra sección de contacto o completando el formulario online en nuestra web.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Participan en competencias de danza?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Sí. Contamos con un programa de competición para alumnas avanzadas que participan en torneos y festivales de danza a nivel nacional. El equipo de competición selecciona alumnas por nivel técnico.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Tienen clases para adultos?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Ofrecemos clases recreativas para adolescentes y adultas que buscan bailar sin presión competitiva, como actividad física y artística.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Cuál es el costo de la cuota mensual?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Las cuotas varían según el nivel y la cantidad de clases semanales. Contactanos por WhatsApp o completá el formulario para recibir la información de aranceles actualizada.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Se puede alquilar una sala en Select Dance Studio para clases o ensayos?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Sí. Contamos con salas profesionales disponibles para alquiler por horas, ideales para clases privadas, ensayos, workshops, sesiones de fotos, videoclips y castings. Las salas incluyen piso de madera flotante, espejos, barras de ballet y sistema de sonido. Para consultar disponibilidad y precios, contactanos por WhatsApp o email.',
                },
            },
            {
                '@type': 'Question',
                name: '¿Cómo reservo una sala en Select Dance Studio Palermo?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Para reservar una sala escribinos por WhatsApp o al correo selectdancestudio.ar@gmail.com. Te confirmamos la disponibilidad horaria y coordinamos los detalles de forma personalizada.',
                },
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 2) }}
        />
    );
};

export default SchemaFAQ;
