import Modal from '../../Modal';
import Button from '../../Button';
import { PlusIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';

const StudentModal = ({
    isOpen,
    onClose,
    editando,
    formData,
    setFormData,
    handleSubmit,
    cursos,
    saving
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={editando ? 'Editar Alumno' : 'Nuevo Alumno'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex justify-center mb-6">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                            {formData.previewUrl || formData.foto_perfil ? (
                                <img
                                    src={formData.previewUrl || `http://localhost:5000${formData.foto_perfil}`}
                                    alt="Perfil"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserIcon className="w-12 h-12 text-gray-500" />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full cursor-pointer hover:bg-gray-50 transition-colors shadow-lg border border-gray-200">
                            <PlusIcon className="w-4 h-4 text-gray-400" />
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        setFormData({
                                            ...formData,
                                            foto_perfil: file,
                                            previewUrl: URL.createObjectURL(file)
                                        });
                                    }
                                }}
                            />

                        </label>
                        {saving && <div className="absolute inset-0 bg-white/50 rounded-full z-10" />}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={saving}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                    <input
                        type="text"
                        value={formData.apellido}
                        onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={saving}
                        required
                    />
                </div>

                {!editando && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email de Contacto (Padre/Tutor)
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    email: e.target.value,
                                    email_padre: e.target.value // Usar el mismo email para ambos campos
                                })}
                                className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={saving}
                                required
                                placeholder="correo@ejemplo.com"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Este correo se usará para el acceso al sistema y comunicaciones
                            </p>
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">DNI</label>
                    <input
                        type="text"
                        value={formData.dni}
                        onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Nacimiento</label>
                    <input
                        type="date"
                        value={formData.fecha_nacimiento}
                        onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Padre/Tutor</label>
                    <input
                        type="text"
                        value={formData.nombre_padre}
                        onChange={(e) => setFormData({ ...formData, nombre_padre: e.target.value })}
                        className={`w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={saving}
                        placeholder="Nombre completo"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                    <input
                        type="text"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                    <textarea
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent outline-none resize-none"
                        rows={3}
                    />
                </div>

                {/* Course Enrollment Selection */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-900 mb-3">Inscribir en Cursos (Opcional)</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                        {cursos.filter(c => c.activo).length > 0 ? (
                            cursos.filter(c => c.activo).map(curso => (
                                <label
                                    key={curso.id}
                                    className={`flex items-center space-x-3 p-2 rounded hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm ${saving ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        disabled={saving}
                                        checked={formData.cursoIds.includes(String(curso.id))}
                                        onChange={(e) => {
                                            const cursoId = String(curso.id);
                                            const isChecked = e.target.checked;

                                            // 1. Actualizar lista de cursos
                                            let newCursoIds;
                                            if (isChecked) {
                                                newCursoIds = [...formData.cursoIds, cursoId];
                                            } else {
                                                newCursoIds = formData.cursoIds.filter(id => id !== cursoId);
                                            }

                                            // 2. Sincronizar Pagos (Agregar/Quitar Mensualidad del curso)
                                            let newPagos = [...(formData.pagosIniciales || [])];
                                            const conceptoCurso = `Mensualidad ${curso.nombre}`;

                                            if (isChecked) {
                                                // Agregar pago si no existe uno igual
                                                const existe = newPagos.some(p => p.concepto === conceptoCurso);
                                                if (!existe) {
                                                    newPagos.push({
                                                        monto: '', // Se deja vacío para que el usuario ponga el precio
                                                        concepto: conceptoCurso,
                                                        es_mensual: true,
                                                        fecha_vencimiento: new Date().toISOString().split('T')[0]
                                                    });
                                                }
                                            } else {
                                                // Quitar el pago asociado a este curso
                                                newPagos = newPagos.filter(p => p.concepto !== conceptoCurso);
                                            }

                                            setFormData({
                                                ...formData,
                                                cursoIds: newCursoIds,
                                                pagosIniciales: newPagos
                                            });
                                        }}
                                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black focus:ring-2"
                                    />
                                    <span className="text-sm text-gray-700">
                                        {curso.nombre} <span className="text-gray-500">({curso.horario_dia} {curso.horario_hora})</span>
                                    </span>
                                </label>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 italic">No hay cursos activos disponibles</p>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                        Al seleccionar un curso, se añadirá automáticamente un pago sugerido abajo.
                    </p>
                </div>

                {/* Payment Configuration (Always visible now) */}
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-medium text-gray-900 uppercase tracking-wide">
                            {editando ? 'Generar Pagos' : 'Pagos Iniciales'}
                        </label>
                        <button
                            type="button"
                            onClick={() => setFormData({
                                ...formData,
                                pagosIniciales: [
                                    ...(formData.pagosIniciales || []),
                                    {
                                        monto: '',
                                        concepto: 'Mensualidad',
                                        es_mensual: true,
                                        fecha_vencimiento: new Date().toISOString().split('T')[0]
                                    }
                                ]
                            })}
                            className="text-xs flex items-center space-x-1 text-gray-600 hover:text-black transition-colors"
                        >
                            <PlusIcon className="h-3 w-3" />
                            <span>Agregar</span>
                        </button>
                    </div>

                    <div className="space-y-2">
                        <div className="flex space-x-2 px-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                            <div className="w-1/3">Concepto</div>
                            <div className="w-1/4">Monto</div>
                            <div className="w-1/4">Vencimiento</div>
                            <div className="w-auto">Opts</div>
                        </div>
                        {(formData.pagosIniciales || []).map((pago, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-white p-1.5 rounded border border-gray-200 shadow-sm">
                                <div className="w-1/3">
                                    <input
                                        type="text"
                                        list={`conceptos-sugeridos-${index}`}
                                        value={pago.concepto}
                                        onChange={(e) => {
                                            const newPagos = formData.pagosIniciales.map((p, i) =>
                                                i === index ? { ...p, concepto: e.target.value } : p
                                            );
                                            setFormData({ ...formData, pagosIniciales: newPagos });
                                        }}
                                        className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded px-2 py-1 focus:ring-1 focus:ring-black focus:border-transparent placeholder-gray-400 outline-none"
                                        placeholder="Concepto"
                                    />
                                    <datalist id={`conceptos-sugeridos-${index}`}>
                                        <option value="Matrícula" />
                                        <option value="Mensualidad" />
                                        <option value="Uniforme" />
                                    </datalist>
                                </div>
                                <div className="w-1/4">
                                    <input
                                        type="number"
                                        value={pago.monto}
                                        placeholder="$"
                                        onChange={(e) => {
                                            const newPagos = formData.pagosIniciales.map((p, i) =>
                                                i === index ? { ...p, monto: e.target.value } : p
                                            );
                                            setFormData({ ...formData, pagosIniciales: newPagos });
                                        }}
                                        className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded px-2 py-1 focus:ring-1 focus:ring-black focus:border-transparent placeholder-gray-400 outline-none"
                                    />
                                </div>
                                <div className="w-1/4">
                                    <input
                                        type="date"
                                        value={pago.fecha_vencimiento || new Date().toISOString().split('T')[0]}
                                        onChange={(e) => {
                                            const newPagos = formData.pagosIniciales.map((p, i) =>
                                                i === index ? { ...p, fecha_vencimiento: e.target.value } : p
                                            );
                                            setFormData({ ...formData, pagosIniciales: newPagos });
                                        }}
                                        className="w-full bg-white border border-gray-300 text-gray-900 text-xs rounded px-2 py-1 focus:ring-1 focus:ring-black focus:border-transparent outline-none"
                                    />
                                </div>
                                <div className="w-auto flex items-center space-x-1">
                                    <label className="text-xs text-gray-500 flex items-center cursor-pointer hover:text-black transition-colors" title="Es mensual">
                                        <input
                                            type="checkbox"
                                            checked={pago.es_mensual}
                                            onChange={(e) => {
                                                const newPagos = formData.pagosIniciales.map((p, i) =>
                                                    i === index ? { ...p, es_mensual: e.target.checked } : p
                                                );
                                                setFormData({ ...formData, pagosIniciales: newPagos });
                                            }}
                                            className="w-3 h-3 rounded bg-white border-gray-300 text-black focus:ring-black checked:bg-black checked:border-black"
                                        />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newPagos = formData.pagosIniciales.filter((_, i) => i !== index);
                                            setFormData({ ...formData, pagosIniciales: newPagos });
                                        }}
                                        className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <TrashIcon className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {(formData.pagosIniciales || []).length === 0 && (
                            <p className="text-xs text-gray-500 text-center py-2">
                                No hay pagos configurados.
                            </p>
                        )}
                    </div>
                </div>



                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        disabled={saving}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors flex items-center shadow-lg"
                    >
                        {saving ? 'Guardando...' : (formData.id ? 'Guardar Cambios' : 'Registrar Alumno')}
                    </button>
                </div>
            </form>
        </Modal >
    );
};

export default StudentModal;


