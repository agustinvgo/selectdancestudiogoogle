import React, { useState, useEffect } from 'react';
import { TrophyIcon, StarIcon } from '@heroicons/react/24/solid';

const AWARDS = [
    "Mejor coach 2025 (FED)",
    "mejor Tecnica Academica (FED)",
    "Mejor Coreografia (FED)",
    "Mejor Coach (LID)",
    "Duo Destacado (LID)",
    "Mejor Duo Academico (LID)",
    "Pase Internacional ,Brasil 2026 (ICD)",
    "Primer Lugar en Torneo FED (BABY,INFANTIL A ,INFANTIL B)",
    "Primer Lugar en LID (DUOS,TECNICA ACADEMICA,LYRICAL JAZZ,JAZZ DANCE)",
    "Finalistas Martin Fierro de la Danza 2025 (DUOS Y GRUPAL JUNIOR)",
    "Duo Destacado (MF)",
];

// Define images explicitly with correct paths based on public/hof directory content
// Added version query string (?v=2) to force browser cache refresh
const IMAGES = [
    { id: 1, src: "/hof/1.jpg?v=2", alt: "Competition Momement 1", className: "md:col-span-2 md:row-span-2" },
    { id: 2, src: "/hof/2.jpg?v=2", alt: "Competition Momement 2", className: "md:col-span-1 md:row-span-1" },
    { id: 3, src: "/hof/3.jpg?v=2", alt: "Competition Momement 3", className: "md:col-span-1 md:row-span-1" },
    { id: 4, src: "/hof/4.jpg?v=2", alt: "Competition Momement 4", className: "md:col-span-2 md:row-span-1" },
    { id: 5, src: "/hof/5.jpg?v=2", alt: "Competition Momement 5", className: "md:col-span-1 md:row-span-1" },
    { id: 6, src: "/hof/6.jpg?v=2", alt: "Competition Momement 6", className: "md:col-span-1 md:row-span-2" },
    { id: 7, src: "/hof/7.jpg?v=2", alt: "Competition Momement 7", className: "md:col-span-1 md:row-span-1" },
    { id: 8, src: "/hof/8.jpg?v=2", alt: "Competition Momement 8", className: "md:col-span-1 md:row-span-1" },
    { id: 9, src: "/hof/9.jpg?v=2", alt: "Competition Momement 9", className: "md:col-span-1 md:row-span-1" },
    { id: 10, src: "/hof/10.jpeg?v=2", alt: "Competition Momement 10", className: "md:col-span-1 md:row-span-1" },
    { id: 11, src: "/hof/11.jpeg?v=2", alt: "Competition Momement 11", className: "md:col-span-1 md:row-span-1" },
    { id: 12, src: "/hof/12.jpeg?v=2", alt: "Competition Momement 12", className: "md:col-span-1 md:row-span-1" },
    { id: 13, src: "/hof/13.jpeg?v=2", alt: "Competition Momement 13", className: "md:col-span-1 md:row-span-1" },
];

const ImageSkeleton = () => (
    <div className="absolute inset-0 bg-zinc-800 animate-pulse flex items-center justify-center">
        <StarIcon className="w-8 h-8 text-zinc-700" />
    </div>
);

const CompetitionGallery = ({ onJoinClick }) => {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loadedImages, setLoadedImages] = useState({});

    const handleImageLoad = (id) => {
        setLoadedImages(prev => ({ ...prev, [id]: true }));
    };

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const apiUrl = `${baseUrl.replace(/\/api$/, '')}/api/public/eventos/proximas`;
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error('Error loading events');
                const data = await response.json();
                if (data.success) setUpcomingEvents(data.data || []);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <section className="py-24 bg-black relative">
            <div className="max-w-7xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-16">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <StarIcon className="w-6 h-6 text-yellow-500" />
                        <span className="text-red-500 tracking-[0.5em] text-xs font-bold uppercase">Trayectoria de Éxito</span>
                        <StarIcon className="w-6 h-6 text-yellow-500" />
                    </div>
                    <h2 className="text-fluid-h2 font-black text-white tracking-tighter">
                        HALL OF FAME
                    </h2>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 auto-rows-[min(40vw,250px)]">
                    {IMAGES.map((img) => (
                        <div
                            key={img.id}
                            className={`relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 group ${img.className} hover:z-10`}
                            style={{ willChange: 'transform' }}
                        >
                            {!loadedImages[img.id] && <ImageSkeleton />}
                            
                            <img
                                src={img.src}
                                alt={img.alt}
                                loading="lazy"
                                onLoad={() => handleImageLoad(img.id)}
                                className={`w-full h-full object-cover transition-all duration-700 ${loadedImages[img.id] ? 'opacity-100 scale-100' : 'opacity-0 scale-110'} group-hover:scale-105`}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                    e.target.parentElement.innerHTML = '<span class="text-zinc-500 text-sm italic">Image not found</span>';
                                }}
                            />
                        </div>
                    ))}

                    {/* CTA Card */}
                    <div
                        className="relative overflow-hidden bg-gradient-to-br from-red-600 to-red-900 rounded-xl flex flex-col items-center justify-center p-8 text-center col-span-2 md:col-span-1 md:row-span-1 border border-red-500/20 shadow-xl"
                    >
                        {/* Ribbon */}
                        <div className="absolute top-6 -right-14 bg-yellow-400 text-red-950 text-[10px] font-black py-1.5 w-48 text-center rotate-45 shadow-xl z-10 uppercase tracking-[0.15em] border-y-2 border-yellow-200">
                            PRÓXIMAMENTE
                        </div>

                        <TrophyIcon className="w-12 h-12 text-white/50 mb-4" />
                        <h3 className="text-xl font-bold text-white/90">JOIN THE TEAM</h3>
                        <p className="text-[10px] text-red-200/60 mb-4 uppercase tracking-wider font-medium mt-1">Audiciones 2026</p>

                        <button disabled className="bg-black/20 text-white/30 px-5 py-1.5 rounded-full text-xs font-bold border border-white/5 cursor-not-allowed select-none tracking-wide">
                            AUDICIONAR
                        </button>
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="mt-24">
                    <h3 className="text-3xl font-bold text-white text-center mb-8">PRÓXIMAS COMPETENCIAS</h3>

                    {loading && <p className="text-center text-zinc-500">Cargando...</p>}

                    {!loading && !error && upcomingEvents.length === 0 && (
                        <p className="text-center text-zinc-500">No hay eventos próximos.</p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {upcomingEvents.map(event => (
                            <div key={event.id} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                                <div className="text-red-500 font-bold mb-2">
                                    {new Date(event.fecha).toLocaleDateString()}
                                </div>
                                <h4 className="text-xl font-bold text-white mb-2">{event.nombre}</h4>
                                <p className="text-zinc-400 text-sm">{event.lugar}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Awards Ticker */}
                <div className="mt-24 border-y border-white/10 py-6 overflow-hidden">
                    <div className="flex animate-scroll whitespace-nowrap gap-8">
                        {[...AWARDS, ...AWARDS].map((award, i) => (
                            <div key={i} className="flex items-center gap-2 text-zinc-400">
                                <StarIcon className="w-4 h-4 text-red-500" />
                                <span className="uppercase tracking-widest text-sm">{award}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
            <style>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 8s linear infinite;
                }
            `}</style>
        </section>
    );
};

export default CompetitionGallery;
