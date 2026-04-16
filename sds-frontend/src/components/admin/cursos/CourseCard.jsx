import { PencilIcon, TrashIcon, UserGroupIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CourseCard = ({
    curso,
    isExpanded,
    onToggle,
    participantes,
    loadingParticipantes,
    alumnos,
    isProfesor,
    onEdit,
    onDelete,
    onEnroll,
    onUnenroll
}) => {
    // Calculamos alumnos disponibles para inscribir (que no estén ya en la lista de participantes)
    const inscritosIds = participantes.map(p => p.id);
    const alumnosDisponibles = alumnos.filter(a => !inscritosIds.includes(a.id));

    return (
        <div
            className={`group flex flex-col h-full bg-white rounded-xl border transition-all duration-200 ${curso.activo ? 'border-gray-200 hover:border-gray-300 hover:shadow-sm' : 'border-gray-100 bg-gray-50/50'
                }`}
        >
            <div className="p-5 flex-1">
                {/* Encabezado de la Tarjeta */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className={`text-lg font-bold mb-2 ${curso.activo ? 'text-gray-900' : 'text-gray-500'}`}>
                            {curso.nombre}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {/* Helper para asegurar array y parsear niveles */}
                            {(() => {
                                const parseLevels = (data) => {
                                    if (!data) return [];
                                    try {
                                        if (typeof data === 'string') {
                                            if (data.trim().startsWith('[')) {
                                                const parsed = JSON.parse(data);
                                                return parseLevels(parsed);
                                            }
                                            return [data];
                                        }
                                        if (Array.isArray(data)) {
                                            return data.flatMap(item => parseLevels(item)).filter(Boolean);
                                        }
                                        return [String(data)];
                                    } catch {
                                        return [String(data)];
                                    }
                                };

                                const getLevelStyle = (nivel) => {
                                    const n = String(nivel).toLowerCase();
                                    if (n.includes('level 1') || n.includes('principiante')) return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20';
                                    if (n.includes('level 2') || n.includes('intermedio')) return 'bg-blue-50 text-blue-700 ring-blue-600/20';
                                    if (n.includes('level 3') || n.includes('avanzado')) return 'bg-purple-50 text-purple-700 ring-purple-600/20';

                                    if (n.includes('baby')) return 'bg-pink-50 text-pink-700 ring-pink-600/20';
                                    if (n.includes('mini')) return 'bg-orange-50 text-orange-700 ring-orange-600/20';
                                    return 'bg-gray-50 text-gray-700 ring-gray-600/20';
                                };

                                const formatLevel = (l) => {
                                    const s = String(l).trim();
                                    if (s === '1' || s.toLowerCase().includes('principiante')) return 'Level 1';
                                    if (s === '2' || s.toLowerCase().includes('intermedio')) return 'Level 2';
                                    if (s === '3' || s.toLowerCase().includes('avanzado')) return 'Level 3';
                                    if (s.toLowerCase().includes('todos')) return 'All Levels';
                                    return s;
                                };

                                const niveles = [...new Set(parseLevels(curso.nivel).map(formatLevel))];
                                const categorias = [...new Set(parseLevels(curso.categoria))];
                                const tipos = [...new Set(parseLevels(curso.tipo))];

                                return (
                                    <>
                                        {/* Nivel Badges */}
                                        {niveles.map((nivel, idx) => (
                                            <span key={`nivel-${idx}`} className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium ring-1 ring-inset ${getLevelStyle(nivel)}`}>
                                                {nivel}
                                            </span>
                                        ))}

                                        {/* Categoría Badges */}
                                        {categorias.map((cat, idx) => (
                                            <span key={`cat-${idx}`} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                                {cat}
                                            </span>
                                        ))}

                                        {/* Tipo Badges */}
                                        {tipos.map((tipo, idx) => (
                                            <span key={`tipo-${idx}`} className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium ring-1 ring-inset ${String(tipo).toLowerCase().includes('competi') ? 'bg-amber-50 text-amber-700 ring-amber-600/20' : 'bg-slate-50 text-slate-600 ring-slate-500/10'
                                                }`}>
                                                {tipo}
                                            </span>
                                        ))}

                                        {!curso.activo && (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                Inactivo
                                            </span>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                    {!isProfesor && (
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                            <button
                                onClick={() => onEdit(curso)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                                title="Editar"
                            >
                                <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onDelete(curso.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Eliminar"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Info del Curso */}
                <div className="space-y-3 text-sm text-gray-600 mb-6">
                    <div className="flex items-center justify-between py-1 border-b border-gray-50 dark:border-gray-50">
                        <span className="text-gray-500">Horario</span>
                        <span className="font-medium text-gray-900">
                            {curso.horario_dia} {curso.horario_hora?.slice(0, 5)} - {curso.hora_fin?.slice(0, 5)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-50">
                        <span className="text-gray-500">Duración</span>
                        <span className="font-medium text-gray-900">{curso.duracion_minutos} min</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-50">
                        <span className="text-gray-500">Profesor</span>
                        <span className="font-medium text-gray-900 truncate max-w-[120px] text-right" title={curso.nombre_profesor ? `${curso.nombre_profesor} ${curso.apellido_profesor || ''}`.trim() : ''}>
                            {curso.nombre_profesor
                                ? `${curso.nombre_profesor} ${curso.apellido_profesor || ''}`.trim()
                                : (curso.profesor || <span className="text-gray-400 italic">No asignado</span>)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                        <span className="text-gray-500">Cupo</span>
                        <span className={`font-medium ${curso.alumnos_inscritos >= curso.cupo_maximo ? 'text-red-600' : 'text-zinc-700'
                            }`}>
                            {curso.alumnos_inscritos} <span className="text-gray-400">/ {curso.cupo_maximo}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer / Expansion */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                <button
                    onClick={onToggle}
                    className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm font-medium transition-all ${isExpanded
                        ? 'bg-zinc-900 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm'
                        }`}
                >
                    <UserGroupIcon className="h-4 w-4" />
                    <span>{isExpanded ? 'Ocultar Alumnos' : 'Gestionar Alumnos'}</span>
                </button>

                {/* Sección Expandible: Lista de Alumnos */}
                {isExpanded && (
                    <div className="mt-4 animate-fade-in-down">
                        {loadingParticipantes ? (
                            <div className="flex justify-center py-4">
                                <div className="h-4 w-4 rounded-full border-2 border-zinc-300 border-t-zinc-900 animate-spin"></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Lista de Inscritos */}
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                                        <span>Inscritos</span>
                                        <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px]">{participantes.length}</span>
                                    </h4>
                                    {participantes.length === 0 ? (
                                        <p className="text-gray-400 text-xs italic text-center py-2 border border-dashed border-gray-200 rounded-lg">
                                            Sin inscritos
                                        </p>
                                    ) : (
                                        <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                                            {participantes.map((alumno) => (
                                                <div key={alumno.id} className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-colors group/item">
                                                    <span className="text-sm text-gray-700 truncate">
                                                        {alumno.nombre} {alumno.apellido}
                                                    </span>
                                                    {!isProfesor && (
                                                        <button
                                                            onClick={() => onUnenroll(curso.id, alumno.id)}
                                                            className="text-gray-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all p-1"
                                                            title="Desinscribir"
                                                        >
                                                            <XMarkIcon className="h-3.5 w-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Agregar Alumno */}
                                {!isProfesor && (
                                    <div className="pt-3 border-t border-gray-200/50">
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                            Inscribir Nuevo
                                        </h4>
                                        <div className="max-h-40 overflow-y-auto space-y-1 custom-scrollbar">
                                            {alumnosDisponibles.length === 0 ? (
                                                <p className="text-gray-400 text-xs italic text-center py-2">
                                                    Todos los alumnos están inscritos
                                                </p>
                                            ) : (
                                                alumnosDisponibles.map((alumno) => (
                                                    <button
                                                        key={alumno.id}
                                                        onClick={() => onEnroll(curso.id, alumno.id)}
                                                        className="w-full flex items-center justify-between p-2 text-left text-sm text-gray-600 hover:bg-zinc-50 rounded-lg transition-colors group/add"
                                                    >
                                                        <span className="truncate group-hover/add:text-zinc-900">
                                                            {alumno.nombre} {alumno.apellido}
                                                        </span>
                                                        <PlusIcon className="h-3.5 w-3.5 text-gray-300 group-hover/add:text-zinc-900" />
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseCard;


