import Modal from '../../Modal';

const EventoFormModal = ({ isOpen, onClose, onSubmit, editando, formData, setFormData }) => {
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
                            onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
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
                    <button type="button" onClick={onClose} className="btn btn-secondary">
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                        {editando ? 'Guardar Cambios' : 'Crear Evento'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EventoFormModal;
