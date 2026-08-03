import Modal from '../../Modal';

const PaymentNoteModal = ({
    isOpen,
    onClose,
    pago,
    nota,
    setNota,
    guardarNota,
    guardando
}) => (
    <Modal isOpen={isOpen} onClose={onClose} title="Nota del Pago">
        <form
            className="space-y-5"
            onSubmit={(event) => {
                event.preventDefault();
                guardarNota();
            }}
        >
            {pago && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <p className="font-semibold text-gray-900">
                        {pago.alumno_nombre} {pago.alumno_apellido}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">{pago.concepto}</p>
                </div>
            )}

            <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                    <label htmlFor="payment-note" className="text-sm font-medium text-gray-700">
                        Descripción / Nota interna
                    </label>
                    <span className="text-xs text-gray-400">{nota.length}/500</span>
                </div>
                <textarea
                    id="payment-note"
                    value={nota}
                    onChange={(event) => setNota(event.target.value)}
                    maxLength={500}
                    rows={5}
                    autoFocus
                    disabled={guardando}
                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-black disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Ej.: Mensualidad ajustada por promoción familiar"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                    Solo será visible en la administración. Déjala vacía para eliminarla.
                </p>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={guardando}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={guardando}
                    className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {guardando ? 'Guardando...' : 'Guardar Nota'}
                </button>
            </div>
        </form>
    </Modal>
);

export default PaymentNoteModal;
