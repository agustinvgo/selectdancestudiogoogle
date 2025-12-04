import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { cursosAPI, eventosAPI, asistenciasAPI, pagosAPI } from '../services/api';
import { CalendarIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import Loader from '../components/Loader';

const AlumnoDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [cursos, setCursos] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [asistenciasMes, setAsistenciasMes] = useState(null);
    const [pagosPendientes, setPagosPendientes] = useState([]);

    const alumnoId = user?.alumno?.id;

    useEffect(() => {
        if (alumnoId) {
            cargarDatos();
        }
    }, [alumnoId]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const mes = new Date().getMonth() + 1;
            const anio = new Date().getFullYear();

            const [cursosRes, eventosRes, asistenciasRes, pagosRes] = await Promise.all([
                cursosAPI.getByAlumno(alumnoId),
                eventosAPI.getByAlumno(alumnoId),
                asistenciasAPI.getByAlumno(alumnoId, mes, anio),
                pagosAPI.getByAlumno(alumnoId)
            ]);

            setCursos(cursosRes.data.data);
            setEventos(eventosRes.data.data.filter(e => new Date(e.fecha) >= new Date()));
            setAsistenciasMes(asistenciasRes.data.data.estadisticas);
            setPagosPendientes(pagosRes.data.data.filter(p => p.estado !== 'pagado'));
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loader />;

    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white">
                    ¡Bienvenido, {user?.alumno?.nombre}!
                </h1>
                <p className="text-gray-400 mt-1">Aquí puedes ver toda tu información</p>
            </div>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Mis Clases</p>
                                <p className="text-3xl font-bold text-white mt-1">{cursos.length}</p>
                            </div>
                            <CalendarIcon className="h-12 w-12 text-sds-red" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Asistencia del Mes</p>
                                <p className="text-3xl font-bold text-white mt-1">
                                    {asistenciasMes?.porcentaje_asistencia || 0}%
                                </p>
                            </div>
                            <CheckCircleIcon className="h-12 w-12 text-green-500" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-body">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400">Pagos Pendientes</p>
                                <p className="text-3xl font-bold text-white mt-1">{pagosPendientes.length}</p>
                            </div>
                            <div className={`w-12 h-12 ${pagosPendientes.length > 0 ? 'bg-yellow-500/20' : 'bg-green-500/20'} rounded-lg flex items-center justify-center`}>
                                <span className={`text-2xl ${pagosPendientes.length > 0 ? 'text-yellow-500' : 'text-green-500'}`}>
                                    $
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendario de clases */}
            <div className="card">
                <div className="card-header">
                    <h3 className="text-lg font-semibold text-white">Mis Clases de la Semana</h3>
                </div>
                <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cursos.map((curso) => (
                            <div key={curso.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                                <h4 className="font-semibold text-white mb-2">{curso.nombre}</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center text-gray-400">
                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                        {curso.dia_semana}
                                    </div>
                                    <div className="flex items-center text-gray-400">
                                        <ClockIcon className="h-4 w-4 mr-2" />
                                        {curso.hora_inicio?.substring(0, 5)} - {curso.hora_fin?.substring(0, 5)}
                                    </div>
                                    {curso.profesor && (
                                        <div className="text-gray-400">
                                            Prof. {curso.profesor}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {cursos.length === 0 && (
                        <p className="text-center text-gray-400 py-8">No tienes clases inscritas</p>
                    )}
                </div>
            </div>

            {/* Próximos eventos */}
            {eventos.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-white">Próximos Eventos</h3>
                    </div>
                    <div className="card-body space-y-3">
                        {eventos.map((evento) => (
                            <div key={evento.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold text-white">{evento.nombre}</h4>
                                        <p className="text-sm text-gray-400 mt-1">{evento.descripcion}</p>
                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                                            <span>📅 {new Date(evento.fecha).toLocaleDateString('es-AR')}</span>
                                            <span>📍 {evento.lugar}</span>
                                        </div>
                                    </div>
                                    {evento.pago_realizado ? (
                                        <span className="badge badge-success">Pago realizado</span>
                                    ) : (
                                        <span className="badge badge-warning">Pago pendiente</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pagos pendientes */}
            {pagosPendientes.length > 0 && (
                <div className="card border-2 border-yellow-600">
                    <div className="card-header bg-yellow-900/20">
                        <h3 className="text-lg font-semibold text-yellow-500">⚠️ Pagos Pendientes</h3>
                    </div>
                    <div className="card-body">
                        <div className="space-y-3">
                            {pagosPendientes.map((pago) => (
                                <div key={pago.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                                    <div>
                                        <p className="font-medium text-white">{pago.concepto}</p>
                                        <p className="text-sm text-gray-400">
                                            Vence: {new Date(pago.fecha_vencimiento).toLocaleDateString('es-AR')}
                                        </p>
                                    </div>
                                    <span className="text-xl font-bold text-yellow-500">
                                        ${pago.monto.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlumnoDashboard;
