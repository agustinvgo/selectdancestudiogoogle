import { useState, useEffect } from 'react';
import { alumnosAPI, cursosAPI, pagosAPI } from '../../services/api';
import { exportAlumnos } from '../../utils/exportExcel';
import { PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Loader from '../../components/Loader';
import useToast from '../../hooks/useToast';
import ConfirmDialog from '../../components/ConfirmDialog';
import useConfirm from '../../hooks/useConfirm';
import Pagination from '../../components/common/Pagination';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Modular Components
import StudentStats from '../../components/admin/alumnos/StudentStats';
import StudentFilters from '../../components/admin/alumnos/StudentFilters';
import StudentTable from '../../components/admin/alumnos/StudentTable';
import StudentModal from '../../components/admin/alumnos/StudentModal';
import StudentTableSkeleton from '../../components/admin/alumnos/StudentTableSkeleton';
import SuccessModal from '../../components/SuccessModal';

const GestionAlumnos = () => {
    // --- State ---
    const [saving, setSaving] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10); // Configurable

    // Filters State
    const [activeTab, setActiveTab] = useState('activos');
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [editando, setEditando] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        fecha_nacimiento: '',
        dni: '',
        telefono: '',
        nombre_padre: '',
        email_padre: '',
        direccion: '',
        cursoIds: [],
        pagosIniciales: []
    });

    // Success Modal State
    const [successModal, setSuccessModal] = useState({
        open: false,
        title: '',
        message: '',
        copyText: ''
    });

    const toast = useToast();
    const { isOpen, confirmConfig, confirm, closeConfirm } = useConfirm();
    const queryClient = useQueryClient();

    // --- Helpers ---
    const isActivo = (val) => {
        if (val === 1 || val === '1' || val === true) return true;
        if (val === 0 || val === '0' || val === false || val === null || val === undefined) return false;
        if (typeof val === 'object' && val?.type === 'Buffer' && Array.isArray(val?.data)) {
            return val.data[0] === 1;
        }
        return !!val;
    };

    // --- React Query ---
    // 1. Fetch Alumnos
    const { data: alumnosData, isLoading: loadingAlumnos } = useQuery({
        queryKey: ['alumnos', { page, pageSize, searchTerm, activeTab }],
        queryFn: async () => {
            const params = {
                page,
                limit: pageSize,
                search: searchTerm,
                activo: activeTab
            };
            const response = await alumnosAPI.getAll(params);
            return response.data;
        },
        keepPreviousData: true,
    });

    const alumnos = alumnosData?.data || [];
    const totalItems = alumnosData?.total || 0;
    const stats = alumnosData?.stats
        ? {
            activos: parseInt(alumnosData.stats.activos || 0),
            inactivos: parseInt(alumnosData.stats.inactivos || 0),
            todos: parseInt(alumnosData.stats.total || 0)
        }
        : { activos: 0, inactivos: 0, todos: 0 };

    // 2. Fetch Cursos (Shared Cache)
    const { data: cursos = [] } = useQuery({
        queryKey: ['cursos_list'],
        queryFn: async () => {
            const res = await cursosAPI.getAll();
            return res.data.data || [];
        },
        staleTime: 10 * 60 * 1000
    });

    const loading = loadingAlumnos;

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, activeTab]);




    // --- Mutations ---
    const createAlumnoMutation = useMutation({
        mutationFn: (data) => alumnosAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['alumnos']);
            queryClient.invalidateQueries(['alumnos_stats']);
        }
    });

    const updateAlumnoMutation = useMutation({
        mutationFn: ({ id, data }) => alumnosAPI.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['alumnos']);
            queryClient.invalidateQueries(['alumnos_stats']);
        }
    });

    const deleteAlumnoMutation = useMutation({
        mutationFn: (id) => alumnosAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['alumnos']);
            queryClient.invalidateQueries(['alumnos_stats']);
            toast.success('Alumno eliminado correctamente');
        },
        onError: () => toast.error('Error al eliminar alumno')
    });

    // --- Actions ---
    const abrirModal = async (alumno = null) => {
        if (alumno) {
            setEditando(alumno);
            setModalOpen(true);

            // Inicializar con datos básicos
            setFormData({
                email: alumno.email || '',
                password: '',
                nombre: alumno.nombre || '',
                apellido: alumno.apellido || '',
                fecha_nacimiento: alumno.fecha_nacimiento
                    // Bug #6 fix: extraer la fecha local sin pasar por new Date() para evitar desfase UTC
                    // new Date('2010-04-01') en UTC-3 da 2010-03-31 — leemos directamente del string
                    ? (typeof alumno.fecha_nacimiento === 'string'
                        ? alumno.fecha_nacimiento.split('T')[0]
                        : new Date(alumno.fecha_nacimiento).toISOString().split('T')[0])
                    : '',
                dni: alumno.dni || '',
                telefono: alumno.telefono || '',
                email_padre: alumno.email_padre || '',
                direccion: alumno.direccion || '',
                cursoIds: [], // Se llenará async
                pagosIniciales: []
            });

            // Fetch current enrollments
            try {
                const res = await cursosAPI.getByAlumno(alumno.id);
                const currentCursos = res.data.data || [];
                const currentIds = currentCursos.map(c => String(c.id));

                setFormData(prev => ({
                    ...prev,
                    cursoIds: currentIds,
                    _initialCursoIds: currentIds
                }));
            } catch (error) {
                console.error('Error fetching enrollments:', error);
                toast.error('Error cargando inscripciones del alumno');
            }

        } else {
            setEditando(null);
            setFormData({
                email: '',
                password: '',
                nombre: '',
                apellido: '',
                fecha_nacimiento: '',
                dni: '',
                telefono: '',
                email_padre: '',
                direccion: '',
                cursoIds: [],
                pagosIniciales: []
            });
            setModalOpen(true);
        }
    };

    const cerrarModal = () => {
        setModalOpen(false);
        setEditando(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'cursoIds' || key === 'pagosIniciales' || key === '_initialCursoIds') {
                    if (key === 'cursoIds' && !editando) {
                        data.append(key, JSON.stringify(formData[key]));
                    }
                } else if (key === 'previewUrl') {
                    // Ignorar
                } else if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });

            let tempPassword = '';

            if (editando) {
                // Actualizar
                await updateAlumnoMutation.mutateAsync({ id: editando.id, data });

                // Procesar cursos (Logic kept as manual calls for simplicity or could be separate mutations)
                // For a full refactor, these should be their own mutations or part of the update service
                const initialIds = formData._initialCursoIds || [];
                const currentIds = formData.cursoIds || [];
                const toEnroll = currentIds.filter(id => !initialIds.includes(id));
                const toUnenroll = initialIds.filter(id => !currentIds.includes(id));

                for (const cid of toEnroll) {
                    try { await cursosAPI.inscribirAlumno(cid, editando.id); } catch (err) { console.error(err); }
                }
                for (const cid of toUnenroll) {
                    try { await cursosAPI.desinscribirAlumno(cid, editando.id); } catch (err) { console.error(err); }
                }

                // Crear pagos nuevos
                if (formData.pagosIniciales && formData.pagosIniciales.length > 0) {
                    for (const pago of formData.pagosIniciales) {
                        if (pago.concepto) {
                            try {
                                await pagosAPI.create({
                                    alumno_id: editando.id,
                                    monto: pago.monto || 0,
                                    concepto: pago.concepto,
                                    fecha_vencimiento: pago.fecha_vencimiento || new Date().toISOString().split('T')[0],
                                    es_mensual: pago.es_mensual,
                                    estado: 'pendiente'
                                });
                            } catch (err) { console.error(err); }
                        }
                    }
                }
                toast.success(`${formData.nombre} ${formData.apellido} actualizado correctamente`);
                cerrarModal();

            } else {
                // Crear
                const cleanStr = (str) => str.replace(/[^a-zA-Z0-9]/g, '');
                const nombreClean = cleanStr(formData.nombre || 'Nom');
                const apellidoClean = cleanStr(formData.apellido || 'Ape');
                const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
                const random4 = Math.floor(1000 + Math.random() * 9000);
                const symbols = ['!', '@', '#', '$', '%'];
                const symbol = symbols[Math.floor(Math.random() * symbols.length)];
                const apellidoInitial = cap(apellidoClean.charAt(0) || 'X');
                // Formato: NombreCapitalizado + 4digitos + simbolo + InicialApellido
                // Ejemplo: Juan1234!G — cumple >= 9 chars, mayúscula, número, símbolo
                tempPassword = `${cap(nombreClean)}${random4}${symbol}${apellidoInitial}`;

                data.set('password', tempPassword);

                const response = await createAlumnoMutation.mutateAsync(data);
                const nuevoAlumnoId = response.data.data.id;

                if (formData.cursoIds && formData.cursoIds.length > 0) {
                    for (const cid of formData.cursoIds) {
                        try { await cursosAPI.inscribirAlumno(cid, { alumno_id: nuevoAlumnoId }); } catch (err) { console.error('Error inscribiendo alumno nuevo', err); }
                    }
                }

                setSuccessModal({
                    open: true,
                    title: '¡Alumno Creado!',
                    message: 'El alumno ha sido registrado exitosamente. Por favor, copia y comparte esta contraseña temporal con el usuario, ya que no podrá recuperarla hasta que inicie sesión.',
                    copyText: tempPassword
                });
                setModalOpen(false);
            }

        } catch (error) {
            console.error('Error guardando alumno:', error);
            toast.error(error.response?.data?.message || 'Error al guardar alumno');
        } finally {
            setSaving(false);
        }
    };

    const eliminarAlumno = async (id) => {
        confirm({
            title: '¿Eliminar alumno permanentemente?',
            message: 'Esta acción borrará todos los datos del alumno, historial de pagos y asistencia. NO se puede deshacer.',
            variant: 'danger',
            confirmText: 'Eliminar permanentemente',
            onConfirm: () => deleteAlumnoMutation.mutate(id)
        });
    };

    const toggleEstadoAlumno = async (alumno) => {
        const nuevoEstado = !isActivo(alumno.usuario_activo);
        const accion = nuevoEstado ? 'activar' : 'desactivar';

        confirm({
            title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} alumno?`,
            message: `¿Estás seguro de ${accion} a ${alumno.nombre} ${alumno.apellido}?`,
            variant: 'remove',
            confirmText: accion.charAt(0).toUpperCase() + accion.slice(1),
            onConfirm: async () => {
                // Optimistic update could go here, but invalidate is safer
                try {
                    await updateAlumnoMutation.mutateAsync({
                        id: alumno.id,
                        data: { activo: nuevoEstado }
                    });
                    toast.success(`Alumno ${nuevoEstado ? 'activado' : 'desactivado'} correctamente`);
                } catch (error) {
                    console.error('Error cambiando estado:', error);
                    toast.error('Error al cambiar estado.');
                }
            }
        });
    };

    if (loading && alumnos.length === 0) return (
        <div className="space-y-6">
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>)}
            </div>
            <StudentTableSkeleton />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Alumnos</h1>
                    <p className="text-sm text-gray-500 mt-1">Gestión integral de estudiantes</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => exportAlumnos && exportAlumnos(alumnos)}
                        className="btn btn-secondary btn-sm flex items-center space-x-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
                        disabled={alumnos.length === 0}
                    >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        <span>Exportar</span>
                    </button>
                    <button
                        onClick={() => abrirModal()}
                        className="btn btn-primary btn-sm flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
                    >
                        <PlusIcon className="h-4 w-4" />
                        <span>Nuevo Alumno</span>
                    </button>
                </div>
            </div>

            {/* Dashboard Statistics */}
            <StudentStats stats={stats} />

            {/* Filters */}
            <StudentFilters
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                counts={stats}
            />

            {/* Main Table */}
            <StudentTable
                alumnos={alumnos} // Now server-side filtered
                isActivo={isActivo}
                abrirModal={abrirModal}
                toggleEstadoAlumno={toggleEstadoAlumno}
                eliminarAlumno={eliminarAlumno}
                searchTerm={searchTerm}
            />

            {/* Pagination Controls */}
            {totalItems > 0 && (
                <Pagination
                    currentPage={page}
                    totalItems={totalItems}
                    pageSize={pageSize}
                    onPageChange={setPage}
                />
            )}

            {/* Modal Form */}
            <StudentModal
                isOpen={modalOpen && !successModal.open}
                onClose={cerrarModal}
                editando={editando}
                formData={formData}
                setFormData={setFormData}
                handleSubmit={handleSubmit}
                cursos={cursos}
                saving={saving}
            />

            {/* Success Modal */}
            <SuccessModal
                isOpen={successModal.open}
                onClose={() => setSuccessModal({ ...successModal, open: false })}
                title={successModal.title}
                message={successModal.message}
                copyText={successModal.copyText}
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

export default GestionAlumnos;

