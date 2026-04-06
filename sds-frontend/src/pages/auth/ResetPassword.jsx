import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../../services/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (tokenParam) {
            setToken(tokenParam);
        } else {
            setError('Token no encontrado en la URL');
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validaciones básicas
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{9,}$/;
        if (!passwordRegex.test(password)) {
            setError('La contraseña debe tener al menos 9 caracteres, una mayúscula, un número y un símbolo.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.resetPassword(token, password);

            if (response.data.success) {
                setSuccess(true);
                // Redirigir al login después de 3 segundos
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al restablecer la contraseña');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        if (password.length < 9) return { strength: 1, label: 'Muy débil', color: 'bg-red-500' };
        if (password.length < 11) return { strength: 2, label: 'Débil', color: 'bg-orange-500' };
        if (password.length < 13) return { strength: 3, label: 'Media', color: 'bg-yellow-500' };
        return { strength: 4, label: 'Fuerte', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
            <div className="card w-full max-w-md">
                <div className="card-header text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">🩰 Select Dance Studio</h1>
                    <p className="text-gray-500">Restablecer Contraseña</p>
                </div>

                <div className="card-body">
                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900">¡Contraseña Actualizada!</h3>

                            <p className="text-gray-600">
                                Tu contraseña ha sido restablecida exitosamente.
                            </p>

                            <p className="text-sm text-gray-500">
                                Serás redirigido al login en 3 segundos...
                            </p>

                            <Link to="/login" className="btn btn-primary w-full inline-block">
                                Ir al Login Ahora
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-sm text-red-200">
                                    {error}
                                </div>
                            )}

                            {!token && (
                                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 text-sm text-yellow-200">
                                    <p className="font-semibold mb-1">⚠️ Token no encontrado</p>
                                    <p>Por favor, usa el enlace que recibiste en tu correo electrónico.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input w-full"
                                    placeholder="Mínimo 9 carac., 1 mayúscula, 1 símbolo"
                                    required
                                    disabled={loading || !token}
                                    minLength={9}
                                    autoFocus
                                />

                                <div className="mt-2 text-xs text-gray-500 mb-2">
                                    Requisitos: 9+ caracteres, 1 mayus, 1 número, 1 símbolo.
                                </div>

                                {password && (
                                    <div className="mt-2">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-gray-500">Seguridad:</span>
                                            <span className="text-xs text-gray-500">{passwordStrength.label}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                                                style={{ width: `${(passwordStrength.strength / 4) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-2">
                                    Confirmar Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input w-full"
                                    placeholder="Repite tu contraseña"
                                    required
                                    disabled={loading || !token}
                                    minLength={6}
                                />

                                {confirmPassword && password !== confirmPassword && (
                                    <p className="mt-1 text-xs text-red-400">
                                        ⚠️ Las contraseñas no coinciden
                                    </p>
                                )}
                                {confirmPassword && password === confirmPassword && (
                                    <p className="mt-1 text-xs text-green-400">
                                        ✓ Las contraseñas coinciden
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-full"
                                disabled={loading || !token || password !== confirmPassword}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Actualizando...
                                    </span>
                                ) : (
                                    'Restablecer Contraseña'
                                )}
                            </button>

                            <div className="text-center">
                                <Link
                                    to="/login"
                                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
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

export default ResetPassword;

