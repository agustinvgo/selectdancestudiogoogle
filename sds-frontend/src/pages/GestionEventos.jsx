import { useState, useEffect } from 'react';
import { eventosAPI, alumnosAPI } from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon, UserPlusIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Modal from '../components/Modal';
import Loader from '../components/Loader';

const GestionEventos = () => {
    const [eventos, setEventos] = useState([]);
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalInscripcionOpen, setModalInscripcionOpen] = useState(false);
    const [editando, setEditando] = useState(null);
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        fecha: '',
        hora: '',
        lugar: '',
        tipo: 'Competencia',
        costo: '',
        cupo_maximo: '',
        vestimenta: '',
        maquillaje: '',
        peinado: ''
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [eventosRes, alumnosRes] = await Promise.all([
                eventosAPI.getAll(),
                alumnosAPI.getAll()
            ]);
            setEventos(eventosRes.data.data || []);
            setAlumnos(alumnosRes.data.data || []);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (evento = null) => {
        if (evento) {
            setEditando(evento);
            setFormData({
                nombre: evento.nombre,
                descripcion: evento.descripcion || '',
                fecha: evento.fecha,
                hora: evento.hora || '',
                lugar: evento.lugar || '',
                tipo: evento.tipo,
                costo: evento.costo || '',
                cupo_maximo: evento.cupo_maximo || '',
                vestimenta: evento.vestimenta || '',
                maquillaje: evento.maquillaje || '',
                peinado: evento.peinado || ''
            });
        } else {
            setEditando(null);
            setFormData({
                nombre: '',
                descripcion: '',
                fecha: '',
                hora: '',
                lugar: '',
                tipo: 'Competencia',
                costo: '',
                cupo_maximo: '',
                vestimenta: '',
                maquillaje: '',
                peinado: ''
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editando) {
                await eventosAPI.update(editando.id, formData);
            } else {
                await eventosAPI.create(formData);
            }
            await cargarDatos();
            setModalOpen(false);
            alert(`✅ Evento ${editando ? 'actualizado' : 'creado'} exitosamente`);
        } catch (error) {
            console.error('Error guardando evento:', error);
            alert('❌ Error al guardar evento');
        }
    };

    const eliminarEvento = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este evento?')) return;

        try {
            await eventosAPI.delete(id);
            await cargarDatos();
            alert('✅ Evento eliminado');
        } catch (error) {
            console.error('Error eliminando evento:', error);
            alert('❌ Error al eliminar evento');
        }
    };

    const abrirModalInscripcion = (evento) => {
        setEventoSeleccionado(evento);
        setModalInscripcionOpen(true);
    };

    const inscribirAlumno = async (alumnoId) => {
        try {
            await eventosAPI.inscribirAlumno(eventoSeleccionado.id, { alumno_id: alumnoId });
            alert('✅ Alumno inscrito exitosamente');
            setModalInscripcionOpen(false);
        } catch (error) {
            console.error('Error inscribiendo alumno:', error);
            alert('❌ Error al inscribir alumno');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gestión de Eventos</h1>
                    <p className="text-gray-400 mt-1">Administra competencias y presentaciones</p>
                </div>
                <button onClick={() => abrirModal()} className="btn btn-primary flex items-center space-x-2">
                    <PlusIcon className="h-5 w-5" />
                    <span>Nuevo Evento</span>
                </button>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card">
                    <div className="card-body">
                        <p className="text-sm text-gray-400">Total de Eventos</p>
                        <p className="text-3xl font-bold text-white mt-2">{eventos.length}</p>
                    </div>
                </div>

                <div className="card border-blue-900">
                    <div className="card-body">
                        <p className="text-sm text-gray-400">Próximos Eventos</p>
                        <p className="text-3xl font-bold text-blue-500 mt-2">
                            {eventos.filter(e => new Date(e.fecha) >= new Date()).length}
                        </p>
                    </div>
                </div>

                <div className="card border-purple-900">
                    <div className="card-body">
                        <p className="text-sm text-gray-400">Eventos Pasados</p>
                        <p className="text-3xl font-bold text-purple-500 mt-2">
                            {eventos.filter(e => new Date(e.fecha) < new Date()).length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Lista de Eventos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eventos.map((evento) => {
                    const esFuturo = new Date(evento.fecha) >= new Date();

                    return (
                        <div key={evento.id} className={`card ${esFuturo ? 'border-blue-900' : 'border-gray-700'}`}>
                            <div className="card-header">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white">{evento.nombre}</h3>
                                        <span className={`badge mt-2 ${evento.tipo === 'Competencia' ? 'badge-error' :
                                                evento.tipo === 'Presentación' ? 'badge-success' :
                                                    'badge-info'
                                            }`}>
                                            {evento.tipo}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => abrirModalInscripcion(evento)}
                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                            title="Inscribir alumno"
                                        >
                                            <UserPlusIcon className="h-5 w-5 text-blue-400" />
                                        </button>
                                        <button
                                            onClick={() => abrirModal(evento)}
                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <PencilIcon className="h-5 w-5 text-yellow-400" />
                                        </button>
                                        <button
                                            onClick={() => eliminarEvento(evento.id)}
                                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <TrashIcon className="h-5 w-5 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body space-y-3">
                                <div className="flex items-center text-gray-300">
                                    <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                                    <span>{new Date(evento.fecha).toLocaleDateString('es-AR')} - {evento.hora}</span>
                                </div>

                                {evento.descripcion && (
                                    <p className="text-gray-400 text-sm">{evento.descripcion}</p>
                                )}

                                {evento.lugar && (
                                    <p className="text-gray-400 text-sm">📍 {evento.lugar}</p>
                                )}

                                {evento.costo && (
                                    <p className="text-white font-bold">💵 Costo: ${evento.costo}</p>
                                )}

                                {(evento.vestimenta || evento.maquillaje || evento.peinado) && (
                                    <div className="border-t border-gray-700 pt-3 mt-3 space-y-1">
                                        <p className="text-sm font-medium text-gray-300">Instrucciones:</p>
                                        {evento.vestimenta && (
                                            <p className="text-sm text-gray-400">👗 {evento.vestimenta}</p>
                                        )}
                                        {evento.maquillaje && (
                                            <p className="text-sm text-gray-400">💄 {evento.maquillaje}</p>
                                        )}
                                        {evento.peinado && (
                                            <p className="text-sm text-gray-400">💇 {evento.peinado}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal de Crear/Editar Evento */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar Evento' : 'Nuevo Evento'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Evento</label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="input w-full"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
                            <select
                                value={formData.tipo}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                className="input w-full"
                            >
                                <option>Competencia</option>
                                <option>Presentación</option>
                                <option>Evento Social</option>
                                <option>Otro</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Fecha</label>
                            <input
                                type="date"
                                value={formData.fecha}
                                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                                className="input w-full"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Hora</label>
                            <input
                                type="time"
                                value={formData.hora}
                                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                                className="input w-full"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Lugar</label>
                            <input
                                type="text"
                                value={formData.lugar}
                                onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                                className="input w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
                        <textarea
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            className="input w-full"
                            rows="3"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Costo</label>
                            <input
                                type="number"
                                value={formData.costo}
                                onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                                className="input w-full"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Cupo Máximo</label>
                            <input
                                type="number"
                                value={formData.cupo_maximo}
                                onChange={(e) => setFormData({ ...formData, cupo_maximo: e.target.value })}
                                className="input w-full"
                                min="0"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Vestimenta/Vestuario</label>
                        <input
                            type="text"
                            value={formData.vestimenta}
                            onChange={(e) => setFormData({ ...formData, vestimenta: e.target.value })}
                            className="input w-full"
                            placeholder="Ej: Tutú blanco con zapatillas de punta"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Maquillaje</label>
                        <input
                            type="text"
                            value={formData.maquillaje}
                            onChange={(e) => setFormData({ ...formData, maquillaje: e.target.value })}
                            className="input w-full"
                            placeholder="Ej: Maquillaje natural con labios rojos"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Peinado</label>
                        <input
                            type="text"
                            value={formData.peinado}
                            onChange={(e) => setFormData({ ...formData, peinado: e.target.value })}
                            className="input w-full"
                            placeholder="Ej: Moño alto con red"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {editando ? 'Guardar Cambios' : 'Crear Evento'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal de Inscripción */}
            <Modal isOpen={modalInscripcionOpen} onClose={() => setModalInscripcionOpen(false)} title="Inscribir Alumno">
                <div className="space-y-4">
                    <p className="text-gray-300">
                        Selecciona un alumno para inscribir en: <span className="font-bold text-white">{eventoSeleccionado?.nombre}</span>
                    </p>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {alumnos.map((alumno) => (
                            <button
                                key={alumno.id}
                                onClick={() => inscribirAlumno(alumno.id)}
                                className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-blue-500 transition-all text-left"
                            >
                                <p className="text-white font-medium">
                                    {alumno.nombre} {alumno.apellido}
                                </p>
                                <p className="text-sm text-gray-400">{alumno.email}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default GestionEventos;
