import { absoluteUrl } from '../../config/site.js';
import StructuredDataScript from './StructuredDataScript.jsx';

const SchemaBreadcrumb = ({ items }) => {
    if (!items || items.length === 0) return null;

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${absoluteUrl(items.at(-1).url)}#breadcrumb`,
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: absoluteUrl(item.url),
        })),
    };

    return <StructuredDataScript id="seo-breadcrumb" schema={schema} />;
};

export default SchemaBreadcrumb;
