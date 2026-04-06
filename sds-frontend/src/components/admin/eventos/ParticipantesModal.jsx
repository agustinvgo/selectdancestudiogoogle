import Modal from '../../Modal';
import { TrashIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const ParticipantesModal = ({
    isOpen,
    onClose,
    eventoDetalle,
    togglePagoParticipante,
    desinscribirAlumno
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Participantes: ${eventoDetalle?.nombre || ''}`}
        >
            {eventoDetalle && (
                <div className="space-y-4">
                    {/* Estadísticas de Pago */}
                    {eventoDetalle.costo_inscripcion > 0 && (
                        <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 p-4 rounded-lg border border-green-700/50">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">📊 Estado de Pagos</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Pagado</p>
                                    <p className="text-2xl font-bold text-green-400">
                                        {eventoDetalle.inscritos?.filter(i => i.pago_realizado).length || 0} / {eventoDetalle.inscritos?.length || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Recaudado</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        ${Math.round((eventoDetalle.inscritos?.filter(i => i.pago_realizado).length || 0) * eventoDetalle.costo_inscripcion).toLocaleString('es-AR')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Pendiente</p>
                                    <p className="text-2xl font-bold text-red-400">
                                        {eventoDetalle.inscritos?.filter(i => !i.pago_realizado).length || 0}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Esperado</p>
                                    <p className="text-2xl font-bold text-blue-400">
                                        ${Math.round((eventoDetalle.inscritos?.length || 0) * eventoDetalle.costo_inscripcion).toLocaleString('es-AR')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Lista de Participantes */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">👥 Participantes ({eventoDetalle.inscritos?.length || 0})</h3>
                        {eventoDetalle.inscritos && eventoDetalle.inscritos.length > 0 ? (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {eventoDetalle.inscritos.map((inscrito) => (
                                    <div
                                        key={inscrito.inscripcion_id}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                                    >
                                        <div className="flex-1">
                                            <p className="text-gray-900 font-medium">
                                                {inscrito.nombre} {inscrito.apellido}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Inscrito: {new Date(inscrito.fecha_inscripcion).toLocaleDateString('es-AR')}
                                            </p>
                                        </div>

                                        {eventoDetalle.costo_inscripcion > 0 && (
                                            <div className="flex items-center space-x-2">
                                                {inscrito.pago_realizado ? (
                                                    <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm font-medium flex items-center space-x-1">
                                                        <span>✅</span>
                                                        <span>Pagado</span>
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-red-900 text-red-200 rounded-full text-sm font-medium flex items-center space-x-1">
                                                        <span>❌</span>
                                                        <span>No pagado</span>
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => togglePagoParticipante(inscrito.inscripcion_id, inscrito.pago_realizado)}
                                                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-600 rounded transition-colors"
                                                    title="Cambiar estado de pago"
                                                >
                                                    ↔️
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => desinscribirAlumno(eventoDetalle.id, inscrito.inscripcion_id, `${inscrito.nombre} ${inscrito.apellido}`)}
                                            className="ml-2 p-2 bg-red-900/30 hover:bg-red-900/50 rounded-lg transition-colors"
                                            title="Eliminar inscripción"
                                        >
                                            <TrashIcon className="h-5 w-5 text-red-400" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <UserGroupIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                <p>No hay participantes inscritos aún</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default ParticipantesModal;
