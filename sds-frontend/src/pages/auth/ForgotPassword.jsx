import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import logo from '../../assets/logo-select-dance-studio.webp';

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
        <div className="min-h-screen flex items-center justify-center bg-black px-4 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-900/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-zinc-800/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-md w-full relative z-10">
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4 mx-auto transform hover:scale-105 transition-transform duration-500 -mt-16">
                        <img
                            src={logo}
                            alt="SDS Logo"
                            className="w-32 h-32 object-contain"
                        />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-2">
                        Recuperar
                    </h1>
                    <p className="text-zinc-500 font-medium tracking-wide text-sm uppercase">
                        Select Dance Studio
                    </p>
                </div>

                {/* Glass Card */}
                <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                    {/* Subtle border gradient effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <div className="relative z-10">
                        {success ? (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>

                                <h3 className="text-xl font-bold text-white tracking-widest uppercase">¡Correo Enviado!</h3>

                                <p className="text-zinc-400 text-sm leading-relaxed text-center px-4">
                                    Si el correo electrónico está registrado en nuestro sistema,
                                    recibirás instrucciones para restablecer tu contraseña.
                                </p>

                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-zinc-300">
                                    <p className="font-bold uppercase tracking-widest text-xs mb-2 text-zinc-500">Recordatorio</p>
                                    <ul className="list-disc list-inside space-y-2 text-left text-xs">
                                        <li>Revisa tu bandeja de entrada y spam</li>
                                        <li>El enlace es válido por 1 hora</li>
                                        <li>Si no lo solicitaste, ignora este mensaje</li>
                                    </ul>
                                </div>

                                <Link to="/login" className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transform active:scale-[0.98] transition-all duration-300 uppercase tracking-widest text-sm shadow-lg shadow-white/10 mt-6 inline-block text-center mt-4">
                                    VOLVER AL LOGIN
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <p className="text-zinc-400 text-sm text-center px-2 mb-6 tracking-wide">
                                    Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
                                </p>

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm text-center font-medium">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-700 focus:outline-none focus:border-white/30 focus:bg-black/80 transition-all duration-300"
                                        placeholder="tu@email.com"
                                        required
                                        disabled={loading}
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transform active:scale-[0.98] transition-all duration-300 uppercase tracking-widest text-sm shadow-lg shadow-white/10 mt-6 min-h-[56px]"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            PROCESANDO
                                        </span>
                                    ) : (
                                        'ENVIAR INSTRUCCIONES'
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-zinc-600 hover:text-white transition-colors duration-300 text-sm font-medium tracking-wide group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        VOLVER AL LOGIN
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

