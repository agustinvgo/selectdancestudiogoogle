import { SITE } from '../../config/site.js';
import StructuredDataScript from './StructuredDataScript.jsx';

const SchemaWebSite = () => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE.url}/#website`,
        url: SITE.url,
        name: SITE.name,
        alternateName: ['Select Dance Studio Palermo', 'SDS'],
        inLanguage: 'es-AR',
        publisher: {
            '@id': `${SITE.url}/#organization`,
        },
    };

    return <StructuredDataScript id="seo-website" schema={schema} />;
};

export default SchemaWebSite;
