import { useState, useEffect, useRef } from 'react';
import { notificacionesAPI, cursosAPI, eventosAPI, alumnosAPI, getMediaUrl } from '../../services/api';
import useToast from '../../hooks/useToast';
import useConfirm from '../../hooks/useConfirm';
import ConfirmDialog from '../../components/ConfirmDialog';
import {
    PaperAirplaneIcon,
    UserGroupIcon,
    AcademicCapIcon,
    UserIcon,
    EnvelopeIcon,
    PhotoIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';
import FormattedMessage, { stripMessageFormatting } from '../../components/common/FormattedMessage';

const ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'image/avif'
]);
const ALLOWED_IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'avif']);
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_SERVER_PIXELS = 40_000_000;
const MAX_SAFE_PREVIEW_PIXELS = 8_000_000;
const PREVIEW_MAX_DIMENSION = 1280;
const CLIENT_OPTIMIZABLE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const formatFileSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const readJpegDimensions = (view) => {
    if (view.byteLength < 4 || view.getUint16(0) !== 0xFFD8) return null;
    let offset = 2;
    while (offset + 9 < view.byteLength) {
        if (view.getUint8(offset) !== 0xFF) {
            offset += 1;
            continue;
        }
        const marker = view.getUint8(offset + 1);
        offset += 2;
        if (marker === 0xD8 || marker === 0xD9) continue;
        if (offset + 2 > view.byteLength) break;
        const segmentLength = view.getUint16(offset);
        const isStartOfFrame = [
            0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7,
            0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF
        ].includes(marker);
        if (isStartOfFrame && offset + 7 < view.byteLength) {
            return {
                width: view.getUint16(offset + 5),
                height: view.getUint16(offset + 3)
            };
        }
        if (segmentLength < 2) break;
        offset += segmentLength;
    }
    return null;
};

const readImageDimensions = async (file) => {
    // Leer solo el encabezado evita decodificar una foto enorme para conocer su tamaño.
    const header = await file.slice(0, Math.min(file.size, 1024 * 1024)).arrayBuffer();
    const view = new DataView(header);

    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        return readJpegDimensions(view);
    }
    if (file.type === 'image/png' && view.byteLength >= 24) {
        return { width: view.getUint32(16), height: view.getUint32(20) };
    }
    if (file.type === 'image/webp' && view.byteLength >= 30) {
        const chunk = String.fromCharCode(...new Uint8Array(header, 12, 4));
        if (chunk === 'VP8X') {
            return {
                width: 1 + view.getUint8(24) + (view.getUint8(25) << 8) + (view.getUint8(26) << 16),
                height: 1 + view.getUint8(27) + (view.getUint8(28) << 8) + (view.getUint8(29) << 16)
            };
        }
        if (chunk === 'VP8 ') {
            return { width: view.getUint16(26, true) & 0x3FFF, height: view.getUint16(28, true) & 0x3FFF };
        }
        if (chunk === 'VP8L' && view.byteLength >= 25) {
            const b1 = view.getUint8(21);
            const b2 = view.getUint8(22);
            const b3 = view.getUint8(23);
            const b4 = view.getUint8(24);
            return {
                width: 1 + b1 + ((b2 & 0x3F) << 8),
                height: 1 + (b2 >> 6) + (b3 << 2) + ((b4 & 0x0F) << 10)
            };
        }
    }
    return null;
};

const canvasToBlob = (canvas) => new Promise((resolve, reject) => {
    canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen optimizada.')),
        'image/webp',
        0.84
    );
});

