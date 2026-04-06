import { useState } from 'react';
import { usuariosAPI } from '../../services/api';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import useToast from '../../hooks/useToast';
import ConfirmDialog from '../../components/ConfirmDialog';
import useConfirm from '../../hooks/useConfirm';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const GestionProfesores = () => {
    const queryClient = useQueryClient();
    const toast = useToast();
    const { isOpen, confirmConfig, confirm, closeConfirm } = useConfirm();

    // --- State (UI only) ---
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editando, setEditando] = useState(null);

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        email: '',
        password: '' // Solo requerido para crear
    });

    // --- Queries ---
    const { data: profesoresData, isLoading } = useQuery({
        queryKey: ['profesores'],
        queryFn: async () => {
            const response = await usuariosAPI.getProfesores();
            return response.data.data || [];
        }
    });

    const profesores = profesoresData || [];

    // --- Mutations ---
    const createProfesorMutation = useMutation({
        mutationFn: (data) => usuariosAPI.createProfesor(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['profesores']);
            toast.success('Profesor creado exitosamente');
            setModalOpen(false);
        },
        onError: (error) => {
            console.error('Error creando profesor:', error);
            const msg = error.response?.data?.message || 'Error al guardar profesor';
            toast.error(msg);
        }
    });

    const updateProfesorMutation = useMutation({
        mutationFn: ({ id, data }) => usuariosAPI.updateProfesor(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['profesores']);
            toast.success('Profesor actualizado correctamente');
            setModalOpen(false);
        },
        onError: (error) => {
            console.error('Error actualizando profesor:', error);
            const msg = error.response?.data?.message || 'Error al guardar profesor';
            toast.error(msg);
        }
    });

    const deleteProfesorMutation = useMutation({
        mutationFn: (id) => usuariosAPI.deleteProfesor(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['profesores']);
            toast.success('Profesor eliminado correctamente');
        },
        onError: (error) => {
            console.error('Error eliminando profesor:', error);
            toast.error('Error al eliminar profesor');
        }
    });

    // --- Actions ---

    const abrirModal = (profesor = null) => {
        if (profesor) {
            setEditando(profesor);
            setFormData({
                nombre: profesor.nombre || '',
                apellido: profesor.apellido || '',
                email: profesor.email || '',
                password: '' // Vacío al editar, opcional
            });
        } else {
            setEditando(null);
            setFormData({
                nombre: '',
                apellido: '',
                email: '',
                password: ''
            });
        }
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editando) {
            updateProfesorMutation.mutate({ id: editando.id, data: formData });
        } else {
            if (!formData.password) {
                toast.error('La contraseña es requerida para nuevos profesores');
                return;
            }
            createProfesorMutation.mutate(formData);
        }
    };

    const eliminarProfesor = (id) => {
        confirm({
            title: '¿Eliminar profesor?',
            message: '¿Estás seguro de eliminar este profesor? El usuario ya no podrá iniciar sesión.',
            variant: 'danger',
            confirmText: 'Eliminar',
            onConfirm: () => deleteProfesorMutation.mutate(id)
        });
    };

    // Filtrar profesores
    const profesoresFiltrados = profesores.filter(p =>
        p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return <Loader />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Profesores</h1>
                    <p className="text-sm text-gray-500 mt-1">Gestión del equipo docente</p>
                </div>
                <button
                    onClick={() => abrirModal()}
                    className="btn btn-primary btn-sm flex items-center space-x-2 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
                >
                    <PlusIcon className="h-4 w-4" />
                    <span>Nuevo Profesor</span>
                </button>
            </div>

            {/* Buscador */}
            <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className={`h-5 w-5 transition-colors ${searchTerm ? 'text-zinc-900' : 'text-gray-400'}`} />
                </div>
                <input
                    type="text"
                    placeholder="Buscar profesor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input w-full bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            {/* Lista de Profesores (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {profesoresFiltrados.map((profesor) => (
                    <div key={profesor.id} className="group bg-white rounded-xl border border-gray-100 p-5 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-4">
                                <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900 font-bold text-lg border border-zinc-200">
                                    {profesor.nombre?.[0]}{profesor.apellido?.[0]}
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-zinc-700 transition-colors">
                                        {profesor.nombre} {profesor.apellido}
                                    </h3>
                                    <p className="text-xs text-gray-500 font-mono">{profesor.email}</p>
                                </div>
                            </div>
                            <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => abrirModal(profesor)}
                                    className="p-1.5 rounded-md text-gray-400 hover:text-zinc-900 hover:bg-white transition-all"
                                    title="Editar"
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </button>
                                <div className="w-px bg-gray-200 my-1 mx-0.5"></div>
                                <button
                                    onClick={() => eliminarProfesor(profesor.id)}
                                    className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-white transition-all"
                                    title="Eliminar"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50 flex justify-between items-center text-xs">
                            <span className="text-gray-400 font-medium">Estado</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5"></span>
                                Activo
                            </span>
                        </div>
                    </div>
                ))}

                {profesoresFiltrados.length === 0 && (
                    <div className="col-span-full py-16 text-center">
                        <div className="mx-auto h-12 w-12 text-gray-300">
                            <UserCircleIcon />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay profesores</h3>
                        <p className="mt-1 text-sm text-gray-500">Comienza creando un nuevo profesor.</p>
                    </div>
                )}
            </div>

            {/* Modal Crear/Editar */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editando ? 'Editar Profesor' : 'Nuevo Profesor'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Nombre</label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="input w-full bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Apellido</label>
                            <input
                                type="text"
                                value={formData.apellido}
                                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                className="input w-full bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input w-full bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                            {editando ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                        </label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="input w-full bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500"
                            placeholder={editando ? 'Dejar en blanco para mantener actual' : 'Contraseña segura'}
                            required={!editando}
                            minLength={6}
                        />
                        {editando && (
                            <p className="text-xs text-gray-500 mt-1">
                                Solo ingresa una contraseña si deseas cambiarla.
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-gray-900 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            disabled={createProfesorMutation.isPending || updateProfesorMutation.isPending}
                        >
                            {createProfesorMutation.isPending || updateProfesorMutation.isPending ? 'Guardando...' : (editando ? 'Guardar Cambios' : 'Crear Profesor')}
                        </button>
                    </div>
                </form>
            </Modal>

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

export default GestionProfesores;


