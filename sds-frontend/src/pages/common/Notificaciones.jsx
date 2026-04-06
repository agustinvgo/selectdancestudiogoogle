import { useState, useEffect } from 'react';
import { emailsAPI, alumnosAPI } from '../../services/api';
import {
    EnvelopeIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import useToast from '../../hooks/useToast';
import Button from '../../components/Button';
import ConfirmDialog from '../../components/ConfirmDialog';
import useConfirm from '../../hooks/useConfirm';

const Notificaciones = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [emailTest, setEmailTest] = useState('');

    // Estado para email personalizado
    const [alumnos, setAlumnos] = useState([]);
    const [selectedAlumno, setSelectedAlumno] = useState('');
    const [customEmail, setCustomEmail] = useState({
        email: '',
        nombre: '',
        asunto: '',
        mensaje: ''
    });
    const [enviarA_Todos, setEnviarA_Todos] = useState(false);

    // Estado para filtro de recordatorios por mes
    const currentDate = new Date();
    const [filtroMes, setFiltroMes] = useState(currentDate.getMonth() + 1); // 1-12
    const [filtroAnio, setFiltroAnio] = useState(currentDate.getFullYear());
    const [enviarTodosPendientes, setEnviarTodosPendientes] = useState(false);

    const toast = useToast();
    const { isOpen, confirmConfig, confirm, closeConfirm } = useConfirm();

    useEffect(() => {
        cargarAlumnos();
    }, []);

    const cargarAlumnos = async () => {
        try {
            const response = await alumnosAPI.getAll();
            if (response.data.success) {
                setAlumnos(response.data.data);
            } else {
                console.error('Error en respuesta de alumnos:', response.data);
            }
        } catch (error) {
            console.error('Error cargando alumnos:', error);
        }
    };

    const handleAlumnoChange = (e) => {
        const alumnoId = e.target.value;
        setSelectedAlumno(alumnoId);

        if (alumnoId) {
            const alumno = alumnos.find(a => a.id === parseInt(alumnoId));
            if (alumno) {
                setCustomEmail(prev => ({
                    ...prev,
                    email: alumno.email,
                    nombre: `${alumno.nombre} ${alumno.apellido}`
                }));
            }
        } else {
            setCustomEmail(prev => ({
                ...prev,
                email: '',
                nombre: ''
            }));
        }
    };

    const enviarRecordatoriosMasivos = async () => {
        const periodo = enviarTodosPendientes ? 'todos los períodos' : `${filtroMes}/${filtroAnio}`;
        confirm({
            title: '¿Enviar recordatorios masivos?',
            message: `Se enviarán recordatorios de pago a alumnos con pagos pendientes de ${periodo}.`,
            variant: 'info',
            confirmText: 'Enviar',
            onConfirm: async () => {
                try {
                    setLoading(true);
                    setResult(null);

                    // Preparar filtros
                    const filtros = enviarTodosPendientes ? {} : { mes: filtroMes, anio: filtroAnio };

                    const response = await emailsAPI.enviarRecordatoriosMasivos(filtros);
                    setResult({
                        type: response.data.success ? 'success' : 'error',
                        message: response.data.message || 'Proceso completado',
                        details: response.data.data,
                        timestamp: new Date().toLocaleString('es-AR')
                    });
                } catch (error) {
                    console.error('Error enviando recordatorios:', error);
                    setResult({
                        type: 'error',
                        message: error.response?.data?.message || 'Error al enviar recordatorios',
                        timestamp: new Date().toLocaleString('es-AR')
                    });
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const probarConfiguracion = async () => {
        if (!emailTest) {
            toast.warning('Ingresa un email para probar');
            return;
        }

        setResult(null);
        setLoading(true);

        try {
            const response = await emailsAPI.test(emailTest);
            setResult({
                success: true,
                message: `Email de prueba enviado a ${emailTest}`
            });
        } catch (error) {
            setResult({
                success: false,
                message: error.response?.data?.message || 'Error al enviar email de prueba'
            });
        } finally {
            setLoading(false);
        }
    };

    const enviarEmailPersonalizado = async (e) => {
        e.preventDefault();

        if (!enviarA_Todos && !customEmail.email) {
            toast.warning('Por favor especifica el destinatario');
            return;
        }

        if (!customEmail.asunto || !customEmail.mensaje) {
            toast.warning('Por favor completa todos los campos');
            return;
        }

        if (enviarA_Todos) {
            confirm({
                title: '\u00bfEnviar a todos?',
                message: '\u00bfEst\u00e1s seguro de enviar este correo a TODOS los alumnos?',
                variant: 'warning',
                confirmText: 'Enviar a Todos',
                onConfirm: () => procederEnvioEmail()
            });
        } else {
            procederEnvioEmail();
        }
    };

    const procederEnvioEmail = async () => {
        setResult(null);
        setLoading(true);

        try {
            let response;
            if (enviarA_Todos) {
                response = await emailsAPI.enviarMasivoPersonalizado({
                    asunto: customEmail.asunto,
                    mensaje: customEmail.mensaje
                });
                setResult({
                    success: true,
                    message: response.data.message,
                    data: response.data.data
                });
            } else {
                response = await emailsAPI.enviarPersonalizado(customEmail);
                setResult({
                    success: true,
                    message: `Email enviado correctamente a ${customEmail.email}`
                });
            }

            // Limpiar formulario
            setCustomEmail({
                email: '',
                nombre: '',
                asunto: '',
                mensaje: ''
            });
            setSelectedAlumno('');
            setEnviarA_Todos(false);
        } catch (error) {
            setResult({
                success: false,
                message: error.response?.data?.message || 'Error al enviar email personalizado'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Notificaciones por Email</h1>
                <p className="text-gray-500 mt-1">Envía recordatorios y notificaciones automáticas</p>
            </div>

            {/* Resultado */}
            {result && (
                <div className={`card ${result.success ? 'border-green-900 bg-green-900/10' : 'border-red-900 bg-red-900/10'}`}>
                    <div className="card-body">
                        <div className="flex items-start space-x-3">
                            {result.success ? (
                                <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
                            ) : (
                                <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
                            )}
                            <div>
                                <p className={`font-semibold ${result.success ? 'text-green-500' : 'text-red-500'}`}>
                                    {result.success ? '✅ Éxito' : '❌ Error'}
                                </p>
                                <p className="text-gray-600 mt-1">{result.message}</p>
                                {result.data && (
                                    <div className="mt-2 text-sm text-gray-500">
                                        <p>Enviados: {result.data.enviados}</p>
                                        <p>Errores: {result.data.errores}</p>
                                        <p>Total: {result.data.total}</p>
                                        {result.data.detalles && result.data.detalles.length > 0 && (
                                            <div className="mt-2 p-2 bg-red-900/30 rounded text-xs text-red-200 max-h-32 overflow-y-auto">
                                                <p className="font-bold mb-1">Detalle de errores:</p>
                                                <ul className="list-disc list-inside">
                                                    {result.data.detalles.map((err, idx) => (
                                                        <li key={idx}>{err}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Email Personalizado */}
                <div className="card lg:col-span-2 border-blue-900">
                    <div className="card-header bg-blue-900/20">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <EnvelopeIcon className="h-5 w-5" />
                            Enviar Email Personalizado
                        </h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={enviarEmailPersonalizado} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="flex items-center space-x-2 cursor-pointer bg-white p-3 rounded border border-gray-200">
                                        <input
                                            type="checkbox"
                                            checked={enviarA_Todos}
                                            onChange={(e) => {
                                                setEnviarA_Todos(e.target.checked);
                                                if (e.target.checked) {
                                                    setSelectedAlumno('');
                                                    setCustomEmail(prev => ({ ...prev, email: '', nombre: '' }));
                                                }
                                            }}
                                            className="checkbox checkbox-primary"
                                        />
                                        <span className="text-gray-900 font-medium">Enviar a todos los alumnos</span>
                                    </label>
                                </div>

                                {!enviarA_Todos && (
                                    <>
                                        <div>
                                            <label className="label">Seleccionar Alumno (Opcional)</label>
                                            <select
                                                className="input w-full"
                                                value={selectedAlumno}
                                                onChange={handleAlumnoChange}
                                            >
                                                <option value="">-- Seleccionar alumno --</option>
                                                {alumnos.map(alumno => (
                                                    <option key={alumno.id} value={alumno.id}>
                                                        {alumno.nombre} {alumno.apellido} ({alumno.email})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Email Destino</label>
                                            <input
                                                type="email"
                                                required={!enviarA_Todos}
                                                className="input w-full"
                                                value={customEmail.email}
                                                onChange={(e) => setCustomEmail({ ...customEmail, email: e.target.value })}
                                                placeholder="alumno@ejemplo.com"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div>
                                <label className="label">Asunto</label>
                                <input
                                    type="text"
                                    required
                                    className="input w-full"
                                    value={customEmail.asunto}
                                    onChange={(e) => setCustomEmail({ ...customEmail, asunto: e.target.value })}
                                    placeholder="Asunto del correo"
                                />
                            </div>

                            <div>
                                <label className="label">Mensaje</label>
                                <textarea
                                    required
                                    rows="6"
                                    className="input w-full"
                                    value={customEmail.mensaje}
                                    onChange={(e) => setCustomEmail({ ...customEmail, mensaje: e.target.value })}
                                    placeholder="Escribe tu mensaje aquí..."
                                ></textarea>
                                <p className="text-xs text-gray-500 mt-1">
                                    El mensaje se enviará con el formato oficial de Select Dance Studio.
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <Button
                                    type="submit"
                                    loading={loading}
                                    className="flex items-center space-x-2"
                                >
                                    <PaperAirplaneIcon className="h-5 w-5" />
                                    <span>Enviar Email</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Recordatorios de Pago */}
                <div className="card border-yellow-900">
                    <div className="card-header bg-yellow-900/20">
                        <h3 className="text-lg font-semibold text-gray-900">
                            💰 Recordatorios de Pago
                        </h3>
                    </div>
                    <div className="card-body">
                        <p className="text-gray-500 mb-4">
                            Envía recordatorios de pago automáticos a alumnos con pagos pendientes.
                        </p>

                        {/* Filtros de Mes/Año */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                            <div>
                                <label className="flex items-center space-x-2 cursor-pointer mb-3">
                                    <input
                                        type="checkbox"
                                        checked={enviarTodosPendientes}
                                        onChange={(e) => setEnviarTodosPendientes(e.target.checked)}
                                        className="checkbox checkbox-primary"
                                    />
                                    <span className="text-gray-900 font-medium">Enviar a todos los pendientes (sin filtro de mes)</span>
                                </label>
                            </div>

                            {!enviarTodosPendientes && (
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="label">Mes</label>
                                        <select
                                            className="input w-full"
                                            value={filtroMes}
                                            onChange={(e) => setFiltroMes(parseInt(e.target.value))}
                                        >
                                            <option value={1}>Enero</option>
                                            <option value={2}>Febrero</option>
                                            <option value={3}>Marzo</option>
                                            <option value={4}>Abril</option>
                                            <option value={5}>Mayo</option>
                                            <option value={6}>Junio</option>
                                            <option value={7}>Julio</option>
                                            <option value={8}>Agosto</option>
                                            <option value={9}>Septiembre</option>
                                            <option value={10}>Octubre</option>
                                            <option value={11}>Noviembre</option>
                                            <option value={12}>Diciembre</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label">Año</label>
                                        <input
                                            type="number"
                                            className="input w-full"
                                            value={filtroAnio}
                                            onChange={(e) => setFiltroAnio(parseInt(e.target.value))}
                                            min={2020}
                                            max={2030}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <p className="text-sm text-gray-500 mb-2">El email incluirá:</p>
                            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                <li>Concepto del pago</li>
                                <li>Monto adeudado</li>
                                <li>Fecha de vencimiento</li>
                                <li>Datos de contacto de la escuela</li>
                            </ul>
                        </div>
                        <Button
                            onClick={enviarRecordatoriosMasivos}
                            loading={loading}
                            className="w-full flex justify-center items-center space-x-2"
                        >
                            <PaperAirplaneIcon className="h-5 w-5" />
                            <span>Enviar Recordatorios Masivos</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={isOpen}
                onClose={closeConfirm}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                variant={confirmConfig.variant}
                confirmText={confirmConfig.confirmText}
                cancelText={confirmConfig.cancelText}
            />
        </div>
    );
};

export default Notificaciones;


