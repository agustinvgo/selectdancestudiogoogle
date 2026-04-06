import { useState } from 'react';
import { PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';
import useConfirm from '../../hooks/useConfirm';
import ConfirmDialog from '../../components/ConfirmDialog';
import { exportEventos } from '../../utils/exportExcel';

// Hooks & Subcomponents
import useEventos from '../../hooks/useEventos';
import EventoCard from '../../components/admin/eventos/EventoCard';
import EventoFormModal from '../../components/admin/eventos/EventoFormModal';
import InscripcionModal from '../../components/admin/eventos/InscripcionModal';
import ParticipantesModal from '../../components/admin/eventos/ParticipantesModal';

const GestionEventos = () => {
    // 1. Local UI State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalParticipantesOpen, setModalParticipantesOpen] = useState(false);
    const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
    const [expandedEventoId, setExpandedEventoId] = useState(null);
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
    const [editando, setEditando] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        nombre: '', descripcion: '', fecha: '', hora: '', lugar: '', ubicacion: '', 
        tipo: 'Presentación', costo: '', cupo_maximo: '', vestimenta: '', 
        costo_vestuario: '', maquillaje: '', costo_maquillaje: '', peinado: '', costo_peinado: ''
    });

    const { isOpen, confirmConfig, confirm, closeConfirm } = useConfirm();

    // 2. Data & Business Logic (Custom Hook)
    const {
        eventos: eventosApi,
        alumnos,
        eventoDetalle,
        isLoading,
        loadingParticipantes,
        createMutation,
        updateMutation,
        deleteMutation,
        inscribirMutation,
        desinscribirMutation,
        updatePaymentMutation
    } = useEventos({ expandedEventoId, eventoSeleccionado, modalDetalleOpen });

    // 3. Derived State
    const eventos = eventosApi.filter(e =>
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 4. Handlers
    const cerrarModal = () => {
        setModalOpen(false);
        setEditando(null);
        setFormData({
            nombre: '', descripcion: '', fecha: '', hora: '', lugar: '', ubicacion: '',
            tipo: 'Presentación', costo: '', cupo_maximo: '', vestimenta: '',
            costo_vestuario: '', maquillaje: '', costo_maquillaje: '', peinado: '', costo_peinado: ''
        });
    };

    const abrirModal = (evento = null) => {
        if (evento) {
            setEditando(evento);
            setFormData({
                nombre: evento.nombre, descripcion: evento.descripcion || '', fecha: evento.fecha || '',
                hora: evento.hora || '', lugar: evento.lugar || '', ubicacion: evento.ubicacion || '',
                tipo: evento.tipo || 'Presentación', costo: evento.costo_inscripcion || evento.costo || '',
                cupo_maximo: evento.cupo_maximo || '', vestimenta: evento.vestuario_requerido || evento.vestimenta || '',
                costo_vestuario: evento.costo_vestuario || '', maquillaje: evento.maquillaje_instrucciones || evento.maquillaje || '',
                costo_maquillaje: evento.costo_maquillaje || '', peinado: evento.peinado_instrucciones || evento.peinado || '',
                costo_peinado: evento.costo_peinado || ''
            });
        } else {
            cerrarModal(); // Resets form
            setModalOpen(true);
        }
        setModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editando) updateMutation.mutate({ id: editando.id, data: formData }, { onSuccess: cerrarModal });
        else createMutation.mutate(formData, { onSuccess: cerrarModal });
    };

    const eliminarEvento = (id) => {
        confirm({
            title: '¿Eliminar evento?', message: '¿Estás seguro de eliminar este evento?',
            variant: 'danger', confirmText: 'Eliminar',
            onConfirm: () => deleteMutation.mutate(id)
        });
    };

    const toggleParticipantes = (eventoId) => {
        setExpandedEventoId(expandedEventoId === eventoId ? null : eventoId);
    };

    const inscribirAlumno = (alumnoId) => {
        const eventoId = eventoSeleccionado?.id || expandedEventoId;
        if (eventoId) inscribirMutation.mutate({ eventoId, alumnoId });
    };

    const desinscribirAlumno = (eventoId, inscripcionId, alumnoNombre) => {
        confirm({
            title: '¿Eliminar inscripción?', message: `¿Estás seguro de eliminar la inscripción de ${alumnoNombre}?`,
            variant: 'danger', confirmText: 'Eliminar',
            onConfirm: () => desinscribirMutation.mutate({ eventoId, inscripcionId })
        });
    };

    const getAlumnosDisponibles = () => {
        const currentEventId = eventoSeleccionado?.id || expandedEventoId;
        if (eventoDetalle && (eventoDetalle.id === currentEventId)) {
            const inscritosIds = eventoDetalle.inscritos?.map(p => p.usuario_id) || [];
            return alumnos.filter(a => !inscritosIds.includes(a.usuario_id));
        }
        return alumnos;
    };

    const togglePagoParticipante = (inscripcionId, pagoActual) => {
        if (eventoDetalle) {
            updatePaymentMutation.mutate({ eventoId: eventoDetalle.id, inscripcionId, pagoRealizado: pagoActual });
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Eventos</h1>
                    <p className="text-gray-500 mt-1">Administra competencias y presentaciones</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar evento por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none w-full sm:w-64"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button onClick={() => exportEventos(eventos)} className="btn btn-secondary flex items-center justify-center space-x-2" disabled={eventos.length === 0}>
                        <ArrowDownTrayIcon className="h-5 w-5" /><span>Exportar</span>
                    </button>
                    <button onClick={() => abrirModal()} className="btn btn-primary flex items-center justify-center space-x-2">
                        <PlusIcon className="h-5 w-5" /><span>Nuevo Evento</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card"><div className="card-body"><p className="text-sm text-gray-500">Total de Eventos</p><p className="text-3xl font-bold text-gray-900 mt-2">{eventos.length}</p></div></div>
                <div className="card border-blue-900"><div className="card-body"><p className="text-sm text-gray-500">Próximos Eventos</p><p className="text-3xl font-bold text-blue-500 mt-2">{eventos.filter(e => new Date(e.fecha) >= new Date()).length}</p></div></div>
                <div className="card border-purple-900"><div className="card-body"><p className="text-sm text-gray-500">Eventos Pasados</p><p className="text-3xl font-bold text-purple-500 mt-2">{eventos.filter(e => new Date(e.fecha) < new Date()).length}</p></div></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eventos.map((evento) => (
                    <EventoCard
                        key={evento.id}
                        evento={evento}
                        abrirModal={abrirModal}
                        eliminarEvento={eliminarEvento}
                        toggleParticipantes={toggleParticipantes}
                        expandedEventoId={expandedEventoId}
                        loadingParticipantes={loadingParticipantes}
                        participantes={expandedEventoId === evento.id ? (eventoDetalle?.inscritos || []) : []}
                        desinscribirAlumno={desinscribirAlumno}
                        getAlumnosDisponibles={getAlumnosDisponibles}
                        inscribirAlumno={inscribirAlumno}
                    />
                ))}
            </div>

            <EventoFormModal 
                isOpen={modalOpen} onClose={cerrarModal} onSubmit={handleSubmit} 
                editando={editando} formData={formData} setFormData={setFormData} 
            />

            <InscripcionModal 
                isOpen={modalParticipantesOpen} onClose={() => setModalParticipantesOpen(false)} 
                eventoSeleccionado={eventoSeleccionado} alumnos={alumnos} inscribirAlumno={inscribirAlumno} 
            />

            <ParticipantesModal 
                isOpen={modalDetalleOpen} onClose={() => setModalDetalleOpen(false)} 
                eventoDetalle={eventoDetalle} togglePagoParticipante={togglePagoParticipante} 
                desinscribirAlumno={desinscribirAlumno} 
            />

            <ConfirmDialog isOpen={isOpen} onClose={closeConfirm} {...confirmConfig} />
        </div>
    );
};

export default GestionEventos;
