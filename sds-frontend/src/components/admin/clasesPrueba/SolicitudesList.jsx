import { TrashIcon } from '@heroicons/react/24/outline';

const SolicitudesList = ({
    solicitudes,
    handleStatusChange,
    handleDelete,
    updateStatusPending,
    deleteSolicitudPending
}) => {
    return (
        <>
            {/* Tabla Desktop */}
            <div className="hidden md:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interés</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {solicitudes.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        No hay solicitudes pendientes.
                                    </td>
                                </tr>
                            ) : (
                                solicitudes.map((solicitud) => (
                                    <tr key={solicitud.id} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(solicitud.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{solicitud.nombre} {solicitud.apellido}</div>
                                            <div className="text-xs text-gray-500">{solicitud.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500">{solicitud.interes || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-500">{solicitud.horario || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={solicitud.estado}
                                                onChange={(e) => handleStatusChange(solicitud.id, e.target.value)}
                                                className="text-xs rounded-full px-2 py-1 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-gray-100 text-gray-900 shadow-sm outline-none"
                                                disabled={updateStatusPending}
                                            >
                                                <option value="pendiente">Pendiente</option>
                                                <option value="contactado">Contactado</option>
                                                <option value="agendado">Agendado</option>
                                                <option value="completado">Completado</option>
                                                <option value="cancelado">Cancelado</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(solicitud.id)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                                title="Eliminar solicitud"
                                                disabled={deleteSolicitudPending}
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cards Móvil */}
            <div className="md:hidden space-y-4">
                {solicitudes.length === 0 ? (
                    <div className="bg-white rounded-xl p-4 shadow text-center text-gray-500">
                        No hay solicitudes pendientes.
                    </div>
                ) : (
                    solicitudes.map((solicitud) => (
                        <div key={solicitud.id} className="bg-white rounded-xl p-4 shadow-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{solicitud.nombre} {solicitud.apellido}</h3>
                                    <p className="text-xs text-gray-500">{new Date(solicitud.created_at).toLocaleDateString()}</p>
                                </div>
                                <select
                                    value={solicitud.estado}
                                    onChange={(e) => handleStatusChange(solicitud.id, e.target.value)}
                                    className="text-xs rounded-lg px-2 py-1 border border-gray-300 bg-gray-100 text-gray-900 outline-none"
                                    disabled={updateStatusPending}
                                >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="contactado">Contactado</option>
                                    <option value="agendado">Agendado</option>
                                    <option value="completado">Completado</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>
                            <div className="text-sm text-gray-600 mb-4 space-y-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p>Interés: <span className="font-medium text-gray-900">{solicitud.interes}</span></p>
                                <p>Horario: <span className="font-medium text-gray-900">{solicitud.horario}</span></p>
                                <p className="text-xs text-gray-500 mt-2">{solicitud.email} | {solicitud.telefono}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(solicitud.id)}
                                className="w-full py-2 flex items-center justify-center gap-2 text-red-500 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100 transition-colors font-medium"
                                disabled={deleteSolicitudPending}
                            >
                                <TrashIcon className="h-5 w-5" />
                                <span>Eliminar Solicitud</span>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

export default SolicitudesList;
