import Modal from '../../Modal';

const IMPACT_OPTIONS = [
    { value: 'ingreso', label: 'Ingreso real', help: 'Suma a los ingresos y forma parte del estado de cuenta.' },
    { value: 'ajuste', label: 'Ajuste o bonificación', help: 'Reduce el saldo pendiente, pero no suma a los ingresos.' },
    { value: 'informativo', label: 'Registro informativo', help: 'Queda en el historial sin modificar saldos ni ingresos.' },
];

const CATEGORY_OPTIONS = [
    ['beca', 'Beca'],
    ['descuento', 'Descuento'],
    ['bonificacion', 'Bonificación'],
    ['cortesia', 'Cortesía'],
    ['saldo_inicial', 'Saldo inicial'],
    ['registro_historico', 'Registro histórico'],
    ['correccion', 'Corrección administrativa'],
    ['otro', 'Otro'],
];

const PaymentImpactModal = ({ isOpen, onClose, data, setData, onSave, saving }) => {
    const noComputable = data.impacto_financiero !== 'ingreso';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Clasificar movimiento">
            <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); onSave(); }}>
                <div>
                    <p className="text-sm font-semibold text-gray-900">{data.pago?.concepto || 'Movimiento'}</p>
                    <p className="mt-1 text-xs text-gray-500">
                        {data.pago ? `${data.pago.alumno_nombre} ${data.pago.alumno_apellido}` : ''}
                    </p>
                </div>

                <div className="space-y-2">
                    {IMPACT_OPTIONS.map((option) => (
                        <label key={option.value} className={`block cursor-pointer rounded-xl border p-4 transition-colors ${data.impacto_financiero === option.value ? 'border-zinc-900 bg-zinc-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <span className="flex items-start gap-3">
                                <input
                                    type="radio"
                                    name="impacto_financiero"
                                    value={option.value}
                                    checked={data.impacto_financiero === option.value}
                                    onChange={(event) => setData((current) => ({ ...current, impacto_financiero: event.target.value, categoria_movimiento: event.target.value === 'ingreso' ? '' : current.categoria_movimiento }))}
                                    className="mt-1"
                                />
                                <span>
                                    <span className="block text-sm font-semibold text-gray-900">{option.label}</span>
                                    <span className="mt-1 block text-xs leading-relaxed text-gray-500">{option.help}</span>
                                </span>
                            </span>
                        </label>
                    ))}
                </div>

                {noComputable && (
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Categoría *</label>
                        <select
                            value={data.categoria_movimiento}
                            onChange={(event) => setData((current) => ({ ...current, categoria_movimiento: event.target.value }))}
                            required
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="">Seleccionar categoría...</option>
                            {CATEGORY_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                    </div>
                )}

                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-700">Descripción {noComputable ? '*' : '(Opcional)'}</label>
                        <span className="text-xs text-gray-400">{(data.notas_pago || '').length}/500</span>
                    </div>
                    <textarea
                        value={data.notas_pago}
                        onChange={(event) => setData((current) => ({ ...current, notas_pago: event.target.value }))}
                        required={noComputable}
                        maxLength={500}
                        rows={4}
                        className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-black"
                        placeholder="Explicá por qué este movimiento no debe contarse como ingreso"
                    />
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                    <button type="button" onClick={onClose} disabled={saving} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
                    <button type="submit" disabled={saving} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar clasificación'}</button>
                </div>
            </form>
        </Modal>
    );
};

export default PaymentImpactModal;
