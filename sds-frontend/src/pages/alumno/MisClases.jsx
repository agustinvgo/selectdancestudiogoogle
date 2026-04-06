import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { cursosAPI } from '../../services/api';
import { CalendarIcon, ClockIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const MisClases = () => {
    const { user } = useAuth();
    const alumnoId = user?.alumno?.id;

    const { data: cursosData, isLoading } = useQuery({
        queryKey: ['cursos', 'alumno', alumnoId],
        queryFn: async () => {
            const response = await cursosAPI.getByAlumno(alumnoId);
            return response.data.data;
        },
        enabled: !!alumnoId,
        retry: 1
    });

    if (isLoading) return <Loader />;

    const cursos = cursosData || [];

    const diasOrden = {
        'Lunes': 1,
        'Martes': 2,
        'Miércoles': 3,
        'Jueves': 4,
        'Viernes': 5,
        'Sábado': 6,
        'Domingo': 7
    };

    const cursosOrdenados = [...cursos].sort((a, b) => {
        const diaA = diasOrden[a.dia_semana] || 8;
        const diaB = diasOrden[b.dia_semana] || 8;
        if (diaA !== diaB) return diaA - diaB;
        return a.hora_inicio.localeCompare(b.hora_inicio);
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Mis Clases</h1>
                <p className="text-gray-500 mt-1">
                    Tienes {cursos.length} {cursos.length === 1 ? 'clase inscrita' : 'clases inscritas'}
                </p>
            </div>

            {cursos.length === 0 ? (
                <div className="card">
                    <div className="card-body text-center py-12">
                        <AcademicCapIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No tienes clases inscritas</p>
                        <p className="text-gray-500 text-sm mt-2">
                            Comunícate con la administración para inscribirte a un curso
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cursosOrdenados.map((curso) => (
                        <div key={curso.id} className="card hover:border-sds-red transition-all">
                            <div className="card-body">
                                <div className="mb-4">
                                    <div className="w-12 h-12 bg-sds-red/20 rounded-lg flex items-center justify-center mb-3">
                                        <AcademicCapIcon className="h-6 w-6 text-sds-red" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{curso.nombre}</h3>
                                    {curso.descripcion && (
                                        <p className="text-sm text-gray-500 mt-2">{curso.descripcion}</p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center text-gray-600">
                                        <CalendarIcon className="h-5 w-5 mr-3 text-sds-red" />
                                        <span>{curso.dia_semana}</span>
                                    </div>

                                    <div className="flex items-center text-gray-600">
                                        <ClockIcon className="h-5 w-5 mr-3 text-sds-red" />
                                        <span>
                                            {curso.hora_inicio?.substring(0, 5)} - {curso.hora_fin?.substring(0, 5)}
                                        </span>
                                    </div>

                                    {curso.profesor && (
                                        <div className="pt-3 border-t border-gray-200">
                                            <p className="text-sm text-gray-500">Profesor</p>
                                            <p className="text-gray-900 font-medium">{curso.profesor}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Horario semanal */}
            {cursos.length > 0 && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-gray-900">Horario Semanal</h3>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((dia) => {
                                const clasesDelDia = cursos.filter(c => c.dia_semana === dia);
                                return (
                                    <div key={dia} className="space-y-2">
                                        <h4 className="font-semibold text-gray-900 text-sm border-b border-gray-200 pb-2">
                                            {dia}
                                        </h4>
                                        {clasesDelDia.length > 0 ? (
                                            clasesDelDia.map((curso) => (
                                                <div key={curso.id} className="p-2 bg-gray-50 rounded text-xs">
                                                    <p className="font-medium text-gray-900">{curso.nombre}</p>
                                                    <p className="text-gray-500 mt-1">
                                                        {curso.hora_inicio?.substring(0, 5)}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-8"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MisClases;

