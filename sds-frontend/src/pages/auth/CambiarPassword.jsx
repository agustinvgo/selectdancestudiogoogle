import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import logo from '../../assets/logo-select-dance-studio.webp';

const CambiarPassword = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{9,}$/;
        if (!passwordRegex.test(newPassword)) {
            toast.error('La contraseña debe tener al menos 9 caracteres, una mayúscula, un número y un símbolo.');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.changePassword(oldPassword, newPassword);
            if (response.data.success) {
                toast.success('Contraseña actualizada exitosamente');

                // Actualizar el estado de primer_login en el contexto y localStorage
                updateUser({ primer_login: false });

                // Redirigir según el rol
                setTimeout(() => {
                    if (user?.rol === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/alumno');
                    }
                }, 1500);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error al cambiar contraseña');
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        if (newPassword.length === 0) return { strength: 0, label: '', color: '' };
        if (newPassword.length < 9) return { strength: 1, label: 'Muy débil', color: 'bg-red-500' };
        if (newPassword.length < 11) return { strength: 2, label: 'Débil', color: 'bg-orange-500' };
        if (newPassword.length < 13) return { strength: 3, label: 'Media', color: 'bg-yellow-500' };
        return { strength: 4, label: 'Fuerte', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img
                        src={logo}
                        alt="Select Dance Studio"
                        className="w-24 h-24 rounded-full mx-auto mb-6 border-4 border-red-600 shadow-xl object-cover"
                    />
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        Cambiar Contraseña
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Por seguridad, debes actualizar tu clave
                    </p>
                </div>

                {/* Formulario */}
                <div className="card">
                    <div className="card-body">
                        <div className="bg-blue-600 border border-blue-400 rounded-xl p-5 mb-8 shadow-lg shadow-blue-900/50">
                            <div className="flex items-start gap-4">
                                <span className="text-2xl">🛡️</span>
                                <div className="text-white">
                                    <strong className="block text-lg font-bold mb-1">Configura tu seguridad</strong>
                                    <p className="text-blue-50 text-sm font-medium leading-relaxed">
                                        Es necesario que establezcas una nueva contraseña segura para proteger tu cuenta en este primer ingreso.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-600 mb-2">
                                    Contraseña Actual
                                </label>
                                <input
                                    id="oldPassword"
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="input"
                                    placeholder="Tu contraseña temporal"
                                    required
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-600 mb-2">
                                    Nueva Contraseña
                                </label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="input"
                                    placeholder="Mínimo 9 carac., 1 mayúscula, 1 símbolo"
                                    required
                                    disabled={loading}
                                    minLength={9}
                                />

                                <div className="mt-2 text-xs text-gray-500">
                                    Requisitos: 9+ caracteres, 1 mayúscula, 1 número, 1 símbolo.
                                </div>

                                {newPassword && (
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
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-2">
                                    Confirmar Nueva Contraseña
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="input"
                                    placeholder="Repite tu nueva contraseña"
                                    required
                                    disabled={loading}
                                    minLength={9}
                                />

                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="mt-1 text-xs text-red-400">
                                        ⚠️ Las contraseñas no coinciden
                                    </p>
                                )}
                                {confirmPassword && newPassword === confirmPassword && (
                                    <p className="mt-1 text-xs text-green-400">
                                        ✓ Las contraseñas coinciden
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
                                className="btn btn-primary w-full"
                            >
                                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                            </button>
                        </form>

                        <div className="mt-6 text-center border-t border-gray-200 pt-6">
                            <p className="text-gray-500 text-sm mb-2">¿No eres tú o quieres ingresar con otra cuenta?</p>
                            <button
                                onClick={async () => {
                                    try { await authAPI.logout(); } catch (err) { console.error('Logout error', err); }
                                    window.location.href = '/login';
                                }}
                                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CambiarPassword;
