import useClasesPrueba from '../../hooks/useClasesPrueba';
import SolicitudesList from '../../components/admin/clasesPrueba/SolicitudesList';
import AvailabilityManager from '../../components/admin/clasesPrueba/AvailabilityManager';

const GestionClasesPrueba = () => {
    const {
        // Solicitudes State & Actions
        solicitudes,
        loadingSolicitudes,
        searchTerm,
        setSearchTerm,
        handleStatusChange,
        handleDelete,
        updateStatusPending,
        deleteSolicitudPending,
        
        // Disponibilidad State & Actions
        disponibles,
        cursos,
        addSlotMutation,
        handleDeleteSlot
    } = useClasesPrueba();

    if (loadingSolicitudes) return <div className="p-8 text-center text-gray-500">Cargando solicitudes...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Clases de Prueba</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Columna Izquierda: Solicitudes (2/3 del ancho) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Solicitudes Recibidas</h2>
                        <div className="relative w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Buscar por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none w-full text-sm transition-shadow"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <SolicitudesList 
                        solicitudes={solicitudes}
                        handleStatusChange={handleStatusChange}
                        handleDelete={handleDelete}
                        updateStatusPending={updateStatusPending}
                        deleteSolicitudPending={deleteSolicitudPending}
                    />
                </div>

                {/* Columna Derecha: Gestión de Disponibilidad */}
                <div className="space-y-6 relative">
                    <AvailabilityManager 
                        disponibles={disponibles}
                        cursos={cursos}
                        addSlotMutation={addSlotMutation}
                        handleDeleteSlot={handleDeleteSlot}
                    />
                </div>
            </div>
        </div>
    );
};

export default GestionClasesPrueba;
