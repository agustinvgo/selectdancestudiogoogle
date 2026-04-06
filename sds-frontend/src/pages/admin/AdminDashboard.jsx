import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { alumnosAPI, pagosAPI, cursosAPI, eventosAPI, estadisticasAPI } from '../../services/api';
import Loader from '../../components/Loader';
import { useQuery } from '@tanstack/react-query';

// Widgets
import KPIStats from '../../components/Dashboard/KPIStats.jsx';
import FinancialHealthWidget from '../../components/Dashboard/FinancialHealthWidget.jsx';
import PaymentChart from '../../components/Dashboard/PaymentChart.jsx';
import AttendanceChart from '../../components/Dashboard/AttendanceChart.jsx';
import TopStudents from '../../components/Dashboard/TopStudents.jsx';
import RetentionWidget from '../../components/Dashboard/RetentionWidget.jsx';
import CourseDistributionChart from '../../components/Dashboard/CourseDistributionChart.jsx';
import GrowthChart from '../../components/Dashboard/GrowthChart.jsx';
import DemographicsChart from '../../components/Dashboard/DemographicsChart.jsx';
import AttendanceWeekChart from '../../components/Dashboard/AttendanceWeekChart.jsx';
import PopularCourses from '../../components/Dashboard/PopularCourses.jsx';
import SEO from '../../components/SEO';
import NotificationFeed from '../../components/common/NotificationFeed';

