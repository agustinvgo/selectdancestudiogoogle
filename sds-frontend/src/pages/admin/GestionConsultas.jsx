import { useState, useEffect } from 'react';
import { consultasAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import {
    EnvelopeIcon,
    TrashIcon,
    CheckCircleIcon,
    ClockIcon,
    MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const GestionConsultas = () => {
    const [consultas, setConsultas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterEstado, setFilterEstado] = useState('todos'); // todos, pendiente, leido

    useEffect(() => {
        fetchConsultas();
    }, []);

    const fetchConsultas = async () => {
        try {
            setLoading(true);
            const response = await consultasAPI.getAll();
            if (response.data.success) {
                setConsultas(response.data.data);
            }
        } catch (error) {
            toast.error('Error al cargar consultas');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta consulta?')) return;
        try {
            await consultasAPI.delete(id);
            toast.success('Consulta eliminada');
            fetchConsultas(); // Recargar
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await consultasAPI.markAsRead(id);
            // Actualizar estado localmente para rapidez
            setConsultas(consultas.map(c =>
                c.id === id ? { ...c, estado: 'leido' } : c
            ));
            toast.success('Marcado como leído');
        } catch (error) {
            toast.error('Error al actualizar estado');
        }
    };

    // Filtrar
    const filteredConsultas = consultas.filter(consulta => {
        const matchesSearch =
            consulta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consulta.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            consulta.mensaje.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEstado = filterEstado === 'todos' || consulta.estado === filterEstado;

        return matchesSearch && matchesEstado;
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <EnvelopeIcon className="h-8 w-8 mr-2 text-blue-500" />
                    Consultas Web
                </h1>
                <div className="text-gray-500 text-sm">
                    {consultas.length} mensajes recibidos
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg p-4 mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, email o mensaje..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-100 text-gray-900 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="todos">Todos los estados</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="leido">Leídos</option>
                </select>
            </div>

            {/* Lista */}
            {loading ? (
                <div className="text-gray-900 text-center py-10">Cargando...</div>
            ) : filteredConsultas.length === 0 ? (
                <div className="text-gray-500 text-center py-10 bg-white rounded-lg">
                    No se encontraron consultas
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredConsultas.map((consulta) => (
                        <div
                            key={consulta.id}
                            className={`bg-white rounded-lg p-6 border-l-4 transition-all ${consulta.estado === 'pendiente' ? 'border-blue-500' : 'border-gray-300 opacity-90'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-bold text-lg text-gray-900">{consulta.nombre}</h3>
                                        <span className={`text-xs px-2 py-1 rounded-full ${consulta.estado === 'pendiente'
                                            ? 'bg-blue-900 text-blue-200'
                                            : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {consulta.estado.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-500 flex items-center">
                                            <ClockIcon className="h-3 w-3 mr-1" />
                                            {new Date(consulta.fecha).toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        <span className="text-blue-400">{consulta.email}</span>
                                        {consulta.telefono && <span className="mx-2">|</span>}
                                        <span>{consulta.telefono}</span>
                                    </div>
                                    <div className="bg-gray-50/50 p-3 rounded text-gray-200 whitespace-pre-wrap">
                                        {consulta.mensaje}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                    {consulta.estado === 'pendiente' && (
                                        <button
                                            onClick={() => handleMarkAsRead(consulta.id)}
                                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                            title="Marcar como leído"
                                        >
                                            <CheckCircleIcon className="h-6 w-6" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(consulta.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Eliminar"
                                    >
                                        <TrashIcon className="h-6 w-6" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GestionConsultas;


