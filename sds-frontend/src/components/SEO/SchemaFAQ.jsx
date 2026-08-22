import { FAQ_ITEMS } from '../../data/faqData.js';
import StructuredDataScript from './StructuredDataScript.jsx';

const SchemaFAQ = () => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': 'https://selectdancestudio.com/faq#faq',
        mainEntity: FAQ_ITEMS.map(({ question, answer }) => ({
            '@type': 'Question',
            name: question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: answer,
            },
        })),
    };

    return <StructuredDataScript id="seo-faq" schema={schema} />;
};

export default SchemaFAQ;
