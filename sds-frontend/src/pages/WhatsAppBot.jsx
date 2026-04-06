/**
 * @file WhatsAppBot.jsx
 * @description Panel de administración del Bot de WhatsApp.
 * Permite al admin: inicializar el bot, escanear el QR, ver el estado 
 * de la conexión, enviar mensajes de prueba y desconectar el bot.
 */
import { useState, useEffect, useRef } from 'react';
import { whatsappAPI } from '../services/api';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon,
    PaperAirplaneIcon,
    PhoneIcon,
    XCircleIcon,
    QrCodeIcon,
} from '@heroicons/react/24/outline';

const WhatsAppBot = () => {
    const [status, setStatus] = useState('disconnected');
    const [connectedInfo, setConnectedInfo] = useState(null);
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Estado para enviar mensaje de prueba
    const [testPhone, setTestPhone] = useState('');
    const [testMessage, setTestMessage] = useState('');

    // Polling interval ref
    const pollRef = useRef(null);

    // Cargar estado inicial y arrancar polling
    useEffect(() => {
        fetchStatus();
        // Polling cada 4 segundos para actualizar QR y estado
        pollRef.current = setInterval(fetchQRAndStatus, 4000);
        return () => clearInterval(pollRef.current);
    }, []);

    /**
     * Consulta el estado actual del bot
     */
    const fetchStatus = async () => {
        try {
            const res = await whatsappAPI.getStatus();
            setStatus(res.data.data.status);
            setConnectedInfo(res.data.data.connectedInfo);
        } catch (e) {
            console.error('Error fetching status:', e);
        }
    };

    /**
     * Consulta QR + estado (usado en polling)
     */
    const fetchQRAndStatus = async () => {
        try {
            const res = await whatsappAPI.getQR();
            setQrDataUrl(res.data.data.qr);
            setStatus(res.data.data.status);
            
            // Si se conectó, actualizar info
            if (res.data.data.status === 'connected') {
                const statusRes = await whatsappAPI.getStatus();
                setConnectedInfo(statusRes.data.data.connectedInfo);
            }
        } catch (e) {
            // Silencioso en polling
        }
    };

    /**
     * Inicializa el bot (genera QR)
     */
    const handleInitialize = async () => {
        setLoading(true);
        setResult(null);
        try {
            await whatsappAPI.initialize();
            setResult({ success: true, message: 'Bot inicializando... El QR aparecerá en unos segundos.' });
        } catch (e) {
            setResult({ success: false, message: e.response?.data?.message || 'Error al inicializar' });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Desconecta el bot
     */
    const handleLogout = async () => {
        if (!confirm('¿Estás seguro de desconectar el bot de WhatsApp?')) return;
        setLoading(true);
        try {
            await whatsappAPI.logout();
            setStatus('disconnected');
            setConnectedInfo(null);
            setQrDataUrl(null);
            setResult({ success: true, message: 'Bot desconectado correctamente.' });
        } catch (e) {
            setResult({ success: false, message: 'Error al desconectar' });
        } finally {
            setLoading(false);
        }
    };

    /**
     * Envía un mensaje de prueba
     */
    const handleSendTest = async (e) => {
        e.preventDefault();
        if (!testPhone || !testMessage) {
            alert('Completá el teléfono y el mensaje');
            return;
        }
        setLoading(true);
        setResult(null);
        try {
            const res = await whatsappAPI.sendMessage(testPhone, testMessage);
            setResult({ success: true, message: res.data.message });
            setTestPhone('');
            setTestMessage('');
        } catch (err) {
            setResult({ success: false, message: err.response?.data?.message || 'Error al enviar' });
        } finally {
            setLoading(false);
        }
    };

    // Mapeo de estados a colores y textos
    const statusConfig = {
        connected: { color: 'green', text: '🟢 Conectado', bg: 'bg-green-900/30 border-green-700' },
        qr_pending: { color: 'yellow', text: '🟡 Esperando escaneo de QR', bg: 'bg-yellow-900/30 border-yellow-700' },
        disconnected: { color: 'red', text: '🔴 Desconectado', bg: 'bg-red-900/30 border-red-700' },
    };

    const currentStatus = statusConfig[status] || statusConfig.disconnected;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Bot de WhatsApp</h1>
                <p className="text-gray-400 mt-1">Gestiona la conexión del bot para enviar mensajes automáticos</p>
            </div>

            {/* Resultado / Feedback */}
            {result && (
                <div className={`card ${result.success ? 'border-green-900 bg-green-900/10' : 'border-red-900 bg-red-900/10'}`}>
                    <div className="card-body">
                        <div className="flex items-center space-x-3">
                            {result.success ? (
                                <CheckCircleIcon className="h-6 w-6 text-green-500" />
                            ) : (
                                <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                            )}
                            <p className={`font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                                {result.message}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Panel de Estado + QR */}
                <div className="card lg:row-span-2">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <QrCodeIcon className="h-5 w-5" />
                            Estado del Bot
                        </h3>
                    </div>
                    <div className="card-body space-y-6">
                        {/* Indicador de Estado */}
                        <div className={`p-4 rounded-lg border ${currentStatus.bg}`}>
                            <p className="text-lg font-bold text-white">{currentStatus.text}</p>
                            {connectedInfo && (
                                <p className="text-sm text-gray-300 mt-1">
                                    Conectado como: <span className="font-semibold text-white">{connectedInfo.pushname}</span> ({connectedInfo.phone})
                                </p>
                            )}
                        </div>

                        {/* Área del QR */}
                        {status === 'qr_pending' && qrDataUrl && (
                            <div className="flex flex-col items-center space-y-4">
                                <p className="text-sm text-gray-400 text-center">
                                    Escaneá este código QR desde WhatsApp en tu celular:
                                </p>
                                <div className="bg-white p-4 rounded-xl shadow-lg">
                                    <img 
                                        src={qrDataUrl} 
                                        alt="QR Code WhatsApp" 
                                        className="w-64 h-64"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 text-center">
                                    WhatsApp → ⋮ Menú → Dispositivos vinculados → Vincular un dispositivo
                                </p>
                            </div>
                        )}

                        {status === 'qr_pending' && !qrDataUrl && (
                            <div className="flex flex-col items-center space-y-3 py-8">
                                <ArrowPathIcon className="h-10 w-10 text-yellow-500 animate-spin" />
                                <p className="text-gray-400">Generando QR...</p>
                            </div>
                        )}

                        {status === 'connected' && (
                            <div className="flex flex-col items-center space-y-3 py-8">
                                <CheckCircleIcon className="h-16 w-16 text-green-500" />
                                <p className="text-green-400 font-bold text-lg">Bot activo y funcionando</p>
                                <p className="text-sm text-gray-400">Podés enviar mensajes desde la sección de prueba.</p>
                            </div>
                        )}

                        {status === 'disconnected' && (
                            <div className="flex flex-col items-center space-y-3 py-8">
                                <XCircleIcon className="h-16 w-16 text-gray-600" />
                                <p className="text-gray-400">El bot no está activo.</p>
                                <p className="text-sm text-gray-500">Presioná "Iniciar Bot" para generar el QR.</p>
                            </div>
                        )}

                        {/* Botones de acción */}
                        <div className="flex gap-3">
                            {status === 'disconnected' && (
                                <button
                                    onClick={handleInitialize}
                                    disabled={loading}
                                    className="btn btn-primary flex-1 flex justify-center items-center gap-2"
                                >
                                    <PhoneIcon className="h-5 w-5" />
                                    {loading ? 'Iniciando...' : 'Iniciar Bot'}
                                </button>
                            )}
                            {(status === 'connected' || status === 'qr_pending') && (
                                <button
                                    onClick={handleLogout}
                                    disabled={loading}
                                    className="btn bg-red-600 hover:bg-red-700 text-white flex-1 flex justify-center items-center gap-2"
                                >
                                    <XCircleIcon className="h-5 w-5" />
                                    Desconectar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Enviar Mensaje de Prueba */}
                <div className="card">
                    <div className="card-header bg-green-900/20">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <PaperAirplaneIcon className="h-5 w-5" />
                            Enviar Mensaje de Prueba
                        </h3>
                    </div>
                    <div className="card-body">
                        {status !== 'connected' ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Conectá el bot primero para enviar mensajes.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSendTest} className="space-y-4">
                                <div>
                                    <label className="label">Teléfono (con código de país)</label>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        value={testPhone}
                                        onChange={(e) => setTestPhone(e.target.value)}
                                        placeholder="5491155804522"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Sin '+', sin espacios ni guiones. Ej: 5491155804522
                                    </p>
                                </div>
                                <div>
                                    <label className="label">Mensaje</label>
                                    <textarea
                                        rows="4"
                                        className="input w-full"
                                        value={testMessage}
                                        onChange={(e) => setTestMessage(e.target.value)}
                                        placeholder="Hola! Este es un mensaje de prueba del bot de SDS 🎉"
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary w-full flex justify-center items-center gap-2"
                                >
                                    <PaperAirplaneIcon className="h-5 w-5" />
                                    {loading ? 'Enviando...' : 'Enviar mensaje'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="card border-blue-900 bg-blue-900/10">
                    <div className="card-body">
                        <h4 className="font-semibold text-blue-400 mb-2">ℹ️ Información Importante</h4>
                        <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                            <li>Usá un número de teléfono <strong>dedicado</strong> para el bot (no tu número personal).</li>
                            <li>La sesión se guarda automáticamente. Si reiniciás el servidor, el bot se reconecta solo sin necesitar QR nuevamente.</li>
                            <li>No envíes mensajes masivos de forma abusiva para evitar que WhatsApp bloquee el número.</li>
                            <li>El formato del teléfono es: código de país + número, sin '+'. Ejemplo: <code className="bg-gray-900 px-1 rounded">5491155804522</code></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WhatsAppBot;
