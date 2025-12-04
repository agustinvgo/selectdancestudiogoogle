import { useState, useEffect } from 'react';
import { cursosAPI, alumnosAPI } from '../services/api';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    UserGroupIcon,
    ArrowDownTrayIcon,
    XMarkIcon,
    CheckIcon
} from '@heroicons/react/24/outline';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import { exportCursos } from '../utils/exportExcel';

const GestionCursos = () => {
    // Estados principales
    const [cursos, setCursos] = useState([]);
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estados de UI
    const [modalOpen, setModalOpen] = useState(false);
    const [expandedCursoId, setExpandedCursoId] = useState(null);
    const [participantes, setParticipantes] = useState([]);
    const [loadingParticipantes, setLoadingParticipantes] = useState(false);

    // Estado para edición/creación
    const [editando, setEditando] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        nivel: 'Principiante',
        horario_dia: 'Lunes',
        horario_hora: '18:00',
        duracion_minutos: 60,
        cupo_maximo: 15,
        profesor: '',
        activo: true
    });

    // Constantes
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const niveles = ['Principiante', 'Intermedio', 'Avanzado', 'Todos los niveles'];

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [cursosRes, alumnosRes] = await Promise.all([
                cursosAPI.getAll(),
                alumnosAPI.getAll()
            ]);
            setCursos(cursosRes.data.data || []);
            setAlumnos(alumnosRes.data.data || []);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    // === GESTIÓN DE CURSOS ===

    const abrirModal = (curso = null) => {
        if (curso) {
            setEditando(curso);
            setFormData({
                nombre: curso.nombre,
                descripcion: curso.descripcion || '',
                nivel: curso.nivel || 'Principiante',
                horario_dia: curso.horario_dia || 'Lunes',
                horario_hora: curso.horario_hora || '18:00',
                duracion_minutos: curso.duracion_minutos || 60,
                cupo_maximo: curso.cupo_maximo || 15,
                profesor: curso.profesor || '',
                activo: curso.activo !== 0
            });
        } else {
            setEditando(null);
            setFormData({
                nombre: '',
                descripcion: '',
                nivel: 'Principiante',
                horario_dia: 'Lunes',
                horario_hora: '18:00',
                duracion_minutos: 60,
                cupo_maximo: 15,
                profesor: '',
                activo: true
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editando) {
                await cursosAPI.update(editando.id, formData);
            } else {
                await cursosAPI.create(formData);
            }
            await cargarDatos();
            setModalOpen(false);
            alert(`✅ Curso ${editando ? 'actualizado' : 'creado'} exitosamente`);
        } catch (error) {
            console.error('Error guardando curso:', error);
            alert('❌ Error al guardar curso');
        }
    };

    const eliminarCurso = async (id) => {
        if (!confirm('¿Estás seguro de eliminar este curso? Se eliminarán también las inscripciones.')) return;

        try {
            await cursosAPI.delete(id);
            await cargarDatos();
            alert('✅ Curso eliminado');
        } catch (error) {
            console.error('Error eliminando curso:', error);
            alert('❌ Error al eliminar curso');
        }
    };

    // === GESTIÓN DE PARTICIPANTES ===

    const toggleParticipantes = async (cursoId) => {
        if (expandedCursoId === cursoId) {
            setExpandedCursoId(null);
            setParticipantes([]);
            return;
        }

        try {
            setLoadingParticipantes(true);
            setExpandedCursoId(cursoId);
            const response = await cursosAPI.getParticipantes(cursoId);
            setParticipantes(response.data.data || []);
        } catch (error) {
            console.error('Error cargando participantes:', error);
            alert('❌ Error al cargar participantes');
        } finally {
            setLoadingParticipantes(false);
        }
    };

    const inscribirAlumno = async (cursoId, alumnoId) => {
        try {
            await cursosAPI.inscribirAlumno(cursoId, { alumno_id: alumnoId });
            // Recargar participantes
            const response = await cursosAPI.getParticipantes(cursoId);
            setParticipantes(response.data.data || []);
            // Actualizar contador en la lista principal
            cargarDatos();
            alert('✅ Alumno inscrito exitosamente');
        } catch (error) {
            console.error('Error inscribiendo alumno:', error);
            alert(error.response?.data?.message || '❌ Error al inscribir alumno');
        }
    };

    const desinscribirAlumno = async (cursoId, alumnoId) => {
        if (!confirm('¿Estás seguro de desinscribir a este alumno?')) return;

        try {
            await cursosAPI.desinscribirAlumno(cursoId, alumnoId);
            // Recargar participantes
            const response = await cursosAPI.getParticipantes(cursoId);
            setParticipantes(response.data.data || []);
            // Actualizar contador
            cargarDatos();
            alert('✅ Alumno desinscrito');
        } catch (error) {
            console.error('Error desinscribiendo alumno:', error);
            alert('❌ Error al desinscribir alumno');
        }
    };

    // Filtrar alumnos que NO están inscritos en el curso seleccionado
    const getAlumnosDisponibles = () => {
        const inscritosIds = participantes.map(p => p.id);
        return alumnos.filter(a => !inscritosIds.includes(a.id));
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gestión de Cursos</h1>
                    <p className="text-gray-400 mt-1">Administra tus clases y alumnos inscritos</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => exportCursos(cursos)}
                        className="btn btn-secondary flex items-center space-x-2"
                        disabled={cursos.length === 0}
                    >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        <span>Exportar</span>
                    </button>
                    <button onClick={() => abrirModal()} className="btn btn-primary flex items-center space-x-2">
                        <PlusIcon className="h-5 w-5" />
                        <span>Nuevo Curso</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card bg-gray-800 border-gray-700">
                    <div className="card-body">
                        <p className="text-sm text-gray-400">Total de Cursos</p>
                        <p className="text-3xl font-bold text-white mt-2">{cursos.length}</p>
                    </div>
                </div>
                <div className="card bg-gray-800 border-green-900/50">
                    <div className="card-body">
                        <p className="text-sm text-gray-400">Cursos Activos</p>
                        <p className="text-3xl font-bold text-green-500 mt-2">
                            {cursos.filter(c => c.activo === 1).length}
                        </p>
                    </div>
                </div>
                <div className="card bg-gray-800 border-blue-900/50">
                    <div className="card-body">
                        <p className="text-sm text-gray-400">Total Alumnos</p>
                        <p className="text-3xl font-bold text-blue-500 mt-2">{alumnos.length}</p>
                    </div>
                </div>
            </div>

            {/* Grid de Cursos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {cursos.map((curso) => (
                    <div
                        key={curso.id}
                        className={`card transition-all duration-200 ${curso.activo === 1 ? 'bg-gray-800 border-gray-700' : 'bg-gray-800/50 border-gray-700 opacity-75'
                            }`}
                    >
                        <div className="p-5">
                            {/* Encabezado de la Tarjeta */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">{curso.nombre}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`badge ${curso.nivel === 'Principiante' ? 'badge-success' :
                                                curso.nivel === 'Intermedio' ? 'badge-warning' :
                                                    curso.nivel === 'Avanzado' ? 'badge-error' :
                                                        'badge-info'
                                            }`}>
                                            {curso.nivel}
                                        </span>
                                        {curso.activo === 0 && (
                                            <span className="badge badge-secondary">Inactivo</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => abrirModal(curso)}
                                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-yellow-400 transition-colors"
                                        title="Editar"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => eliminarCurso(curso.id)}
                                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                                        title="Eliminar"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Info del Curso */}
                            <div className="space-y-2 text-sm text-gray-300 mb-4">
                                <div className="flex items-center justify-between">
                                    <span>📅 Horario:</span>
                                    <span className="font-medium text-white">{curso.horario_dia} {curso.horario_hora}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>⏱️ Duración:</span>
                                    <span className="font-medium text-white">{curso.duracion_minutos} min</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>👨‍🏫 Profesor:</span>
                                    <span className="font-medium text-white">{curso.profesor || 'No asignado'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>👥 Cupo:</span>
                                    <span className={`font-medium ${curso.alumnos_inscritos >= curso.cupo_maximo ? 'text-red-400' : 'text-green-400'
                                        }`}>
                                        {curso.alumnos_inscritos} / {curso.cupo_maximo}
                                    </span>
                                </div>
                            </div>

                            {/* Botón Ver Participantes */}
                            <button
                                onClick={() => toggleParticipantes(curso.id)}
                                className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${expandedCursoId === curso.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                            >
                                <UserGroupIcon className="h-5 w-5" />
                                <span>{expandedCursoId === curso.id ? 'Ocultar Alumnos' : 'Gestionar Alumnos'}</span>
                            </button>

                            {/* Sección Expandible: Lista de Alumnos */}
                            {expandedCursoId === curso.id && (
                                <div className="mt-4 pt-4 border-t border-gray-700 animate-fade-in">
                                    {loadingParticipantes ? (
                                        <div className="text-center py-4 text-gray-400">Cargando...</div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Lista de Inscritos */}
                                            <div>
                                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                    Inscritos ({participantes.length})
                                                </h4>
                                                {participantes.length === 0 ? (
                                                    <p className="text-gray-500 text-sm italic text-center py-2">
                                                        No hay alumnos inscritos
                                                    </p>
                                                ) : (
                                                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                        {participantes.map((alumno) => (
                                                            <div key={alumno.id} className="flex items-center justify-between p-2 bg-gray-700/30 rounded hover:bg-gray-700/50 transition-colors group">
                                                                <span className="text-sm text-gray-200 truncate">
                                                                    {alumno.nombre} {alumno.apellido}
                                                                </span>
                                                                <button
                                                                    onClick={() => desinscribirAlumno(curso.id, alumno.id)}
                                                                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    title="Desinscribir"
                                                                >
                                                                    <XMarkIcon className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Agregar Alumno */}
                                            <div>
                                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                    Inscribir Nuevo
                                                </h4>
                                                <div className="max-h-40 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                    {getAlumnosDisponibles().length === 0 ? (
                                                        <p className="text-gray-500 text-sm italic text-center py-2">
                                                            No hay más alumnos disponibles
                                                        </p>
                                                    ) : (
                                                        getAlumnosDisponibles().map((alumno) => (
                                                            <button
                                                                key={alumno.id}
                                                                onClick={() => inscribirAlumno(curso.id, alumno.id)}
                                                                className="w-full flex items-center justify-between p-2 bg-gray-700/30 rounded hover:bg-blue-900/30 border border-transparent hover:border-blue-500/30 transition-all group text-left"
                                                            >
                                                                <span className="text-sm text-gray-400 group-hover:text-blue-200 truncate">
                                                                    {alumno.nombre} {alumno.apellido}
                                                                </span>
                                                                <PlusIcon className="h-4 w-4 text-gray-500 group-hover:text-blue-400" />
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Formulario */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar Curso' : 'Nuevo Curso'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Curso</label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="input w-full bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Ej: Salsa Cubana"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                        <textarea
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            className="input w-full bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                            rows="3"
                            placeholder="Detalles sobre el curso..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nivel</label>
                            <select
                                value={formData.nivel}
                                onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                                className="input w-full bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                            >
                                {niveles.map(nivel => (
                                    <option key={nivel} value={nivel}>{nivel}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Día</label>
                            <select
                                value={formData.horario_dia}
                                onChange={(e) => setFormData({ ...formData, horario_dia: e.target.value })}
                                className="input w-full bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                            >
                                {diasSemana.map(dia => (
                                    <option key={dia} value={dia}>{dia}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Hora Inicio</label>
                            <input
                                type="time"
                                value={formData.horario_hora}
                                onChange={(e) => setFormData({ ...formData, horario_hora: e.target.value })}
                                className="input w-full bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Duración (min)</label>
                            <input
                                type="number"
                                value={formData.duracion_minutos}
                                onChange={(e) => setFormData({ ...formData, duracion_minutos: Number(e.target.value) })}
                                className="input w-full bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                                min="30"
                                step="15"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Cupo Máximo</label>
                            <input
                                type="number"
                                value={formData.cupo_maximo}
                                onChange={(e) => setFormData({ ...formData, cupo_maximo: Number(e.target.value) })}
                                className="input w-full bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                                min="1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Profesor</label>
                            <input
                                type="text"
                                value={formData.profesor}
                                onChange={(e) => setFormData({ ...formData, profesor: e.target.value })}
                                className="input w-full bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Nombre del profesor"
                            />
                        </div>
                    </div>

                    <div className="flex items-center pt-2">
                        <input
                            type="checkbox"
                            id="activo"
                            checked={formData.activo}
                            onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label htmlFor="activo" className="ml-2 text-sm text-gray-300">Curso activo</label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700 mt-4">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                            {editando ? 'Guardar Cambios' : 'Crear Curso'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default GestionCursos;
