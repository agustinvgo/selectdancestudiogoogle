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
    const [fotoPosicion, setFotoPosicion] = useState('center');
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
            const msg = error.response?.data?.message || 'Error al eliminar';
            toast.error(msg);
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
        formData.append('foto_posicion', fotoPosicion);
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
        setFotoPosicion(miembro.foto_posicion || 'center');
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
        setFotoPosicion('center');
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
                                        style={{ objectPosition: miembro.foto_posicion || 'center' }}
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-4xl border border-gray-200 shadow-2xl p-6 md:p-8 max-h-[92vh] overflow-y-auto my-auto">
                        <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-200">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingId ? 'Editar Miembro del Equipo' : 'Nuevo Miembro del Equipo'}
                                </h2>
                                <p className="text-xs text-gray-500 mt-1">
                                    Configura los datos personales y ajusta el encuadre exacto de la fotografía.
                                </p>
                            </div>
                            <button onClick={resetForm} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Left Column: Form Controls */}
                            <div className="lg:col-span-7 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                        placeholder="Ej: Paz Olejnik"
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cargo / Rol</label>
                                    <input
                                        type="text"
                                        value={cargo}
                                        onChange={(e) => setCargo(e.target.value)}
                                        placeholder="Ej: Directora / Profesora de Clásico"
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Perfil / Biografía (Solo letras)</label>
                                    <textarea
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        rows="4"
                                        placeholder="Escribe la biografía, trayectoria profesional, formación y reconocimientos..."
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-sm"
                                    ></textarea>
                                </div>

                                {/* File Upload Box */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Fotografía del Integrante</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 bg-gray-50/50 transition-colors">
                                        <div className="space-y-1 text-center">
                                            <PhotoIcon className="mx-auto h-10 w-10 text-gray-400" />
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none px-3 py-1 border border-gray-200 shadow-sm">
                                                    <span>Seleccionar imagen</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                        className="sr-only"
                                                    />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, WEBP hasta 10MB</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Image Position Slider & Preset Controls */}
                                <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-gray-800">
                                            🎯 Encuadre y Centrado de la Foto
                                        </label>
                                        <span className="text-xs font-mono bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                                            {(() => {
                                                if (!fotoPosicion || fotoPosicion === 'center') return '50%';
                                                if (fotoPosicion === 'top') return '0%';
                                                if (fotoPosicion === 'bottom') return '100%';
                                                const match = String(fotoPosicion).match(/(\d+)%/);
                                                return match ? `${match[1]}%` : '50%';
                                            })()} Vertical
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Mueve la barra o presiona un botón para subir o bajar el rostro en el encuadre:
                                    </p>

                                    {/* Slider */}
                                    <div className="space-y-1">
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            step="1"
                                            value={(() => {
                                                if (!fotoPosicion || fotoPosicion === 'center') return 50;
                                                if (fotoPosicion === 'top') return 0;
                                                if (fotoPosicion === 'bottom') return 100;
                                                const match = String(fotoPosicion).match(/(\d+)%/);
                                                return match ? parseInt(match[1], 10) : 50;
                                            })()}
                                            onChange={(e) => setFotoPosicion(`center ${e.target.value}%`)}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                                            <span>⬆️ Rostro arriba (0%)</span>
                                            <span>🎯 Centro (50%)</span>
                                            <span>⬇️ Abajo (100%)</span>
                                        </div>
                                    </div>

                                    {/* Quick Presets */}
                                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                                        {[
                                            { label: 'Rostro (0%)', val: 'center 0%' },
                                            { label: 'Alto (25%)', val: 'center 25%' },
                                            { label: 'Centro (50%)', val: 'center 50%' },
                                            { label: 'Bajo (75%)', val: 'center 75%' },
                                            { label: 'Abajo (100%)', val: 'center 100%' },
                                        ].map((preset) => (
                                            <button
                                                key={preset.val}
                                                type="button"
                                                onClick={() => setFotoPosicion(preset.val)}
                                                className={`py-1.5 px-1 rounded-md text-[11px] font-medium transition-all text-center ${
                                                    fotoPosicion === preset.val || (fotoPosicion === 'top' && preset.val === 'center 0%') || (fotoPosicion === 'center' && preset.val === 'center 50%') || (fotoPosicion === 'bottom' && preset.val === 'center 100%')
                                                        ? 'bg-blue-600 text-white shadow-sm'
                                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                                                }`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Real-Time Website Live Preview */}
                            <div className="lg:col-span-5 flex flex-col">
                                <div className="sticky top-0 bg-zinc-950 rounded-2xl p-5 border border-zinc-800 shadow-xl text-white space-y-4">
                                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                                                Vista Previa en Vivo Web
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-zinc-500 font-mono">Aspecto 3:4</span>
                                    </div>

                                    {/* Simulated Website Card */}
                                    <div className="space-y-4">
                                        {/* Image Container with 3:4 aspect ratio */}
                                        <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-900 relative border border-zinc-800 shadow-2xl group">
                                            {previewUrl ? (
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover transition-all duration-300"
                                                    style={{ objectPosition: fotoPosicion }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                                                    <PhotoIcon className="w-12 h-12 stroke-1" />
                                                    <span className="text-xs font-medium">Selecciona una imagen arriba</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Simulated Website Text Content */}
                                        <div>
                                            <h3 className="text-lg font-extrabold uppercase tracking-wide text-white line-clamp-1">
                                                {nombre || 'NOMBRE Y APELLIDO'}
                                            </h3>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mt-0.5 mb-2">
                                                {cargo || 'CARGO / ROL'}
                                            </p>
                                            <div className="bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 text-[11px] text-zinc-400 font-light leading-relaxed line-clamp-3">
                                                {descripcion || 'Aquí se mostrará el perfil o biografía del integrante en la web pública.'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Buttons (Full Width) */}
                            <div className="lg:col-span-12 flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-md"
                                >
                                    {createMutation.isPending || updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GestionEquipo;


