import { useAuth } from '../../context/AuthContext';

import NotificationFeed from '../../components/common/NotificationFeed';

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

            {/* Notification Feed (Main Focus) */}
            <div className="bg-gray-50/50 rounded-3xl p-4 sm:p-0">
                <NotificationFeed />
            </div>
        </div>
    );
};

export default AlumnoDashboard;

