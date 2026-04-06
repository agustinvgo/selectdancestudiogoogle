import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { alumnosAPI } from '../../services/api';
import { UserCircleIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, IdentificationIcon, CakeIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const PerfilAlumno = () => {
    const { user } = useAuth();
    const alumnoId = user?.alumno?.id;

    const { data: alumnoData, isLoading } = useQuery({
        queryKey: ['alumno', alumnoId],
        queryFn: async () => {
            const response = await alumnosAPI.getById(alumnoId);
            return response.data; // Assuming getById returns the student object directly or in data.data
        },
        enabled: !!alumnoId,
        retry: 1
    });

    if (isLoading) return <Loader />;

    const alumno = alumnoData || user?.alumno;

    if (!alumno) {
        return (
            <div className="text-gray-900">
                <p>No se encontró información del alumno</p>
            </div>
        );
    }

    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return null;
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    const edad = calcularEdad(alumno.fecha_nacimiento);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
                <p className="text-gray-500 mt-1">Información personal y de contacto</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Card de foto de perfil */}
                <div className="card">
                    <div className="card-body text-center">
                        <div className="w-32 h-32 bg-sds-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            {alumno.foto_perfil ? (
                                <img
                                    src={alumno.foto_perfil}
                                    alt={`${alumno.nombre} ${alumno.apellido}`}
                                    className="w-32 h-32 rounded-full object-cover"
                                />
                            ) : (
                                <UserCircleIcon className="h-24 w-24 text-sds-red" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {alumno.nombre} {alumno.apellido}
                        </h2>
                        <p className="text-gray-500 mt-1">{user.email}</p>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className="badge badge-info">Alumno</span>
                        </div>
                    </div>
                </div>

                {/* Información personal */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Datos Personales */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold text-gray-900">Datos Personales</h3>
                        </div>
                        <div className="card-body">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start space-x-3">
                                    <IdentificationIcon className="h-6 w-6 text-sds-red flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">DNI</p>
                                        <p className="text-gray-900 font-medium">{alumno.dni || 'No especificado'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <CakeIcon className="h-6 w-6 text-sds-red flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
                                        <p className="text-gray-900 font-medium">
                                            {alumno.fecha_nacimiento ? (
                                                <>
                                                    {new Date(alumno.fecha_nacimiento).toLocaleDateString('es-AR')}
                                                    {edad && <span className="text-gray-500"> ({edad} años)</span>}
                                                </>
                                            ) : (
                                                'No especificada'
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <PhoneIcon className="h-6 w-6 text-sds-red flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Teléfono</p>
                                        <p className="text-gray-900 font-medium">{alumno.telefono || 'No especificado'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <EnvelopeIcon className="h-6 w-6 text-sds-red flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email de Contacto</p>
                                        <p className="text-gray-900 font-medium">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Información del Padre/Tutor */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="text-lg font-semibold text-gray-900">Información del Padre/Tutor</h3>
                        </div>
                        <div className="card-body">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start space-x-3">
                                    <EnvelopeIcon className="h-6 w-6 text-sds-red flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email del Padre/Tutor</p>
                                        <p className="text-gray-900 font-medium">{alumno.email_padre || 'No especificado'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <MapPinIcon className="h-6 w-6 text-sds-red flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="text-sm text-gray-500">Dirección</p>
                                        <p className="text-gray-900 font-medium">{alumno.direccion || 'No especificada'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nota informativa */}
                    <div className="card border-blue-900 bg-blue-900/10">
                        <div className="card-body">
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold text-blue-400">ℹ️ Información:</span> Si necesitas actualizar alguno  de tus datos personales, comunícate con la administración de la escuela.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PerfilAlumno;

