import { useState, useEffect } from 'react';
import { asistenciasAPI, cursosAPI } from '../services/api';
import { CheckCircleIcon, XCircleIcon, CalendarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Loader from '../components/Loader';
import { exportAsistencias } from '../utils/exportExcel';

const GestionAsistencias = () => {
    const [cursos, setCursos] = useState([]);
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        cargarCursos();
    }, []);

    useEffect(() => {
        if (cursoSeleccionado && fechaSeleccionada) {
            cargarAsistencias();
        }
    }, [cursoSeleccionado, fechaSeleccionada]);

    const cargarCursos = async () => {
        try {
            const response = await cursosAPI.getAll();
            setCursos(response.data.data || []);
            if (response.data.data && response.data.data.length > 0) {
                setCursoSeleccionado(response.data.data[0].id);
            }
        } catch (error) {
            console.error('Error cargando cursos:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarAsistencias = async () => {
        try {
            setLoading(true);
            const response = await asistenciasAPI.getByCurso(cursoSeleccionado, fechaSeleccionada);
            setAlumnos(response.data.data || []);
        } catch (error) {
            console.error('Error cargando asistencias:', error);
            setAlumnos([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleAsistencia = (alumnoId) => {
        setAlumnos(alumnos.map(alumno =>
            alumno.alumno_id === alumnoId
                ? { ...alumno, presente: !alumno.presente }
                : alumno
        ));
    };

    const guardarAsistencias = async () => {
        try {
            setGuardando(true);
            const asistenciasData = alumnos.map(alumno => ({
                alumno_id: alumno.alumno_id,
                curso_id: cursoSeleccionado,
                fecha: fechaSeleccionada,
                presente: alumno.presente || false,
                observaciones: alumno.observaciones || null
            }));

            await asistenciasAPI.marcarAsistenciasMasivas({ asistencias: asistenciasData });
            alert('✅ Asistencias guardadas exitosamente');
        } catch (error) {
            console.error('Error guardando asistencias:', error);
            alert('❌ Error al guardar asistencias');
        } finally {
            setGuardando(false);
        }
    };

    if (loading && cursos.length === 0) return <Loader />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Gestión de Asistencias</h1>
                <p className="text-gray-400 mt-1">Registra la asistencia de alumnos por curso y fecha</p>
            </div>

            {/* Filtros */}
            <div className="card">
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <CalendarIcon className="h-4 w-4 inline mr-2" />
                                Curso
                            </label>
                            <select
                                value={cursoSeleccionado}
                                onChange={(e) => setCursoSeleccionado(e.target.value)}
                                className="input w-full"
                            >
                                {cursos.map((curso) => (
                                    <option key={curso.id} value={curso.id}>
                                        {curso.nombre} - {curso.horario_dia} {curso.horario_hora}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Fecha
                            </label>
                            <input
                                type="date"
                                value={fechaSeleccionada}
                                onChange={(e) => setFechaSeleccionada(e.target.value)}
                                className="input w-full"
                            />
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
                            <button
                                onClick={guardarAsistencias}
                                disabled={guardando || alumnos.length === 0}
                                className="btn btn-primary flex-1"
                            >
                                {guardando ? 'Guardando...' : 'Guardar Asistencias'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de alumnos */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-white">
                        Lista de Asistencia
                    </h3>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-8">
                            <Loader />
                        </div>
                    ) : alumnos.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">
                            No hay alumnos inscritos en este curso
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {alumnos.map((alumno) => (
                                <div
                                    key={alumno.alumno_id}
                                    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                                >
                                    <div className="flex items-center space-x-4 flex-1">
                                        <div className="flex-1">
                                            <h4 className="text-white font-medium">
                                                {alumno.alumno_nombre} {alumno.alumno_apellido}
                                            </h4>
                                            <p className="text-sm text-gray-400">{alumno.alumno_email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => toggleAsistencia(alumno.alumno_id)}
                                            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${alumno.presente
                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                : 'bg-red-600 hover:bg-red-700 text-white'
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
                            <p className="text-sm text-gray-400">Total de Alumnos</p>
                            <p className="text-3xl font-bold text-white mt-2">
                                {alumnos.length}
                            </p>
                        </div>
                    </div>

                    <div className="card border-green-900">
                        <div className="card-body">
                            <p className="text-sm text-gray-400">Presentes</p>
                            <p className="text-3xl font-bold text-green-500 mt-2">
                                {alumnos.filter(a => a.presente).length}
                            </p>
                        </div>
                    </div>

                    <div className="card border-red-900">
                        <div className="card-body">
                            <p className="text-sm text-gray-400">Ausentes</p>
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
