import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const StudentFilters = ({ activeTab, setActiveTab, searchTerm, setSearchTerm, counts = { activos: 0, inactivos: 0, todos: 0 } }) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Tabs de Estado - Segmented Control Style */}
            <div className="flex bg-gray-100/80 p-1 rounded-xl w-full md:w-auto">
                <button
                    onClick={() => setActiveTab('activos')}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'activos'
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    Activos
                    <span className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${activeTab === 'activos' ? 'bg-gray-100 text-gray-900' : 'bg-gray-200/50 text-gray-500'}`}>
                        {counts.activos}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('inactivos')}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'inactivos'
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    Inactivos
                    <span className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${activeTab === 'inactivos' ? 'bg-gray-100 text-gray-900' : 'bg-gray-200/50 text-gray-500'}`}>
                        {counts.inactivos}
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('todos')}
                    className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${activeTab === 'todos'
                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                        : 'text-gray-500 hover:text-gray-900'
                        }`}
                >
                    Todos
                    <span className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${activeTab === 'todos' ? 'bg-gray-100 text-gray-900' : 'bg-gray-200/50 text-gray-500'}`}>
                        {counts.todos}
                    </span>
                </button>
            </div>

            {/* Buscador - Clean & Neutral */}
            <div className="relative w-full md:w-72 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className={`h-5 w-5 transition-colors ${searchTerm ? 'text-zinc-900' : 'text-gray-400 group-hover:text-gray-500'}`} />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar alumno..."
                    className="block w-full pl-10 pr-10 py-2.5 border-0 bg-gray-100/80 text-gray-900 placeholder-gray-500 rounded-xl focus:ring-2 focus:ring-zinc-900/10 focus:bg-white transition-all duration-200 sm:text-sm"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default StudentFilters;


