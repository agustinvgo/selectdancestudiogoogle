import { useEffect } from 'react';

const StructuredDataScript = ({ id, schema }) => {
    const serializedSchema = JSON.stringify(schema);

    useEffect(() => {
        let script = document.getElementById(id);

        if (!script) {
            script = document.createElement('script');
            script.id = id;
            document.head.appendChild(script);
        }

        script.type = 'application/ld+json';
        script.removeAttribute('data-rh');
        script.textContent = serializedSchema;

        return () => {
            if (document.getElementById(id) === script) {
                script.remove();
            }
        };
    }, [id, serializedSchema]);

    return null;
};

export default StructuredDataScript;
