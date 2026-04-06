import { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, BarsArrowUpIcon } from '@heroicons/react/24/outline';

const LEVELS = ['All Levels', 'Level 1', 'Level 2', 'Level 3'];

const CourseFilters = ({ onFilterChange }) => {
    const [search, setSearch] = useState('');
    const [level, setLevel] = useState('All Levels');
    const [type, setType] = useState('Todos');
    const [sortBy, setSortBy] = useState('nombre');

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearch(val);
        onFilterChange({ search: val, level, type, sortBy });
    };

    const handleLevelChange = (e) => {
        const val = e.target.value;
        setLevel(val);
        onFilterChange({ search, level: val, type, sortBy });
    };

    const handleTypeChange = (e) => {
        const val = e.target.value;
        setType(val);
        onFilterChange({ search, level, type: val, sortBy });
    };

    const handleSortChange = (e) => {
        const val = e.target.value;
        setSortBy(val);
        onFilterChange({ search, level, type, sortBy: val });
    };

    return (
        <div className="mb-12 space-y-6">
            {/* Search and Filter Row */}
            <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
                {/* Search Bar */}
                <div className="relative flex-grow group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className={`h-5 w-5 transition-colors ${search ? 'text-red-500' : 'text-gray-400 group-focus-within:text-red-500'}`} />
                    </div>
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="BUSCAR CLASE (EJ: JAZZ, BALLET...)"
                        className={`w-full pl-12 pr-10 py-3 bg-white dark:bg-zinc-900 border rounded-xl focus:outline-none focus:border-red-500 dark:focus:border-red-500 text-sm tracking-wide transition-all shadow-sm text-gray-900 dark:text-white placeholder-gray-500 ${search ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-200 dark:border-zinc-800'}`}
                    />
                    {search && (
                        <button
                            onClick={() => { setSearch(''); setType('Todos'); onFilterChange({ search: '', level, type: 'Todos', sortBy }); }}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <span className="sr-only">Borrar búsqueda</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Level Dropdown */}
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FunnelIcon className={`h-5 w-5 transition-colors ${level !== 'All Levels' ? 'text-red-500' : 'text-gray-400'}`} />
                    </div>
                    <select
                        value={level}
                        onChange={handleLevelChange}
                        className={`w-full pl-12 pr-10 py-3 bg-white dark:bg-zinc-900 border rounded-xl focus:outline-none focus:border-red-500 dark:focus:border-red-500 text-sm tracking-wide appearance-none cursor-pointer transition-all shadow-sm text-gray-700 dark:text-gray-200 ${level !== 'All Levels' ? 'border-red-500 ring-1 ring-red-500/20 bg-red-50/10' : 'border-gray-200 dark:border-zinc-800'}`}
                    >
                        {LEVELS.map(l => (
                            <option key={l} value={l}>{l.toUpperCase()}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>

                {/* Type Dropdown */}
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FunnelIcon className={`h-5 w-5 transition-colors ${type !== 'Todos' ? 'text-red-500' : 'text-gray-400'}`} />
                    </div>
                    <select
                        value={type}
                        onChange={handleTypeChange}
                        className={`w-full pl-12 pr-10 py-3 bg-white dark:bg-zinc-900 border rounded-xl focus:outline-none focus:border-red-500 dark:focus:border-red-500 text-sm tracking-wide appearance-none cursor-pointer transition-all shadow-sm text-gray-700 dark:text-gray-200 ${type !== 'Todos' ? 'border-red-500 ring-1 ring-red-500/20 bg-red-50/10' : 'border-gray-200 dark:border-zinc-800'}`}
                    >
                        <option value="Todos">TODOS LOS PROGRAMAS</option>
                        <option value="Recreative">RECREATIVO</option>
                        <option value="Pre Competitive">PRE COMPETENCIA</option>
                        <option value="Competitive">COMPETENCIA</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>

                {/* Sort Dropdown */}
                <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <BarsArrowUpIcon className={`h-5 w-5 transition-colors ${sortBy !== 'nombre' ? 'text-red-500' : 'text-gray-400'}`} />
                    </div>
                    <select
                        value={sortBy}
                        onChange={handleSortChange}
                        className={`w-full pl-12 pr-10 py-3 bg-white dark:bg-zinc-900 border rounded-xl focus:outline-none focus:border-red-500 dark:focus:border-red-500 text-sm tracking-wide appearance-none cursor-pointer transition-all shadow-sm text-gray-700 dark:text-gray-200 ${sortBy !== 'nombre' ? 'border-red-500 ring-1 ring-red-500/20 bg-red-50/10' : 'border-gray-200 dark:border-zinc-800'}`}
                    >
                        <option value="nombre">ORDEN: NOMBRE</option>
                        <option value="horario">ORDEN: HORARIO</option>
                        <option value="nivel">ORDEN: NIVEL</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseFilters;
