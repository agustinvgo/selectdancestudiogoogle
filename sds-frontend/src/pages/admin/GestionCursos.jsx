import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { cursosAPI, alumnosAPI, usuariosAPI } from '../../services/api';
import { ArrowDownTrayIcon, PlusIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';
import useToast from '../../hooks/useToast';
import ConfirmDialog from '../../components/ConfirmDialog';
import useConfirm from '../../hooks/useConfirm';
import { exportCursos } from '../../utils/exportExcel';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Modular Components
import CourseStats from '../../components/admin/cursos/CourseStats';
import CourseGrid from '../../components/admin/cursos/CourseGrid';
import CourseModal from '../../components/admin/cursos/CourseModal';

const GestionCursos = () => {
    const { isProfesor } = useAuth();
    const queryClient = useQueryClient();
    const toast = useToast();
    const { isOpen, confirmConfig, confirm, closeConfirm } = useConfirm();

    // --- State (UI only) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCursoId, setExpandedCursoId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editando, setEditando] = useState(null);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        nivel: 'Principiante',
        horario_dia: 'Lunes',
        horario_hora: '18:00',
        duracion_minutos: 60,
        cupo_maximo: 15,
        profesor_id: '',
        activo: true
    });

    // --- Queries ---
    const { data: cursosData, isLoading: loadingCursos } = useQuery({
        queryKey: ['cursos'],
        queryFn: async () => {
            const res = isProfesor ? await cursosAPI.getMyCourses() : await cursosAPI.getAll();
            return res.data.data || [];
        }
    });

    const { data: alumnosData } = useQuery({
        queryKey: ['alumnos'],
        queryFn: async () => {
            const res = await alumnosAPI.getAll();
            return res.data.data || [];
        }
    });

    const { data: profesoresData } = useQuery({
        queryKey: ['profesores'],
        queryFn: async () => {
            const res = await usuariosAPI.getProfesores();
            return res.data.data || [];
        }
    });

    const { data: participantesData, isLoading: loadingParticipantes } = useQuery({
        queryKey: ['participantes', expandedCursoId],
        queryFn: async () => {
            const res = await cursosAPI.getParticipantes(expandedCursoId);
            return res.data.data || [];
        },
        enabled: !!expandedCursoId
    });

    const cursosApi = cursosData || [];
    const cursos = cursosApi.filter(curso =>
        curso.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const alumnos = alumnosData || [];
    const profesores = profesoresData || [];
    const participantes = participantesData || [];

    // --- Mutations ---
    const createCursoMutation = useMutation({
        mutationFn: (data) => cursosAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['cursos']);
            queryClient.invalidateQueries(['cursos_stats']); // If stats query exists
            toast.success(`Curso "${formData.nombre}" creado exitosamente`);
            setModalOpen(false);
        },
        onError: (error) => {
            console.error('Error creando curso:', error);
            toast.error(error.response?.data?.message || 'Error al crear curso');
        }
    });

    const updateCursoMutation = useMutation({
        mutationFn: ({ id, data }) => cursosAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['cursos']);
            queryClient.invalidateQueries(['cursos_stats']);
            toast.success(`Curso "${formData.nombre}" actualizado exitosamente`);
            setModalOpen(false);
        },
        onError: (error) => {
            console.error('Error actualizando curso:', error);
            toast.error(error.response?.data?.message || 'Error al actualizar curso');
        }
    });

    const deleteCursoMutation = useMutation({
        mutationFn: (id) => cursosAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['cursos']);
            toast.success('Curso eliminado correctamente');
        },
        onError: (error) => {
            console.error('Error eliminando curso:', error);
            toast.error('Error al eliminar curso');
        }
    });

    const enrollMutation = useMutation({
        mutationFn: ({ cursoId, alumnoId }) => cursosAPI.inscribirAlumno(cursoId, alumnoId),
        onSuccess: (_, { cursoId }) => {
            queryClient.invalidateQueries(['participantes', cursoId]);
            queryClient.invalidateQueries(['cursos']); // Update counts
            toast.success('Alumno inscrito exitosamente');
        },
        onError: (error) => {
            console.error('Error inscribiendo alumno:', error);
            toast.error(error.response?.data?.message || 'Error al inscribir alumno');
        }
    });

    const unenrollMutation = useMutation({
        mutationFn: ({ cursoId, alumnoId }) => cursosAPI.desinscribirAlumno(cursoId, alumnoId),
        onSuccess: (_, { cursoId }) => {
            queryClient.invalidateQueries(['participantes', cursoId]);
            queryClient.invalidateQueries(['cursos']); // Update counts
            toast.success('Alumno desinscrito correctamente');
        },
        onError: (error) => {
            console.error('Error desinscribiendo alumno:', error);
            toast.error('Error al desinscribir alumno');
        }
    });


    // --- Actions ---
    const abrirModal = (curso = null) => {
        if (curso) {
            setEditando(curso);
            setFormData({
                nombre: curso.nombre,
                descripcion: curso.descripcion || '',
                nivel: typeof curso.nivel === 'string' && curso.nivel.startsWith('[') ? JSON.parse(curso.nivel) : (Array.isArray(curso.nivel) ? curso.nivel : (curso.nivel ? [curso.nivel] : [])),
                categoria: typeof curso.categoria === 'string' && curso.categoria.startsWith('[') ? JSON.parse(curso.categoria) : (Array.isArray(curso.categoria) ? curso.categoria : (curso.categoria ? [curso.categoria] : [])),
                tipo: typeof curso.tipo === 'string' && curso.tipo.startsWith('[') ? JSON.parse(curso.tipo) : (Array.isArray(curso.tipo) ? curso.tipo : (curso.tipo ? [curso.tipo] : [])),
                horario_dia: curso.horario_dia || 'Lunes',
                horario_hora: curso.horario_hora || '18:00',
                duracion_minutos: curso.duracion_minutos || 60,
                cupo_maximo: curso.cupo_maximo || 15,
                profesor_id: curso.profesor_id || '',
                activo: curso.activo !== 0
            });
        } else {
            setEditando(null);
            setFormData({
                nombre: '',
                descripcion: '',
                nivel: [],
                categoria: [],
                tipo: [],
                horario_dia: 'Lunes',
                horario_hora: '18:00',
                duracion_minutos: 60,
                cupo_maximo: 15,
                profesor_id: '',
                activo: true
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editando) {
            updateCursoMutation.mutate({ id: editando.id, data: formData });
        } else {
            createCursoMutation.mutate(formData);
        }
    };

    const eliminarCurso = async (id) => {
        confirm({
            title: '¿Eliminar curso?',
            message: '¿Estás seguro de eliminar este curso? Se eliminarán también las inscripciones de los alumnos.',
            variant: 'danger',
            confirmText: 'Eliminar',
            onConfirm: () => deleteCursoMutation.mutate(id)
        });
    };

    // --- Participant Logic ---
    const toggleParticipantes = (cursoId) => {
        if (expandedCursoId === cursoId) {
            setExpandedCursoId(null);
        } else {
            setExpandedCursoId(cursoId);
        }
    };

    const inscribirAlumno = (cursoId, alumnoId) => {
        enrollMutation.mutate({ cursoId, alumnoId });
    };

    const desinscribirAlumno = (cursoId, alumnoId) => {
        confirm({
            title: '¿Desinscribir alumno?',
            message: '¿Estás seguro de desinscribir a este alumno del curso?',
            variant: 'remove',
            confirmText: 'Desinscribir',
            onConfirm: () => unenrollMutation.mutate({ cursoId, alumnoId })
        });
    };

    if (loadingCursos && !cursosData) return <Loader />;

    return (
        <div className="space-y-6">
            {/* Header Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 border-b-4 border-black inline-block pb-1">
                        {isProfesor ? 'Mis Cursos' : 'Gestión de Cursos'}
                    </h1>
                    <p className="text-gray-500 font-medium mt-2">
                        {isProfesor ? 'Administra las clases que tienes asignadas' : 'Administra todos los programas de formación'}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Buscador */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar curso por nombre..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none w-full sm:w-64"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {!isProfesor && (
                        <>
                            <button onClick={() => exportCursos(cursos)} className="btn bg-gray-900 hover:bg-black text-white flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5" disabled={cursos.length === 0}>
                                <ArrowDownTrayIcon className="w-5 h-5 flex-shrink-0" />
                                <span className="whitespace-nowrap">Exportar Excel</span>
                            </button>
                            <button onClick={() => abrirModal()} className="btn bg-black hover:bg-gray-800 text-white flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                                <PlusIcon className="w-5 h-5 flex-shrink-0" />
                                <span className="whitespace-nowrap">Nuevo Curso</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Stats */}
            <CourseStats cursos={cursos} alumnos={alumnos} />

            {/* Content (Grid of Cursos) */}
            <CourseGrid
                cursos={cursos}
                expandedCursoId={expandedCursoId}
                toggleParticipantes={toggleParticipantes}
                participantes={participantes}
                loadingParticipantes={loadingParticipantes}
                alumnos={alumnos}
                isProfesor={isProfesor}
                onEdit={abrirModal}
                onDelete={eliminarCurso}
                onEnroll={inscribirAlumno}
                onUnenroll={desinscribirAlumno}
            />

            {/* Modal */}
            <CourseModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                editando={editando}
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                profesores={profesores}
                saving={createCursoMutation.isPending || updateCursoMutation.isPending}
            />

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

export default GestionCursos;

