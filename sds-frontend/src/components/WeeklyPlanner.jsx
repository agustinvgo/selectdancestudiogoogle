import React from 'react';

const WeeklyPlanner = ({ cursos, onSelectCourse }) => {
    const days = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

    // Helper to convert time string (HH:MM) to minutes for sorting
    const timeToMinutes = (time) => {
        if (!time) return 0;
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // Helper to calculate end time
    const calculateEndTime = (startTime, durationMinutes) => {
        if (!startTime || !durationMinutes) return '';
        const [hours, minutes] = startTime.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        date.setMinutes(date.getMinutes() + Number(durationMinutes));
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

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

    const formatLevel = (l) => {
        const s = String(l).trim();
        if (s === '1') return 'Principiante';
        if (s === '2') return 'Intermedio';
        if (s === '1' || s.toLowerCase().includes('principiante')) return 'Level 1';
        if (s === '2' || s.toLowerCase().includes('intermedio')) return 'Level 2';
        if (s === '3' || s.toLowerCase().includes('avanzado')) return 'Level 3';
        if (String(l).toLowerCase().includes('todos')) return 'All Levels';
        return s;
    };

    // Group courses by day
    const normalizeDay = (d) => String(d || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const coursesByDay = days.reduce((acc, day) => {
        acc[day] = cursos
            .filter(c => normalizeDay(c.horario_dia) === normalizeDay(day) || normalizeDay(c.dia_semana) === normalizeDay(day))
            .sort((a, b) => timeToMinutes(a.horario_hora) - timeToMinutes(b.horario_hora));
        return acc;
    }, {});

    const getCourseStyle = (nivel, tipo) => {
        // Prioridad: tipo del curso determina el color de la card
        const rawTypes = parseLevels(tipo).map(t => String(t).toLowerCase());
        const isPreComp = rawTypes.some(t => t.includes('pre competi') || t.includes('pre-competi') || t.includes('precompeti'));
        const isComp = !isPreComp && rawTypes.some(t => t.includes('competi'));
        const isRec = rawTypes.some(t => t.includes('recreati'));

        if (isComp) return 'border-l-red-500 bg-red-500/5 hover:bg-red-500/10';
        if (isPreComp) return 'border-l-purple-500 bg-purple-500/5 hover:bg-purple-500/10';
        if (isRec) return 'border-l-cyan-400 bg-cyan-400/5 hover:bg-cyan-400/10';

        // Fallback por nivel
        const levels = parseLevels(nivel).map(formatLevel);
        const n = levels.join(' ').toLowerCase();
        if (n.includes('level 1')) return 'border-l-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10';
        if (n.includes('level 2')) return 'border-l-blue-500 bg-blue-500/5 hover:bg-blue-500/10';
        if (n.includes('level 3')) return 'border-l-violet-500 bg-violet-500/5 hover:bg-violet-500/10';
        if (n.includes('all levels')) return 'border-l-teal-500 bg-teal-500/5 hover:bg-teal-500/10';
        return 'border-l-gray-300 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700';
    };

    return (
        <div className="w-full bg-white dark:bg-black/40 backdrop-blur-sm rounded-3xl border border-gray-100 dark:border-white/5 p-8 md:p-12 animate-fade-in-up transition-all duration-500 shadow-xl">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-10 tracking-tighter uppercase text-center italic">
                Agenda Semanal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                {days.map(day => (
                    <div key={day} className="flex flex-col min-h-[200px]">
                        {/* Day Header */}
                        <div className="text-center py-3 px-3 mb-6 rounded-full text-xs font-bold tracking-[0.2em] uppercase bg-gradient-to-r from-gray-900 to-gray-700 text-white dark:from-white dark:to-gray-300 dark:text-black shadow-lg">
                            {day}
                        </div>

                        {/* Courses List for the Day */}
                        <div className="flex-1 space-y-3">
                            {coursesByDay[day].length === 0 ? (
                                <div className="text-gray-300 dark:text-zinc-700 text-[10px] text-center italic py-4 border border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
                                    -
                                </div>
                            ) : (
                                coursesByDay[day].map(curso => {
                                    const startTime = curso.horario_hora ? curso.horario_hora.substring(0, 5) : '';
                                    const endTime = calculateEndTime(curso.horario_hora, curso.duracion_minutos);
                                    const rawTypes = parseLevels(curso.tipo).map(t => String(t).toLowerCase());
                                    const isPreComp = rawTypes.some(t => t.includes('pre competi') || t.includes('pre-competi') || t.includes('precompeti'));
                                    const isComp = !isPreComp && rawTypes.some(t => t.includes('competi'));
                                    const isRec = rawTypes.some(t => t.includes('recreati'));
                                    const nameHoverColor = isComp ? 'group-hover:text-red-500 dark:group-hover:text-red-400'
                                        : isPreComp ? 'group-hover:text-purple-500 dark:group-hover:text-purple-400'
                                            : isRec ? 'group-hover:text-cyan-400 dark:group-hover:text-cyan-300'
                                                : 'group-hover:text-gray-600 dark:group-hover:text-gray-300';

                                    return (
                                        <div
                                            key={curso.id}
                                            onClick={() => onSelectCourse && onSelectCourse(curso)}
                                            className={`p-3 rounded-r-xl border-l-[3px] transition-all cursor-pointer group shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] ${getCourseStyle(curso.nivel, curso.tipo)}`}
                                        >
                                            {/* Time Range - Bold and Prominent */}
                                            <div className="flex items-center text-xs font-black text-gray-700 dark:text-gray-300 mb-1 tracking-wide">
                                                <span>{startTime}</span>
                                                <span className="mx-1 text-gray-300 dark:text-zinc-600">-</span>
                                                <span>{endTime}</span>
                                            </div>

                                            <div className={`text-[11px] font-bold text-gray-900 dark:text-white mb-2 ${nameHoverColor} transition-colors uppercase tracking-tight leading-tight line-clamp-2`}>
                                                {curso.nombre}
                                            </div>

                                            {/* Badges Row */}
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {/* Category Badges */}
                                                {(() => {
                                                    const rawCategories = parseLevels(curso.categoria);
                                                    const categories = [...new Set(rawCategories.map(c => String(c).trim()).filter(Boolean))];
                                                    return categories.map((cat, idx) => (
                                                        <span key={`cat-${idx}`} className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                                                            {cat}
                                                        </span>
                                                    ));
                                                })()}

                                                {/* Type Badges */}
                                                {(() => {
                                                    const rawTypes = parseLevels(curso.tipo);
                                                    const types = rawTypes.map(t => String(t).toLowerCase());

                                                    const isPreCompetitive = types.some(t => t.includes('pre competi') || t.includes('pre-competi') || t.includes('precompeti'));
                                                    const isCompetitive = !isPreCompetitive && types.some(t => t.includes('competi'));
                                                    const isRecreative = types.some(t => t.includes('recreati'));

                                                    return (
                                                        <>
                                                            {isCompetitive && (
                                                                <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">
                                                                    COMPETITIVE
                                                                </span>
                                                            )}
                                                            {isPreCompetitive && (
                                                                <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                                                                    PRE-COMPETITIVE
                                                                </span>
                                                            )}
                                                            {isRecreative && (
                                                                <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded bg-cyan-400/20 text-cyan-600 dark:text-cyan-300 border border-cyan-400/30">
                                                                    RECREATIVE
                                                                </span>
                                                            )}
                                                        </>
                                                    );
                                                })()}
                                            </div>

                                            <div className="flex justify-end items-center text-[9px] text-gray-400 dark:text-zinc-500 font-medium border-t border-gray-200/50 dark:border-white/5 pt-1 mt-1">
                                                <span className="uppercase tracking-wider opacity-90">
                                                    {(() => {
                                                        const lvls = parseLevels(curso.nivel).map(formatLevel);
                                                        return lvls[0] || '';
                                                    })()}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ))}
            </div>


            {/* Legend */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-semibold">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div> Competitive
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]"></div> Pre-Competitive
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]"></div> Recreative
                </div>
            </div>
        </div>
    );
};

export default WeeklyPlanner;
