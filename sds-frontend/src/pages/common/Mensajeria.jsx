import { useState, useEffect } from 'react';
import { whatsappAPI, alumnosAPI, cursosAPI } from '../../services/api';
import { PaperAirplaneIcon, UserGroupIcon, ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import useToast from '../../hooks/useToast';
import Loader from '../../components/Loader';

const Mensajeria = () => {
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [alumnos, setAlumnos] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [variables, setVariables] = useState([]);
    const [activeTab, setActiveTab] = useState('status'); // status, individual, masivo, templates, default to status
    const [status, setStatus] = useState(null);

    // Fetch simple status for tab indicator
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await whatsappAPI.getStatus();
                setStatus(res.data.data);
            } catch (e) {
                console.error(e);
            }
        };
        checkStatus();
    }, []);

    // Formulario individual
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');
    const [mensajeIndividual, setMensajeIndividual] = useState('');

    // Formulario masivo
    const [filtroMasivo, setFiltroMasivo] = useState('todos'); // todos, curso
    const [cursoSeleccionado, setCursoSeleccionado] = useState('');
    const [alumnosSeleccionados, setAlumnosSeleccionados] = useState([]);
    const [mensajeMasivo, setMensajeMasivo] = useState('');
    const [alumnosCurso, setAlumnosCurso] = useState([]); // Alumnos del curso seleccionado
    const [loadingCurso, setLoadingCurso] = useState(false);

    const toast = useToast();

    useEffect(() => {
        cargarDatos();
    }, []);

    // Cargar alumnos del curso cuando se selecciona un curso
    useEffect(() => {
        const cargarAlumnosCurso = async () => {
            if (filtroMasivo === 'curso' && cursoSeleccionado) {
                try {
                    setLoadingCurso(true);
                    const response = await cursosAPI.getParticipantes(cursoSeleccionado);
                    const participantes = response.data.data || [];
                    // Guardar los IDs de los alumnos inscritos en el curso
                    setAlumnosCurso(participantes.map(p => p.usuario_id || p.alumno_id || p.id));
                } catch (error) {
                    console.error('Error cargando alumnos del curso:', error);
                    toast.error('Error al cargar alumnos del curso');
                    setAlumnosCurso([]);
                } finally {
                    setLoadingCurso(false);
                }
            } else {
                setAlumnosCurso([]);
            }
            // Limpiar selección al cambiar de curso
            setAlumnosSeleccionados([]);
        };

        cargarAlumnosCurso();
    }, [filtroMasivo, cursoSeleccionado]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [alumnosRes, cursosRes, templatesRes, variablesRes] = await Promise.all([
                alumnosAPI.getAll(),
                cursosAPI.getAll(),
                whatsappAPI.obtenerTemplates(),
                whatsappAPI.obtenerVariables()
            ]);
            setAlumnos(alumnosRes.data.data || []);
            setCursos(cursosRes.data.data || []);
            setTemplates(templatesRes.data.data || []);
            setVariables(variablesRes.data.data || []);
        } catch (error) {
            console.error('Error cargando datos:', error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const enviarIndividual = async (e) => {
        e.preventDefault();

        const alumno = alumnos.find(a => a.usuario_id === parseInt(alumnoSeleccionado));
        if (!alumno || !alumno.telefono) {
            toast.error('El alumno no tiene teléfono registrado');
            return;
        }

        try {
            setSending(true);
            // Enviar con alumno_id para que el backend obtenga automáticamente todos los datos
            await whatsappAPI.enviarMensaje({
                alumno_id: alumno.usuario_id,
                mensaje: mensajeIndividual
            });
            toast.success(`Mensaje enviado a ${alumno.nombre}`);
            setMensajeIndividual('');
            setAlumnoSeleccionado('');
        } catch (error) {
            console.error('Error enviando mensaje:', error);
            toast.error(error.response?.data?.message || 'Error al enviar mensaje');
        } finally {
            setSending(false);
        }
    };

    const enviarMasivo = async (e) => {
        e.preventDefault();

        if (alumnosSeleccionados.length === 0) {
            toast.error('Selecciona al menos un alumno');
            return;
        }

        try {
            setSending(true);
            const response = await whatsappAPI.enviarMasivo({
                alumno_ids: alumnosSeleccionados,
                mensaje: mensajeMasivo
            });
            toast.success(response.data.message);
            setMensajeMasivo('');
            setAlumnosSeleccionados([]);
            setFiltroMasivo('todos');
        } catch (error) {
            console.error('Error enviando masivo:', error);
            toast.error(error.response?.data?.message || 'Error al enviar mensajes');
        } finally {
            setSending(false);
        }
    };

    const seleccionarTodosCurso = () => {
        // Obtener los alumnos filtrados actualmente visibles
        const alumnosFiltrados = getAlumnosFiltrados();
        const ids = alumnosFiltrados.filter(a => a.telefono).map(a => a.usuario_id);
        setAlumnosSeleccionados(ids);
        toast.success(`${ids.length} alumnos seleccionados`);
    };

    // Función para obtener alumnos filtrados según el curso seleccionado
    const getAlumnosFiltrados = () => {
        if (filtroMasivo === 'curso' && cursoSeleccionado && alumnosCurso.length > 0) {
            return alumnos.filter(a => alumnosCurso.includes(a.usuario_id));
        }
        return alumnos;
    };

    const toggleAlumno = (alumnoId) => {
        setAlumnosSeleccionados(prev =>
            prev.includes(alumnoId)
                ? prev.filter(id => id !== alumnoId)
                : [...prev, alumnoId]
        );
    };

    const aplicarTemplate = (templateId) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            if (activeTab === 'individual') {
                setMensajeIndividual(template.mensaje);
            } else {
                setMensajeMasivo(template.mensaje);
            }
            toast.success(`Template "${template.nombre}" aplicado`);
        }
    };

    const insertarVariable = (variable) => {
        const mensajeActual = activeTab === 'individual' ? mensajeIndividual : mensajeMasivo;
        const nuevoMensaje = mensajeActual + variable;

        if (activeTab === 'individual') {
            setMensajeIndividual(nuevoMensaje);
        } else {
            setMensajeMasivo(nuevoMensaje);
        }
    };

    const escapeHtml = (str) => {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    };

    const procesarPreview = (mensaje) => {
        if (!mensaje) return 'Tu mensaje aparecerá aquí...';

        // Escape the raw message content first to prevent XSS
        const mensajeEscapado = escapeHtml(mensaje);

        // Datos de ejemplo para el preview
        const datosEjemplo = {
            '{nombre}': 'María',
            '{apellido}': 'González',
            '{email}': 'maria@example.com',
            '{telefono}': '+5491112345678',
            '{monto}': '5000',
            '{fecha_vencimiento}': '31/12/2026',
            '{concepto}': 'Mensualidad Diciembre',
            '{curso}': 'Salsa Intermedio',
            '{evento}': 'Show de Fin de Año',
            '{fecha_evento}': '25/12/2026',
            '{hora_evento}': '20:00',
            '{ubicacion}': 'Teatro Municipal'
        };

        let mensajeProcesado = mensajeEscapado;
        Object.entries(datosEjemplo).forEach(([variable, valor]) => {
            mensajeProcesado = mensajeProcesado.replace(
                new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'),
                `<span class="text-blue-600 font-semibold">${escapeHtml(valor)}</span>`
            );
        });

        return mensajeProcesado;
    };

    const handleTestCron = async () => {
        if (!window.confirm('¿Estás seguro de que deseas simular el envío de recordatorios? Esto buscará pagos que vencen en 3 días y enviará mensajes reales a los alumnos correspondientes.')) {
            return;
        }

        try {
            const response = await whatsappAPI.testCron();
            toast.success(response.data.message || 'Proceso de recordatorios iniciado');
        } catch (error) {
            console.error('Error simulando recordatorios:', error);
            toast.error('Error al iniciar simulación');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Mensajería WhatsApp</h1>
                    <p className="text-gray-500 mt-1">Envía mensajes automáticos a tus alumnos</p>
                </div>
                <button
                    onClick={handleTestCron}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-600 text-gray-900 rounded-lg transition-colors border border-gray-300 text-sm"
                    title="Ejecutar manualmente los recordatorios programados (útil para pruebas)"
                >
                    <ClockIcon className="h-4 w-4 text-yellow-400" />
                    <span>Simular Recordatorios</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto pb-1 scrollbar-hide">
                <button
                    onClick={() => setActiveTab('status')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'status'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-600'
                        }`}
                >
                    <span className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${status?.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        Estado
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab('individual')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'individual'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-gray-500 hover:text-gray-600'
                        }`}
                >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 inline mr-2" />
                    Individual
                </button>
                <button
                    onClick={() => setActiveTab('masivo')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'masivo'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-gray-500 hover:text-gray-600'
                        }`}
                >
                    <UserGroupIcon className="h-5 w-5 inline mr-2" />
                    Masivo
                </button>
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'templates'
                        ? 'text-blue-400 border-b-2 border-blue-400'
                        : 'text-gray-500 hover:text-gray-600'
                        }`}
                >
                    📝 Templates
                </button>
            </div>

            {/* Contenido */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulario Principal */}
                <div className="lg:col-span-2">

                    {activeTab === 'status' && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-xl font-bold text-gray-900">Estado de Conexión</h2>
                            </div>
                            <div className="card-body flex flex-col items-center justify-center space-y-6 py-8">
                                <StatusView />
                            </div>
                        </div>
                    )}

                    {activeTab === 'individual' && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-xl font-bold text-gray-900">Enviar Mensaje Individual</h2>
                            </div>
                            <div className="card-body">
                                <form onSubmit={enviarIndividual} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            Alumno
                                        </label>
                                        <select
                                            value={alumnoSeleccionado}
                                            onChange={(e) => setAlumnoSeleccionado(e.target.value)}
                                            className="input w-full"
                                            required
                                        >
                                            <option value="">Selecciona un alumno</option>
                                            {alumnos.filter(a => a.telefono).map(alumno => (
                                                <option key={alumno.usuario_id} value={alumno.usuario_id}>
                                                    {alumno.nombre} {alumno.apellido} ({alumno.telefono})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            Mensaje
                                        </label>
                                        <textarea
                                            value={mensajeIndividual}
                                            onChange={(e) => setMensajeIndividual(e.target.value)}
                                            className="input w-full"
                                            rows="6"
                                            placeholder="Escribe tu mensaje aquí... Usa variables como {nombre}, {monto}, etc."
                                            required
                                        />

                                        {/* Botones de variables */}
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            <span className="text-xs text-gray-500 w-full mb-1">Insertar variable:</span>
                                            {variables.slice(0, 6).map((variable) => (
                                                <button
                                                    key={variable.nombre}
                                                    type="button"
                                                    onClick={() => insertarVariable(variable.nombre)}
                                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-600 text-gray-600 rounded transition-colors"
                                                    title={variable.descripcion}
                                                >
                                                    {variable.nombre}
                                                </button>
                                            ))}
                                        </div>

                                        <p className="text-sm text-gray-500 mt-1">
                                            {mensajeIndividual.length} caracteres
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sending}
                                        className="btn btn-primary w-full flex items-center justify-center"
                                    >
                                        {sending ? (
                                            <>Enviando...</>
                                        ) : (
                                            <>
                                                <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                                                Enviar Mensaje
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'masivo' && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-xl font-bold text-gray-900">Enviar Mensaje Masivo</h2>
                            </div>
                            <div className="card-body">
                                <form onSubmit={enviarMasivo} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            Destinatarios
                                        </label>
                                        <div className="flex space-x-2 mb-3">
                                            <select
                                                value={filtroMasivo}
                                                onChange={(e) => setFiltroMasivo(e.target.value)}
                                                className="input flex-1"
                                            >
                                                <option value="todos">Todos los alumnos</option>
                                                <option value="curso">Por curso</option>
                                            </select>
                                            {filtroMasivo === 'curso' && (
                                                <>
                                                    <select
                                                        value={cursoSeleccionado}
                                                        onChange={(e) => setCursoSeleccionado(e.target.value)}
                                                        className="input flex-1"
                                                    >
                                                        <option value="">Selecciona curso</option>
                                                        {cursos.map(curso => (
                                                            <option key={curso.id} value={curso.id}>
                                                                {curso.nombre}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={seleccionarTodosCurso}
                                                        className="btn btn-secondary"
                                                    >
                                                        Seleccionar todos
                                                    </button>
                                                </>
                                            )}
                                        </div>

                                        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-1">
                                            {loadingCurso ? (
                                                <div className="text-center py-4 text-gray-500">
                                                    Cargando alumnos del curso...
                                                </div>
                                            ) : getAlumnosFiltrados().filter(a => a.telefono).length === 0 ? (
                                                <div className="text-center py-4 text-gray-500">
                                                    {filtroMasivo === 'curso' && cursoSeleccionado
                                                        ? 'No hay alumnos inscritos en este curso con teléfono'
                                                        : 'No hay alumnos con teléfono registrado'}
                                                </div>
                                            ) : (
                                                getAlumnosFiltrados().filter(a => a.telefono).map(alumno => (
                                                    <label
                                                        key={alumno.usuario_id}
                                                        className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={alumnosSeleccionados.includes(alumno.usuario_id)}
                                                            onChange={() => toggleAlumno(alumno.usuario_id)}
                                                            className="w-4 h-4"
                                                        />
                                                        <span className="text-sm text-gray-600">
                                                            {alumno.nombre} {alumno.apellido}
                                                        </span>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {alumnosSeleccionados.length} destinatarios seleccionados
                                            {filtroMasivo === 'curso' && cursoSeleccionado && (
                                                <span className="text-blue-400 ml-2">
                                                    (de {getAlumnosFiltrados().filter(a => a.telefono).length} en el curso)
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            Mensaje
                                        </label>
                                        <textarea
                                            value={mensajeMasivo}
                                            onChange={(e) => setMensajeMasivo(e.target.value)}
                                            className="input w-full"
                                            rows="6"
                                            placeholder="Escribe tu mensaje aquí... Cada alumno recibirá el mensaje personalizado con sus datos."
                                            required
                                        />

                                        {/* Botones de variables */}
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            <span className="text-xs text-gray-500 w-full mb-1">Insertar variable (se reemplazará automáticamente por los datos de cada alumno):</span>
                                            {variables.map((variable) => (
                                                <button
                                                    key={variable.nombre}
                                                    type="button"
                                                    onClick={() => insertarVariable(variable.nombre)}
                                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-600 text-gray-600 rounded transition-colors"
                                                    title={`${variable.descripcion} - Ejemplo: ${variable.ejemplo}`}
                                                >
                                                    {variable.nombre}
                                                </button>
                                            ))}
                                        </div>

                                        <p className="text-sm text-gray-500 mt-2">
                                            💡 Cada mensaje será personalizado con los datos del destinatario
                                        </p>
                                    </div>

                                    <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3">
                                        <p className="text-sm text-yellow-200">
                                            ⚠️ Estás a punto de enviar mensajes a {alumnosSeleccionados.length} personas.
                                            Asegúrate de revisar el mensaje antes de enviar.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={sending || alumnosSeleccionados.length === 0}
                                        className="btn btn-primary w-full flex items-center justify-center"
                                    >
                                        {sending ? (
                                            <>Enviando...</>
                                        ) : (
                                            <>
                                                <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                                                Enviar a {alumnosSeleccionados.length} personas
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'templates' && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="text-xl font-bold text-gray-900">Templates de Mensajes</h2>
                            </div>
                            <div className="card-body space-y-4">
                                {templates.map(template => (
                                    <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{template.nombre}</h3>
                                        <pre className="text-sm text-gray-600 bg-white p-3 rounded whitespace-pre-wrap font-sans">
                                            {template.mensaje}
                                        </pre>
                                        <div className="mt-3 flex items-center justify-between">
                                            <p className="text-xs text-gray-500">
                                                Variables: {template.variables.map(v => `{${v}}`).join(', ')}
                                            </p>
                                            <button
                                                onClick={() => aplicarTemplate(template.id)}
                                                className="btn btn-sm btn-secondary"
                                            >
                                                Usar template
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar - Preview */}
                <div className="lg:col-span-1">
                    <div className="card sticky top-4">
                        <div className="card-header">
                            <h3 className="text-lg font-bold text-gray-900">📱 Preview</h3>
                        </div>
                        <div className="card-body space-y-4">
                            <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-700 rounded-lg p-4">
                                <div className="bg-white text-black p-3 rounded-lg shadow-lg">
                                    <p className="text-xs text-gray-500 mb-2">WhatsApp</p>
                                    <div
                                        className="text-sm whitespace-pre-wrap break-words"
                                        dangerouslySetInnerHTML={{
                                            __html: procesarPreview(
                                                activeTab === 'individual' ? mensajeIndividual : mensajeMasivo
                                            )
                                        }}
                                    />
                                    <p className="text-xs text-gray-500 mt-2 text-right">
                                        {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>

                            {/* Variables disponibles */}
                            <div className="border border-gray-200 rounded-lg p-3">
                                <h4 className="text-sm font-bold text-gray-900 mb-2">📝 Variables disponibles:</h4>
                                <div className="space-y-1 text-xs">
                                    {variables.slice(0, 6).map((variable) => (
                                        <div key={variable.nombre} className="text-gray-600">
                                            <span className="text-blue-400 font-mono">{variable.nombre}</span> - {variable.descripcion}
                                        </div>
                                    ))}
                                    {variables.length > 6 && (
                                        <p className="text-gray-500 italic mt-1">Y {variables.length - 6} más...</p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <p>💡 <strong>Tip:</strong> Usa emojis para hacer tus mensajes más amigables</p>
                                <p>⚡ <strong>Formato:</strong> Usa *negrita* para resaltar</p>
                                {activeTab === 'masivo' && (
                                    <p className="text-blue-400">✨ <strong>Masivo:</strong> Cada alumno recibirá datos personalizados</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusView = () => {
    const [statusData, setStatusData] = useState({ status: 'loading', qr: null });
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            const response = await whatsappAPI.getStatus();
            setStatusData(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching status:', error);
            setStatusData({ status: 'error', qr: null });
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(async () => {
            // Si ya está conectado, no tiene sentido seguir actualizando tan frecuente
            if (statusData.status === 'connected' || statusData.status === 'authenticated') {
                clearInterval(interval);
                return;
            }
            await fetchStatus();
        }, 10000); // Poll cada 10s (antes era 5s)
        return () => clearInterval(interval);
    }, [statusData.status]);

    if (loading) return <div className="text-gray-500">Cargando estado...</div>;

    return (
        <div className="flex flex-col items-center text-center space-y-4 max-w-md mx-auto">
            {statusData.status === 'connected' || statusData.status === 'authenticated' ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg flex flex-col items-center">
                    <div className="h-16 w-16 bg-green-500 rounded-full flex items-center justify-center mb-2">
                        <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold">¡Bot Conectado!</h3>
                    <p className="text-sm mt-1">El sistema está listo para enviar y recibir mensajes.</p>
                </div>
            ) : statusData.status === 'qr_ready' ? (
                <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Escanea el código QR</h3>
                    <p className="text-sm text-gray-500 mb-4">Abre WhatsApp en tu teléfono → Menú → Dispositivos vinculados → Vincular dispositivo</p>
                    {statusData.qr ? (
                        <div className="border-4 border-gray-900 rounded-lg p-2 bg-white inline-block">
                            <img src={statusData.qr} alt="QR Code" className="w-64 h-64 object-contain" />
                        </div>
                    ) : (
                        <div className="w-64 h-64 bg-gray-100 flex items-center justify-center rounded-lg">
                            <span className="text-gray-400">Generando QR...</span>
                        </div>
                    )}
                    <p className="text-xs text-gray-400 mt-4">El QR se actualiza cada pocos segundos.</p>
                </div>
            ) : (
                <div className="text-gray-500">
                    <p>Estado: {statusData.status}</p>
                    <p className="text-sm">Esperando inicialización...</p>
                </div>
            )}

            <div className="text-xs text-gray-400 bg-gray-50 p-2 rounded w-full">
                Estado interno: <span className="font-mono">{statusData.status}</span>
            </div>
        </div>
    );
};

export default Mensajeria;

