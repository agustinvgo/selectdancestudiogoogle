import { useState, useEffect } from 'react';
import { equipoAPI } from '../../services/api';
import PageSEO from '../../components/SEO/PageSEO';
import SchemaBreadcrumb from '../../components/SEO/SchemaBreadcrumb';

const QuienesSomos = () => {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await equipoAPI.getAll();
                setTeam(response.data.data || []);
            } catch (error) {
                console.error('Error fetching team:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, []);

    return (
        <div className="min-h-screen pt-24">
            <PageSEO
                title="Quiénes Somos"
                description="Conocé al equipo de profesoras de Select Dance Studio Palermo. Profesionales formadas en danza clásica, jazz y contemporáneo con trayectoria nacional e internacional."
                canonical="/nosotros"
            />
            <SchemaBreadcrumb items={[
                { name: 'Inicio', url: '/' },
                { name: 'Quiénes Somos', url: '/nosotros' },
            ]} />
            {/* Hero Section */}
            <div className="container mx-auto px-6 py-12 text-center">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 uppercase">
                    Quiénes <span className="text-gray-500 dark:text-gray-400 font-light">Somos</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                    Conoce al equipo de profesionales apasionados que hacen de Select Dance Studio un lugar único para el arte y el movimiento.
                </p>
            </div>

            {/* Team Grid */}
            <div className="container mx-auto px-6 pb-24">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {team.map((member) => (
                            <div key={member.id} className="group relative">
                                {/* Image Container */}
                                <div className="aspect-[3/4] overflow-hidden rounded-sm bg-zinc-900 mb-6 relative">
                                    <div className="absolute inset-0 bg-white/5 animate-pulse" /> {/* Placeholder */}
                                    {member.foto_url && (
                                        <img
                                            src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${member.foto_url}`}
                                            alt={member.nombre}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale group-hover:grayscale-0"
                                            loading="lazy"
                                        />
                                    )}
                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>

                                {/* Text Content */}
                                <div className="text-center md:text-left">
                                    <h3 className="text-2xl font-bold uppercase tracking-wide mb-1 group-hover:text-blue-500 transition-colors">
                                        {member.nombre}
                                    </h3>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                                        {member.cargo}
                                    </p>
                                    <p className="text-gray-400 font-light leading-relaxed text-sm">
                                        {member.descripcion}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && team.length === 0 && (
                    <div className="text-center py-24 text-gray-500 italic">
                        Aún no hay miembros del equipo visibles.
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuienesSomos;

