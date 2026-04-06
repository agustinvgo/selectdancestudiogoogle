import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

const TallasModal = ({
    showGroupModal,
    setShowGroupModal,
    selectedGroup,
    handleEditFromGroup,
    handleDelete,
    openNewVariantModal
}) => {
    if (!showGroupModal || !selectedGroup) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl border border-gray-200 shadow-2xl animate-fade-in-up max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                            Tallas y Variantes
                        </h2>
                        <p className="text-sm text-gray-500">{selectedGroup.nombre}</p>
                    </div>
                    <button onClick={() => setShowGroupModal(false)} className="text-gray-400 hover:text-gray-900">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-4">
                        {selectedGroup.variants?.sort((a, b) => a.variantValue.localeCompare(b.variantValue, undefined, { numeric: true })).map(variant => (
                            <div key={variant.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-lg font-black text-gray-500 shrink-0">
                                        {variant.variantValue}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{variant.variantType.toUpperCase()} {variant.variantValue}</h4>
                                        <p className="text-sm text-gray-500">${parseFloat(variant.precio_venta).toLocaleString('es-AR')}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                                    <div className="text-center">
                                        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1">Stock</span>
                                        <span className={`font-bold px-2 py-1 rounded-md ${variant.stock_actual <= variant.stock_minimo ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {variant.stock_actual}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditFromGroup(variant)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent shadow-sm hover:border-blue-100">
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(variant.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent shadow-sm hover:border-red-100">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl shrink-0">
                    <button
                        onClick={() => openNewVariantModal(selectedGroup)}
                        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium hover:border-gray-900 hover:text-gray-900 hover:bg-gray-100 transition-colors flex justify-center items-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4" /> Agregar Nueva Talla
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TallasModal;
