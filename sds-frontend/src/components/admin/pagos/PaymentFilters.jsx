import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

const PaymentFilters = ({
    alumnos,
    filtroAlumno,
    setFiltroAlumno,
    filtroEstado,
    setFiltroEstado,
    filtroMes,
    setFiltroMes,
    filtroAnio,
    setFiltroAnio,
    limpiarFiltros,
    totalResults = 0,
    filteredResults = 0
}) => {
    const mesesNombres = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const hasActiveFilters = filtroAlumno || filtroEstado !== 'todos' || filtroMes !== 0;

    const alumnoSeleccionado = alumnos.find(a => a.usuario_id === parseInt(filtroAlumno));

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-800">Filtros y Búsqueda</h2>
                    <div className="text-sm text-gray-500">
                        Mostrando <span className="font-bold text-gray-900">{filteredResults}</span> de <span className="font-bold text-gray-900">{totalResults}</span> pagos
                    </div>
                </div>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Alumno</label>
                        <select
                            value={filtroAlumno}
                            onChange={(e) => setFiltroAlumno(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${filtroAlumno ? 'border-red-500 ring-1 ring-red-500/20 bg-red-50/10' : 'border-gray-200'}`}
                        >
                            <option value="">Todos los alumnos</option>
                            {alumnos.map(alumno => (
                                <option key={alumno.usuario_id} value={alumno.usuario_id}>
                                    {alumno.nombre} {alumno.apellido}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${filtroEstado !== 'todos' ? 'border-red-500 ring-1 ring-red-500/20 bg-red-50/10' : 'border-gray-200'}`}
                        >
                            <option value="todos">Todos</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="revision">En Revisión</option>
                            <option value="pagado">Pagado</option>
                            <option value="vencido">Vencido</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mes</label>
                        <select
                            value={filtroMes}
                            onChange={(e) => setFiltroMes(parseInt(e.target.value))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${filtroMes !== 0 ? 'border-red-500 ring-1 ring-red-500/20 bg-red-50/10' : 'border-gray-200'}`}
                        >
                            <option value="0">Todos</option>
                            {mesesNombres.slice(1).map((mes, idx) => (
                                <option key={idx + 1} value={idx + 1}>{mes}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                        <select
                            value={filtroAnio}
                            onChange={(e) => setFiltroAnio(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        >
                            {[2026, 2027, 2028, 2029, 2030].map(anio => (
                                <option key={anio} value={anio}>{anio}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            onClick={limpiarFiltros}
                            className="btn btn-secondary w-full"
                            disabled={!hasActiveFilters}
                        >
                            Limpiar Filtros
                        </button>
                    </div>
                </div>

                {/* Active Filters Pills */}
                {hasActiveFilters && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-sm text-gray-500 font-medium">Filtros activos:</span>

                        {filtroAlumno && alumnoSeleccionado && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200">
                                {alumnoSeleccionado.nombre} {alumnoSeleccionado.apellido}
                                <button
                                    onClick={() => setFiltroAlumno('')}
                                    className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                                >
                                    <XMarkIcon className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {filtroEstado !== 'todos' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full border border-purple-200">
                                {filtroEstado.charAt(0).toUpperCase() + filtroEstado.slice(1)}
                                <button
                                    onClick={() => setFiltroEstado('todos')}
                                    className="hover:bg-purple-100 rounded-full p-0.5 transition-colors"
                                >
                                    <XMarkIcon className="h-3 w-3" />
                                </button>
                            </span>
                        )}

                        {filtroMes !== 0 && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                                {mesesNombres[filtroMes]} {filtroAnio}
                                <button
                                    onClick={() => setFiltroMes(0)}
                                    className="hover:bg-green-100 rounded-full p-0.5 transition-colors"
                                >
                                    <XMarkIcon className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentFilters;

