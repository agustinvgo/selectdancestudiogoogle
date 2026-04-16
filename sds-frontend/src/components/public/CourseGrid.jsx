import { ClockIcon, UserIcon, CalendarIcon } from '@heroicons/react/24/outline';

const CourseGrid = ({ cursos, onSelectCourse }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {cursos.map((curso, index) => {
                // Helpers
                const parseData = (data) => {
                    if (!data) return [];
                    try {
                        if (typeof data === 'string') {
                            if (data.trim().startsWith('[')) {
                                const parsed = JSON.parse(data);
                                return parseData(parsed);
                            }
                            return [data];
                        }
                        if (Array.isArray(data)) {
                            return data.flatMap(item => parseData(item)).filter(Boolean);
                        }
                        return [String(data)];
                    } catch (e) {
                        return [String(data)];
                    }
                };

                const formatLevel = (l) => {
                    const s = String(l).trim();
                    if (s === '1') return 'Principiante';
                    if (s === '2') return 'Intermedio';
                    if (s === '1' || s.toLowerCase().includes('principiante')) return 'Level 1';
                    if (s === '2' || s.toLowerCase().includes('intermedio')) return 'Level 2';
                    if (s === '3' || s.toLowerCase().includes('avanzado')) return 'Level 3';
                    if (s.toLowerCase().includes('todos')) return 'All Levels';
                    return s;
                };

                const getLevelStyle = (nivel) => {
                    const n = nivel?.toLowerCase() || '';
                    if (n.includes('level 1') || n.includes('principiante')) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
                    if (n.includes('level 2') || n.includes('intermedio')) return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
                    if (n.includes('level 3') || n.includes('avanzado')) return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
                    if (n.includes('all levels') || n.includes('todos')) return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';

                    if (n.includes('baby')) return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20';
                    if (n.includes('mini')) return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
                    if (n.includes('junior')) return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20';
                    if (n.includes('teen')) return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
                    if (n.includes('senior')) return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
                    if (n.includes('recreative')) return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
                    return 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-700';
                };

                // Data Processing
                const rawLevels = parseData(curso.nivel);
                const levels = [...new Set(rawLevels.map(formatLevel))];
                const rawTypes = parseData(curso.tipo);
                const isPreCompetitive = rawTypes.some(t => String(t).toLowerCase().includes('pre competi') || String(t).toLowerCase().includes('pre-competi') || String(t).toLowerCase().includes('precompeti'));
                const isCompetitive = !isPreCompetitive && rawTypes.some(t => String(t).toLowerCase().includes('competi'));
                const isRecreative = rawTypes.some(t => String(t).toLowerCase().includes('recreative') || String(t).toLowerCase().includes('recreativo'));

                // Card Style Logic
                const calculateEndTime = (startTime, durationMinutes) => {
                    if (!startTime || !durationMinutes) return '';
                    const [hours, minutes] = startTime.split(':').map(Number);
                    const date = new Date();
                    date.setHours(hours, minutes, 0, 0);
                    date.setMinutes(date.getMinutes() + Number(durationMinutes));
                    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                };

                const formatTime = (time) => {
                    if (!time) return '';
                    return time.substring(0, 5);
                };

                const startTimeFormatted = formatTime(curso.horario_hora);
                const endTimeFormatted = calculateEndTime(curso.horario_hora, curso.duracion_minutos);

                const cardBaseStyle = "group relative cursor-pointer animate-fade-in-up transition-all duration-300 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden p-8 border";
                const cardTypeStyle = isCompetitive
                    ? "bg-red-500/10 dark:bg-red-900/20 border-red-400/60 dark:border-red-600/50 hover:border-red-500 dark:hover:border-red-400"
                    : isPreCompetitive
                        ? "bg-purple-500/10 dark:bg-purple-900/20 border-purple-400/60 dark:border-purple-600/50 hover:border-purple-500 dark:hover:border-purple-400"
                        : isRecreative
                            ? "bg-cyan-400/10 dark:bg-cyan-900/20 border-cyan-400/60 dark:border-cyan-500/50 hover:border-cyan-400 dark:hover:border-cyan-300"
                            : "bg-[#F2F2F2] dark:bg-zinc-900/40 border-gray-100 dark:border-white/5 hover:border-red-500/30 dark:hover:border-red-500/30";

                const gpuStyle = { willChange: 'transform, box-shadow' };

                const formatTitle = (name) => {
                    // Match " I - II", " I-II", " I", " II", " III" at end of string
                    // This regex looks for space + roman numerals (I, V, X) and optional hyphens at end
                    const romanPattern = /\s+([IVX]+(?:\s*-\s*[IVX]+)*)$/;
                    const match = name.match(romanPattern);

                    if (match) {
                        const mainPart = name.replace(romanPattern, '');
                        const suffix = match[1];
                        return (
                            <>
                                {mainPart}
                                <br />
                                <span className="text-xl opacity-90">{suffix}</span>
                            </>
                        );
                    }
                    return name;
                };

                return (
                    <div
                        key={curso.id}
                        className={`${cardBaseStyle} ${cardTypeStyle}`}
                        style={{ ...gpuStyle, animationDelay: `${index * 50}ms` }}
                        onClick={() => onSelectCourse(curso)}
                    >
                        {/* Decorative Gradient based on type - Only for Competitive and Recreative */}
                        {isCompetitive && (
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-red-500 via-transparent to-red-700"></div>
                        )}
                        {isPreCompetitive && (
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-purple-500 via-transparent to-purple-700"></div>
                        )}
                        {isRecreative && (
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br from-cyan-400 via-transparent to-cyan-600"></div>
                        )}

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className={`text-2xl font-bold transition-colors uppercase italic tracking-tighter ${isCompetitive ? 'text-red-900 dark:text-red-200 group-hover:text-red-500'
                                    : isPreCompetitive ? 'text-purple-900 dark:text-purple-200 group-hover:text-purple-500'
                                        : isRecreative ? 'text-cyan-900 dark:text-cyan-100 group-hover:text-cyan-500'
                                            : 'text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-500'
                                    }`}>
                                    {formatTitle(curso.nombre)}
                                </h3>

                                <div className="flex flex-wrap gap-2 justify-end max-w-[50%]">
                                    {/* Categories */}
                                    {(() => {
                                        const rawCategories = parseData(curso.categoria);
                                        const categories = [...new Set(rawCategories.map(c => String(c).trim()).filter(Boolean))];
                                        return categories.map((cat, idx) => (
                                            <span
                                                key={`cat-${idx}`}
                                                className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest uppercase border rounded-full backdrop-blur-sm bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                                            >
                                                {cat}
                                            </span>
                                        ));
                                    })()}

                                    {/* Levels */}
                                    {levels.map((lvl, idx) => (
                                        <span
                                            key={idx}
                                            className={`inline-block px-3 py-1 text-[10px] font-bold tracking-widest uppercase border rounded-full backdrop-blur-sm ${getLevelStyle(lvl)}`}
                                        >
                                            {lvl}
                                        </span>
                                    ))}
                                    {/* Optional: Show Competitive Badge if needed, or rely on card color */}
                                    {isCompetitive && (
                                        <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest uppercase border rounded-full backdrop-blur-sm bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40">
                                            COMPETITIVE
                                        </span>
                                    )}
                                    {isPreCompetitive && (
                                        <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest uppercase border rounded-full backdrop-blur-sm bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40">
                                            PRE-COMPETITIVE
                                        </span>
                                    )}
                                    {isRecreative && (
                                        <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest uppercase border rounded-full backdrop-blur-sm bg-cyan-400/20 text-cyan-700 dark:text-cyan-300 border-cyan-400/40">
                                            RECREATIVE
                                        </span>
                                    )}
                                </div>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-8 font-light line-clamp-3">
                                {curso.descripcion || "Experiencia inmersiva enfocada en la técnica y la expresión corporal."}
                            </p>

                            <div className="grid grid-cols-2 gap-y-4 text-xs font-semibold tracking-wide pt-6 border-t border-gray-100 dark:border-white/5 text-gray-500 dark:text-zinc-500 uppercase">
                                <div className={`flex items-center transition-colors ${isCompetitive ? 'group-hover:text-red-700 dark:group-hover:text-red-300'
                                    : isPreCompetitive ? 'group-hover:text-purple-700 dark:group-hover:text-purple-300'
                                        : isRecreative ? 'group-hover:text-cyan-700 dark:group-hover:text-cyan-300'
                                            : 'group-hover:text-gray-900 dark:group-hover:text-gray-300'
                                    }`}>
                                    <CalendarIcon className={`w-4 h-4 mr-2 ${isCompetitive ? 'text-red-500' : isPreCompetitive ? 'text-purple-500' : isRecreative ? 'text-cyan-500' : 'text-red-500'}`} />
                                    {curso.horario_dia} {startTimeFormatted} - {endTimeFormatted}
                                </div>
                                <div className={`flex items-center justify-end transition-colors ${isCompetitive ? 'group-hover:text-red-700 dark:group-hover:text-red-300'
                                    : isPreCompetitive ? 'group-hover:text-purple-700 dark:group-hover:text-purple-300'
                                        : isRecreative ? 'group-hover:text-cyan-700 dark:group-hover:text-cyan-300'
                                            : 'group-hover:text-gray-900 dark:group-hover:text-gray-300'
                                    }`}>
                                    <ClockIcon className={`w-4 h-4 mr-2 ${isCompetitive ? 'text-red-500' : isPreCompetitive ? 'text-purple-500' : isRecreative ? 'text-cyan-500' : 'text-red-500'}`} />
                                    {curso.duracion_minutos} MIN
                                </div>
                                <div className={`flex items-center col-span-2 transition-colors ${isCompetitive ? 'group-hover:text-red-700 dark:group-hover:text-red-300'
                                    : isPreCompetitive ? 'group-hover:text-purple-700 dark:group-hover:text-purple-300'
                                        : isRecreative ? 'group-hover:text-cyan-700 dark:group-hover:text-cyan-300'
                                            : 'group-hover:text-gray-900 dark:group-hover:text-gray-300'
                                    }`}>
                                    <UserIcon className={`w-4 h-4 mr-2 ${isCompetitive ? 'text-red-500' : isPreCompetitive ? 'text-purple-500' : isRecreative ? 'text-cyan-500' : 'text-red-500'}`} />
                                    <span className="truncate">
                                        {curso.nombre_profesor ? `${curso.nombre_profesor} ${curso.apellido_profesor || ''}`.trim() : (curso.profesor || 'STAFF')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default CourseGrid;

