import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            // Redirigir según el rol
            if (result.user.rol === 'admin') {
                navigate('/admin');
            } else {
                navigate('/alumno');
            }
        } else {
            setError(result.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-sds-red rounded-2xl mb-4">
                        <span className="text-4xl font-bold text-white">SDS</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Select Dance Studio
                    </h1>
                    <p className="text-gray-400">
                        Ingresa a tu cuenta
                    </p>
                </div>

                {/* Formulario */}
                <div className="card">
                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input"
                                    placeholder="tu@email.com"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input"
                                    placeholder="••••••••"
                                    required
                                />
                                <div className="mt-2 text-right">
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm text-gray-400 hover:text-white transition-colors"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full"
                            >
                                {loading ? 'Ingresando...' : 'Ingresar'}
                            </button>
                        </form>

                        {/* Info de usuarios de prueba */}
                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <p className="text-xs text-gray-400 mb-2">Usuarios de prueba:</p>
                            <div className="text-xs text-gray-500 space-y-1">
                                <p><strong className="text-gray-400">Admin:</strong> admin@sds.com / admin123</p>
                                <p><strong className="text-gray-400">Alumno:</strong> alumno1@sds.com / alumno123</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
