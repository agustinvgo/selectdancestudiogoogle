import { useState, useEffect } from 'react';
import { notificacionesAPI } from '../../services/api';
import {
    BellIcon,
    ExclamationTriangleIcon,
    CakeIcon,
    InformationCircleIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
const API_URL = import.meta.env.VITE_API_URL;

const NotificationFeed = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await notificacionesAPI.getAll();
            if (response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id, currentStatus) => {
        if (currentStatus) return;
        try {
            await notificacionesAPI.markAsRead(id);
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, leido: 1 } : n
            ));
            window.dispatchEvent(new Event('notificationsUpdated'));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'aviso': return <ExclamationTriangleIcon className="h-6 w-6 text-white" />;
            case 'importante': return <BellIcon className="h-6 w-6 text-white" />;
            case 'cumpleanos': return <CakeIcon className="h-6 w-6 text-white" />;
            default: return <InformationCircleIcon className="h-6 w-6 text-white" />;
        }
    };

    const getIconBg = (type) => {
        switch (type) {
            case 'aviso': return 'bg-yellow-500';
            case 'importante': return 'bg-red-500';
            case 'cumpleanos': return 'bg-pink-500';
            default: return 'bg-blue-500';
        }
    };

    if (loading) {
        return <div className="space-y-4 animate-pulse">
            {[1, 2].map(i => (
                <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
            ))}
        </div>;
    }

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                    <BellIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-gray-900 font-medium">Sin novedades</h3>
                <p className="text-gray-500 text-sm mt-1">No hay comunicados recientes para mostrar.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-900">Novedades</h2>
                {notifications.some(n => !n.leido) && (
                    <button
                        onClick={async () => {
                            await notificacionesAPI.markAllAsRead();
                            loadNotifications();
                            window.dispatchEvent(new Event('notificationsUpdated'));
                        }}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Marcar todo como leído
                    </button>
                )}
            </div>

            {notifications.map(notification => (
                <article
                    key={notification.id}
                    onClick={() => !notification.leido && handleMarkAsRead(notification.id, notification.leido)}
                    className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 ${!notification.leido ? 'ring-2 ring-red-500/10 bg-red-50/10 shadow-md cursor-pointer' : ''}`}
                >
                    <div className="flex items-start gap-4">
                        {/* Avatar / Icon */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${getIconBg(notification.tipo)}`}>
                            {getIcon(notification.tipo)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    {/* Remitente */}
                                    {notification.remitente && (
                                        <div className="text-xs uppercase tracking-wide font-bold text-gray-500 mb-1">
                                            {notification.remitente}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 mb-1">
                                        {!notification.leido && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-600 animate-pulse">
                                                NUEVO
                                            </span>
                                        )}
                                        <h3 className={`text-lg font-bold leading-tight ${!notification.leido ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {notification.titulo}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">
                                        Hace {formatDistanceToNow(new Date(notification.created_at), { locale: es })}
                                    </p>
                                </div>

                                {notification.leido && (
                                    <div className="text-green-500" title="Leído">
                                        <CheckIcon className="w-5 h-5" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                                {notification.mensaje}
                            </div>

                            {/* Imagen Adjunta */}
                            {notification.imagen_url && (
                                <div className="mt-4">
                                    <img
                                        src={`${API_URL}${notification.imagen_url}`}
                                        alt="Adjunto"
                                        className="w-full h-auto rounded-lg object-cover shadow-sm max-h-96"
                                        onError={(e) => { e.target.style.display = 'none' }}
                                    />
                                </div>
                            )}

                            {/* Footer Actions */}
                            {!notification.leido && (
                                <div className="mt-4 flex justify-end pt-4 border-t border-gray-50">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMarkAsRead(notification.id, notification.leido);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full hover:bg-blue-100 transition-colors"
                                    >
                                        <CheckIcon className="w-4 h-4" />
                                        Marcar como leído
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
};

export default NotificationFeed;
