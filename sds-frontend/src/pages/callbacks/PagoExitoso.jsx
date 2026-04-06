import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

const PagoExitoso = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');

    useEffect(() => {
        // Redirigir al dashboard después de 5 segundos
        const timeout = setTimeout(() => {
            navigate('/alumno');
        }, 5000);

        return () => clearTimeout(timeout);
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="card text-center">
                    <div className="card-body space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
                                <CheckCircleIcon className="h-12 w-12 text-green-500" />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                ¡Pago Exitoso!
                            </h1>
                            <p className="text-gray-500">
                                Tu pago ha sido procesado correctamente
                            </p>
                        </div>

                        {paymentId && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">ID de Transacción</p>
                                <p className="text-gray-900 font-mono">{paymentId}</p>
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
                                Serás redirigido automáticamente en 5 segundos...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PagoExitoso;

