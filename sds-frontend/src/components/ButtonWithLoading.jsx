import React from 'react';

/**
 * ButtonWithLoading - Reusable button component with loading state
 * 
 * @param {boolean} loading - Whether the button is in loading state
 * @param {boolean} disabled - Whether the button is disabled
 * @param {string} loadingText - Text to show when loading (optional)
 * @param {React.ReactNode} children - Button content when not loading
 * @param {string} className - Additional CSS classes
 * @param {function} onClick - Click handler
 */
const ButtonWithLoading = ({
    loading = false,
    disabled = false,
    loadingText,
    children,
    className = '',
    onClick,
    type = 'button',
    ...props
}) => {
    const isDisabled = loading || disabled;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={`${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            {...props}
        >
            {loading ? (
                <span className="flex items-center justify-center space-x-2">
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
                    {loadingText && <span>{loadingText}</span>}
                </span>
            ) : (
                children
            )}
        </button>
    );
};

export default ButtonWithLoading;
