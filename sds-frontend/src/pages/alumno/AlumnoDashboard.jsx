import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { pagosAPI, transmisionesAPI } from '../../services/api';
import { ArrowRightIcon, BanknotesIcon, CalendarDaysIcon, SignalIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import { formatPaymentPeriod } from '../../utils/paymentPeriod';

import NotificationFeed from '../../components/common/NotificationFeed';

const currencyFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
});

const parseLocalDate = (dateValue) => {
    if (!dateValue) return null;
    const match = String(dateValue).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDueDate = (dateValue) => {
    const date = parseLocalDate(dateValue);
    return date
        ? date.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'Sin vencimiento';
};

const PaymentSummary = ({ user }) => {
    const { data: payments = [], isLoading, isError } = useQuery({
        queryKey: ['pagos', 'mis-pagos'],
        queryFn: async () => (await pagosAPI.getMisPagos()).data.data || [],
        enabled: !!user,
        staleTime: 60 * 1000,
    });

    if (isLoading) {
        return (
            <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Cargando estado de cuenta">
                <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
                <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
            </section>
        );
    }

    if (isError) {
        return (
            <Link to="/alumno/pagos" className="mb-6 flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 p-5 text-red-800">
                <span>No pudimos cargar tu estado de cuenta. Tocá para revisarlo.</span>
                <ArrowRightIcon className="h-5 w-5" />
            </Link>
        );
    }

    const pendingPayments = payments
        .filter((payment) => !['pagado', 'anulado'].includes(payment.estado))
        .sort((a, b) => {
            const dateA = parseLocalDate(a.fecha_vencimiento)?.getTime() ?? Number.MAX_SAFE_INTEGER;
            const dateB = parseLocalDate(b.fecha_vencimiento)?.getTime() ?? Number.MAX_SAFE_INTEGER;
            return dateA - dateB;
        });

    const nextPayment = pendingPayments[0];
    const pendingBalance = pendingPayments.reduce(
        (total, payment) => total + (Number.parseFloat(payment.monto) || 0),
        0
    );
    const dueDate = parseLocalDate(nextPayment?.fecha_vencimiento);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = dueDate ? dueDate < today : false;

    return (
        <section className="mb-7" aria-labelledby="payment-summary-title">
            <div className="mb-3 flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">Finanzas</p>
                    <h2 id="payment-summary-title" className="mt-1 text-xl font-bold text-gray-900">Estado de cuenta</h2>
                </div>
                <Link to="/alumno/pagos" className="inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-950">
                    Ver mis pagos
                    <ArrowRightIcon className="h-4 w-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Link
                    to="/alumno/pagos"
                    className={`group rounded-2xl border p-5 transition-shadow hover:shadow-md ${
                        isOverdue ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
                    }`}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className={`text-sm font-semibold ${isOverdue ? 'text-red-700' : 'text-amber-700'}`}>
                                {isOverdue ? 'Monto vencido' : 'Monto a pagar'}
                            </p>
                            <p className="mt-2 text-3xl font-black tracking-tight text-gray-950">
                                {nextPayment ? currencyFormatter.format(Number(nextPayment.monto) || 0) : currencyFormatter.format(0)}
                            </p>
                        </div>
                        <div className={`rounded-xl p-3 ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                            <CalendarDaysIcon className="h-6 w-6" />
                        </div>
                    </div>
                    {nextPayment ? (
                        <div className="mt-4 text-sm text-gray-600">
                            <p className="font-semibold text-gray-800">
                                {nextPayment.concepto} · {formatPaymentPeriod(nextPayment.fecha_vencimiento)}
                            </p>
                            <p className="mt-1">{isOverdue ? 'Venció' : 'Vence'} el {formatDueDate(nextPayment.fecha_vencimiento)}</p>
                        </div>
                    ) : (
                        <p className="mt-4 text-sm font-semibold text-green-700">No tenés pagos pendientes.</p>
                    )}
                </Link>

                <Link to="/alumno/pagos" className="group rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-gray-500">Saldo pendiente</p>
                            <p className="mt-2 text-3xl font-black tracking-tight text-gray-950">
                                {currencyFormatter.format(pendingBalance)}
                            </p>
                        </div>
                        <div className="rounded-xl bg-gray-100 p-3 text-gray-600">
                            <BanknotesIcon className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                        <p className="text-gray-500">
                            {pendingPayments.length === 0
                                ? 'Cuenta al día'
                                : `${pendingPayments.length} ${pendingPayments.length === 1 ? 'pago pendiente' : 'pagos pendientes'}`}
                        </p>
                        <span className="inline-flex items-center gap-1 font-semibold text-gray-700 group-hover:text-black">
                            Ver detalle <ArrowRightIcon className="h-4 w-4" />
                        </span>
                    </div>
                </Link>
            </div>
        </section>
    );
};

// Aviso de clase en vivo — aparece solo cuando hay transmisión activa (o por comenzar)
const LiveBanner = () => {
    const { data } = useQuery({
        queryKey: ['transmision-en-vivo'],
        queryFn: async () => (await transmisionesAPI.enVivo()).data,
        refetchInterval: 15000,
        refetchOnWindowFocus: true,
    });

    if (!data || data.estado === 'offline') return null;

    // Iniciada a mano pero la cámara aún no se conectó
    if (data.estado === 'esperando') {
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
                    <p className="text-amber-700 text-sm mt-0.5">La transmisión está por comenzar. Esperando la cámara.</p>
                </div>
                <ArrowRightIcon className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
        );
    }

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

            {/* Resumen financiero familiar */}
            <PaymentSummary user={user} />

            {/* Notification Feed (Main Focus) */}
            <div className="bg-gray-50/50 rounded-3xl p-4 sm:p-0">
                <NotificationFeed />
            </div>
        </div>
    );
};

export default AlumnoDashboard;
