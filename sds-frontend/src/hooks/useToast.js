import toast from 'react-hot-toast';

/**
 * Custom hook para manejar notificaciones toast de manera consistente
 * en toda la aplicación
 */
const useToast = () => {
    const success = (message) => {
        toast.success(message, {
            duration: 4000,
            position: 'top-right',
            style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #10b981',
            },
            iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
            },
        });
    };

    const error = (message) => {
        toast.error(message, {
            duration: 5000,
            position: 'top-right',
            style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #ef4444',
            },
            iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
            },
        });
    };

    const warning = (message) => {
        toast(message, {
            duration: 4000,
            position: 'top-right',
            icon: '⚠️',
            style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #f59e0b',
            },
        });
    };

    const info = (message) => {
        toast(message, {
            duration: 4000,
            position: 'top-right',
            icon: 'ℹ️',
            style: {
                background: '#1f2937',
                color: '#fff',
                border: '1px solid #3b82f6',
            },
        });
    };

    return {
        success,
        error,
        warning,
        info,
    };
};

export default useToast;
