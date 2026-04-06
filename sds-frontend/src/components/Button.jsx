/**
 * Componente Button reutilizable con soporte para estados de carga
 * Muestra un spinner cuando loading={true} y deshabilita automáticamente el botón
 */
const Button = ({
    children,
    loading = false,
    variant = 'primary',
    type = 'button',
    disabled = false,
    className = '',
    ...props
}) => {
    const baseClasses = 'btn inline-flex items-center justify-center space-x-2';

    const variantClasses = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        danger: 'bg-red-600 hover:bg-red-700 text-gray-900',
        success: 'bg-green-600 hover:bg-green-700 text-gray-900',
        warning: 'bg-yellow-600 hover:bg-yellow-700 text-gray-900',
    };

    const isDisabled = disabled || loading;

    return (
        <button
            type={type}
            disabled={isDisabled}
            className={`${baseClasses} ${variantClasses[variant]} ${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            {...props}
        >
            {loading && (
                <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            )}
            <span>{children}</span>
        </button>
    );
};

export default Button;

