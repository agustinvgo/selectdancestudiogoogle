import { useState, useEffect } from 'react';
import { emailsAPI, alumnosAPI } from '../services/api';
import {
    EnvelopeIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    UserIcon
} from '@heroicons/react/24/outline';

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
        if (!confirm('¿Enviar recordatorios de pago a todos los alumnos con pagos pendientes?')) {
            return;
        }

        setResult(null);
        setLoading(true);

        try {
            const response = await emailsAPI.enviarRecordatoriosMasivos();
            setResult({
                success: true,
                message: response.data.message,
                data: response.data.data
            });
        } catch (error) {
            setResult({
                success: false,
                message: error.response?.data?.message || 'Error al enviar recordatorios'
            });
        } finally {
            setLoading(false);
        }
    };

    const probarConfiguracion = async () => {
        if (!emailTest) {
            alert('Ingresa un email para probar');
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

        if ((!enviarA_Todos && !customEmail.email) || !customEmail.asunto || !customEmail.mensaje) {
            alert('Por favor completa todos los campos');
            return;
        }

        if (enviarA_Todos && !confirm('¿Estás seguro de enviar este correo a TODOS los alumnos?')) {
            return;
        }

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
                <h1 className="text-3xl font-bold text-white">Notificaciones por Email</h1>
                <p className="text-gray-400 mt-1">Envía recordatorios y notificaciones automáticas</p>
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
                                <p className="text-gray-300 mt-1">{result.message}</p>
                                {result.data && (
                                    <div className="mt-2 text-sm text-gray-400">
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
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <EnvelopeIcon className="h-5 w-5" />
                            Enviar Email Personalizado
                        </h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={enviarEmailPersonalizado} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="flex items-center space-x-2 cursor-pointer bg-gray-800 p-3 rounded border border-gray-700">
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
                                        <span className="text-white font-medium">Enviar a todos los alumnos</span>
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
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary flex items-center space-x-2"
                                >
                                    <PaperAirplaneIcon className="h-5 w-5" />
                                    <span>{loading ? 'Enviando...' : 'Enviar Email'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Recordatorios de Pago */}
                <div className="card border-yellow-900">
                    <div className="card-header bg-yellow-900/20">
                        <h3 className="text-lg font-semibold text-white">
                            💰 Recordatorios de Pago
                        </h3>
                    </div>
                    <div className="card-body">
                        <p className="text-gray-400 mb-4">
                            Envía recordatorios de pago automáticos a todos los alumnos que tienen pagos pendientes o vencidos.
                        </p>
                        <div className="bg-gray-900 p-4 rounded-lg mb-4">
                            <p className="text-sm text-gray-400 mb-2">El email incluirá:</p>
                            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                                <li>Concepto del pago</li>
                                <li>Monto adeudado</li>
                                <li>Fecha de vencimiento</li>
                                <li>Datos de contacto de la escuela</li>
                            </ul>
                        </div>
                        <button
                            onClick={enviarRecordatoriosMasivos}
                            disabled={loading}
                            className="btn btn-primary w-full flex justify-center items-center space-x-2"
                        >
                            <PaperAirplaneIcon className="h-5 w-5" />
                            <span>{loading ? 'Enviando...' : 'Enviar Recordatorios Masivos'}</span>
                        </button>
                    </div>
                </div>

                {/* Probar Configuración */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="text-lg font-semibold text-white">🧪 Probar Configuración</h3>
                    </div>
                    <div className="card-body">
                        <p className="text-gray-400 mb-4">
                            Envía un email de prueba para verificar que la configuración SMTP funciona correctamente.
                        </p>
                        <div className="flex items-center space-x-3">
                            <input
                                type="email"
                                value={emailTest}
                                onChange={(e) => setEmailTest(e.target.value)}
                                placeholder="tu@email.com"
                                className="input flex-1"
                            />
                            <button
                                onClick={probarConfiguracion}
                                disabled={loading}
                                className="btn btn-primary flex items-center space-x-2"
                            >
                                <EnvelopeIcon className="h-5 w-5" />
                                <span>Probar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información importante */}
            <div className="card border-blue-900 bg-blue-900/10">
                <div className="card-body">
                    <h4 className="font-semibold text-blue-400 mb-2">ℹ️ Configuración SMTP Requerida</h4>
                    <p className="text-sm text-gray-300 mb-3">
                        Para que los emails funcionen, debes configurar las variables SMTP en el archivo <code className="bg-gray-900 px-2 py-1 rounded">.env</code> del backend.
                    </p>
                    <details className="text-sm text-gray-400">
                        <summary className="cursor-pointer hover:text-white">Ver instrucciones</summary>
                        <div className="mt-3 space-y-2">
                            <p>Agrega estas variables a tu archivo <code>.env</code>:</p>
                            <pre className="bg-gray-900 p-3 rounded text-xs overflow-x-auto">
                                {`SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion`}
                            </pre>
                            <p className="text-yellow-500">
                                ⚠️ Para Gmail, necesitas crear una "Contraseña de aplicación" en tu cuenta de Google
                            </p>
                        </div>
                    </details>
                </div>
            </div>
        </div>
    );
};

export default Notificaciones;
