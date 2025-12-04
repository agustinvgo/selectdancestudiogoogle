import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authAPI.forgotPassword(email);

            if (response.data.success) {
                setSuccess(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al enviar el correo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
            <div className="card w-full max-w-md">
                <div className="card-header text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">🩰 Select Dance Studio</h1>
                    <p className="text-gray-400">Recuperación de Contraseña</p>
                </div>

                <div className="card-body">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h3 className="text-xl font-bold text-white">¡Correo Enviado!</h3>

                            <p className="text-gray-300">
                                Si el correo electrónico está registrado en nuestro sistema,
                                recibirás instrucciones para restablecer tu contraseña.
                            </p>

                            <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 text-sm text-yellow-200">
                                <p className="font-semibold mb-1">⚠️ Recordatorio:</p>
                                <ul className="list-disc list-inside space-y-1 text-left">
                                    <li>Revisa tu bandeja de entrada y spam</li>
                                    <li>El enlace es válido por 1 hora</li>
                                    <li>Si no lo solicitaste, ignora este mensaje</li>
                                </ul>
                            </div>

                            <Link to="/login" className="btn btn-primary w-full inline-block">
                                Volver al Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <p className="text-gray-300 text-sm text-center">
                                Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
                            </p>

                            {error && (
                                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-sm text-red-200">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input w-full"
                                    placeholder="tu@email.com"
                                    required
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Enviando...
                                    </span>
                                ) : (
                                    'Enviar Instrucciones'
                                )}
                            </button>

                            <div className="text-center space-y-2">
                                <Link
                                    to="/login"
                                    className="text-sm text-gray-400 hover:text-white transition-colors block"
                                >
                                    ← Volver al Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
