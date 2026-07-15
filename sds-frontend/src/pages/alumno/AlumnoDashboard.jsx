import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { transmisionesAPI } from '../../services/api';
import { VideoCameraIcon, SignalIcon, ArrowRightIcon } from '@heroicons/react/24/solid';

import NotificationFeed from '../../components/common/NotificationFeed';

// Aviso de clase en vivo — aparece solo cuando hay transmisión activa (o por comenzar)
const LiveBanner = () => {
    const { data } = useQuery({
        queryKey: ['transmision-en-vivo'],
        queryFn: async () => (await transmisionesAPI.enVivo()).data,
        refetchInterval: 15000,
        refetchOnWindowFocus: true,
    });

    if (!data || data.estado === 'offline') return null;

    if (data.estado === 'en_vivo') {
        return (
            <Link
                to="/alumno/en-vivo"
                className="group flex items-center gap-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl p-5 mb-6 shadow-lg shadow-red-600/25 transition-colors"
            >
                <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <VideoCameraIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            En vivo
                        </span>
                        <span className="font-bold truncate">{data.curso?.nombre}</span>
                    </div>
                    <p className="text-red-50 text-sm mt-0.5">La clase está transmitiéndose ahora. Tocá para verla.</p>
                </div>
                <ArrowRightIcon className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
        );
    }

    // esperando: la clase está en horario pero la cámara todavía no arrancó
    return (
        <Link
            to="/alumno/en-vivo"
            className="group flex items-center gap-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 rounded-2xl p-5 mb-6 transition-colors"
        >
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <SignalIcon className="w-6 h-6 text-amber-500 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
                <span className="font-bold truncate">{data.curso?.nombre} · por comenzar</span>
                <p className="text-amber-700 text-sm mt-0.5">La clase está en horario. En breve vas a poder verla en vivo.</p>
            </div>
            <ArrowRightIcon className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>
    );
};

const AlumnoDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto pb-12 animate-fade-in">
            {/* Header */}
            <div className="mb-8 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Hola, {user?.alumno?.nombre} 👋
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                    Bienvenido a tu panel de comunicación.
                </p>
            </div>

            {/* Aviso de clase en vivo */}
            <LiveBanner />

            {/* Notification Feed (Main Focus) */}
            <div className="bg-gray-50/50 rounded-3xl p-4 sm:p-0">
                <NotificationFeed />
            </div>
        </div>
    );
};

export default AlumnoDashboard;
