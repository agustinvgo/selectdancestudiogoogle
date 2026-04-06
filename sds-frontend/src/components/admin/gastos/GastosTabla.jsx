import Loader from '../../Loader';
import { PaperClipIcon, ArrowUpTrayIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const GastosTabla = ({
    isLoading,
    gastos,
    handleVerComprobante,
    handleUploadComprobante,
    uploadingGastoId,
    openEditModal,
    handleDelete
}) => {
    return (
        <>
            {/* Tabla (Desktop) */}
            <div className="hidden md:block card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white border border-gray-100 text-gray-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-3 text-left">Fecha</th>
                                <th className="px-6 py-3 text-left">Categoría</th>
                                <th className="px-6 py-3 text-left">Descripción</th>
                                <th className="px-6 py-3 text-right">Monto</th>
                                <th className="px-6 py-3 text-center">Comprobante</th>
                                <th className="px-6 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        <Loader />
                                    </td>
                                </tr>
                            ) : gastos.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        No hay gastos registrados en este período
                                    </td>
                                </tr>
                            ) : (
                                gastos.map((gasto) => (
                                    <tr key={gasto.id} className="hover:bg-white border border-gray-100 transition-colors">
                                        <td className="px-6 py-4 text-gray-900">
                                            {new Date(gasto.fecha).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                {gasto.categoria}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                                            {gasto.descripcion || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            ${parseFloat(gasto.monto).toLocaleString('es-AR')}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {gasto.comprobante_url ? (
                                                <button
                                                    onClick={() => handleVerComprobante(gasto.id)}
                                                    className="text-white hover:text-gray-300 inline-flex items-center gap-1 text-xs bg-gray-800 px-2 py-1 rounded cursor-pointer border border-gray-700"
                                                    title="Ver comprobante"
                                                >
                                                    <PaperClipIcon className="w-3 h-3" /> Ver
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleUploadComprobante(gasto.id)}
                                                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded cursor-pointer border transition-colors ${uploadingGastoId === gasto.id
                                                        ? 'text-amber-600 bg-amber-50 border-amber-200 animate-pulse'
                                                        : 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100'
                                                        }`}
                                                    title="Subir comprobante"
                                                    disabled={uploadingGastoId === gasto.id}
                                                >
                                                    <ArrowUpTrayIcon className="w-3 h-3" /> Subir
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => openEditModal(gasto)}
                                                    className="p-1 text-white hover:bg-gray-800 rounded transition-colors"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(gasto.id)}
                                                    className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vista Móvil (Cards) */}
            <div className="md:hidden space-y-4">
                {isLoading ? (
                    <div className="text-center py-8">
                        <Loader />
                    </div>
                ) : gastos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-white border border-gray-100 rounded-lg">
                        No hay gastos registrados en este período
                    </div>
                ) : (
                    gastos.map((gasto) => (
                        <div key={gasto.id} className="card p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        {new Date(gasto.fecha).toLocaleDateString()}
                                    </span>
                                    <h3 className="text-gray-900 font-medium mt-1 text-lg">
                                        {gasto.categoria}
                                    </h3>
                                </div>
                                <span className="text-xl font-bold text-gray-900">
                                    ${parseFloat(gasto.monto).toLocaleString('es-AR')}
                                </span>
                            </div>

                            {gasto.descripcion && (
                                <p className="text-sm text-gray-500 bg-white border border-gray-100 p-2 rounded">
                                    {gasto.descripcion}
                                </p>
                            )}

                            <div className="flex justify-between items-center pt-3 border-t border-gray-200/50">
                                <div>
                                    {gasto.comprobante_url ? (
                                        <button
                                            onClick={() => handleVerComprobante(gasto.id)}
                                            className="text-white text-xs flex items-center gap-1 hover:underline bg-gray-800 px-2 py-1 rounded"
                                        >
                                            <PaperClipIcon className="w-4 h-4" /> Comprobante
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleUploadComprobante(gasto.id)}
                                            className={`text-xs flex items-center gap-1 px-2 py-1 rounded border transition-colors ${uploadingGastoId === gasto.id
                                                ? 'text-amber-600 bg-amber-50 border-amber-200 animate-pulse'
                                                : 'text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100'
                                                }`}
                                            disabled={uploadingGastoId === gasto.id}
                                        >
                                            <ArrowUpTrayIcon className="w-4 h-4" /> Subir
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(gasto)}
                                        className="p-2 text-white bg-gray-800 rounded-lg border border-gray-700"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(gasto.id)}
                                        className="p-2 text-red-400 bg-red-500/10 rounded-lg"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

export default GastosTabla;
