import Modal from '../../Modal';

const PaymentMethodModal = ({
    isOpen,
    onClose,
    metodoPagoSeleccionado,
    setMetodoPagoSeleccionado,
    confirmarPago,
    metodoOtroTexto,
    setMetodoOtroTexto,
    fechaPago,
    setFechaPago
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Pago">
            <div className="space-y-4">
                <p className="text-gray-600">Selecciona el método de pago utilizado:</p>

                <div className="space-y-2">
                    <label className="flex items-center p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="radio"
                            name="metodoPago"
                            value="efectivo"
                            checked={metodoPagoSeleccionado === 'efectivo'}
                            onChange={(e) => setMetodoPagoSeleccionado(e.target.value)}
                            className="mr-3 text-black focus:ring-black bg-white border-gray-300"
                        />
                        <span className="text-gray-900">💵 Efectivo</span>
                    </label>

                    <label className="flex items-center p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="radio"
                            name="metodoPago"
                            value="transferencia"
                            checked={metodoPagoSeleccionado === 'transferencia'}
                            onChange={(e) => setMetodoPagoSeleccionado(e.target.value)}
                            className="mr-3 text-black focus:ring-black bg-white border-gray-300"
                        />
                        <span className="text-gray-900">🏦 Transferencia Bancaria</span>
                    </label>

                    <label className="flex items-center p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="radio"
                            name="metodoPago"
                            value="tarjeta"
                            checked={metodoPagoSeleccionado === 'tarjeta'}
                            onChange={(e) => setMetodoPagoSeleccionado(e.target.value)}
                            className="mr-3 text-black focus:ring-black bg-white border-gray-300"
                        />
                        <span className="text-gray-900">💳 Tarjeta de Crédito/Débito</span>
                    </label>

                    <label className="flex items-center p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                            type="radio"
                            name="metodoPago"
                            value="otro"
                            checked={metodoPagoSeleccionado === 'otro'}
                            onChange={(e) => setMetodoPagoSeleccionado(e.target.value)}
                            className="mr-3 text-black focus:ring-black bg-white border-gray-300"
                        />
                        <span className="text-gray-900">✏️ Otro</span>
                    </label>

                    {metodoPagoSeleccionado === 'otro' && (
                        <input
                            type="text"
                            value={metodoOtroTexto}
                            onChange={(e) => setMetodoOtroTexto(e.target.value)}
                            placeholder="Especifica el método de pago..."
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none mt-2"
                        />
                    )}
                </div>

                {/* Fecha de Pago Selection */}
                <div className="mb-4">
                    <label className="text-gray-700 text-sm mb-1 block">Fecha de Pago</label>
                    <input
                        type="date"
                        value={fechaPago}
                        onChange={(e) => setFechaPago(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
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
                        onClick={confirmarPago}
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Confirmar Pago
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PaymentMethodModal;

