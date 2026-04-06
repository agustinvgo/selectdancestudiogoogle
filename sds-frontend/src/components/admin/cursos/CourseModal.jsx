import Modal from '../../Modal';
import MultiSelect from '../../ui/MultiSelect';

const CourseModal = ({
    isOpen,
    onClose,
    editando,
    formData,
    setFormData,
    handleSubmit,
    profesores,
    saving
}) => {
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const niveles = ['Level 1', 'Level 2', 'Level 3', 'All Levels'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editando ? 'Editar Curso' : 'Nuevo Curso'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Curso</label>
                    <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        placeholder="Ej: Salsa Cubana"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                        rows="3"
                        placeholder="Detalles sobre el curso..."
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <MultiSelect
                            label="Nivel"
                            options={niveles}
                            selected={formData.nivel}
                            onChange={(value) => setFormData({ ...formData, nivel: value })}
                        />
                    </div>
                    <div>
                        <MultiSelect
                            label="Categoría"
                            options={['Baby', 'Mini', 'Junior', 'Teen', 'Senior']}
                            selected={formData.categoria}
                            onChange={(value) => setFormData({ ...formData, categoria: value })}
                        />
                    </div>
                    <div>
                        <MultiSelect
                            label="Tipo"
                            options={['Recreative', 'Pre Competitive', 'Competitive']}
                            selected={formData.tipo}
                            onChange={(value) => setFormData({ ...formData, tipo: value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
                        <select
                            value={formData.horario_dia}
                            onChange={(e) => setFormData({ ...formData, horario_dia: e.target.value })}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        >
                            {diasSemana.map(dia => (
                                <option key={dia} value={dia}>{dia}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                            <input
                                type="time"
                                value={formData.horario_hora}
                                onChange={(e) => setFormData({ ...formData, horario_hora: e.target.value })}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
                            <input
                                type="number"
                                value={formData.duracion_minutos}
                                onChange={(e) => setFormData({ ...formData, duracion_minutos: Number(e.target.value) })}
                                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                                min="30"
                                step="15"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cupo Máximo</label>
                        <input
                            type="number"
                            value={formData.cupo_maximo}
                            onChange={(e) => setFormData({ ...formData, cupo_maximo: Number(e.target.value) })}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            min="1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profesor</label>
                        <select
                            value={formData.profesor_id || ""}
                            onChange={(e) => {
                                const selectedId = e.target.value;
                                setFormData({
                                    ...formData,
                                    profesor_id: selectedId ? parseInt(selectedId) : null
                                });
                            }}
                            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                        >
                            <option value="">Seleccionar Profesor</option>
                            {profesores.map(prof => (
                                <option key={prof.id} value={prof.id}>
                                    {prof.nombre} {prof.apellido}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center pt-2">
                    <input
                        type="checkbox"
                        id="activo"
                        checked={formData.activo}
                        onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2"
                    />
                    <label htmlFor="activo" className="ml-2 text-sm text-gray-700">Curso activo</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-black transition-colors"
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors flex items-center shadow-lg"
                    >
                        {saving ? 'Guardando...' : (editando ? 'Guardar Cambios' : 'Crear Curso')}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CourseModal;


