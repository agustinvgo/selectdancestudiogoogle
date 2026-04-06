import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ClockIcon } from '@heroicons/react/24/outline';

const PagoPendiente = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const paymentId = searchParams.get('payment_id');

    useEffect(() => {
        // Redirigir al dashboard después de 8 segundos
        const timeout = setTimeout(() => {
            navigate('/alumno');
        }, 8000);

        return () => clearTimeout(timeout);
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="card text-center border-2 border-yellow-600">
                    <div className="card-body space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center">
                                <ClockIcon className="h-12 w-12 text-yellow-500" />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Pago Pendiente
                            </h1>
                            <p className="text-gray-500">
                                Tu pago está en proceso
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                            <p className="text-sm text-gray-900">
                                Has seleccionado pago en efectivo
                            </p>
                            <p className="text-sm text-gray-500">
                                Tu pago se acreditará una vez que sea realizado en:
                            </p>
                            <div className="flex justify-center space-x-4 text-sm">
                                <span className="px-3 py-1 bg-white rounded">Rapipago</span>
                                <span className="px-3 py-1 bg-white rounded">Pago Fácil</span>
                            </div>
                        </div>

                        {paymentId && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">ID de Operación</p>
                                <p className="text-gray-900 font-mono text-sm">{paymentId}</p>
                            </div>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/alumno')}
                                className="btn btn-primary w-full"
                            >
                                Volver al Dashboard
                            </button>
                            <p className="text-sm text-gray-500">
                                Serás redirigido automáticamente en 8 segundos...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PagoPendiente;

