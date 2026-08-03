import Modal from '../../Modal';

const formatCurrency = (value) => `$${Math.round(Number(value) || 0).toLocaleString('es-AR')}`;

const AdjustmentModal = ({ isOpen, onClose, ajusteData, setAjusteData, aplicarAjusteManual, guardando = false }) => {
    const pago = ajusteData.pago;
    const montoActual = Number(pago?.monto) || 0;
    const montoOriginal = Number(pago?.monto_original) || montoActual;
    const nuevoMonto = ajusteData.nuevoMonto === '' ? null : Number(ajusteData.nuevoMonto);
    const diferenciaActual = Number.isFinite(nuevoMonto) ? nuevoMonto - montoActual : 0;
    const diferenciaOriginal = Number.isFinite(nuevoMonto) ? nuevoMonto - montoOriginal : 0;
    const tipoCambio = diferenciaActual < 0 ? 'Descuento' : diferenciaActual > 0 ? 'Recargo' : 'Sin cambios';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ajustar Monto">
            <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); aplicarAjusteManual(); }}>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-900">{pago?.concepto || 'Pago'}</p>
                    <p className="mt-1 text-xs text-gray-500">
                        {pago ? `${pago.alumno_nombre || ''} ${pago.alumno_apellido || ''}`.trim() : ''}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Monto original</p>
                            <p className="mt-1 text-lg font-bold text-gray-800">{formatCurrency(montoOriginal)}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Monto actual</p>
                            <p className="mt-1 text-lg font-bold text-gray-950">{formatCurrency(montoActual)}</p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Nuevo monto *</label>
                    <input
                        type="number"
                        value={ajusteData.nuevoMonto}
                        onChange={(event) => setAjusteData((current) => ({ ...current, nuevoMonto: event.target.value }))}
                        required min="0.01" step="0.01" autoFocus disabled={guardando}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-lg font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                        placeholder="Escribe el monto final"
                    />
                </div>

                {Number.isFinite(nuevoMonto) && nuevoMonto > 0 && (
                    <div className={`rounded-xl border p-4 ${diferenciaActual < 0 ? 'border-emerald-200 bg-emerald-50' : diferenciaActual > 0 ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm font-semibold text-gray-700">{tipoCambio}</span>
                            <span className={`text-base font-bold ${diferenciaActual < 0 ? 'text-emerald-700' : diferenciaActual > 0 ? 'text-amber-700' : 'text-gray-600'}`}>
                                {diferenciaActual > 0 ? '+' : diferenciaActual < 0 ? '-' : ''}{formatCurrency(Math.abs(diferenciaActual))}
                            </span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            El registro quedará con {diferenciaOriginal < 0 ? `${formatCurrency(Math.abs(diferenciaOriginal))} de descuento` : diferenciaOriginal > 0 ? `${formatCurrency(diferenciaOriginal)} de recargo` : 'el monto original restablecido'}.
                        </p>
                    </div>
                )}

                <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                        <label className="block text-sm font-medium text-gray-700">Motivo del ajuste *</label>
                        <span className="text-xs text-gray-400">{(ajusteData.motivo || '').length}/200</span>
                    </div>
                    <textarea
                        value={ajusteData.motivo}
                        onChange={(event) => setAjusteData((current) => ({ ...current, motivo: event.target.value }))}
                        required maxLength={200} rows={3} disabled={guardando}
                        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
                        placeholder="Ej.: Beca especial, corrección del valor o recargo acordado"
                    />
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                    <button type="button" onClick={onClose} disabled={guardando} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancelar</button>
                    <button type="submit" disabled={guardando || !Number.isFinite(nuevoMonto) || nuevoMonto <= 0 || diferenciaActual === 0 || !ajusteData.motivo?.trim()} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50">
                        {guardando ? 'Guardando...' : 'Guardar nuevo monto'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AdjustmentModal;
