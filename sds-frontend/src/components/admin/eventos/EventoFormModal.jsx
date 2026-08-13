import Modal from '../../Modal';

const EventoFormModal = ({ isOpen, onClose, onSubmit, editando, formData, setFormData, isSubmitting = false }) => {
    const totalCentavos = Math.max(0, Math.round((Number(formData.costo) || 0) * 100));
    const cantidadCuotas = Math.max(2, Number.parseInt(formData.cantidad_cuotas, 10) || 2);
    const cuotaBase = Math.floor(totalCentavos / cantidadCuotas);
    const ultimaCuota = totalCentavos - (cuotaBase * (cantidadCuotas - 1));
    const formatCurrency = (centavos) => {
        const usaDecimales = centavos % 100 !== 0;
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: usaDecimales ? 2 : 0,
            maximumFractionDigits: usaDecimales ? 2 : 0
        }).format(centavos / 100);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editando ? 'Editar Evento' : 'Nuevo Evento'}>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Nombre del Evento</label>
                    <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="input w-full"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Tipo</label>
                        <select
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                            className="input w-full"
                            required
                        >
                            <option value="Presentación">Presentación</option>
                            <option value="Competencia">Competencia</option>
                            <option value="Ensayo">Ensayo</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Fecha</label>
                        <input
                            type="date"
                            value={formData.fecha}
                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                            className="input w-full"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Hora</label>
                        <input
                            type="time"
                            value={formData.hora}
                            onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                            className="input w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Lugar</label>
                        <input
                            type="text"
                            value={formData.lugar}
                            onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                            className="input w-full"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Descripción</label>
                    <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        className="input w-full"
                        rows="3"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Costo</label>
                        <input
                            type="number"
                            value={formData.costo}
                            onChange={(e) => {
                                const costo = e.target.value;
                                setFormData({
                                    ...formData,
                                    costo,
                                    ...(Number(costo) > 0 ? {} : { modalidad_pago: 'unico', fecha_primera_cuota: '' })
                                });
                            }}
                            className="input w-full"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Cupo Máximo</label>
                        <input
                            type="number"
                            value={formData.cupo_maximo}
                            onChange={(e) => setFormData({ ...formData, cupo_maximo: e.target.value })}
                            className="input w-full"
                            min="0"
                        />
                    </div>
                </div>

                {totalCentavos > 0 && (
                    <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Forma de pago del evento</h3>
                            <p className="mt-1 text-xs text-gray-500">
                                Se aplicará al costo principal cuando inscribas a cada alumno.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 rounded-lg border border-gray-300 bg-white p-1">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, modalidad_pago: 'unico' })}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition ${formData.modalidad_pago !== 'cuotas' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                Pago único
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, modalidad_pago: 'cuotas' })}
                                className={`rounded-md px-3 py-2 text-sm font-medium transition ${formData.modalidad_pago === 'cuotas' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                Pago en cuotas
                            </button>
                        </div>

                        {formData.modalidad_pago === 'cuotas' && (
                            <>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-600">Número de cuotas</label>
                                        <input
                                            type="number"
                                            min="2"
                                            max="24"
                                            value={formData.cantidad_cuotas}
                                            onChange={(e) => setFormData({ ...formData, cantidad_cuotas: e.target.value })}
                                            className="input w-full"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-600">Fecha primera cuota</label>
                                        <input
                                            type="date"
                                            value={formData.fecha_primera_cuota}
                                            onChange={(e) => setFormData({ ...formData, fecha_primera_cuota: e.target.value })}
                                            className="input w-full"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                                    {cantidadCuotas} cuotas: {cantidadCuotas > 1 && `${cantidadCuotas - 1} de ${formatCurrency(cuotaBase)} y `}
                                    la última de {formatCurrency(ultimaCuota)}.
                                </div>
                            </>
                        )}

                        <p className="text-xs leading-5 text-gray-500">
                            Vestuario, maquillaje y peinado se mantendrán como cobros separados. Si editas esta opción, solo afectará a futuras inscripciones.
                        </p>
                    </div>
                )}

                <div className="space-y-4 p-4 bg-white border border-gray-100 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-600">Requisitos Adicionales (Opcional)</h3>

                    {/* Vestimenta/Vestuario */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-2">Vestimenta/Vestuario</label>
                            <input
                                type="text"
                                value={formData.vestimenta}
                                onChange={(e) => setFormData({ ...formData, vestimenta: e.target.value })}
                                className="input w-full"
                                placeholder="Ej: Tutú blanco con zapatillas de punta"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Costo 👗</label>
                            <input
                                type="number"
                                value={formData.costo_vestuario}
                                onChange={(e) => setFormData({ ...formData, costo_vestuario: e.target.value })}
                                className="input w-full"
                                min="0"
                                step="0.01"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Maquillaje */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-2">Maquillaje</label>
                            <input
                                type="text"
                                value={formData.maquillaje}
                                onChange={(e) => setFormData({ ...formData, maquillaje: e.target.value })}
                                className="input w-full"
                                placeholder="Ej: Maquillaje natural con labios rojos"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Costo 💄</label>
                            <input
                                type="number"
                                value={formData.costo_maquillaje}
                                onChange={(e) => setFormData({ ...formData, costo_maquillaje: e.target.value })}
                                className="input w-full"
                                min="0"
                                step="0.01"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Peinado */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-600 mb-2">Peinado</label>
                            <input
                                type="text"
                                value={formData.peinado}
                                onChange={(e) => setFormData({ ...formData, peinado: e.target.value })}
                                className="input w-full"
                                placeholder="Ej: Moño alto con red"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-2">Costo 💇</label>
                            <input
                                type="number"
                                value={formData.costo_peinado}
                                onChange={(e) => setFormData({ ...formData, costo_peinado: e.target.value })}
                                className="input w-full"
                                min="0"
                                step="0.01"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting} aria-busy={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : (editando ? 'Guardar Cambios' : 'Crear Evento')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EventoFormModal;
