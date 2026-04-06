import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { eventosAPI } from '../../services/api';
import { CalendarIcon, MapPinIcon, CurrencyDollarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const MisEventos = () => {
    const { user } = useAuth();
    const alumnoId = user?.alumno?.id;

    const { data: eventosData, isLoading } = useQuery({
        queryKey: ['eventos', 'alumno', alumnoId],
        queryFn: async () => {
            const response = await eventosAPI.getByAlumno(alumnoId);
            return response.data.data;
        },
        enabled: !!alumnoId,
        retry: 1
    });

    if (isLoading) return <Loader />;

    const eventos = eventosData || [];

    const eventosProximos = eventos.filter(e => new Date(e.fecha) >= new Date());
    const eventosPasados = eventos.filter(e => new Date(e.fecha) < new Date());

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Mis Eventos</h1>
                <p className="text-gray-500 mt-1">
                    {eventos.length} {eventos.length === 1 ? 'evento inscrito' : 'eventos inscritos'}
                </p>
            </div>

            {eventos.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center py-12">
                        <CalendarIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No tienes eventos inscritos</p>
                        <p className="text-gray-500 text-sm mt-2">
                            Consulta con la administración sobre próximos eventos y competencias
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Próximos Eventos */}
                    {eventosProximos.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Próximos Eventos ({eventosProximos.length})
                            </h2>
                            <div className="space-y-4">
                                {eventosProximos.map((evento) => (
                                    <div key={evento.id} className="card border-sds-red">
                                        <div className="card-body">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-2xl font-bold text-gray-900">{evento.nombre}</h3>
                                                    {evento.descripcion && (
                                                        <p className="text-gray-500 mt-2">{evento.descripcion}</p>
                                                    )}
                                                </div>
                                                {evento.pago_realizado ? (
                                                    <span className="badge badge-success flex items-center">
                                                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                        Pago realizado
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-warning flex items-center">
                                                        <XCircleIcon className="h-4 w-4 mr-1" />
                                                        Pago pendiente
                                                    </span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                                <div className="flex items-center space-x-3">
                                                    <CalendarIcon className="h-5 w-5 text-sds-red" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Fecha</p>
                                                        <p className="text-gray-900 font-medium">
                                                            {new Date(evento.fecha).toLocaleDateString('es-AR', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    <MapPinIcon className="h-5 w-5 text-sds-red" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Lugar</p>
                                                        <p className="text-gray-900 font-medium">{evento.lugar}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    <CurrencyDollarIcon className="h-5 w-5 text-sds-red" />
                                                    <div>
                                                        <p className="text-xs text-gray-500">Costo</p>
                                                        <p className="text-gray-900 font-medium">
                                                            ${parseFloat(evento.costo_inscripcion).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Checklist de preparación */}
                                            <div className="border-t border-gray-200 pt-4">
                                                <h4 className="font-semibold text-gray-900 mb-3">📋 Checklist de Preparación</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className={`p-3 rounded-lg ${evento.checklist_vestuario ? 'bg-green-900/20 border border-green-900' : 'bg-gray-50'}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-900">👗 Vestuario</span>
                                                            {evento.checklist_vestuario ? (
                                                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                                            ) : (
                                                                <XCircleIcon className="h-5 w-5 text-gray-600" />
                                                            )}
                                                        </div>
                                                        {evento.vestuario_requerido && (
                                                            <p className="text-xs text-gray-500 mt-1">{evento.vestuario_requerido}</p>
                                                        )}
                                                    </div>

                                                    <div className={`p-3 rounded-lg ${evento.checklist_peinado ? 'bg-green-900/20 border border-green-900' : 'bg-gray-50'}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-900">💇 Peinado</span>
                                                            {evento.checklist_peinado ? (
                                                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                                            ) : (
                                                                <XCircleIcon className="h-5 w-5 text-gray-600" />
                                                            )}
                                                        </div>
                                                        {evento.peinado_instrucciones && (
                                                            <p className="text-xs text-gray-500 mt-1">{evento.peinado_instrucciones}</p>
                                                        )}
                                                    </div>

                                                    <div className={`p-3 rounded-lg ${evento.checklist_maquillaje ? 'bg-green-900/20 border border-green-900' : 'bg-gray-50'}`}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-sm font-medium text-gray-900">💄 Maquillaje</span>
                                                            {evento.checklist_maquillaje ? (
                                                                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                                                            ) : (
                                                                <XCircleIcon className="h-5 w-5 text-gray-600" />
                                                            )}
                                                        </div>
                                                        {evento.maquillaje_instrucciones && (
                                                            <p className="text-xs text-gray-500 mt-1">{evento.maquillaje_instrucciones}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Eventos Pasados */}
                    {eventosPasados.length > 0 && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-500 mb-4">
                                Eventos Pasados ({eventosPasados.length})
                            </h2>
                            <div className="space-y-3">
                                {eventosPasados.map((evento) => (
                                    <div key={evento.id} className="card opacity-60">
                                        <div className="card-body">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{evento.nombre}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        📅 {new Date(evento.fecha).toLocaleDateString('es-AR')} •
                                                        📍 {evento.lugar}
                                                    </p>
                                                </div>
                                                <span className="badge badge-info">Finalizado</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MisEventos;

