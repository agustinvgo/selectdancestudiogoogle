import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    AcademicCapIcon,
    ArrowDownTrayIcon,
    CalendarDaysIcon,
    CheckCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ClockIcon,
    EnvelopeIcon,
    MagnifyingGlassIcon,
    PhoneIcon,
    PrinterIcon,
    UserGroupIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import { agendaAPI } from '../../services/api';
import { exportAgendaSemanal } from '../../utils/exportExcel';
import { addIsoDays, formatLongDate, formatShortDate, getMonday, toLocalIsoDate } from '../../utils/agendaDates';
import useToast from '../../hooks/useToast';
import Loader from '../../components/Loader';

const STATUS_OPTIONS = [
    { value: 'programado', label: 'Programado' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'no_asistira', label: 'No asistirá' }
];

const STATUS_STYLES = {
    programado: 'bg-zinc-100 text-zinc-700 ring-zinc-200',
    confirmado: 'bg-blue-50 text-blue-700 ring-blue-200',
    no_asistira: 'bg-amber-50 text-amber-700 ring-amber-200',
    presente: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    ausente: 'bg-red-50 text-red-700 ring-red-200'
};

const STATUS_LABELS = {
    programado: 'Programado',
    confirmado: 'Confirmado',
    no_asistira: 'No asistirá',
    presente: 'Presente',
    ausente: 'Ausente'
};

