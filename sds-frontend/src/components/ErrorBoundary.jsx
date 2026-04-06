import { Component } from 'react';

/**
 * ErrorBoundary - Captura errores de React en tiempo de runtime.
 * Evita que un crash en un componente derribe toda la aplicación.
 * 
 * Uso:
 *   <ErrorBoundary>
 *     <MiComponente />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // En producción podrías enviar esto a un servicio tipo Sentry
        console.error('[ErrorBoundary] Error capturado:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[200px] flex flex-col items-center justify-center p-8 text-center">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        Algo salió mal
                    </h2>
                    <p className="text-gray-500 mb-6 max-w-sm text-sm">
                        Esta sección tuvo un error inesperado. Puedes intentar recargarla.
                    </p>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
