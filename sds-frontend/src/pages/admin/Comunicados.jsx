import { useState, useEffect } from 'react';
import { notificacionesAPI, cursosAPI, alumnosAPI, usuariosAPI } from '../../services/api';
import useToast from '../../hooks/useToast';
import {
    PaperAirplaneIcon,
    UserGroupIcon,
    AcademicCapIcon,
    UserIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';

const Comunicados = () => {
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    // Formulario
    const [titulo, setTitulo] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [tipo, setTipo] = useState('info'); // info, aviso, importante
    const [enviarEmail, setEnviarEmail] = useState(false);
    const [remitente, setRemitente] = useState('');
    const [imagen, setImagen] = useState(null);

    // Destinatarios
    const [filtro, setFiltro] = useState('todos'); // todos, rol, curso, usuario
    const [destinatarioId, setDestinatarioId] = useState('');

    // Listas para selectores
    const [cursos, setCursos] = useState([]);
    const [usuarios, setUsuarios] = useState([]); // Alumnos o Profesores según necesidad

    const toast = useToast();

    // Tabs & Historial
    const [activeTab, setActiveTab] = useState('redactar'); // 'redactar' | 'historial'
    const [historial, setHistorial] = useState([]);

    useEffect(() => {
        if (activeTab === 'historial') {
            cargarHistorial();
        } else {
            cargarDatosSelectores();
        }
    }, [activeTab, filtro]);

    const cargarHistorial = async () => {
        try {
            setLoading(true);
            const res = await notificacionesAPI.getSentHistory();
            setHistorial(res.data.data || []);
        } catch (error) {
            console.error('Error cargando historial:', error);
            toast.error('Error al cargar historial');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteBatch = async (batchId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este comunicado para TODOS los destinatarios? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            await notificacionesAPI.deleteBatch(batchId);
            toast.success('Comunicado eliminado exitosamente');
            cargarHistorial();
        } catch (error) {
            console.error('Error eliminando comunicado:', error);
            toast.error('Error al eliminar comunicado');
        }
    };

    const cargarDatosSelectores = async () => {
        try {
            if (filtro === 'curso') {
                setLoading(true);
                const res = await cursosAPI.getAll();
                setCursos(res.data.data || []);
                setLoading(false);
            } else if (filtro === 'usuario') {
                setLoading(true);
                // Por defecto cargamos alumnos, podríamos mejorar esto para buscar cualquiera
                const res = await alumnosAPI.getAll();
                // Mapear para tener formato uniforme
                setUsuarios(res.data.data.map(a => ({
                    id: a.usuario_id || a.id, // Preferir usuario_id si existe
                    nombre: `${a.nombre} ${a.apellido}`
                })));
                setLoading(false);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setImagen(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!titulo || !mensaje) {
            toast.error('Completa los campos obligatorios');
            return;
        }

        if (filtro !== 'todos' && !destinatarioId) {
            toast.error('Selecciona un destinatario');
            return;
        }

        try {
            setSending(true);

            const formData = new FormData();
            formData.append('titulo', titulo);
            formData.append('mensaje', mensaje);
            formData.append('tipo', tipo);
            formData.append('filtro', filtro);
            if (destinatarioId) formData.append('destinatarioId', destinatarioId);
            formData.append('enviarEmail', enviarEmail);
            if (remitente) formData.append('remitente', remitente);
            if (imagen) formData.append('imagen', imagen);

            const response = await notificacionesAPI.send(formData);

            toast.success(response.data.message);

            // Limpiar form
            setTitulo('');
            setMensaje('');
            setRemitente('');
            setImagen(null);
            // Reset file input manually if needed or via ref, but for now just state
            setPaginaDefault();
        } catch (error) {
            console.error('Error enviando comunicado:', error);
            toast.error(error.response?.data?.message || 'Error al enviar comunicado');
        } finally {
            setSending(false);
        }
    };

    const setPaginaDefault = () => {
        setFiltro('todos');
        setDestinatarioId('');
        setEnviarEmail(false);
        setTipo('info');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Comunicados Internos</h1>
                    <p className="text-gray-500 mt-1">Envía notificaciones a usuarios de la plataforma</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => { setActiveTab('redactar'); }}
                        className={`${activeTab === 'redactar'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                        Redactar Nuevo
                    </button>
                    <button
                        onClick={() => { setActiveTab('historial'); cargarHistorial(); }}
                        className={`${activeTab === 'historial'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                    >
                        <AcademicCapIcon className="h-5 w-5 mr-2" />
                        Historial de Envíos
                    </button>
                </nav>
            </div>

            {activeTab === 'redactar' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                    {/* Formulario */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-lg font-bold text-gray-900">Redactar Mensaje</h2>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Destinatarios */}
                                    <div>
                                        <label className="label">Destinatarios</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <select
                                                value={filtro}
                                                onChange={(e) => {
                                                    setFiltro(e.target.value);
                                                    setDestinatarioId('');
                                                }}
                                                className="input w-full"
                                            >
                                                <option value="todos">Todos los Usuarios</option>
                                                <option value="rol">Por Rol</option>
                                                <option value="curso">Por Curso</option>
                                                <option value="usuario">Usuario Específico</option>
                                            </select>

                                            {filtro === 'rol' && (
                                                <select
                                                    value={destinatarioId}
                                                    onChange={(e) => setDestinatarioId(e.target.value)}
                                                    className="input w-full"
                                                    required
                                                >
                                                    <option value="">Selecciona Rol</option>
                                                    <option value="alumno">Alumnos</option>
                                                    <option value="profesor">Profesores</option>
                                                    <option value="admin">Administradores</option>
                                                </select>
                                            )}

                                            {filtro === 'curso' && (
                                                <select
                                                    value={destinatarioId}
                                                    onChange={(e) => setDestinatarioId(e.target.value)}
                                                    className="input w-full"
                                                    required
                                                    disabled={loading}
                                                >
                                                    <option value="">Selecciona Curso</option>
                                                    {cursos.map(c => (
                                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                                    ))}
                                                </select>
                                            )}

                                            {filtro === 'usuario' && (
                                                <select
                                                    value={destinatarioId}
                                                    onChange={(e) => setDestinatarioId(e.target.value)}
                                                    className="input w-full"
                                                    required
                                                    disabled={loading}
                                                >
                                                    <option value="">Selecciona Usuario</option>
                                                    {usuarios.map(u => (
                                                        <option key={u.id} value={u.id}>{u.nombre}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contenido */}
                                    <div>
                                        <label className="label">Título</label>
                                        <input
                                            type="text"
                                            value={titulo}
                                            onChange={(e) => setTitulo(e.target.value)}
                                            className="input w-full"
                                            placeholder="Ej: Cambio de horario, Aviso importante..."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Mensaje</label>
                                        <textarea
                                            value={mensaje}
                                            onChange={(e) => setMensaje(e.target.value)}
                                            className="input w-full"
                                            rows="6"
                                            placeholder="Escribe el contenido del comunicado aquí..."
                                            required
                                        ></textarea>
                                    </div>

                                    {/* Remitente e Imagen */}
                                    <div>
                                        <label className="label">Remitente Personalizado (Opcional)</label>
                                        <input
                                            type="text"
                                            value={remitente}
                                            onChange={(e) => setRemitente(e.target.value)}
                                            className="input w-full"
                                            placeholder="Ej: Profe Ana, Administración, Dirección"
                                        />
                                    </div>

                                    <div>
                                        <label className="label">Adjuntar Imagen (Opcional)</label>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="file-input file-input-bordered w-full"
                                            accept="image/*"
                                        />
                                        <label className="label-text-alt text-gray-400 mt-1">
                                            Formatos: JPG, PNG, GIF. Máx 5MB.
                                        </label>
                                    </div>


                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Tipo */}
                                        <div>
                                            <label className="label">Tipo de Notificación</label>
                                            <div className="flex space-x-4">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input type="radio" name="tipo" value="info" checked={tipo === 'info'} onChange={() => setTipo('info')} className="text-blue-600 focus:ring-blue-500" />
                                                    <span className="text-gray-700">Información</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input type="radio" name="tipo" value="aviso" checked={tipo === 'aviso'} onChange={() => setTipo('aviso')} className="text-yellow-600 focus:ring-yellow-500" />
                                                    <span className="text-gray-700">Aviso</span>
                                                </label>
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input type="radio" name="tipo" value="importante" checked={tipo === 'importante'} onChange={() => setTipo('importante')} className="text-red-600 focus:ring-red-500" />
                                                    <span className="text-gray-700">Importante</span>
                                                </label>
                                            </div>
                                        </div>

                                        {/* Opciones Extra */}
                                        <div>
                                            <label className="label">Opciones de Envío</label>
                                            <label className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${enviarEmail ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'
                                                }`}>
                                                <input
                                                    type="checkbox"
                                                    checked={enviarEmail}
                                                    onChange={(e) => setEnviarEmail(e.target.checked)}
                                                    className="checkbox checkbox-primary"
                                                />
                                                <div className="flex items-center">
                                                    <EnvelopeIcon className={`h-5 w-5 mr-2 ${enviarEmail ? 'text-blue-600' : 'text-gray-400'}`} />
                                                    <span className={`font-medium ${enviarEmail ? 'text-blue-800' : 'text-gray-600'}`}>
                                                        Enviar copia por correo electrónico
                                                    </span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={sending}
                                            className="btn btn-primary px-8 py-3 flex items-center"
                                        >
                                            {sending ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Enviando...
                                                </>
                                            ) : (
                                                <>
                                                    <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                                                    Enviar Comunicado
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Previsualización / Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card bg-gray-50 border-gray-200">
                            <div className="card-body">
                                <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                                    <AcademicCapIcon className="h-5 w-5 mr-2 text-gray-500" />
                                    Sobre los Comunicados
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Los comunicados aparecerán instantáneamente en el panel de control de los usuarios seleccionados.
                                </p>

                                <h4 className="font-medium text-gray-800 text-sm mb-2">Iconografía</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center">
                                        <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                                        <span className="text-gray-600">Info: Notificaciones generales</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                                        <span className="text-gray-600">Aviso: Cambios de horario, recordatorios</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                                        <span className="text-gray-600">Importante: Cancelaciones, urgencias</span>
                                    </div>
                                </div>

                                {enviarEmail && (
                                    <div className="mt-6 p-3 bg-blue-100 rounded-lg border border-blue-200 text-blue-800 text-sm">
                                        <strong>📧 Copia por Email activada:</strong><br />
                                        Se enviará un correo electrónico a cada destinatario además de la notificación en plataforma.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card animate-fade-in">
                    <div className="card-body">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Historial de Envíos Masivos</h2>
                            <button onClick={cargarHistorial} className="btn btn-sm btn-ghost">
                                Actualizar
                            </button>
                        </div>

                        {loading ? (
                            <Loader />
                        ) : historial.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Título</th>
                                            <th>Destinatarios</th>
                                            <th>Leídos</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historial.map((batch) => (
                                            <tr key={batch.batch_id} className="hover">
                                                <td className="text-sm">
                                                    {new Date(batch.fecha).toLocaleString()}
                                                </td>
                                                <td>
                                                    <div className="font-bold">{batch.titulo}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-xs">{batch.mensaje}</div>
                                                    {batch.remitente && <span className="badge badge-xs badge-ghost mt-1">{batch.remitente}</span>}
                                                </td>
                                                <td>
                                                    <div className="flex items-center">
                                                        <UserGroupIcon className="h-4 w-4 mr-1 text-gray-400" />
                                                        {batch.total_destinatarios}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-xs">
                                                        {batch.leidos} ({Math.round((batch.leidos / batch.total_destinatarios) * 100)}%)
                                                    </div>
                                                    <progress className="progress progress-primary w-20" value={batch.leidos} max={batch.total_destinatarios}></progress>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => handleDeleteBatch(batch.batch_id)}
                                                        className="btn btn-error btn-xs"
                                                        title="Eliminar este comunicado para todos"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <EnvelopeIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                                <p>No hay historial de envíos registrados.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Comunicados;
