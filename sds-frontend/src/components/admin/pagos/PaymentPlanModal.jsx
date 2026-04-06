import Modal from '../../Modal';

const PaymentPlanModal = ({
    isOpen,
    onClose,
    planCuotasData,
    setPlanCuotasData,
    crearPlanDeCuotas,
    alumnos
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crear Plan de Cuotas">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alumno</label>
                    <select
                        value={planCuotasData.alumno_id}
                        onChange={(e) => setPlanCuotasData({ ...planCuotasData, alumno_id: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        required
                    >
                        <option value="">Seleccionar alumno...</option>
                        {alumnos.map((alumno) => (
                            <option key={alumno.id} value={alumno.id}>
                                {alumno.nombre} {alumno.apellido}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Concepto</label>
                    <select
                        value={planCuotasData.concepto}
                        onChange={(e) => setPlanCuotasData({ ...planCuotasData, concepto: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    >
                        <option>Matrícula</option>
                        <option>Evento</option>
                        <option>Uniforme</option>
                        <option>Otro</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monto Total</label>
                        <input
                            type="number"
                            value={planCuotasData.monto_total}
                            onChange={(e) => setPlanCuotasData({ ...planCuotasData, monto_total: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            min="0"
                            step="100"
                            placeholder="Monto total a dividir"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Número de Cuotas</label>
                        <input
                            type="number"
                            value={planCuotasData.cuotas}
                            onChange={(e) => setPlanCuotasData({ ...planCuotasData, cuotas: parseInt(e.target.value) })}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            min="2"
                            max="12"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Primera Cuota</label>
                    <input
                        type="date"
                        value={planCuotasData.fecha_primera_cuota}
                        onChange={(e) => setPlanCuotasData({ ...planCuotasData, fecha_primera_cuota: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        required
                    />
                </div>

                {planCuotasData.monto_total && planCuotasData.cuotas > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-500">
                            Monto por cuota: <span className="text-gray-900 font-semibold">
                                ${(parseFloat(planCuotasData.monto_total) / planCuotasData.cuotas).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Se crearán {planCuotasData.cuotas} pagos mensuales
                        </p>
                    </div>
                )}

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
                        onClick={crearPlanDeCuotas}
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Crear Plan
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default PaymentPlanModal;

