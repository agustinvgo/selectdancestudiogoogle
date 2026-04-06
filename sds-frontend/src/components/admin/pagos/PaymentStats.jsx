import { CheckCircleIcon, XCircleIcon, CurrencyDollarIcon, FunnelIcon } from '@heroicons/react/24/outline';

const PaymentStats = ({ resumenFinanciero }) => {
    if (!resumenFinanciero) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up">
            <div className="card bg-emerald-50 border border-emerald-100">
                <div className="card-body">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-600 mb-1">Total Cobrado</p>
                            <p className="text-3xl font-bold text-emerald-900">
                                ${resumenFinanciero.total_cobrado?.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-full">
                            <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-rose-50 border border-rose-100">
                <div className="card-body">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-rose-600 mb-1">Total Pendiente</p>
                            <p className="text-3xl font-bold text-rose-900">
                                ${resumenFinanciero.total_pendiente?.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                        <div className="p-3 bg-rose-100 rounded-full">
                            <XCircleIcon className="h-8 w-8 text-rose-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-blue-50 border border-blue-100">
                <div className="card-body">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600 mb-1">Total Esperado</p>
                            <p className="text-3xl font-bold text-blue-900">
                                ${resumenFinanciero.total_esperado?.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            </p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-full">
                            <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-violet-50 border border-violet-100">
                <div className="card-body">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-violet-600 mb-1">Tasa de Cobro</p>
                            <p className="text-3xl font-bold text-violet-900">
                                {resumenFinanciero.tasa_cobro?.toFixed(1)}%
                            </p>
                        </div>
                        <div className="p-3 bg-violet-100 rounded-full">
                            <FunnelIcon className="h-8 w-8 text-violet-600" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentStats;