const createOptimizedImage = async (file, dimensions) => {
    if (!CLIENT_OPTIMIZABLE_TYPES.has(file.type) || typeof createImageBitmap !== 'function') return null;
    const pixels = dimensions.width * dimensions.height;
    if (pixels > MAX_SAFE_PREVIEW_PIXELS) return null;

    const scale = Math.min(1, PREVIEW_MAX_DIMENSION / Math.max(dimensions.width, dimensions.height));
    const width = Math.max(1, Math.round(dimensions.width * scale));
    const height = Math.max(1, Math.round(dimensions.height * scale));
    const bitmap = await createImageBitmap(file, {
        imageOrientation: 'from-image',
        resizeWidth: width,
        resizeHeight: height,
        resizeQuality: 'high'
    });

    try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error('El navegador no pudo preparar la imagen.');
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(bitmap, 0, 0, width, height);
        const blob = await canvasToBlob(canvas);
        const baseName = file.name.replace(/\.[^.]+$/, '') || 'comunicado';
        return new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() });
    } finally {
        bitmap.close?.();
    }
};

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
    const [imagenPreview, setImagenPreview] = useState('');
    const [imagenOriginal, setImagenOriginal] = useState(null);
    const [processingImage, setProcessingImage] = useState(false);
    const [previewOmitted, setPreviewOmitted] = useState(false);
    const fileInputRef = useRef(null);
    const messageInputRef = useRef(null);

    // Destinatarios
    const [filtro, setFiltro] = useState('todos'); // todos, rol, curso, evento, usuario
    const [destinatarioId, setDestinatarioId] = useState('');

    // Listas para selectores
    const [cursos, setCursos] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [usuarios, setUsuarios] = useState([]); // Alumnos o Profesores según necesidad

    const toast = useToast();
    const { isOpen, confirmConfig, confirm, closeConfirm } = useConfirm();

    // Tabs & Historial
    const [activeTab, setActiveTab] = useState('redactar'); // 'redactar' | 'historial'
    const [historial, setHistorial] = useState([]);

    // Modal de destinatarios
    const [showRecipientsModal, setShowRecipientsModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [recipients, setRecipients] = useState([]);
    const [loadingRecipients, setLoadingRecipients] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, read, unread

    useEffect(() => {
        return () => {
            if (imagenPreview) URL.revokeObjectURL(imagenPreview);
        };
    }, [imagenPreview]);

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

    const handleDeleteBatch = (batchId) => {
        confirm({
            title: 'Eliminar comunicado',
            message: '¿Estás seguro de que deseas eliminar este comunicado para TODOS los destinatarios? Esta acción no se puede deshacer.',
            confirmText: 'Sí, eliminar',
            cancelText: 'Cancelar',
            variant: 'danger',
            onConfirm: async () => {
                try {
                    await notificacionesAPI.deleteBatch(batchId);
                    toast.success('Comunicado eliminado exitosamente');
                    cargarHistorial();
                } catch (error) {
                    console.error('Error eliminando comunicado:', error);
                    toast.error('Error al eliminar comunicado');
                }
            }
        });
    };

    const handleViewRecipients = async (batch) => {
        try {
            setLoadingRecipients(true);
            setSelectedBatch(batch);
            setShowRecipientsModal(true);
            setSearchTerm('');
            setStatusFilter('all');
            const res = await notificacionesAPI.getBatchRecipients(batch.batch_id);
            setRecipients(res.data.data || []);
        } catch (error) {
            console.error('Error cargando destinatarios:', error);
            toast.error('Error al cargar destinatarios');
            setShowRecipientsModal(false);
        } finally {
            setLoadingRecipients(false);
        }
    };

    const cargarDatosSelectores = async () => {
        try {
            if (filtro === 'curso') {
                setLoading(true);
                const res = await cursosAPI.getAll();
                setCursos(res.data.data || []);
                setLoading(false);
            } else if (filtro === 'evento') {
                setLoading(true);
                const res = await eventosAPI.getAll();
                setEventos(res.data.data || []);
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

    const clearImage = () => {
        setImagen(null);
        setImagenPreview('');
        setImagenOriginal(null);
        setProcessingImage(false);
        setPreviewOmitted(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const extension = file.name.split('.').pop()?.toLowerCase();
        const hasValidType = ALLOWED_IMAGE_TYPES.has(file.type)
            || !file.type
            || file.type === 'application/octet-stream';

        if (!ALLOWED_IMAGE_EXTENSIONS.has(extension) || !hasValidType) {
            clearImage();
            toast.error('Formato no compatible. Usa JPG, PNG, WebP, GIF, HEIC/HEIF o AVIF.');
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            clearImage();
            toast.error('La imagen supera el máximo permitido de 10 MB.');
            return;
        }

        setProcessingImage(true);
        setImagenOriginal(file);
        setPreviewOmitted(false);
        setImagenPreview('');

        try {
            const dimensions = CLIENT_OPTIMIZABLE_TYPES.has(file.type)
                ? await readImageDimensions(file)
                : null;
            const pixels = dimensions ? dimensions.width * dimensions.height : 0;

            if (pixels > MAX_SERVER_PIXELS) {
                clearImage();
                toast.error('La imagen tiene demasiada resolución. Recórtala o guárdala con menos de 40 megapíxeles.');
                return;
            }

            const optimizedFile = dimensions ? await createOptimizedImage(file, dimensions) : null;
            if (optimizedFile) {
                setImagen(optimizedFile);
                setImagenPreview(URL.createObjectURL(optimizedFile));
                return;
            }

            // GIF conserva su animación y HEIC/AVIF se convierten en el servidor.
            // Si el original es costoso de decodificar, no lo mostramos en la página.
            setImagen(file);
            setPreviewOmitted(true);
        } catch (error) {
            console.warn('No se pudo crear una vista previa segura:', error);
            setImagen(file);
            setPreviewOmitted(true);
        } finally {
            setProcessingImage(false);
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

        if (processingImage) {
            toast.error('Espera a que termine la optimización de la imagen.');
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
            clearImage();
            setPaginaDefault();
        } catch (error) {
            console.error('Error enviando comunicado:', error);
            toast.error(error.response?.data?.message || 'Error al enviar comunicado');
        } finally {
            setSending(false);
        }
    };

    const toggleBoldSelection = () => {
        const input = messageInputRef.current;
        if (!input) return;

        const start = input.selectionStart;
        const end = input.selectionEnd;

        if (start === end) {
            toast.error('Selecciona primero la frase que quieres poner en negrita.');
            input.focus();
            return;
        }

        const selectedText = mensaje.slice(start, end);
        const prefix = mensaje.slice(0, start);
        const suffix = mensaje.slice(end);
        const isAlreadyBold = prefix.endsWith('**') && suffix.startsWith('**');
        const nextMessage = isAlreadyBold
            ? `${prefix.slice(0, -2)}${selectedText}${suffix.slice(2)}`
            : `${prefix}**${selectedText}**${suffix}`;
        const nextStart = isAlreadyBold ? start - 2 : start + 2;
        const nextEnd = isAlreadyBold ? end - 2 : end + 2;

        setMensaje(nextMessage);
        requestAnimationFrame(() => {
            input.focus();
            input.setSelectionRange(nextStart, nextEnd);
        });
    };

    const setPaginaDefault = () => {
        setFiltro('todos');
        setDestinatarioId('');
        setEnviarEmail(false);
        setTipo('info');
    };

    return (
        <>
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
                                                <option value="evento">Por Evento</option>
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

                                            {filtro === 'evento' && (
                                                <select
                                                    value={destinatarioId}
                                                    onChange={(e) => setDestinatarioId(e.target.value)}
                                                    className="input w-full"
                                                    required
                                                    disabled={loading}
                                                >
                                                    <option value="">{loading ? 'Cargando eventos...' : 'Selecciona Evento'}</option>
                                                    {eventos.map(evento => {
                                                        const fecha = String(evento.fecha || '').split('T')[0];
                                                        const [anio, mes, dia] = fecha.split('-');
                                                        const fechaLabel = anio && mes && dia ? ` · ${dia}/${mes}/${anio}` : '';
                                                        const inscritos = Number(evento.inscritos || 0);
                                                        return (
                                                            <option key={evento.id} value={evento.id}>
                                                                {evento.nombre}{fechaLabel} · {inscritos} {inscritos === 1 ? 'participante' : 'participantes'}
                                                            </option>
                                                        );
                                                    })}
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
                                        <div className="mb-2 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-2">
                                            <button
                                                type="button"
                                                onClick={toggleBoldSelection}
                                                className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-bold text-gray-900 shadow-sm transition-colors hover:border-gray-400 hover:bg-gray-100"
                                                title="Aplicar o quitar negrita (Ctrl+B)"
                                            >
                                                <span className="text-base font-black">B</span>
                                                Negrita
                                            </button>
                                            <span className="text-xs text-gray-500">Selecciona una frase y presiona Negrita.</span>
                                        </div>
                                        <textarea
                                            ref={messageInputRef}
                                            value={mensaje}
                                            onChange={(e) => setMensaje(e.target.value)}
                                            onKeyDown={(e) => {
                                                if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                                                    e.preventDefault();
                                                    toggleBoldSelection();
                                                }
                                            }}
                                            className="input w-full"
                                            rows="6"
                                            placeholder="Escribe el contenido del comunicado aquí..."
                                            required
                                        ></textarea>
                                        <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                                            <span>Se respetan saltos de línea, listas con • y frases en negrita.</span>
                                            <span>{mensaje.length} caracteres</span>
                                        </div>
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
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={handleFileChange}
                                            disabled={processingImage}
                                            className="file-input file-input-bordered w-full"
                                            accept=".jpg,.jpeg,.png,.webp,.gif,.heic,.heif,.avif,image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/avif"
                                        />
                                        <p className="label-text-alt text-gray-400 mt-1">
                                            JPG, PNG, WebP, GIF, HEIC/HEIF y AVIF. Máximo 10 MB. Las fotos grandes se envían sin abrirlas en el navegador.
                                        </p>

                                        {processingImage && (
                                            <div className="mt-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-700" />
                                                Preparando una copia liviana de la imagen...
                                            </div>
                                        )}

                                        {imagen && !processingImage && (
                                            <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                                {imagenPreview && !previewOmitted ? (
                                                    <img
                                                        src={imagenPreview}
                                                        alt="Vista previa de la imagen seleccionada"
                                                        className="h-52 w-full object-contain bg-white"
                                                    />
                                                ) : (
                                                    <div className="flex h-36 flex-col items-center justify-center gap-2 bg-white text-gray-500">
                                                        <PhotoIcon className="h-10 w-10" />
                                                        <span className="px-4 text-center text-sm font-medium">Imagen lista para enviar</span>
                                                        <span className="px-4 text-center text-xs">Se omitió la vista previa para evitar que el navegador se bloquee.</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between gap-3 px-4 py-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-gray-800">{imagenOriginal?.name || imagen.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatFileSize(imagenOriginal?.size || imagen.size)}
                                                            {imagenOriginal && imagen !== imagenOriginal ? ` · copia optimizada: ${formatFileSize(imagen.size)}` : ''}
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={clearImage}
                                                        className="btn btn-sm btn-ghost text-red-600"
                                                    >
                                                        <XMarkIcon className="h-4 w-4" />
                                                        Quitar
                                                    </button>
                                                </div>
                                            </div>
                                        )}
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
                        <div className="card overflow-hidden border-gray-200 bg-white">
                            <div className="card-body p-0">
                                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                                    <h3 className="font-bold text-gray-900">Vista previa</h3>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                        tipo === 'importante'
                                            ? 'bg-red-100 text-red-700'
                                            : tipo === 'aviso'
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-blue-100 text-blue-700'
                                    }`}>
                                        {tipo === 'importante' ? 'Importante' : tipo === 'aviso' ? 'Aviso' : 'Información'}
                                    </span>
                                </div>

                                {imagen && !processingImage && (
                                    imagenPreview && !previewOmitted ? (
                                        <img
                                            src={imagenPreview}
                                            alt="Imagen del comunicado"
                                            className="max-h-64 w-full object-contain bg-gray-50"
                                        />
                                    ) : (
                                        <div className="flex h-32 flex-col items-center justify-center gap-2 bg-gray-50 text-gray-500">
                                            <PhotoIcon className="h-8 w-8" />
                                            <span className="text-xs font-medium">Imagen adjunta lista para enviar</span>
                                        </div>
                                    )
                                )}

                                <div className="px-5 py-5">
                                    <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-400">
                                        {remitente.trim() || 'Select Dance Studio'}
                                    </p>
                                    <h4 className="text-lg font-bold text-gray-900">
                                        {titulo.trim() || 'Título del comunicado'}
                                    </h4>
                                    <FormattedMessage
                                        as="p"
                                        text={mensaje || 'Aquí podrás revisar cómo se verá el mensaje antes de enviarlo.'}
                                        className={`mt-3 text-sm leading-relaxed ${mensaje ? 'text-gray-600' : 'text-gray-400'}`}
                                    />
                                </div>
                            </div>
                        </div>

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
                                                    <div className="flex items-start gap-3">
                                                        {batch.imagen_url && (
                                                            <img
                                                                src={getMediaUrl(batch.imagen_url)}
                                                                alt="Adjunto"
                                                                className="h-12 w-12 flex-none rounded-lg border border-gray-200 bg-gray-50 object-cover"
                                                                loading="lazy"
                                                            />
                                                        )}
                                                        <div className="min-w-0">
                                                            <div className="font-bold">{batch.titulo}</div>
                                                            <div className="text-xs text-gray-500 truncate max-w-xs">{stripMessageFormatting(batch.mensaje)}</div>
                                                            {batch.remitente && <span className="badge badge-xs badge-ghost mt-1">{batch.remitente}</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => handleViewRecipients(batch)}
                                                        className="flex items-center hover:text-blue-600 font-medium transition-all group"
                                                        title="Ver detalle de destinatarios"
                                                    >
                                                        <UserGroupIcon className="h-4 w-4 mr-1 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                        <span className="underline decoration-dotted decoration-gray-400 group-hover:decoration-blue-600">
                                                            {batch.total_destinatarios}
                                                        </span>
                                                    </button>
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
        
        {/* Modal de Destinatarios (Premium Design) */}
        {showRecipientsModal && selectedBatch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-scale-up">
                    
                    {/* Header */}
                    <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <UserGroupIcon className="h-6 w-6 text-blue-400" />
                                Detalle de Destinatarios
                            </h3>
                            <p className="text-slate-300 text-sm mt-1 truncate max-w-md">
                                Comunicado: <span className="font-semibold text-white">{selectedBatch.titulo}</span>
                            </p>
                            <p className="text-slate-400 text-xs mt-0.5">
                                Enviado el {new Date(selectedBatch.fecha).toLocaleString()}
                            </p>
                        </div>
                        <button 
                            onClick={() => setShowRecipientsModal(false)}
                            className="text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Stats Strip */}
                    <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-slate-50 border-b border-gray-100">
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
                            <span className="text-xs text-gray-500 font-medium block">Enviados</span>
                            <span className="text-lg font-bold text-slate-800">{recipients.length}</span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
                            <span className="text-xs text-emerald-600 font-medium block">Leídos</span>
                            <span className="text-lg font-bold text-emerald-600">
                                {recipients.filter(r => r.leido).length}
                            </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
                            <span className="text-xs text-gray-500 font-medium block">Pendientes</span>
                            <span className="text-lg font-bold text-gray-600">
                                {recipients.filter(r => !r.leido).length}
                            </span>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
                            <span className="text-xs text-blue-600 font-medium block">Tasa Lectura</span>
                            <span className="text-lg font-bold text-blue-600">
                                {recipients.length > 0 
                                    ? `${Math.round((recipients.filter(r => r.leido).length / recipients.length) * 100)}%` 
                                    : '0%'}
                            </span>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar destinatario por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input pl-9 w-full text-sm border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${statusFilter === 'all' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-600 hover:text-slate-800'}`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setStatusFilter('read')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${statusFilter === 'read' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-600 hover:text-slate-800'}`}
                            >
                                Leídos
                            </button>
                            <button
                                onClick={() => setStatusFilter('unread')}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${statusFilter === 'unread' ? 'bg-white shadow-sm text-slate-700' : 'text-slate-600 hover:text-slate-800'}`}
                            >
                                Pendientes
                            </button>
                        </div>
                    </div>

                    {/* Content List */}
                    <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[450px]">
                        {loadingRecipients ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-gray-500 text-sm">Cargando destinatarios...</span>
                            </div>
                        ) : (() => {
                            const filtered = recipients.filter(r => {
                                const nameMatches = `${r.nombre || ''} ${r.apellido || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
                                const emailMatches = (r.email || '').toLowerCase().includes(searchTerm.toLowerCase());
                                const searchMatch = nameMatches || emailMatches;
                                
                                if (statusFilter === 'read') return searchMatch && r.leido;
                                if (statusFilter === 'unread') return searchMatch && !r.leido;
                                return searchMatch;
                            });

                            if (filtered.length === 0) {
                                return (
                                    <div className="text-center py-16 text-gray-400">
                                        <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm">No se encontraron destinatarios.</p>
                                    </div>
                                );
                            }

                            return (
                                <div className="divide-y divide-gray-100">
                                    {filtered.map(r => (
                                        <div key={r.notificacion_id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                                                    {(r.nombre || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-slate-800 text-sm block">
                                                        {r.nombre} {r.apellido}
                                                    </span>
                                                    <span className="text-gray-500 text-xs block">
                                                        {r.email}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                {/* Rol Badge */}
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    r.rol === 'admin' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                                    r.rol === 'profesor' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                    'bg-purple-50 text-purple-700 border border-purple-100'
                                                }`}>
                                                    {r.rol === 'alumno' ? 'Alumno/Padre' : r.rol}
                                                </span>
                                                {/* Read Status Badge */}
                                                {r.leido ? (
                                                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full text-xs font-semibold">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Leído
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full text-xs font-medium">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Pendiente
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex justify-end">
                        <button
                            onClick={() => setShowRecipientsModal(false)}
                            className="btn btn-sm btn-slate bg-slate-200 text-slate-700 hover:bg-slate-300 px-4 py-2"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        )}

        <ConfirmDialog
            isOpen={isOpen}
            onClose={closeConfirm}
            {...confirmConfig}
        />
        </>
    );
};

export default Comunicados;
