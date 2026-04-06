import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipoAPI } from '../../services/api';
import { Toaster, toast } from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

const GestionEquipo = () => {
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState(null);

    // Form States
    const [nombre, setNombre] = useState('');
    const [cargo, setCargo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [foto, setFoto] = useState(null);

    // 1. Fetch Miembros
    const { data: miembrosData, isLoading } = useQuery({
        queryKey: ['equipo'],
        queryFn: async () => {
            const response = await equipoAPI.getAll();
            return response.data.data || [];
        }
    });

    const miembrosApi = miembrosData || [];
    const miembros = miembrosApi.filter(m =>
        (m.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.cargo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Mutations
    const createMutation = useMutation({
        mutationFn: (formData) => equipoAPI.create(formData),
        onSuccess: () => {
            queryClient.invalidateQueries(['equipo']);
            toast.success(`${nombre} agregado al equipo`);
            resetForm();
        },
        onError: (error) => {
            console.error(error);
            toast.error('Error al guardar');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, formData }) => equipoAPI.update(id, formData),
        onSuccess: () => {
            queryClient.invalidateQueries(['equipo']);
            toast.success(`${nombre} actualizado`);
            resetForm();
        },
        onError: (error) => {
            console.error(error);
            toast.error('Error al actualizar');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => equipoAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['equipo']);
            toast.success('Eliminado correctamente');
        },
        onError: (error) => {
            console.error(error);
            toast.error('Error al eliminar');
        }
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFoto(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('cargo', cargo);
        formData.append('descripcion', descripcion);
        if (foto) formData.append('foto', foto);

        if (editingId) {
            updateMutation.mutate({ id: editingId, formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleEdit = (miembro) => {
        setEditingId(miembro.id);
        setNombre(miembro.nombre);
        setCargo(miembro.cargo);
        setDescripcion(miembro.descripcion);
        setPreviewUrl(miembro.foto_url ? `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${miembro.foto_url}` : null);
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esto",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            deleteMutation.mutate(id);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setNombre('');
        setCargo('');
        setDescripcion('');
        setFoto(null);
        setPreviewUrl(null);
        setModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <Toaster position="top-right" />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Miembros del Equipo</h1>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Buscador */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar miembro..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-64"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <button
                        onClick={() => { resetForm(); setModalOpen(true); }}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium border border-blue-700"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Nuevo Miembro
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="text-gray-900">Cargando...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {miembros.map((miembro) => (
                        <div key={miembro.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                            <div className="aspect-square w-full bg-gray-100 relative">
                                {miembro.foto_url ? (
                                    <img
                                        src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${miembro.foto_url}`}
                                        alt={miembro.nombre}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        <PhotoIcon className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="text-xl font-bold text-gray-900">{miembro.nombre}</h3>
                                <p className="text-blue-400 text-sm font-medium mb-2">{miembro.cargo}</p>
                                <p className="text-gray-500 text-sm line-clamp-3 mb-4">{miembro.descripcion}</p>
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => handleEdit(miembro)}
                                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(miembro.id)}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg border border-gray-200 shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingId ? 'Editar Miembro' : 'Nuevo Miembro'}
                            </h2>
                            <button onClick={resetForm} className="text-gray-500 hover:text-gray-900">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Cargo / Rol</label>
                                <input
                                    type="text"
                                    value={cargo}
                                    onChange={(e) => setCargo(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Descripción</label>
                                <textarea
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    rows="3"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Foto</label>
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-300">
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500">
                                                <PhotoIcon className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-gray-900 hover:file:bg-blue-700"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-gray-900 font-bold py-3 rounded-lg transition-colors mt-4 disabled:opacity-50"
                            >
                                {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionEquipo;


