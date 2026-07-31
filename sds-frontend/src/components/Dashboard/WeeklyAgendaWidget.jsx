import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarDaysIcon, ChevronRightIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { agendaAPI } from '../../services/api';
import { getMonday, toLocalIsoDate } from '../../utils/agendaDates';

const WeeklyAgendaWidget = () => {
    const today = toLocalIsoDate();
    const weekStart = getMonday(today);
    const { data, isLoading, isError } = useQuery({
        queryKey: ['agenda-semanal', weekStart],
        queryFn: async () => {
            const response = await agendaAPI.getWeek(weekStart);
            return response.data.data;
        },
        staleTime: 60 * 1000
    });

    if (isLoading) {
        return <div className="h-48 bg-white border border-gray-200 rounded-2xl animate-pulse" />;
    }
    if (isError || !data) return null;

    const todayIndex = data.dias.findIndex((day) => day.fecha === today);
    const upcomingDay = data.dias.find((day, index) => index >= Math.max(todayIndex, 0) && day.clases.length > 0)
        || data.dias.find((day) => day.clases.length > 0);
    const visibleClasses = upcomingDay?.clases.slice(0, 3) || [];

    return (
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <CalendarDaysIcon className="h-5 w-5 text-zinc-700" />
                        <h2 className="font-bold text-zinc-900">Agenda de esta semana</h2>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                        {data.resumen.visitas_programadas} visitas programadas · {data.resumen.clases} clases
                    </p>
                </div>
                <Link to="/admin/agenda" className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-700 hover:text-black">
                    Ver agenda completa <ChevronRightIcon className="h-4 w-4" />
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-gray-100">
                {[
                    ['Hoy', data.resumen.hoy],
                    ['Confirmados', data.resumen.confirmados],
                    ['No asistirán', data.resumen.no_asistiran],
                    ['Alumnos únicos', data.resumen.alumnos_unicos]
                ].map(([label, value]) => (
                    <div key={label} className="px-4 py-3 border-r last:border-r-0 border-gray-100">
                        <p className="text-[11px] uppercase tracking-wide text-zinc-400 font-semibold">{label}</p>
                        <p className="text-xl font-black text-zinc-900 mt-0.5">{value}</p>
                    </div>
                ))}
            </div>

            <div className="p-4">
                {!upcomingDay ? (
                    <p className="text-sm text-zinc-500 text-center py-4">No hay clases programadas esta semana.</p>
                ) : (
                    <>
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                            {upcomingDay.fecha === today ? 'Clases de hoy' : `Próximo: ${upcomingDay.dia}`}
                        </p>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            {visibleClasses.map((item) => (
                                <Link key={item.id} to={`/admin/agenda?fecha=${item.fecha}`} className="p-3 rounded-xl border border-gray-100 bg-gray-50 hover:border-gray-300 transition-colors">
                                    <p className="font-semibold text-sm text-zinc-900 truncate">{item.nombre}</p>
                                    <div className="flex items-center justify-between text-xs text-zinc-500 mt-2">
                                        <span className="inline-flex items-center gap-1"><ClockIcon className="h-4 w-4" />{String(item.hora_inicio || '').slice(0, 5)}</span>
                                        <span className="inline-flex items-center gap-1"><UserGroupIcon className="h-4 w-4" />{item.alumnos.length}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export default WeeklyAgendaWidget;
