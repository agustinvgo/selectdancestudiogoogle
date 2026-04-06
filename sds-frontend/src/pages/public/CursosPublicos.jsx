import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cursosAPI } from '../../services/api.js';
import WeeklyPlanner from '../../components/WeeklyPlanner.jsx';
import { Toaster } from 'react-hot-toast';
import PageSEO from '../../components/SEO/PageSEO.jsx';
import SchemaBreadcrumb from '../../components/SEO/SchemaBreadcrumb.jsx';

// Modular Components
import CoursesHero from '../../components/public/CoursesHero.jsx';
import CourseGrid from '../../components/public/CourseGrid.jsx';
import CourseFilters from '../../components/public/CourseFilters.jsx';
import TrialModal from '../../components/public/TrialModal.jsx';
import CourseDetailsModal from '../../components/public/CourseDetailsModal.jsx';
import CourseGridSkeleton from '../../components/public/CourseGridSkeleton.jsx';

const CursosPublicos = () => {
    // Filter State
    const [filterParams, setFilterParams] = useState({
        search: '',
        level: 'All Levels',
        type: 'Todos',
        sortBy: 'nombre'
    });

    // Modal States
    const [trialModalOpen, setTrialModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    const [selectedCourseName, setSelectedCourseName] = useState(''); // For Trial Modal
    const [viewCourse, setViewCourse] = useState(null); // For Details Modal

    // 1. Fetch Courses
    const { data: cursos = [], isLoading: loading, isError } = useQuery({
        queryKey: ['cursos-publicos'],
        queryFn: async () => {
            const response = await cursosAPI.getAllPublic(); // Endpoint público — sin auth
            return response.data.data || [];
        },
        select: (data) => data.filter(c => c.activo === 1),
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // 2. Open Details Modal (from Grid)
    const handleCourseClick = (course) => {
        setViewCourse(course);
        setDetailsModalOpen(true);
    };

    // 3. Open Trial Modal (Directly or from Details)
    const handleRequestTrial = (courseName = '') => {
        setDetailsModalOpen(false); // Close details if open
        setSelectedCourseName(courseName);
        setTrialModalOpen(true);
    };

    // Helper to normalize levels for filtering
    const normalizeLevel = (lvl) => {
        if (!lvl) return '';
        const s = String(lvl).toUpperCase();
        if (s.includes('PRINCIPIANTE') || s === '1' || s.includes('1') || s.includes('LEVEL 1')) return 'LEVEL 1';
        if (s.includes('INTERMEDIO') || s === '2' || s.includes('2') || s.includes('LEVEL 2')) return 'LEVEL 2';
        if (s.includes('AVANZADO') || s === '3' || s.includes('3') || s.includes('LEVEL 3')) return 'LEVEL 3';
        return s;
    };

    // Filter Logic (Memoized)
    const filteredCursos = useMemo(() => {
        let results = [...cursos];
        const { search, level, type, sortBy } = filterParams;

        if (level && level !== 'Todos' && level !== 'Todos los niveles' && level !== 'All Levels') {
            const levelTarget = level.toUpperCase(); // e.g., "LEVEL 1"

            results = results.filter(c => {
                // Check if any of the course's levels match the target
                // We handle array or string (JSON or raw)
                let cLevels = [];
                try {
                    if (Array.isArray(c.nivel)) cLevels = c.nivel;
                    else if (c.nivel && c.nivel.startsWith('[')) cLevels = JSON.parse(c.nivel);
                    else cLevels = [c.nivel];
                } catch {
                    cLevels = [String(c.nivel)];
                }

                return cLevels.some(l => normalizeLevel(l) === levelTarget);
            });
        }

        if (type && type !== 'Todos') {
            results = results.filter(c => {
                let cTypes = [];
                try {
                    if (Array.isArray(c.tipo)) cTypes = c.tipo;
                    else if (c.tipo && c.tipo.startsWith('[')) cTypes = JSON.parse(c.tipo);
                    else cTypes = [c.tipo];
                } catch {
                    cTypes = [String(c.tipo)];
                }
                // Check intersection
                return cTypes.some(t => String(t) === type);
            });
        }

        if (search) {
            const term = search.toUpperCase();
            results = results.filter(c =>
                c.nombre.toUpperCase().includes(term) ||
                (c.nombre_profesor && c.nombre_profesor.toUpperCase().includes(term)) ||
                (c.apellido_profesor && c.apellido_profesor.toUpperCase().includes(term))
            );
        }

        results.sort((a, b) => {
            if (sortBy === 'nombre') return a.nombre.localeCompare(b.nombre);
            if (sortBy === 'horario') {
                const days = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 7 };
                const dayA = days[a.horario_dia] || 99;
                const dayB = days[b.horario_dia] || 99;
                if (dayA !== dayB) return dayA - dayB;
                return a.horario_hora.localeCompare(b.horario_hora);
            }
            if (sortBy === 'nivel') {
                const levels = { 'Principiante': 1, 'Intermedio': 2, 'Avanzado': 3, 'Baby': 4, 'Mini': 5, 'Junior': 6, 'Teen': 7, 'Senior': 8, 'Recreative': 9 };
                const getLvlVal = (c) => {
                    // Grab first level for sorting
                    const lvl = Array.isArray(c.nivel) ? c.nivel[0] : (typeof c.nivel === 'string' && c.nivel.startsWith('[') ? JSON.parse(c.nivel)[0] : c.nivel);
                    const norm = normalizeLevel(lvl);
                    // Reverse map or partial match? stick to simple map
                    const key = Object.keys(levels).find(k => k.toUpperCase() === norm) || 'Recreative';
                    return levels[key] || 99;
                }
                return getLvlVal(a) - getLvlVal(b);
            }
            return 0;
        });

        return results;
    }, [cursos, filterParams]);

    const handleFilterChange = (newParams) => {
        setFilterParams(prev => ({ ...prev, ...newParams }));
    };



    if (loading) return (
        <div className="min-h-screen pt-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="h-[400px] mb-12 bg-gray-100 dark:bg-white/5 rounded-3xl animate-pulse"></div> {/* Hero Skeleton */}
                <div className="h-20 mb-12 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse"></div> {/* Filters Skeleton */}
                <CourseGridSkeleton />
            </div>
        </div>
    );

    return (
        <div className="min-h-screen pt-20 pb-40 px-6">
            <PageSEO
                title="Cursos de Danza en Palermo — Horarios y Niveles"
                description="Descubrí todos nuestros cursos de ballet, jazz y danza contemporánea en Palermo, Buenos Aires. Niveles Baby, Mini, Junior, Teen, Senior y Recreativo. Solicitá tu clase de prueba."
                canonical="/cursos"
            />
            <SchemaBreadcrumb items={[
                { name: 'Inicio', url: '/' },
                { name: 'Cursos', url: '/cursos' },
            ]} />
            <Toaster position="bottom-right" />
            <div className="max-w-7xl mx-auto">
                <CoursesHero onOpenModal={() => handleRequestTrial()} />

                <CourseFilters onFilterChange={handleFilterChange} />



                {isError && (
                    <div className="text-center py-12">
                        <p className="text-red-400 text-sm tracking-wide">No se pudieron cargar los cursos.</p>
                    </div>
                )}

                {!loading && !isError && filteredCursos.length === 0 ? (
                    <div className="py-24 border-t border-b border-white/5 text-center">
                        <p className="text-gray-600 font-light italic">No se encontraron clases con estos filtros.</p>
                        <button
                            onClick={() => handleFilterChange({ search: '', level: 'All Levels', type: 'Todos', sortBy: 'nombre' })}
                            className="mt-4 text-red-500 hover:text-red-400 text-sm font-bold uppercase tracking-widest"
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 text-right">
                            <span className="text-xs text-gray-500 uppercase tracking-widest">{filteredCursos.length} CLASES ENCONTRADAS</span>
                        </div>

                        <CourseGrid
                            cursos={filteredCursos}
                            onSelectCourse={handleCourseClick}
                        />
                        <WeeklyPlanner
                            cursos={filteredCursos}
                            onSelectCourse={handleCourseClick}
                        />
                    </>
                )}
            </div>

            {/* Read-only Details Modal */}
            <CourseDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                course={viewCourse}
                onRequestTrial={(c) => handleRequestTrial(c.nombre)}
            />

            {/* Form Modal */}
            <TrialModal
                isOpen={trialModalOpen}
                onClose={() => setTrialModalOpen(false)}
                selectedCourse={selectedCourseName}
                courses={cursos}
            />
        </div>
    );
};

export default CursosPublicos;

