import { useState, useEffect } from 'react';
import { estadisticasAPI } from '../../services/api';
import { CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

const FinancialHealthWidget = () => {
    const [data, setData] = useState({ ingresos: 0, gastos: 0, balance: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const mes = new Date().getMonth() + 1;
                const anio = new Date().getFullYear();
                const response = await estadisticasAPI.getBalanceFinanciero(mes, anio);
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching financial balance:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="card h-full animate-pulse bg-white"></div>;

    const isPositive = data.balance >= 0;

    return (
        <div className="card bg-white border border-gray-200 shadow-sm h-full overflow-hidden relative">
            <div className="card-body p-6">
                <div className="mb-6">
                    <div className="min-w-0 w-full flex justify-between items-start">
                        <div>
                            <h3 className="text-zinc-500 text-xs font-semibold uppercase tracking-wider truncate mb-1">Salud Financiera</h3>
                            <p className="text-3xl font-bold text-zinc-900 mt-1" title={`$${data.balance.toLocaleString('es-AR')}`}>
                                ${data.balance.toLocaleString('es-AR')}
                            </p>
                        </div>
                        <div className={`p-2 rounded-lg border ${isPositive ? 'bg-white border-green-100 text-green-600' : 'bg-white border-red-100 text-red-600'}`}>
                            {isPositive ? (
                                <ArrowTrendingUpIcon className="w-5 h-5" />
                            ) : (
                                <ArrowTrendingDownIcon className="w-5 h-5" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-dashed border-gray-100">
                    <div className="flex justify-between items-center group p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            <span className="text-xs font-medium text-zinc-500 uppercase">Ingresos</span>
                        </div>
                        <span className="text-sm font-semibold text-zinc-900">
                            ${data.ingresos.toLocaleString('es-AR')}
                        </span>
                    </div>
                    <div className="flex justify-between items-center group p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            <span className="text-xs font-medium text-zinc-500 uppercase">Gastos</span>
                        </div>
                        <span className="text-sm font-semibold text-zinc-900">
                            ${data.gastos.toLocaleString('es-AR')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinancialHealthWidget;