const AgendaSemanal = () => {
    const today = toLocalIsoDate();
    const [searchParams] = useSearchParams();
    const initialDate = searchParams.get('fecha') || today;
    const [weekStart, setWeekStart] = useState(() => getMonday(initialDate));
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [search, setSearch] = useState('');
    const [courseFilter, setCourseFilter] = useState('todos');
    const [teacherFilter, setTeacherFilter] = useState('todos');
    const [statusFilter, setStatusFilter] = useState('todos');
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: agenda, isLoading, isError, refetch } = useQuery({
        queryKey: ['agenda-semanal', weekStart],
        queryFn: async () => {
            const response = await agendaAPI.getWeek(weekStart);
            return response.data.data;
        }
    });

    useEffect(() => {
        if (!agenda?.dias.some((day) => day.fecha === selectedDate)) {
            setSelectedDate(agenda?.semana_inicio || weekStart);
        }
    }, [agenda, selectedDate, weekStart]);

    const invalidateAgenda = () => queryClient.invalidateQueries({ queryKey: ['agenda-semanal'] });

    const statusMutation = useMutation({
        mutationFn: (payload) => agendaAPI.setStatus(payload),
        onSuccess: invalidateAgenda,
        onError: (error) => toast.error(error.response?.data?.message || 'No se pudo actualizar la confirmación')
    });

    const attendanceMutation = useMutation({
        mutationFn: (payload) => agendaAPI.setAttendance(payload),
        onSuccess: () => {
            invalidateAgenda();
            queryClient.invalidateQueries({ queryKey: ['asistencias'] });
        },
        onError: (error) => toast.error(error.response?.data?.message || 'No se pudo actualizar la asistencia')
    });

    const allClasses = useMemo(() => agenda?.dias.flatMap((day) => day.clases) || [], [agenda]);
    const courseOptions = useMemo(() => [...new Map(allClasses.map((item) => [
        `${item.tipo}:${item.curso_id || item.disponibilidad_id}`,
        {
            value: `${item.tipo}:${item.curso_id || item.disponibilidad_id}`,
            label: `${item.nombre} · ${formatShortDate(item.fecha)} ${String(item.hora_inicio || '').slice(0, 5)}`
        }
    ])).values()].sort((a, b) => a.label.localeCompare(b.label)), [allClasses]);
    const teacherOptions = useMemo(() => [...new Set(allClasses.map((item) => item.profesores).filter(Boolean))].sort(), [allClasses]);

    const filteredDays = useMemo(() => {
        const term = search.trim().toLowerCase();
        return (agenda?.dias || []).map((day) => ({
            ...day,
            clases: day.clases
                .filter((item) => courseFilter === 'todos' || `${item.tipo}:${item.curso_id || item.disponibilidad_id}` === courseFilter)
                .filter((item) => teacherFilter === 'todos' || item.profesores === teacherFilter)
                .map((item) => ({
                    ...item,
                    alumnos: item.alumnos.filter((student) => {
                        const matchesSearch = !term || `${student.nombre} ${student.apellido} ${student.telefono} ${student.email}`.toLowerCase().includes(term);
                        const matchesStatus = statusFilter === 'todos' || student.estado === statusFilter;
                        return matchesSearch && matchesStatus;
                    })
                }))
                .filter((item) => !term && statusFilter === 'todos' ? true : item.alumnos.length > 0)
        }));
    }, [agenda, search, courseFilter, teacherFilter, statusFilter]);

    const selectedDay = filteredDays.find((day) => day.fecha === selectedDate) || filteredDays[0];

    const changeWeek = (days) => {
        const nextStart = addIsoDays(weekStart, days);
        setWeekStart(nextStart);
        setSelectedDate(nextStart);
    };

    const goToday = () => {
        setWeekStart(getMonday(today));
        setSelectedDate(today);
    };

    const setStudentStatus = (item, student, estado) => {
        if (item.tipo !== 'regular') return;
        statusMutation.mutate({
            alumno_id: student.alumno_id,
            curso_id: item.curso_id,
            fecha: item.fecha,
            estado
        });
    };

    const setStudentAttendance = (item, student, presente) => {
        attendanceMutation.mutate(item.tipo === 'prueba'
            ? { tipo: 'prueba', clase_prueba_id: student.clase_prueba_id, presente }
            : {
                tipo: 'regular',
                alumno_id: student.alumno_id,
                curso_id: item.curso_id,
                fecha: item.fecha,
                presente
            });
    };

    const renderStudent = (item, student) => {
        const phoneDigits = String(student.telefono || '').replace(/\D/g, '');
        const attendanceRecorded = student.estado === 'presente' || student.estado === 'ausente';

        return (
            <div key={`${student.tipo}:${student.alumno_id || student.clase_prueba_id}`} className="p-3 sm:p-4 border border-gray-100 rounded-xl bg-white">
                <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-zinc-900 truncate">{student.nombre} {student.apellido}</p>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${STATUS_STYLES[student.estado] || STATUS_STYLES.programado}`}>
                                {STATUS_LABELS[student.estado] || student.estado}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500">
                            {student.telefono && <span className="truncate">{student.telefono}</span>}
                            {student.email && <span className="truncate hidden sm:inline">{student.email}</span>}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 print:hidden">
                        {item.tipo === 'regular' && (
                            <select
                                value={attendanceRecorded ? 'programado' : student.estado}
                                onChange={(event) => setStudentStatus(item, student, event.target.value)}
                                disabled={statusMutation.isPending || attendanceRecorded}
                                className="h-9 rounded-lg border border-gray-200 bg-white px-2 text-xs text-zinc-700 disabled:opacity-50"
                                title={attendanceRecorded ? 'La asistencia ya fue registrada' : 'Confirmación semanal'}
                            >
                                {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                        )}

                        {phoneDigits && (
                            <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg border border-gray-200 text-zinc-500 hover:text-green-700 hover:border-green-200" title="Abrir WhatsApp">
                                <PhoneIcon className="h-4 w-4" />
                            </a>
                        )}
                        {student.email && (
                            <a href={`mailto:${student.email}`} className="p-2 rounded-lg border border-gray-200 text-zinc-500 hover:text-blue-700 hover:border-blue-200" title="Enviar email">
                                <EnvelopeIcon className="h-4 w-4" />
                            </a>
                        )}

                        <button
                            onClick={() => setStudentAttendance(item, student, true)}
                            disabled={attendanceMutation.isPending}
                            className={`inline-flex items-center gap-1 h-9 px-2.5 rounded-lg border text-xs font-semibold ${student.estado === 'presente' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-200 text-zinc-600 hover:border-emerald-300 hover:text-emerald-700'}`}
                        >
                            <CheckCircleIcon className="h-4 w-4" /> Presente
                        </button>
                        <button
                            onClick={() => setStudentAttendance(item, student, false)}
                            disabled={attendanceMutation.isPending}
                            className={`inline-flex items-center gap-1 h-9 px-2.5 rounded-lg border text-xs font-semibold ${student.estado === 'ausente' ? 'bg-red-600 border-red-600 text-white' : 'border-gray-200 text-zinc-600 hover:border-red-300 hover:text-red-700'}`}
                        >
                            <XCircleIcon className="h-4 w-4" /> Ausente
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderClass = (item) => (
        <article key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden break-inside-avoid">
            <header className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-zinc-900 text-lg">{item.nombre}</h3>
                            {item.tipo === 'prueba' && <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 ring-1 ring-purple-200">CLASE DE PRUEBA</span>}
                        </div>
                        <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1.5"><AcademicCapIcon className="h-4 w-4" />{item.profesores}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="inline-flex items-center gap-1.5 text-zinc-600"><ClockIcon className="h-4 w-4" />{String(item.hora_inicio || '').slice(0, 5)}{item.hora_fin ? ` – ${String(item.hora_fin).slice(0, 5)}` : ''}</span>
                        <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-800"><UserGroupIcon className="h-4 w-4" />{item.alumnos.length}</span>
                    </div>
                </div>
            </header>
            <div className="p-3 sm:p-4 space-y-2 bg-zinc-50/30">
                {item.alumnos.length === 0
                    ? <p className="text-sm text-zinc-400 text-center py-5 border border-dashed border-gray-200 rounded-xl">Sin alumnos programados</p>
                    : item.alumnos.map((student) => renderStudent(item, student))}
            </div>
        </article>
    );

    if (isLoading) return <Loader />;

    return (
        <div className="space-y-6 pb-12 print:p-0 print:space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 print:hidden">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Agenda semanal</h1>
                    <p className="text-zinc-500 mt-1">Alumnos programados, confirmaciones y asistencia de cada clase.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={goToday} className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-zinc-700 hover:border-gray-300">Hoy</button>
                    <button onClick={() => exportAgendaSemanal(filteredDays, weekStart)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-zinc-700 hover:border-gray-300"><ArrowDownTrayIcon className="h-4 w-4" />Exportar</button>
                    <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-black"><PrinterIcon className="h-4 w-4" />Imprimir</button>
                </div>
            </div>

            {isError ? (
                <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center">
                    <p className="text-red-700 font-semibold">No se pudo cargar la agenda.</p>
                    <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Reintentar</button>
                </div>
            ) : (
                <>
                    <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden print:border-0">
                        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100 print:justify-center">
                            <button onClick={() => changeWeek(-7)} className="p-2 rounded-lg hover:bg-gray-100 print:hidden" aria-label="Semana anterior"><ChevronLeftIcon className="h-5 w-5" /></button>
                            <div className="text-center">
                                <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold">Semana</p>
                                <p className="font-bold text-zinc-900">{formatShortDate(agenda.semana_inicio)} – {formatShortDate(agenda.semana_fin)}</p>
                            </div>
                            <button onClick={() => changeWeek(7)} className="p-2 rounded-lg hover:bg-gray-100 print:hidden" aria-label="Semana siguiente"><ChevronRightIcon className="h-5 w-5" /></button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                            {[
                                ['Hoy', agenda.resumen.hoy],
                                ['Visitas', agenda.resumen.visitas_programadas],
                                ['Alumnos', agenda.resumen.alumnos_unicos],
                                ['Confirmados', agenda.resumen.confirmados],
                                ['No asistirán', agenda.resumen.no_asistiran],
                                ['Presentes', agenda.resumen.presentes]
                            ].map(([label, value]) => (
                                <div key={label} className="px-4 py-3 border-r border-b sm:border-b-0 border-gray-100 last:border-r-0">
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">{label}</p>
                                    <p className="text-2xl font-black text-zinc-900">{value}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 print:hidden">
                        <div className="relative md:col-span-2 xl:col-span-1">
                            <MagnifyingGlassIcon className="h-5 w-5 text-zinc-400 absolute left-3 top-2.5" />
                            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar alumno, teléfono o email" className="w-full h-10 pl-10 pr-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200" />
                        </div>
                        <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm">
                            <option value="todos">Todos los cursos</option>
                            {courseOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                        <select value={teacherFilter} onChange={(event) => setTeacherFilter(event.target.value)} className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm">
                            <option value="todos">Todos los profesores</option>
                            {teacherOptions.map((teacher) => <option key={teacher} value={teacher}>{teacher}</option>)}
                        </select>
                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 px-3 rounded-xl border border-gray-200 bg-white text-sm">
                            <option value="todos">Todos los estados</option>
                            {[...STATUS_OPTIONS, { value: 'presente', label: 'Presente' }, { value: 'ausente', label: 'Ausente' }]
                                .map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                        </select>
                    </section>

                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 print:hidden">
                        {filteredDays.map((day) => {
                            const count = day.clases.reduce((total, item) => total + item.alumnos.length, 0);
                            const active = day.fecha === selectedDay?.fecha;
                            return (
                                <button key={day.fecha} onClick={() => setSelectedDate(day.fecha)} className={`p-2.5 rounded-xl border text-center transition-colors ${active ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-gray-200 hover:border-gray-300'}`}>
                                    <span className="block text-[11px] font-bold uppercase truncate">{day.dia.slice(0, 3)}</span>
                                    <span className="block text-sm font-semibold mt-0.5">{new Date(`${day.fecha}T12:00:00`).getDate()}</span>
                                    <span className={`inline-flex mt-1 min-w-5 h-5 items-center justify-center rounded-full text-[10px] px-1 ${active ? 'bg-white/15' : 'bg-zinc-100'}`}>{count}</span>
                                </button>
                            );
                        })}
                    </div>

                    <section className="print:hidden">
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarDaysIcon className="h-5 w-5 text-zinc-500" />
                            <h2 className="text-xl font-bold text-zinc-900 capitalize">{selectedDay ? formatLongDate(selectedDay.fecha) : ''}</h2>
                        </div>
                        <div className="space-y-4">
                            {selectedDay?.clases.length
                                ? selectedDay.clases.map(renderClass)
                                : <div className="p-12 bg-white border border-dashed border-gray-200 rounded-2xl text-center text-zinc-400">No hay clases ni alumnos con estos filtros.</div>}
                        </div>
                    </section>

                    <section className="hidden print:block space-y-6">
                        <h1 className="text-2xl font-bold">Agenda semanal</h1>
                        {filteredDays.filter((day) => day.clases.length > 0).map((day) => (
                            <div key={day.fecha} className="space-y-3">
                                <h2 className="text-lg font-bold capitalize border-b pb-1">{formatLongDate(day.fecha)}</h2>
                                {day.clases.map(renderClass)}
                            </div>
                        ))}
                    </section>
                </>
            )}
        </div>
    );
};

export default AgendaSemanal;
