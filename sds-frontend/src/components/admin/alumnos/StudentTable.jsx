import { PencilIcon, TrashIcon, EyeIcon, NoSymbolIcon, CheckCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const StudentTable = ({ alumnos, isActivo, abrirModal, toggleEstadoAlumno, eliminarAlumno, searchTerm }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
                {alumnos.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            {searchTerm ? 'No se encontraron alumnos' : 'No hay alumnos para mostrar'}
                        </p>
                    </div>
                ) : (
                    alumnos.map((alumno) => (
                        <div key={alumno.id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="text-base font-semibold text-gray-900">
                                        {alumno.nombre} {alumno.apellido}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">{alumno.email}</p>
                                </div>
                                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${isActivo(alumno.usuario_activo)
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                                    }`}>
                                    {isActivo(alumno.usuario_activo) ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                <div>
                                    <span className="text-gray-500">DNI:</span>
                                    <span className="ml-1 text-gray-900 font-medium">{alumno.dni || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Teléfono:</span>
                                    {alumno.telefono ? (
                                        <a
                                            href={`https://wa.me/${alumno.telefono.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ml-1 text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {alumno.telefono}
                                        </a>
                                    ) : (
                                        <span className="ml-1 text-gray-900 font-medium">-</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-4">
                                <button
                                    onClick={() => navigate(`/admin/alumnos/${alumno.id}`)}
                                    className="flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-lg border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
                                >
                                    <EyeIcon className="h-4 w-4 text-gray-500" />
                                    <span>Ver</span>
                                </button>
                                <button
                                    onClick={() => abrirModal(alumno)}
                                    className="flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-lg border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-all"
                                >
                                    <PencilIcon className="h-4 w-4 text-gray-500" />
                                    <span>Editar</span>
                                </button>
                                <button
                                    onClick={() => toggleEstadoAlumno(alumno)}
                                    className={`flex-1 py-2 px-3 flex items-center justify-center gap-2 rounded-lg border font-medium text-sm transition-all ${isActivo(alumno.usuario_activo)
                                        ? 'border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200'
                                        : 'border-gray-200 text-green-600 hover:bg-green-50 hover:border-green-200'
                                        }`}
                                >
                                    {isActivo(alumno.usuario_activo) ? (
                                        <>
                                            <NoSymbolIcon className="h-4 w-4" />
                                            <span>Desactivar</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircleIcon className="h-4 w-4" />
                                            <span>Activar</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-white border-b border-gray-200">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wide">
                                Nombre
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wide">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wide">
                                DNI
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 tracking-wide">
                                Teléfono
                            </th>
                            <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 tracking-wide">
                                Estado
                            </th>
                            <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 tracking-wide">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {alumnos.length > 0 ? (
                            alumnos.map((alumno) => (
                                <tr key={alumno.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {alumno.foto_perfil ? (
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        src={`http://localhost:5000${alumno.foto_perfil}`}
                                                        alt={alumno.nombre}
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm">
                                                        {alumno.nombre.charAt(0)}{alumno.apellido.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{alumno.nombre} {alumno.apellido}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {alumno.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {alumno.dni || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {alumno.telefono ? (
                                            <a
                                                href={`https://wa.me/${alumno.telefono.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {alumno.telefono}
                                            </a>
                                        ) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${isActivo(alumno.usuario_activo)
                                            ? 'bg-green-50 text-green-700 border border-green-200'
                                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                                            }`}>
                                            {isActivo(alumno.usuario_activo) ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button
                                                onClick={() => navigate(`/admin/alumnos/${alumno.id}`)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Ver ficha"
                                            >
                                                <EyeIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => abrirModal(alumno)}
                                                className="text-yellow-600 hover:text-yellow-900"
                                                title="Editar"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => toggleEstadoAlumno(alumno)}
                                                className={isActivo(alumno.usuario_activo) ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                                                title={isActivo(alumno.usuario_activo) ? "Desactivar" : "Activar"}
                                            >
                                                {isActivo(alumno.usuario_activo) ? (
                                                    <NoSymbolIcon className="h-5 w-5" />
                                                ) : (
                                                    <CheckCircleIcon className="h-5 w-5" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => eliminarAlumno(alumno.id)}
                                                className="text-gray-600 hover:text-gray-900"
                                                title="Eliminar"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-12">
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <MagnifyingGlassIcon className="h-12 w-12 mb-3 opacity-20" />
                                        <p className="text-lg font-medium">No se encontraron alumnos</p>
                                        {searchTerm && (
                                            <p className="text-sm mt-1">
                                                No hay resultados para <span className="font-bold">"{searchTerm}"</span>
                                            </p>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentTable;

