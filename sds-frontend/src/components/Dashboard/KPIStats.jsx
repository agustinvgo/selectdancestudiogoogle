import {
    UserGroupIcon,
    CurrencyDollarIcon,
    ClipboardDocumentCheckIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';

const KPIStats = ({ stats }) => {
    const kpis = [
        {
            title: 'Alumnos Activos',
            value: stats.total_alumnos || 0,
            icon: UserGroupIcon,
            color: 'text-zinc-500',
            bg: 'bg-zinc-50 border border-zinc-200',
            trend: 'Total registrado'
        },
        {
            title: 'Ingresos Mensuales',
            value: `$${(stats.ingresos_mes || 0).toLocaleString('es-AR')}`,
            icon: CurrencyDollarIcon,
            color: 'text-zinc-500',
            bg: 'bg-zinc-50 border border-zinc-200',
            trend: 'Facturado este mes'
        },
        {
            title: 'Pagos Pendientes',
            value: `$${(stats.pagos_pendientes || 0).toLocaleString('es-AR')}`,
            icon: ClipboardDocumentCheckIcon,
            color: 'text-orange-500',
            bg: 'bg-orange-50 border border-orange-100', // Keep slight alert color for important action items
            trend: 'Requiere atención'
        },
        {
            title: 'Asistencia Promedio',
            value: `${stats.asistencia_promedio || 0}%`,
            icon: ChartBarIcon,
            color: 'text-zinc-500',
            bg: 'bg-zinc-50 border border-zinc-200',
            trend: 'Últimos 30 días'
        }
    ];

    return (
        <>
            {kpis.map((kpi, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-300">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-zinc-500 mb-1">{kpi.title}</p>
                            <p className="text-3xl font-bold text-zinc-900 tracking-tight">{kpi.value}</p>
                        </div>
                        <div className={`p-2.5 rounded-lg ${kpi.bg}`}>
                            <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};

export default KPIStats;

