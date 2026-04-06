import { UserGroupIcon, UserMinusIcon } from '@heroicons/react/24/outline';

const RetentionWidget = ({ data }) => {
    // data: { tasa_retencion: 85.5, total_alumnos: 100, alumnos_activos: 85, alumnos_inactivos: 15 }

    if (!data) return null;

    const rate = parseFloat(data.tasa_retencion || 0);
    const color = rate >= 80 ? 'text-green-400' : rate >= 60 ? 'text-yellow-400' : 'text-red-400';
    const bg = rate >= 80 ? 'bg-green-500/10' : rate >= 60 ? 'bg-yellow-500/10' : 'bg-red-500/10';

    return (
        <div className="card h-full">
            <div className="card-body">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Tasa de Retención</p>
                        <h3 className={`text-3xl font-bold mt-1 ${color}`}>{rate}%</h3>
                    </div>
                    <div className={`p-3 rounded-lg ${bg}`}>
                        <UserGroupIcon className={`w-6 h-6 ${color}`} />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${rate >= 80 ? 'bg-green-500' : rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(rate, 100)}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Activos: {data.alumnos_activos || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Inactivos: {data.alumnos_inactivos || 0}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RetentionWidget;

