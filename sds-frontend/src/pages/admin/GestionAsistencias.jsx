import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { asistenciasAPI, cursosAPI } from '../../services/api';
import { CheckCircleIcon, XCircleIcon, CalendarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';
import { exportAsistencias } from '../../utils/exportExcel';
import useToast from '../../hooks/useToast';
import Button from '../../components/Button';

const GestionAsistencias = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    // Estado local para filtros y edición
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
        const now = new Date();
        const offset = now.getTimezoneOffset();
        const localDate = new Date(now.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    });
    // 'alumnos' es el estado local editable. Se sincroniza con la query cuando cambian los filtros.
    const [alumnos, setAlumnos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // --- Queries ---

    // 1. Obtener Cursos
    const { data: cursosData, isLoading: loadingCursos } = useQuery({
        queryKey: ['cursos'],
        queryFn: async () => {
            const response = await cursosAPI.getAll();
            return response.data.data || [];
        }
    });

    const cursos = cursosData || [];

    // 2. Obtener Asistencias (depende de curso y fecha)
    const { data: asistenciasData, isLoading: loadingAsistencias } = useQuery({
        queryKey: ['asistencias', cursoSeleccionado, fechaSeleccionada],
        queryFn: async () => {
            if (!cursoSeleccionado || !fechaSeleccionada) return [];
            const response = await asistenciasAPI.getByCurso(cursoSeleccionado, fechaSeleccionada);
            return response.data.data || [];
        },
        enabled: !!cursoSeleccionado && !!fechaSeleccionada,
    });

    // --- Sincronización ---
    // Cuando llegan nuevos datos de asistencias (por cambio de filtros), actualizamos el estado local editable
    useEffect(() => {
        if (asistenciasData) {
            setAlumnos(asistenciasData);
        } else {
            setAlumnos([]);
        }
    }, [asistenciasData]);

    // --- Mutations ---
    const guardarMutation = useMutation({
        mutationFn: (asistenciasPayload) => asistenciasAPI.marcarAsistenciasMasivas({ asistencias: asistenciasPayload }),
        onSuccess: () => {
            queryClient.invalidateQueries(['asistencias', cursoSeleccionado, fechaSeleccionada]);
            // También invalidamos estadísticas de asistencia dashboard si quisiéramos ser muy estrictos
            queryClient.invalidateQueries(['attendance_week']);
            toast.success(`Asistencias del ${new Date(fechaSeleccionada + 'T00:00:00').toLocaleDateString('es-AR')} guardadas exitosamente`);
        },
        onError: (error) => {
            console.error('Error guardando asistencias:', error);
            toast.error('Error al guardar asistencias');
        }
    });

    // Helper para obtener día de la semana
    const getDiaSemana = (fechaStr) => {
        const parts = fechaStr.split('-');
        const localDate = new Date(parts[0], parts[1] - 1, parts[2]);
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return dias[localDate.getDay()];
    };

    // Cursos filtrados por el día de la fecha seleccionada
    const cursosFiltrados = cursos.filter(curso => {
        const diaCurso = (curso.horario_dia || '').toLowerCase().trim();
        const diaFecha = (getDiaSemana(fechaSeleccionada) || '').toLowerCase().trim();
        return diaCurso === diaFecha;
    });

    // Efecto para autoseleccionar curso cuando cambia el filtro
    useEffect(() => {
        if (cursosFiltrados.length > 0) {
            const cursoEnLista = cursosFiltrados.find(c => c.id == cursoSeleccionado);
            if (!cursoEnLista) {
                setCursoSeleccionado(cursosFiltrados[0].id);
            }
        } else {
            setCursoSeleccionado('');
        }
    }, [fechaSeleccionada, cursos]);

    const toggleAsistencia = (alumnoId) => {
        setAlumnos(prev => prev.map(alumno =>
            alumno.alumno_id === alumnoId
                ? { ...alumno, presente: !alumno.presente }
                : alumno
        ));
    };

    const handleGuardar = () => {
        const asistenciasPayload = alumnos.map(alumno => ({
            alumno_id: alumno.alumno_id,
            curso_id: cursoSeleccionado,
            fecha: fechaSeleccionada,
            presente: alumno.presente || false,
            observaciones: alumno.observaciones || null
        }));
        guardarMutation.mutate(asistenciasPayload);
    };

    const loading = loadingCursos || (loadingAsistencias && alumnos.length === 0);

    if (loading && cursos.length === 0) return <Loader />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Asistencias</h1>
                <p className="text-gray-500 mt-1">Registra la asistencia de alumnos por curso y fecha</p>
            </div>

            {/* Filtros */}
            <div className="card">
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                Fecha ({getDiaSemana(fechaSeleccionada)})
                            </label>
                            <input
                                type="date"
                                value={fechaSeleccionada}
                                onChange={(e) => setFechaSeleccionada(e.target.value)}
                                className="input w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">
                                <CalendarIcon className="h-4 w-4 inline mr-2" />
                                Curso
                            </label>
                            {cursosFiltrados.length > 0 ? (
                                <select
                                    value={cursoSeleccionado}
                                    onChange={(e) => setCursoSeleccionado(e.target.value)}
                                    className="input w-full"
                                >
                                    {cursosFiltrados.map((curso) => (
                                        <option key={curso.id} value={curso.id}>
                                            {curso.nombre} - {curso.horario_hora} ({curso.nivel})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <div className="p-2 text-gray-500 italic bg-white rounded border border-gray-200">
                                    No hay cursos este día
                                </div>
                            )}
                        </div>

                        <div className="flex items-end gap-3">
                            <button
                                onClick={() => exportAsistencias(alumnos, `asistencias_${fechaSeleccionada}`)}
                                disabled={alumnos.length === 0}
                                className="btn btn-secondary"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5 inline mr-2" />
                                Exportar
                            </button>
                            <Button
                                onClick={handleGuardar}
                                loading={guardarMutation.isPending}
                                disabled={alumnos.length === 0 || guardarMutation.isPending}
                                className="flex-1"
                            >
                                Guardar Asistencias
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de alumnos */}
            <div className="card">
                <div className="card-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Lista de Asistencia
                    </h3>
                    {alumnos.length > 0 && (
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Buscar alumno..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none w-full text-sm"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className="card-body">
                    {loadingAsistencias ? (
                        <div className="text-center py-8">
                            <Loader />
                        </div>
                    ) : alumnos.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                            No hay alumnos inscritos en este curso
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {alumnos.filter(a =>
                                `${a.alumno_nombre} ${a.alumno_apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (a.alumno_email && a.alumno_email.toLowerCase().includes(searchTerm.toLowerCase()))
                            ).map((alumno) => (
                                <div
                                    key={alumno.alumno_id}
                                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className="flex-1">
                                            <h4 className="text-gray-900 font-medium">
                                                {alumno.alumno_nombre} {alumno.alumno_apellido}
                                            </h4>
                                            <p className="text-sm text-gray-500">{alumno.alumno_email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => toggleAsistencia(alumno.alumno_id)}
                                            className={`flex items-center space-x-2 px-3 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-all text-sm md:text-base ${alumno.presente
                                                ? 'bg-green-600 hover:bg-green-700 text-gray-900'
                                                : 'bg-red-600 hover:bg-red-700 text-gray-900'
                                                }`}
                                        >
                                            {alumno.presente ? (
                                                <>
                                                    <CheckCircleIcon className="h-5 w-5" />
                                                    <span>Presente</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircleIcon className="h-5 w-5" />
                                                    <span>Ausente</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Resumen */}
            {alumnos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card">
                        <div className="card-body">
                            <p className="text-sm text-gray-500">Total de Alumnos</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {alumnos.length}
                            </p>
                        </div>
                    </div>

                    <div className="card border-green-900">
                        <div className="card-body">
                            <p className="text-sm text-gray-500">Presentes</p>
                            <p className="text-3xl font-bold text-green-500 mt-2">
                                {alumnos.filter(a => a.presente).length}
                            </p>
                        </div>
                    </div>

                    <div className="card border-red-900">
                        <div className="card-body">
                            <p className="text-sm text-gray-500">Ausentes</p>
                            <p className="text-3xl font-bold text-red-500 mt-2">
                                {alumnos.filter(a => !a.presente).length}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionAsistencias;

