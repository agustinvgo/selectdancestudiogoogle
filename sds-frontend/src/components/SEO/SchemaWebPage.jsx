import { absoluteUrl, SITE } from '../../config/site.js';
import StructuredDataScript from './StructuredDataScript.jsx';

const SchemaWebPage = ({ route }) => {
    if (!route) return null;

    const canonical = absoluteUrl(route.canonical);
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: route.title,
        description: route.description,
        inLanguage: 'es-AR',
        isPartOf: { '@id': `${SITE.url}/#website` },
        about: { '@id': `${SITE.url}/#organization` },
        primaryImageOfPage: absoluteUrl(route.image),
    };

    return <StructuredDataScript id="seo-webpage" schema={schema} />;
};

export default SchemaWebPage;
