import { useState } from 'react';
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

const AvailabilityManager = ({ disponibles, cursos, addSlotMutation, handleDeleteSlot }) => {
    const [newSlot, setNewSlot] = useState({ curso_id: '', fecha: '', horario: '', cupos: 10, weeks: 1, descripcion: '', titulo: '' });
    const [isEvent, setIsEvent] = useState(false);

    const handleAdd = (e) => {
        e.preventDefault();
        addSlotMutation.mutate(newSlot, {
            onSuccess: () => {
                setNewSlot({ curso_id: '', fecha: '', horario: '', cupos: 10, weeks: 1, descripcion: '', titulo: '' });
            }
        });
    };

    return (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm h-fit sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                Horarios Disponibles
            </h2>
            <p className="text-gray-500 text-xs mb-6 w-full leading-relaxed">
                Define qué cursos y fechas están habilitados para que los alumnos se anoten a probar.
            </p>

            <form onSubmit={handleAdd} className="space-y-4 mb-8">
                {/* Toggle Tipo */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => { setIsEvent(false); setNewSlot({ ...newSlot, titulo: '', curso_id: '' }); }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!isEvent ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Clase de Curso
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsEvent(true); setNewSlot({ ...newSlot, curso_id: '', titulo: '' }); }}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${isEvent ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Evento / Audición
                    </button>
                </div>

                {!isEvent ? (
                    <div>
                        <label className="block text-[11px] text-gray-500 uppercase font-bold mb-1">Curso</label>
                        <select
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-black outline-none transition-shadow"
                            value={newSlot.curso_id}
                            onChange={e => setNewSlot({ ...newSlot, curso_id: e.target.value })}
                            required
                        >
                            <option value="">Seleccionar Curso...</option>
                            {cursos.filter(c => c.activo).map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div>
                        <label className="block text-[11px] text-gray-500 uppercase font-bold mb-1">Nombre del Evento</label>
                        <input
                            type="text"
                            className="w-full bg-gray-50 border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg px-3 py-2 text-gray-900 text-sm outline-none transition-shadow"
                            placeholder="Ej: Audición Competencia, Masterclass..."
                            value={newSlot.titulo}
                            onChange={e => setNewSlot({ ...newSlot, titulo: e.target.value })}
                            required
                        />
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[11px] text-gray-500 uppercase font-bold mb-1">Fecha de Inicio</label>
                        <input
                            type="date"
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-black outline-none transition-shadow"
                            value={newSlot.fecha}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={e => setNewSlot({ ...newSlot, fecha: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] text-gray-500 uppercase font-bold mb-1">Hora</label>
                        <input
                            type="time"
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-black outline-none transition-shadow"
                            value={newSlot.horario}
                            onChange={e => setNewSlot({ ...newSlot, horario: e.target.value })}
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[11px] text-gray-500 uppercase font-bold mb-1">Notas / Descripción (Opcional)</label>
                    <textarea
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm resize-none focus:ring-2 focus:ring-black outline-none transition-shadow"
                        rows="2"
                        placeholder="Ej: Traer ropa cómoda, botella de agua, etc."
                        value={newSlot.descripcion}
                        onChange={e => setNewSlot({ ...newSlot, descripcion: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[11px] text-gray-500 uppercase font-bold mb-1">Cupos</label>
                        <input
                            type="number"
                            min="1"
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-black outline-none transition-shadow"
                            value={newSlot.cupos}
                            onChange={e => {
                                const val = e.target.value;
                                setNewSlot({ ...newSlot, cupos: val === '' ? '' : parseInt(val) });
                            }}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] text-gray-500 uppercase font-bold mb-1">Repetir</label>
                        <select
                            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 text-sm focus:ring-2 focus:ring-black outline-none transition-shadow"
                            value={newSlot.weeks || 1}
                            onChange={e => setNewSlot({ ...newSlot, weeks: parseInt(e.target.value) })}
                        >
                            <option value={1}>Solo una vez</option>
                            <option value={4}>Por 1 mes (4 semanas)</option>
                            <option value={8}>Por 2 meses (8 semanas)</option>
                        </select>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={addSlotMutation.isPending}
                    className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2"
                >
                    {addSlotMutation.isPending ? 'Agregando...' : 'Agregar Cupo'}
                </button>
            </form>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {disponibles.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <p className="text-gray-500 text-sm">No hay horarios definidos.</p>
                    </div>
                ) : (
                    Object.entries(disponibles.reduce((acc, slot) => {
                        const name = slot.curso_nombre || 'Sin nombre';
                        if (!acc[name]) acc[name] = [];
                        acc[name].push(slot);
                        return acc;
                    }, {})).map(([cursoName, slots]) => (
                        <div key={cursoName} className="bg-white rounded-lg overflow-hidden border border-gray-200">
                            <div className="bg-gray-50 px-3 py-2.5 border-b border-gray-200">
                                <h3 className="text-gray-900 font-bold text-sm">{cursoName}</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {slots.map(slot => (
                                    <div key={slot.id} className="p-3 flex justify-between items-center hover:bg-blue-50/50 transition-colors group">
                                        <div className="flex-1">
                                            <p className="text-gray-700 text-sm font-medium flex items-center mb-1">
                                                {(() => {
                                                    if (!slot.fecha) return 'Fecha inválida';
                                                    const dateStr = slot.fecha.substring(0, 10);
                                                    const [year, month, day] = dateStr.split('-');
                                                    const dateObj = new Date(year, month - 1, day);
                                                    return isNaN(dateObj.getTime())
                                                        ? slot.fecha
                                                        : dateObj.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' });
                                                })()} - {slot.horario}hs
                                                <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold tracking-wide">
                                                    {slot.cupos} vacantes
                                                </span>
                                            </p>
                                            {slot.descripcion && (
                                                <p className="text-xs text-gray-500 font-light border-l-2 border-gray-200 pl-2">
                                                    "{slot.descripcion}"
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteSlot(slot.id)}
                                            className="text-gray-400 hover:text-red-500 ml-2 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                            title="Eliminar horario"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AvailabilityManager;
