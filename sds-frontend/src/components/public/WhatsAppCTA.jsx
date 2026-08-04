import { buildWhatsAppUrl, trackWhatsAppClick } from '../../utils/whatsapp.js';

const WhatsAppCTA = ({
    message,
    source,
    service,
    children = 'Consultar por WhatsApp',
    className = '',
    ...linkProps
}) => (
    <a
        {...linkProps}
        href={buildWhatsAppUrl(message)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackWhatsAppClick({ source, service })}
        className={className}
    >
        {children}
    </a>
);

export default WhatsAppCTA;
