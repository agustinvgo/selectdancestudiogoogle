import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type, schema }) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title ? `${title} | Select Dance Studio` : 'Select Dance Studio'}</title>
            <meta name='description' content={description} />

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={type} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />

            {/* Schema Markup (JSON-LD) */}
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Helmet>
    );
};

SEO.defaultProps = {
    title: 'Select Dance Studio | Alto Rendimiento en Danza en Palermo',
    description: 'Academia de danza y gimnasia artística en Palermo. Formación competitiva, ballet, lyrical jazz y core training para niñas y adolescentes.',
    name: 'Select Dance Studio',
    type: 'website',
    schema: {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Select Dance Studio",
        "url": "https://selectdancestudio.com/",
        "logo": "https://selectdancestudio.com/logo.jpg"
    }
};

export default SEO;
