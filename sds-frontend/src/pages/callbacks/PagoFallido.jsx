import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/outline';

const PagoFallido = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const paymentId = searchParams.get('payment_id');

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="card text-center border-2 border-red-600">
                    <div className="card-body space-y-6">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center">
                                <XCircleIcon className="h-12 w-12 text-red-500" />
                            </div>
                        </div>

                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Pago No Procesado
                            </h1>
                            <p className="text-gray-500">
                                No se pudo completar el pago
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-500 mb-2">Posibles causas:</p>
                            <ul className="text-sm text-gray-600 space-y-1 text-left list-disc list-inside">
                                <li>Fondos insuficientes</li>
                                <li>Tarjeta rechazada</li>
                                <li>Datos incorrectos</li>
                                <li>Cancelación manual</li>
                            </ul>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/alumno')}
                                className="btn btn-primary w-full"
                            >
                                Intentar Nuevamente
                            </button>
                            <button
                                onClick={() => navigate('/alumno')}
                                className="btn btn-secondary w-full"
                            >
                                Volver al Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PagoFallido;

