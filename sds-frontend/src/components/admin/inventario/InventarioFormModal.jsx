import { PhotoIcon } from '@heroicons/react/24/outline';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const InventarioFormModal = ({
    showModal,
    setShowModal,
    editingProducto,
    formData,
    setFormData,
    handleSubmit,
    isPending,
    categorias
}) => {
    if (!showModal) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg border border-gray-200 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
                    </h2>
                    <p className="text-sm text-gray-500">Complete los detalles del producto</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="label font-medium text-gray-700">Imagen del Producto</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer relative group mt-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFormData({ ...formData, imagen: e.target.files[0] })}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
                                    {formData.imagen ? (
                                        <div className="flex flex-col items-center">
                                            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-bold mb-2">SELECCIONADA</span>
                                            <span className="text-gray-900 font-medium">{formData.imagen.name}</span>
                                        </div>
                                    ) : editingProducto?.imagen_url ? (
                                        <div className="flex flex-col items-center">
                                            <img src={`${API_URL.replace('/api', '')}${editingProducto.imagen_url}`} alt="Preview" className="w-16 h-16 object-cover rounded-lg mb-2 shadow-sm" />
                                            <span className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded-full">IMAGEN ACTUAL</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-3 bg-gray-100 rounded-full group-hover:bg-blue-100 transition-colors">
                                                <PhotoIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                                            </div>
                                            <span className="text-sm font-medium">Click para subir imagen</span>
                                            <span className="text-xs text-gray-400">PNG, JPG hasta 5MB</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="label font-medium text-gray-700">Nombre</label>
                            <input type="text" required value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="input mt-1" placeholder="Ej: Zapatillas Ballet Talle 38" />
                        </div>
                        <div>
                            <label className="label font-medium text-gray-700">Categoría</label>
                            <select value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })} className="input mt-1">
                                <option value="">Seleccionar...</option>
                                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label font-medium text-gray-700">Stock Actual</label>
                            <input type="number" required value={formData.stock_actual} onChange={e => setFormData({ ...formData, stock_actual: e.target.value })} className="input mt-1" />
                        </div>
                        <div>
                            <label className="label font-medium text-gray-700">Costo ($)</label>
                            <input type="number" step="0.01" required value={formData.precio_costo} onChange={e => setFormData({ ...formData, precio_costo: e.target.value })} className="input mt-1" />
                        </div>
                        <div>
                            <label className="label font-medium text-gray-700">Precio Venta ($)</label>
                            <input type="number" step="0.01" required value={formData.precio_venta} onChange={e => setFormData({ ...formData, precio_venta: e.target.value })} className="input mt-1 font-bold text-gray-900" />
                        </div>
                        <div className="col-span-2">
                            <label className="label font-medium text-gray-700">Descripción</label>
                            <textarea rows="2" value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} className="input mt-1" placeholder="Detalles del producto..."></textarea>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                        <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium flex-1 transition-colors">Cancelar</button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex-1 transition-colors shadow-sm disabled:opacity-50">
                            {isPending ? 'Guardando...' : 'Guardar Producto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InventarioFormModal;
