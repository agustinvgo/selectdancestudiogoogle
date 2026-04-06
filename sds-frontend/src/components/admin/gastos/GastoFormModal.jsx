import { PaperClipIcon } from '@heroicons/react/24/outline';

const GastoFormModal = ({
    showModal,
    setShowModal,
    editingGasto,
    formData,
    setFormData,
    handleSubmit,
    isPending,
    categorias
}) => {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md border border-gray-200 shadow-xl animate-fade-in-up overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">
                        {editingGasto ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                        <input
                            type="date"
                            required
                            value={formData.fecha}
                            onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            min="0"
                            value={formData.monto}
                            onChange={e => setFormData({ ...formData, monto: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                        <select
                            required
                            value={formData.categoria}
                            onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        >
                            <option value="">Seleccionar...</option>
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea
                            rows="3"
                            value={formData.descripcion}
                            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                            placeholder="Detalles del gasto..."
                        ></textarea>
                    </div>

                    {!editingGasto && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Comprobante (Opcional)</label>
                            <div className="flex items-center gap-2">
                                <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm text-gray-600 w-full hover:text-black">
                                    <PaperClipIcon className="w-4 h-4" />
                                    {formData.comprobante ? formData.comprobante.name : 'Seleccionar archivo (PDF/Imagen)'}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => setFormData({ ...formData, comprobante: e.target.files[0] })}
                                    />
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                        >
                            {isPending ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GastoFormModal;
