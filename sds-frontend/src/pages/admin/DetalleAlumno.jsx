import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { alumnosAPI } from '../../services/api';
import {
    UserCircleIcon, EnvelopeIcon, PhoneIcon, MapPinIcon,
    IdentificationIcon, ArrowLeftIcon, CalendarIcon, CurrencyDollarIcon, AcademicCapIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';
import { toast } from 'react-hot-toast';

const DetalleAlumno = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading: loading, error } = useQuery({
        queryKey: ['alumno_detalle', id],
        queryFn: async () => {
            const response = await alumnosAPI.getFichaCompleta(id);
            return response.data.data;
        },
        enabled: !!id,
        onError: (err) => {
            console.error('Error fetching student details:', err);
            toast.error('Error al cargar la ficha del alumno: ' + (err.response?.data?.message || err.message));
        }
    });

    if (loading) return <Loader />;
    if (error || !data) return <div className="p-8 text-center text-red-500">Error al cargar datos del alumno.</div>;

    const { alumno, cursos, asistencias, pagos } = data;

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
        <div className="space-y-6 animate-fade-in-up pb-10">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/admin/alumnos')}
                    className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ficha del Alumno</h1>
                    <p className="text-gray-500 text-sm">Información detallada y registos</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Columna Izquierda: Perfil y Datos */}
                <div className="space-y-6">
                    {/* Tarjeta de Perfil */}
                    <div className="card">
                        <div className="card-body text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-blue-900/50 to-purple-900/50"></div>
                            <div className="relative pt-8">
                                <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-gray-800 shadow-xl overflow-hidden">
                                    {alumno.foto_perfil ? (
                                        <img
                                            src={`http://localhost:5000${alumno.foto_perfil}`}
                                            alt={`${alumno.nombre} ${alumno.apellido}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <UserCircleIcon className="h-24 w-24 text-gray-600" />
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {alumno.nombre} {alumno.apellido}
                                </h2>
                                <p className="text-gray-500 mt-1">{alumno.email}</p>
                                <span className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold ${alumno.usuario_activo ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {alumno.usuario_activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Datos Personales */}
                    <div className="card">
                        <div className="card-header border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <IdentificationIcon className="w-5 h-5 text-blue-400" />
                                Datos Personales
                            </h3>
                        </div>
                        <div className="card-body space-y-4">
                            <div className="flex justify-between border-b border-gray-200/50 pb-2 last:border-0 last:pb-0">
                                <span className="text-gray-500 text-sm">DNI</span>
                                <span className="text-gray-900 font-medium">{alumno.dni || '-'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200/50 pb-2 last:border-0 last:pb-0">
                                <span className="text-gray-500 text-sm">Fecha Nac.</span>
                                <span className="text-gray-900 font-medium">
                                    {alumno.fecha_nacimiento ? new Date(alumno.fecha_nacimiento).toLocaleDateString() : '-'}
                                    {edad && <span className="text-gray-500 text-xs ml-1">({edad} años)</span>}
                                </span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200/50 pb-2 last:border-0 last:pb-0">
                                <span className="text-gray-500 text-sm">Teléfono</span>
                                <span className="text-gray-900 font-medium">{alumno.telefono || '-'}</span>
                            </div>
                            <div className="flex justify-between border-b border-gray-200/50 pb-2 last:border-0 last:pb-0">
                                <span className="text-gray-500 text-sm">Dirección</span>
                                <span className="text-gray-900 font-medium text-right max-w-[60%]">{alumno.direccion || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Datos Responsable */}
                    <div className="card">
                        <div className="card-header border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <UserCircleIcon className="w-5 h-5 text-purple-400" />
                                Responsable / Tutor
                            </h3>
                        </div>
                        <div className="card-body space-y-4">
                            <div className="flex items-start gap-3">
                                <UserCircleIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Nombre del Padre/Tutor</p>
                                    <p className="text-gray-900 font-medium text-lg">{alumno.nombre_padre || 'No especificado'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <EnvelopeIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">Email del Padre/Tutor</p>
                                    <p className="text-gray-900">{alumno.email_padre || 'No especificado'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <PhoneIcon className="w-5 h-5 text-green-400 mt-0.5" />
                                <div>
                                    <p className="text-xs text-gray-500">WhatsApp / Teléfono</p>
                                    {alumno.telefono ? (
                                        <a
                                            href={`https://wa.me/${alumno.telefono.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-400 hover:text-green-300 font-medium hover:underline flex items-center gap-1"
                                        >
                                            {alumno.telefono} ↗
                                        </a>
                                    ) : (
                                        <p className="text-gray-900">No especificado</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha: Registros */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Cursos */}
                    <div className="card">
                        <div className="card-header border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <AcademicCapIcon className="w-5 h-5 text-yellow-400" />
                                Cursos Inscritos
                            </h3>
                            <span className="bg-white text-gray-600 text-xs px-2 py-1 rounded-full">{cursos.length}</span>
                        </div>
                        <div className="card-body p-0">
                            {cursos.length > 0 ? (
                                <div className="divide-y divide-gray-200">
                                    {cursos.map(curso => (
                                        <div key={curso.id} className="p-4 flex justify-between items-center hover:bg-white border border-gray-100 transition-colors">
                                            <div>
                                                <h4 className="text-gray-900 font-medium">{curso.nombre}</h4>
                                                <p className="text-xs text-gray-500">{curso.horario} | {curso.dias}</p>
                                            </div>
                                            <span className="text-xs text-blue-400 font-medium">
                                                Inscrito: {new Date(curso.fecha_inscripcion).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No está inscrito en ningún curso.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pagos Recientes */}
                    <div className="card">
                        <div className="card-header border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <CurrencyDollarIcon className="w-5 h-5 text-green-400" />
                                Pagos
                            </h3>
                            {pagos.filter(p => p.estado === 'pendiente' || p.estado === 'revision').length > 0 && (
                                <span className="bg-red-500/10 text-red-500 text-xs font-bold px-2 py-1 rounded-full">
                                    {pagos.filter(p => p.estado === 'pendiente' || p.estado === 'revision').length} pendiente(s)
                                </span>
                            )}
                        </div>
                        <div className="card-body p-0">
                            {pagos.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-white border border-gray-100">
                                            <tr>
                                                <th className="px-4 py-3">Concepto</th>
                                                <th className="px-4 py-3">Monto</th>
                                                <th className="px-4 py-3">Estado</th>
                                                <th className="px-4 py-3 text-right">Fecha Venc.</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {[...pagos]
                                                .sort((a, b) => {
                                                    // Pendientes y revisión primero
                                                    const prioridad = (p) => p.estado === 'pendiente' || p.estado === 'revision' ? 0 : 1;
                                                    if (prioridad(a) !== prioridad(b)) return prioridad(a) - prioridad(b);
                                                    return new Date(b.fecha_vencimiento) - new Date(a.fecha_vencimiento);
                                                })
                                                .slice(0, 8)
                                                .map(pago => (
                                                    <tr key={pago.id} className={`hover:bg-gray-50 border border-gray-200 ${pago.estado === 'pendiente' ? 'bg-red-50/30' : ''}`}>
                                                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                                            {pago.concepto || 'Sin concepto'}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">${Number(pago.monto).toLocaleString()}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${pago.estado === 'pagado' ? 'bg-green-500/10 text-green-600' :
                                                                pago.estado === 'pendiente' ? 'bg-red-500/10 text-red-500' :
                                                                    'bg-yellow-500/10 text-yellow-600'
                                                                }`}>
                                                                {pago.estado}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-500 text-right">
                                                            {new Date(pago.fecha_vencimiento).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                    {pagos.length > 8 && (
                                        <div className="p-2 text-center border-t border-gray-200">
                                            <button onClick={() => navigate('/admin/pagos')} className="text-xs text-blue-400 hover:text-blue-300">
                                                Ver historial completo ({pagos.length} pagos)
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No hay registros de pagos.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Historial Asistencias */}
                    <div className="card">
                        <div className="card-header border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <CalendarIcon className="w-5 h-5 text-orange-400" />
                                Historial de Asistencias (Últimos 3 meses)
                            </h3>
                        </div>
                        <div className="card-body p-0">
                            {asistencias.length > 0 ? (
                                <div className="max-h-60 overflow-y-auto divide-y divide-gray-200">
                                    {asistencias.map(asistencia => (
                                        <div key={asistencia.id} className="p-3 flex justify-between items-center px-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${asistencia.estado === 'presente' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <span className="text-sm text-gray-900 font-medium">{asistencia.curso_nombre}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-500 block">
                                                    {new Date(asistencia.fecha).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                                                    {asistencia.estado}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No hay registros recientes.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DetalleAlumno;