const AdminDashboard = () => {
    const { isProfesor } = useAuth();

    // --- PROFESSOR QUERIES ---
    const { data: myCoursesData, isLoading: loadingMyCourses } = useQuery({
        queryKey: ['my_courses'],
        queryFn: async () => {
            const res = await cursosAPI.getMyCourses();
            return res.data.data || [];
        },
        enabled: !!isProfesor
    });

    // --- SHARED QUERIES ---
    const { data: eventosData, isLoading: loadingEventos } = useQuery({
        queryKey: ['eventos'],
        queryFn: async () => {
            const res = await eventosAPI.getAll();
            return res.data.data || [];
        }
    });

    // --- ADMIN QUERIES ---
    const { data: alumnosData, isLoading: loadingAlumnos } = useQuery({
        queryKey: ['alumnos'],
        queryFn: async () => {
            const res = await alumnosAPI.getAll();
            return res.data.data || [];
        },
        enabled: !isProfesor
    });

    const { data: financeData, isLoading: loadingFinance } = useQuery({
        queryKey: ['finance_stats', new Date().getMonth() + 1, new Date().getFullYear()],
        queryFn: async () => {
            const res = await pagosAPI.getEstadoFinanciero(new Date().getMonth() + 1, new Date().getFullYear());
            return res.data.data || {};
        },
        enabled: !isProfesor
    });

    const { data: advancedStatsData, isLoading: loadingStats } = useQuery({
        queryKey: ['advanced_stats'],
        queryFn: async () => {
            const res = await pagosAPI.getEstadisticasAvanzadas();
            return res.data.data || {};
        },
        enabled: !isProfesor
    });

    const { data: attendanceAvgData, isLoading: loadingAttendanceAvg } = useQuery({
        queryKey: ['attendance_avg'],
        queryFn: async () => {
            const res = await estadisticasAPI.getAsistenciaPromedio();
            return res.data.data || {};
        },
        enabled: !isProfesor
    });

    const { data: topAttendanceData, isLoading: loadingTopAttendance } = useQuery({
        queryKey: ['top_attendance'],
        queryFn: async () => {
            const res = await estadisticasAPI.getMejoresAsistencias();
            return res.data.data || [];
        },
        enabled: !isProfesor
    });

    const { data: retentionData, isLoading: loadingRetention } = useQuery({
        queryKey: ['retention_rate'],
        queryFn: async () => {
            const res = await estadisticasAPI.getTasaRetencion();
            return res.data.data || {};
        },
        enabled: !isProfesor
    });

    const { data: courseDistData, isLoading: loadingCourseDist } = useQuery({
        queryKey: ['course_distribution'],
        queryFn: async () => {
            const res = await estadisticasAPI.getDistribucionPorCurso();
            return res.data.data || [];
        },
        enabled: !isProfesor
    });

    const { data: growthData, isLoading: loadingGrowth } = useQuery({
        queryKey: ['new_students_growth'],
        queryFn: async () => {
            const res = await estadisticasAPI.getNuevosAlumnosPorMes();
            return res.data.data || [];
        },
        enabled: !isProfesor
    });

    const { data: popularCoursesData, isLoading: loadingPopularCourses } = useQuery({
        queryKey: ['popular_courses'],
        queryFn: async () => {
            const res = await estadisticasAPI.getCursosPopulares();
            return res.data.data || [];
        },
        enabled: !isProfesor
    });

    const { data: demographicsData, isLoading: loadingDemographics } = useQuery({
        queryKey: ['demographics'],
        queryFn: async () => {
            const res = await estadisticasAPI.getDistribucionEdades();
            return res.data.data || [];
        },
        enabled: !isProfesor
    });

    const { data: attendanceWeekData, isLoading: loadingAttendanceWeek } = useQuery({
        queryKey: ['attendance_week'],
        queryFn: async () => {
            const res = await estadisticasAPI.getAsistenciaPorDia();
            return res.data.data || [];
        },
        enabled: !isProfesor
    });

    // --- DERIVED STATE ---

    // Proximos eventos logic
    const proximosEventos = useMemo(() => {
        const events = eventosData || [];
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Reset time to start of day to include events from today
        return events
            .filter(e => {
                const eventDate = new Date(e.fecha);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate >= hoy;
            })
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
            .slice(0, 4);
    }, [eventosData]);

    // KPI Data Construction
    const kpiData = useMemo(() => {
        if (isProfesor) {
            return {
                total_alumnos: 'N/A',
                ingresos_mes: 0,
                pagos_pendientes: 0,
                asistencia_promedio: 0,
                custom_kpis: [
                    { label: 'Mis Cursos', value: myCoursesData?.length || 0 }
                ]
            };
        } else {
            const alumnos = alumnosData || [];
            const finance = financeData || {};
            const asistencia = attendanceAvgData || {};

            return {
                total_alumnos: alumnos.filter(a => Number(a.usuario_activo) === 1).length,
                ingresos_mes: finance.total_cobrado || 0,
                pagos_pendientes: finance.total_pendiente || 0,
                asistencia_promedio: asistencia.porcentaje_asistencia || 0
            };
        }
    }, [isProfesor, myCoursesData, alumnosData, financeData, attendanceAvgData]);

    const loading = isProfesor
        ? (loadingMyCourses || loadingEventos)
        : (loadingAlumnos || loadingFinance || loadingStats || loadingAttendanceAvg || loadingEventos || loadingTopAttendance || loadingRetention || loadingCourseDist || loadingGrowth || loadingPopularCourses || loadingDemographics || loadingAttendanceWeek);

    if (loading) return <Loader />;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <SEO
                title={isProfesor ? "Panel de Profesor" : "Dashboard General"}
                description="Resumen de métricas, finanzas y asistencia de tu academia."
            />
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
                        {isProfesor ? 'Panel de Profesor' : 'Dashboard'}
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">
                        Resumen de actividad y métricas clave
                    </p>
                </div>
                <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-sm font-medium text-zinc-600 capitalize">
                        {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </div>


            {isProfesor && (
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Mis Cursos Asignados</h3>
                        <p className="text-4xl font-bold text-zinc-900">{kpiData.custom_kpis?.[0]?.value || 0}</p>
                    </div>

                    <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                        <NotificationFeed />
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            {!isProfesor && (
                <div className="space-y-6">
                    {/* Row 1: KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPIStats stats={kpiData} />
                    </div>

                    {/* Row 1.5: Financial & Retention */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1">
                            <FinancialHealthWidget />
                        </div>
                        <div className="lg:col-span-1">
                            <RetentionWidget data={retentionData} />
                        </div>
                    </div>

                    {/* Row 2: Charts (Attendance & Growth) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 min-h-[320px]">
                            <AttendanceChart data={advancedStatsData?.ingresosPorMes || []} />
                        </div>
                        <div className="min-h-[320px]">
                            <GrowthChart data={growthData} />
                        </div>
                    </div>

                    {/* Row 3: Demographics & Activity (Heatmaps) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="min-h-[320px]">
                            <DemographicsChart data={demographicsData} />
                        </div>
                        <div className="lg:col-span-2 min-h-[320px]">
                            <AttendanceWeekChart data={attendanceWeekData} />
                        </div>
                    </div>

                    {/* Row 4: Course Insights & Finance */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="min-h-[384px]">
                            <CourseDistributionChart data={courseDistData} />
                        </div>
                        <div className="min-h-[384px]">
                            <PopularCourses data={popularCoursesData} />
                        </div>
                        <div className="min-h-[384px]">
                            <PaymentChart data={advancedStatsData?.metodosPago || []} />
                        </div>
                    </div>

                    {/* Row 5: Tables & Lists */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="text-base font-semibold text-zinc-800">Próximos Eventos</h3>
                                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">Ver todos</button>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {proximosEventos.length === 0 ? (
                                            <div className="col-span-2 py-8 text-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
                                                <p className="text-gray-500 text-sm">No hay eventos próximos</p>
                                            </div>
                                        ) : (
                                            proximosEventos.map(evento => (
                                                <div key={evento.id} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-all">
                                                    <div className="w-12 h-12 bg-zinc-50 text-zinc-900 rounded-lg flex flex-col items-center justify-center border border-zinc-100">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{new Date(evento.fecha).toLocaleDateString('es-AR', { month: 'short' })}</span>
                                                        <span className="text-lg font-bold leading-none">{new Date(evento.fecha).getDate()}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-zinc-900 text-sm truncate">{evento.nombre}</h4>
                                                        <p className="text-zinc-500 text-xs truncate mt-0.5">{evento.ubicacion}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <TopStudents students={topAttendanceData} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

