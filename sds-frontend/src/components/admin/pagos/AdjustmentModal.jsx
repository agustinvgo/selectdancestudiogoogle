import Modal from '../../Modal';

const AdjustmentModal = ({
    isOpen,
    onClose,
    ajusteData,
    setAjusteData,
    aplicarAjusteManual,
    pagos
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ajustar Monto">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Ajuste</label>
                    <select
                        value={ajusteData.tipo}
                        onChange={(e) => setAjusteData({ ...ajusteData, tipo: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    >
                        <option value="descuento">Descuento</option>
                        <option value="recargo">Recargo</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Porcentaje (%)</label>
                    <input
                        type="number"
                        value={ajusteData.porcentaje}
                        onChange={(e) => setAjusteData({ ...ajusteData, porcentaje: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="Ingrese el porcentaje del ajuste"
                    />
                    {ajusteData.pagoId && ajusteData.porcentaje && (() => {
                        const pago = pagos.find(p => p.id === ajusteData.pagoId);
                        if (pago) {
                            const montoBase = pago.monto_original || pago.monto;
                            const porcentaje = parseFloat(ajusteData.porcentaje);
                            const montoCalculado = Math.round((montoBase * porcentaje / 100) * 100) / 100;
                            const nuevoMonto = ajusteData.tipo === 'descuento'
                                ? montoBase - montoCalculado
                                : montoBase + montoCalculado;
                            return (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-500">Monto Base: <span className="text-gray-900 font-semibold">${montoBase.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span></p>
                                    <p className="text-sm text-gray-500">{ajusteData.tipo === 'descuento' ? 'Descuento' : 'Recargo'}: <span className="text-gray-600 font-semibold">${montoCalculado.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span></p>
                                    <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200">Nuevo Monto: <span className="text-gray-900 font-bold text-lg">${nuevoMonto.toLocaleString('es-AR', { maximumFractionDigits: 0 })}</span></p>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Motivo</label>
                    <textarea
                        value={ajusteData.motivo}
                        onChange={(e) => setAjusteData({ ...ajusteData, motivo: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                        rows="3"
                        placeholder="Ingrese el motivo del ajuste"
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-black transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={aplicarAjusteManual}
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Aplicar Ajuste
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AdjustmentModal;

