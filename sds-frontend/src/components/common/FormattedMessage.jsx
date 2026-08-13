const BOLD_SEGMENT_PATTERN = /(\*\*[^*\n]+\*\*)/g;

export const stripMessageFormatting = (text = '') => String(text).replace(/\*\*([^*\n]+)\*\*/g, '$1');

const FormattedMessage = ({
    text = '',
    className = '',
    boldClassName = 'font-bold text-gray-900',
    as: Component = 'div'
}) => {
    const segments = String(text).split(BOLD_SEGMENT_PATTERN);

    return (
        <Component className={`whitespace-pre-wrap ${className}`}>
            {segments.map((segment, index) => {
                const isBold = segment.startsWith('**') && segment.endsWith('**') && segment.length > 4;

                return isBold
                    ? <strong key={index} className={boldClassName}>{segment.slice(2, -2)}</strong>
                    : segment;
            })}
        </Component>
    );
};

export default FormattedMessage;
