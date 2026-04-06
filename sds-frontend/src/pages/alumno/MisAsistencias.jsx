import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { asistenciasAPI } from '../../services/api';
import { useQuery } from '@tanstack/react-query';
import { CheckCircleIcon, XCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const MisAsistencias = () => {
    const { user } = useAuth();
    const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
    const [anioSeleccionado, setAnioSeleccionado] = useState(Math.max(new Date().getFullYear(), 2026));

    const alumnoId = user?.alumno?.id;
    const esAlumno = user?.rol === 'alumno';

    const { data: asistenciasData, isLoading, error } = useQuery({
        queryKey: ['asistencias', 'mis', mesSeleccionado, anioSeleccionado],
        queryFn: async () => {
            const response = await asistenciasAPI.getMisAsistencias(mesSeleccionado, anioSeleccionado);
            return response.data.data;
        },
        enabled: esAlumno,
        retry: 1
    });

    if (isLoading) return <Loader />;

    if (!esAlumno) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mis Asistencias</h1>
                    <p className="text-gray-500 mt-1">Historial de asistencia a clases</p>
                </div>
                <div className="card">
                    <div className="card-body text-center py-12">
                        <p className="text-gray-500 text-lg">Esta sección es solo para alumnos.</p>
                        <p className="text-gray-500 mt-2">
                            Como administrador, puedes ver las asistencias desde Gestión de Alumnos.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const asistencias = asistenciasData?.asistencias || [];
    const stats = asistenciasData?.estadisticas || {
        total_clases: 0,
        presentes: 0,
        ausentes: 0,
        porcentaje_asistencia: 0
    };
    const porcentaje = Number(stats.porcentaje_asistencia) || 0;

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mis Asistencias</h1>
                    <p className="text-gray-500 mt-1">Historial de asistencia a clases</p>
                </div>

                {/* Selector de mes/año */}
                <div className="flex items-center space-x-3">
                    <select
                        value={mesSeleccionado}
                        onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                        className="input py-2"
                    >
                        {meses.map((mes, index) => (
                            <option key={index} value={index + 1}>{mes}</option>
                        ))}
                    </select>
                    <select
                        value={anioSeleccionado}
                        onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                        className="input py-2"
                    >
                        {[2026, 2027, 2028, 2029, 2030].map((anio) => (
                            <option key={anio} value={anio}>{anio}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
                    <p className="text-red-400">No se pudieron cargar las asistencias.</p>
                </div>
            )}

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card">
                    <div className="card-body">
                        <p className="text-sm text-gray-500">Total de Clases</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            {stats.total_clases || 0}
                        </p>
                    </div>
                </div>

                <div className="card border-green-900">
                    <div className="card-body">
                        <p className="text-sm text-gray-500">Presentes</p>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-3xl font-bold text-green-500">
                                {stats.presentes || 0}
                            </p>
                            <CheckCircleIcon className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                </div>

                <div className="card border-red-900">
                    <div className="card-body">
                        <p className="text-sm text-gray-500">Ausentes</p>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-3xl font-bold text-red-500">
                                {stats.ausentes || 0}
                            </p>
                            <XCircleIcon className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                </div>

                <div className="card border-blue-900">
                    <div className="card-body">
                        <p className="text-sm text-gray-500">Porcentaje</p>
                        <div className="flex items-center justify-between mt-2">
                            <p className="text-3xl font-bold text-blue-500">
                                {porcentaje.toFixed(1)}%
                            </p>
                            <ChartBarIcon className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Barra de progreso */}
            {/* Using a key to force re-render if necessary, or just rely on state props */}
            <div className="card">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">
                            Porcentaje de Asistencia
                        </span>
                        <span className="text-sm font-bold text-gray-900">{porcentaje.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-4">
                        <div
                            className={`h-4 rounded-full transition-all ${porcentaje >= 80 ? 'bg-green-500' :
                                porcentaje >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${Math.min(porcentaje, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {porcentaje >= 80 ? '¡Excelente asistencia!' :
                            porcentaje >= 60 ? 'Buena asistencia, pero puedes mejorar' :
                                'Necesitas mejorar tu asistencia'}
                    </p>
                </div>
            </div>

            {/* Historial */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Historial - {meses[mesSeleccionado - 1]} {anioSeleccionado}
                    </h3>
                </div>
                <div className="card-body">
                    {!asistencias || asistencias.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">📅</span>
                            </div>
                            <p className="text-gray-500">
                                No hay registros de asistencia para este período
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Curso</th>
                                        <th>Estado</th>
                                        <th>Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {asistencias.map((asist, index) => {
                                        const key = asist.id || `asist-${index}`;
                                        const fecha = asist.fecha ? new Date(asist.fecha).toLocaleDateString('es-AR') : '-';
                                        const curso = asist.curso_nombre || 'Sin nombre';
                                        const presente = asist.presente === 1 || asist.presente === true;
                                        const obs = asist.observaciones || '-';

                                        return (
                                            <tr key={key}>
                                                <td className="font-medium text-gray-900">{fecha}</td>
                                                <td className="text-gray-600">{curso}</td>
                                                <td>
                                                    {presente ? (
                                                        <span className="badge badge-success flex items-center w-fit">
                                                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                            Presente
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-error flex items-center w-fit">
                                                            <XCircleIcon className="h-4 w-4 mr-1" />
                                                            Ausente
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-gray-500 text-sm">{obs}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MisAsistencias;

