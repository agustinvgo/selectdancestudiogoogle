import { PencilIcon, TrashIcon, CalendarIcon, UserGroupIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

const EventoCard = ({
    evento,
    abrirModal,
    eliminarEvento,
    toggleParticipantes,
    expandedEventoId,
    loadingParticipantes,
    participantes,
    desinscribirAlumno,
    getAlumnosDisponibles,
    inscribirAlumno
}) => {
    const esFuturo = new Date(evento.fecha) >= new Date();

    return (
        <div className={`card ${esFuturo ? 'border-blue-900' : 'border-gray-200'} `}>
            <div className="card-header">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{evento.nombre}</h3>
                        <span className={`badge mt-2 ${evento.tipo?.toLowerCase().includes('competencia') ? 'badge-error' :
                            evento.tipo?.toLowerCase().includes('present') ? 'badge-success' :
                                'badge-info'
                            }`}>
                            {evento.tipo}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => abrirModal(evento)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <PencilIcon className="h-5 w-5 text-yellow-400" />
                        </button>
                        <button
                            onClick={() => eliminarEvento(evento.id)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Eliminar"
                        >
                            <TrashIcon className="h-5 w-5 text-red-400" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="card-body space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                        <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                        <span>{new Date(evento.fecha).toLocaleDateString('es-AR')} - {evento.hora}</span>
                    </div>
                    {evento.costo_inscripcion > 0 ? (
                        <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm font-bold">
                            💰 ${Math.round(evento.costo_inscripcion).toLocaleString('es-AR')}
                        </span>
                    ) : (
                        <span className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm font-bold">
                            🎁 GRATIS
                        </span>
                    )}
                </div>

                {evento.descripcion && (
                    <p className="text-gray-500 text-sm">{evento.descripcion}</p>
                )}

                {evento.lugar && (
                    <p className="text-gray-500 text-sm">📍 {evento.lugar}</p>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center text-gray-500">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm">{evento.inscritos || 0} participantes</span>
                    </div>
                </div>

                {(evento.vestuario_requerido || evento.maquillaje_instrucciones || evento.peinado_instrucciones) && (
                    <div className="border-t border-gray-200 pt-3 mt-3 space-y-1">
                        <p className="text-sm font-medium text-gray-600">Instrucciones:</p>
                        {evento.vestuario_requerido && (
                            <p className="text-sm text-gray-500">👗 {evento.vestuario_requerido}</p>
                        )}
                        {evento.maquillaje_instrucciones && (
                            <p className="text-sm text-gray-500">💄 {evento.maquillaje_instrucciones}</p>
                        )}
                        {evento.peinado_instrucciones && (
                            <p className="text-sm text-gray-500">💇 {evento.peinado_instrucciones}</p>
                        )}
                    </div>
                )}

                {/* Botón Gestionar Alumnos */}
                <button
                    onClick={() => toggleParticipantes(evento.id)}
                    className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors mt-3 ${expandedEventoId === evento.id
                        ? 'bg-blue-600 text-gray-900'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-600'
                        }`}
                >
                    <UserGroupIcon className="h-5 w-5" />
                    <span>{expandedEventoId === evento.id ? 'Ocultar Alumnos' : 'Gestionar Alumnos'}</span>
                </button>

                {/* Sección Expandible: Lista de Alumnos */}
                {expandedEventoId === evento.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
                        {loadingParticipantes ? (
                            <div className="text-center py-4 text-gray-500">Cargando...</div>
                        ) : (
                            <div className="space-y-4">
                                {/* Lista de Inscritos */}
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Inscritos ({participantes.length})
                                    </h4>
                                    {participantes.length === 0 ? (
                                        <p className="text-gray-500 text-sm italic text-center py-2">
                                            No hay alumnos inscritos
                                        </p>
                                    ) : (
                                        <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                            {participantes.map((alumno) => (
                                                <div key={alumno.inscripcion_id} className="flex items-center justify-between p-2 bg-gray-100/30 rounded hover:bg-blue-50/50 transition-colors group">
                                                    <span className="text-sm text-gray-200 truncate">
                                                        {alumno.nombre} {alumno.apellido}
                                                    </span>
                                                    <button
                                                        onClick={() => desinscribirAlumno(evento.id, alumno.inscripcion_id, `${alumno.nombre} ${alumno.apellido}`)}
                                                        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Desinscribir"
                                                    >
                                                        <XMarkIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Agregar Alumno */}
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        Inscribir Nuevo
                                    </h4>
                                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                        {getAlumnosDisponibles().length === 0 ? (
                                            <p className="text-gray-500 text-sm italic text-center py-2">
                                                No hay más alumnos disponibles
                                            </p>
                                        ) : (
                                            getAlumnosDisponibles().map((alumno) => (
                                                <button
                                                    key={alumno.usuario_id}
                                                    onClick={() => inscribirAlumno(alumno.id)}
                                                    className="w-full flex items-center justify-between p-2 bg-gray-100/30 rounded hover:bg-blue-900/30 border border-transparent hover:border-blue-500/30 transition-all group text-left"
                                                >
                                                    <span className="text-sm text-gray-500 group-hover:text-blue-200 truncate">
                                                        {alumno.nombre} {alumno.apellido}
                                                    </span>
                                                    <PlusIcon className="h-4 w-4 text-gray-500 group-hover:text-blue-400" />
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventoCard;
