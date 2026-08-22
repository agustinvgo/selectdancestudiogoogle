import { useState, useEffect } from 'react';
import { equipoAPI, getMediaUrl } from '../../services/api';
import PageSEO from '../../components/SEO/PageSEO';
import { getPhotoCropStyle } from '../../utils/photoPosition';

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
                title="Equipo y método de enseñanza en danza"
                description="Conocé al equipo de profesoras de Select Dance Studio Palermo. Profesionales formadas en danza clásica, jazz y contemporáneo con trayectoria nacional e internacional."
                canonical="/nosotros"
            />
            {/* Hero Section */}
            <div className="container mx-auto px-6 py-12 text-center">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 uppercase">
                    Equipo de <span className="text-gray-500 dark:text-gray-400 font-light">Select Dance Studio</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                    Conoce al equipo de profesionales apasionados que hacen de Select Dance Studio un lugar único para el arte y el movimiento.
                </p>
            </div>

            {/* Team Profiles List */}
            <div className="container mx-auto px-6 max-w-6xl pb-24">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                ) : (
                    <div className="space-y-12 md:space-y-16">
                        {team.map((member) => (
                                <div 
                                    key={member.id} 
                                    className="bg-zinc-900/40 border border-zinc-800/70 rounded-2xl p-6 md:p-8 lg:p-10 backdrop-blur-sm shadow-xl flex flex-col md:flex-row gap-8 lg:gap-12 items-start group hover:border-zinc-700/80 transition-all duration-300"
                                >
                                    {/* Left Column: Photo & Name / Cargo */}
                                    <div className="w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col items-center md:items-start text-center md:text-left">
                                        <div className="aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-950 relative shadow-lg mb-6 border border-zinc-800">
                                            <div className="absolute inset-0 bg-white/5 animate-pulse" />
                                            {member.foto_url ? (
                                                <img
                                                    src={getMediaUrl(member.foto_url)}
                                                    alt={member.nombre}
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300"
                                                    style={getPhotoCropStyle(member.foto_posicion)}
                                                    loading="lazy"
                                                />
                                            ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold uppercase tracking-wider text-xl">
                                                {member.nombre?.charAt(0) || 'S'}
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-white mb-1">
                                        {member.nombre}
                                    </h3>
                                    {member.cargo && (
                                        <p className="text-xs md:text-sm font-semibold uppercase tracking-widest text-red-500">
                                            {member.cargo}
                                        </p>
                                    )}
                                </div>

                                {/* Right Column: Profile Text Section ("A un costado") */}
                                <div className="flex-1 w-full flex flex-col h-full self-stretch justify-start bg-zinc-950/50 p-6 md:p-8 rounded-xl border border-zinc-800/50">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-800/80">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                        <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-zinc-400">
                                            Perfil & Trayectoria
                                        </h4>
                                    </div>

                                    <div className="text-zinc-300 font-light leading-relaxed text-base md:text-lg whitespace-pre-line flex-1">
                                        {member.descripcion ? (
                                            member.descripcion
                                        ) : (
                                            <p className="text-zinc-500 italic font-normal text-sm">
                                                Aún no se ha especificado el perfil o la trayectoria de este integrante.
                                            </p>
                                        )}
                                    </div>
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

