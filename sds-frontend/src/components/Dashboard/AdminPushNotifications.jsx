import { useEffect, useState } from 'react';
import { BellRing, CheckCircle2, Loader2, Send, Smartphone, TriangleAlert } from 'lucide-react';
import { pushAPI } from '../../services/api';
import {
    createPushSubscription,
    getCurrentPushSubscription,
    supportsWebPush
} from '../../utils/pushNotifications';

const getErrorMessage = (error, fallback) => error.response?.data?.message || error.message || fallback;

const AdminPushNotifications = () => {
    const supported = supportsWebPush();
    const [loading, setLoading] = useState(true);
    const [working, setWorking] = useState(false);
    const [deviceActive, setDeviceActive] = useState(false);
    const [devices, setDevices] = useState(0);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        const loadStatus = async () => {
            if (!supported) {
                setLoading(false);
                return;
            }
            try {
                const subscription = await getCurrentPushSubscription();
                const statusResponse = await pushAPI.getStatus(subscription?.endpoint);
                if (!mounted) return;
                setDevices(Number(statusResponse.data?.data?.devices || 0));
                setDeviceActive(Boolean(subscription && statusResponse.data?.data?.currentDevice));
            } catch (loadError) {
                if (mounted) setError(getErrorMessage(loadError, 'No se pudo consultar el estado.'));
            } finally {
                if (mounted) setLoading(false);
            }
        };
        loadStatus();
        return () => { mounted = false; };
    }, [supported]);

    const activate = async () => {
        setWorking(true);
        setError('');
        setMessage('');
        try {
            const permission = Notification.permission === 'granted'
                ? 'granted'
                : await Notification.requestPermission();
            if (permission !== 'granted') {
                throw new Error('Debes permitir las notificaciones en el navegador.');
            }

            const keyResponse = await pushAPI.getPublicKey();
            const subscription = await createPushSubscription(keyResponse.data.data.publicKey);
            await pushAPI.subscribe(subscription.toJSON());
            const statusResponse = await pushAPI.getStatus(subscription.endpoint);
            setDeviceActive(true);
            setDevices(Number(statusResponse.data?.data?.devices || 1));
            setMessage('Este dispositivo recibirá los avisos de clases.');
        } catch (activationError) {
            setError(getErrorMessage(activationError, 'No se pudieron activar las notificaciones.'));
        } finally {
            setWorking(false);
        }
    };

    const deactivate = async () => {
        setWorking(true);
        setError('');
        setMessage('');
        try {
            const subscription = await getCurrentPushSubscription();
            if (subscription) {
                await pushAPI.unsubscribe(subscription.endpoint);
                await subscription.unsubscribe();
            }
            const statusResponse = await pushAPI.getStatus();
            setDeviceActive(false);
            setDevices(Number(statusResponse.data?.data?.devices || 0));
            setMessage('Notificaciones desactivadas en este dispositivo.');
        } catch (deactivationError) {
            setError(getErrorMessage(deactivationError, 'No se pudieron desactivar las notificaciones.'));
        } finally {
            setWorking(false);
        }
    };

    const sendTest = async () => {
        setWorking(true);
        setError('');
        setMessage('');
        try {
            await pushAPI.test();
            setMessage('Prueba enviada. Revisa las notificaciones del dispositivo.');
        } catch (testError) {
            setError(getErrorMessage(testError, 'No se pudo enviar la prueba.'));
        } finally {
            setWorking(false);
        }
    };

    return (
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                    <div className="rounded-xl bg-red-50 p-3 text-red-600">
                        <BellRing className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="font-bold text-zinc-900">Avisos de clases en el celular</h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            Solo administradores reciben un aviso 5 minutos antes de cada clase.
                        </p>
                        {!loading && supported && (
                            <p className="mt-2 flex items-center gap-2 text-xs font-medium text-zinc-600">
                                {deviceActive
                                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    : <Smartphone className="h-4 w-4 text-zinc-400" />}
                                {deviceActive ? 'Activo en este dispositivo' : 'Inactivo en este dispositivo'}
                                {devices > 0 && ` · ${devices} dispositivo${devices === 1 ? '' : 's'} activo${devices === 1 ? '' : 's'}`}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                    ) : supported ? (
                        <>
                            <button
                                type="button"
                                onClick={deviceActive ? deactivate : activate}
                                disabled={working}
                                className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:opacity-50"
                            >
                                {working ? 'Procesando…' : deviceActive ? 'Desactivar aquí' : 'Activar en este celular'}
                            </button>
                            {deviceActive && (
                                <button
                                    type="button"
                                    onClick={sendTest}
                                    disabled={working}
                                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4" /> Probar
                                </button>
                            )}
                        </>
                    ) : null}
                </div>
            </div>

            {!supported && (
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    Este navegador no admite notificaciones web. En iPhone, instala la web en la pantalla de inicio y ábrela desde allí.
                </p>
            )}
            {message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
            {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </section>
    );
};

export default AdminPushNotifications;
