import { absoluteUrl, SITE } from '../../config/site.js';
import StructuredDataScript from './StructuredDataScript.jsx';

const SchemaService = ({ name, description, canonical, audience }) => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': `${absoluteUrl(canonical)}#service`,
        name,
        description,
        url: absoluteUrl(canonical),
        provider: {
            '@id': `${SITE.url}/#organization`,
        },
        areaServed: 'Palermo, Ciudad Autónoma de Buenos Aires',
        ...(audience ? {
            audience: {
                '@type': 'Audience',
                audienceType: audience,
            },
        } : {}),
    };

    return <StructuredDataScript id="seo-service" schema={schema} />;
};

export default SchemaService;
