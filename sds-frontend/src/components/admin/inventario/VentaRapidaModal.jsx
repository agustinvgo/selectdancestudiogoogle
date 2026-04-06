import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

const VentaRapidaModal = ({
    showSaleModal,
    setShowSaleModal,
    saleProduct,
    saleData,
    setSaleData,
    handleSaleSubmit,
    isPending
}) => {
    if (!showSaleModal || !saleProduct) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm border border-gray-100 shadow-2xl animate-fade-in-up">
                <div className="p-6 text-center border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-gray-900">Registrar Venta</h2>
                    <p className="text-blue-600 font-medium mt-1">{saleProduct.nombre}</p>
                </div>
                <form onSubmit={handleSaleSubmit} className="p-6 space-y-5">
                    {saleProduct.isGroup && (
                        <div>
                            <label className="label font-medium text-gray-700">Talla / Variante</label>
                            <select
                                value={saleData.selectedVariantId}
                                onChange={e => setSaleData({ ...saleData, selectedVariantId: e.target.value })}
                                className="input mt-1 bg-gray-50 border-gray-200 focus:bg-white text-gray-900"
                            >
                                {saleProduct.variants?.map(v => (
                                    <option key={v.id} value={v.id} disabled={v.stock_actual <= 0}>
                                        {v.variantType.charAt(0).toUpperCase() + v.variantType.slice(1)} {v.variantValue} - {v.stock_actual > 0 ? `Stock: ${v.stock_actual}` : 'Agotado'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="label text-center font-medium text-gray-700">Cantidad</label>
                        <div className="flex items-center justify-center gap-4 mt-2">
                            <button type="button" onClick={() => setSaleData(d => ({ ...d, cantidad: Math.max(1, d.cantidad - 1) }))} className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">
                                <MinusIcon className="w-5 h-5" />
                            </button>
                            <span className="text-3xl font-bold text-gray-900 w-16 text-center">{saleData.cantidad}</span>
                            <button type="button" onClick={() => setSaleData(d => ({ ...d, cantidad: Math.min(saleProduct.stock_actual, d.cantidad + 1) }))} className="p-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors">
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="label font-medium text-gray-700">Método de Pago</label>
                        <select value={saleData.metodo_pago} onChange={e => setSaleData({ ...saleData, metodo_pago: e.target.value })} className="input mt-1 bg-gray-50 border-gray-200 focus:bg-white text-gray-900">
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Debito">Débito</option>
                            <option value="Credito">Crédito</option>
                        </select>
                    </div>

                    <div className="bg-green-50 p-4 rounded-xl text-center border border-green-100">
                        <label className="text-green-700 text-sm mb-1 block font-medium">Total a Cobrar ($)</label>
                        <div className="text-3xl font-black text-green-600">
                            ${parseFloat(saleData.precio_final).toLocaleString('es-AR')}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={() => setShowSaleModal(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium flex-1 transition-colors">Cancelar</button>
                        <button type="submit" disabled={isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex-1 transition-colors shadow-sm disabled:opacity-50">
                            {isPending ? 'Registrando...' : 'Confirmar Venta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VentaRapidaModal;
