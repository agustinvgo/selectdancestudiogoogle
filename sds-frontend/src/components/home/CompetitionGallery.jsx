import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TrophyIcon, FireIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

// type: 'gold' = victoria / primer lugar | 'white' = reconocimiento especial
const AWARDS = [
    // ─── FED 2025
    { title: "Mejor Coach", org: "Div. Técnicas Académicas", type: "white", tournament: "FED 2025" },
    { title: "Mejor Coreografía", org: "Torneo FED 2025", type: "white", tournament: "FED 2025" },
    { title: "Mejor Técnica", org: "Torneo FED 2025", type: "white", tournament: "FED 2025" },
    { title: "1° Lugar · Baby", org: "FED 2025", type: "gold", tournament: "FED 2025" },
    { title: "1° Lugar · Mini", org: "FED 2025", type: "gold", tournament: "FED 2025" },
    { title: "1° Lugar · Junior", org: "FED 2025", type: "gold", tournament: "FED 2025" },
    { title: "Dúo Destacado", org: "FED 2025", type: "white", tournament: "FED 2025" },
    // ─── LID 2025
    { title: "Mejor Coach", org: "Div. Técnicas Académicas", type: "white", tournament: "LID 2025" },
    { title: "Mejor Coreografía", org: "LID 2025 Córdoba", type: "white", tournament: "LID 2025" },
    { title: "Dúo Destacado", org: "LID 2025 Córdoba", type: "white", tournament: "LID 2025" },
    { title: "1° Lugar · Mini", org: "LID 2025 Córdoba", type: "gold", tournament: "LID 2025" },
    { title: "1° Lugar · Baby", org: "LID 2025 Córdoba", type: "gold", tournament: "LID 2025" },
    { title: "1° Lugar · Junior", org: "LID 2025 Córdoba", type: "gold", tournament: "LID 2025" },
    { title: "Pase al Mundial", org: "Mundial de Danzas", type: "gold", tournament: "LID 2025" },
    // ─── Martin Fierro
    { title: "Baile Grupal Infantil", org: "Danzas Académicas", type: "white", tournament: "Martin Fierro" },
    { title: "Dúo Infantil", org: "Danzas Académicas", type: "white", tournament: "Martin Fierro" },
];

const BENTO_IMAGES = [
    { id: 1, src: "/hof/1.jpg",  alt: "Competencia 1", span: "md:col-span-2 md:row-span-2" },
    { id: 2, src: "/hof/2.webp", alt: "Competencia 2", span: "md:col-span-1 md:row-span-1" },
    { id: 3, src: "/hof/3.webp", alt: "Competencia 3", span: "md:col-span-1 md:row-span-1" },
    { id: 4, src: "/hof/4.webp", alt: "Competencia 4", span: "md:col-span-1 md:row-span-1" },
    { id: 5, src: "/hof/5.webp", alt: "Competencia 5", span: "md:col-span-1 md:row-span-1" },
    { id: 6, src: "/hof/6.webp", alt: "Competencia 6", span: "md:col-span-2 md:row-span-1" },
    { id: 7, src: "/hof/7.webp", alt: "Competencia 7", span: "md:col-span-2 md:row-span-1" },
];

// Carrusel infinito — triple copia para loop fluido
const buildCarouselItems = () => {
    const items = [];
    let lastTournament = null;
    AWARDS.forEach((award, idx) => {
        if (award.tournament !== lastTournament) {
            items.push({ type: 'divider', label: award.tournament, key: `divider-${award.tournament}` });
            lastTournament = award.tournament;
        }
        items.push({ type: 'award', ...award, key: `award-${idx}` });
    });
    return items;
};
const CAROUSEL_ITEMS = buildCarouselItems();
const INFINITE_ITEMS = [...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS];

const CompetitionGallery = ({ onJoinClick }) => {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [hoveredImage, setHoveredImage]     = useState(null);
    const scrollRef   = useRef(null);
    const isResetting = useRef(false);

    // Touch: solo necesario en móvil
    const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

    // Scroll del carrusel — useCallback para evitar recrear en cada render
    const scroll = useCallback((dir) => {
        scrollRef.current?.scrollBy({ left: dir === 'left' ? -700 : 700, behavior: 'smooth' });
    }, []);

    // Loop infinito silencioso
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const getWidth = () => el.scrollWidth / 3;
        el.scrollLeft = getWidth();

        const onScroll = () => {
            if (isResetting.current) return;
            const w = getWidth();
            if (el.scrollLeft >= w * 2) {
                isResetting.current = true;
                el.scrollLeft -= w;
                requestAnimationFrame(() => { isResetting.current = false; });
            }
            if (el.scrollLeft <= 0) {
                isResetting.current = true;
                el.scrollLeft += w;
                requestAnimationFrame(() => { isResetting.current = false; });
            }
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, []);

    // Eventos — fetch único al montar
    useEffect(() => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        fetch(`${baseUrl.replace(/\/api$/, '')}/api/public/eventos/proximas`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data?.success) setUpcomingEvents(data.data || []); })
            .catch(() => {});
    }, []);

    return (
        <section className="py-20 bg-black relative w-full overflow-hidden">

            {/* ── Estilos de animación ── */}
            <style>{`
                @property --angle {
                    syntax: '<angle>';
                    initial-value: 0deg;
                    inherits: false;
                }
                @keyframes rotate-border {
                    to { --angle: 360deg; }
                }
                .moving-border-wrap-card {
                    position: relative;
                    border-radius: 1.25rem;
                    padding: 2px;
                    background: conic-gradient(
                        from var(--angle),
                        #09090b 0%, #7f1d1d 20%, #dc2626 40%,
                        #ffffff 50%, #dc2626 60%, #7f1d1d 80%, #09090b 100%
                    );
                    animation: rotate-border 4s linear infinite;
                    width: min(520px, 90vw);
                    /* GPU layer propio para no invalidar el resto del layout */
                    will-change: --angle;
                    transform: translateZ(0);
                    contain: layout style;
                }
                .moving-border-inner-card {
                    background: #000;
                    border-radius: calc(1.25rem - 2px);
                    position: relative;
                    z-index: 1;
                    padding: 3rem 2.5rem;
                    overflow: hidden;
                }
                .hide-scroll-bar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hide-scroll-bar::-webkit-scrollbar { display: none; }
            `}</style>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* ── GALERÍA BENTO ── */}
                <div className="mb-32">
                    <div className="mb-12">
                        <p className="text-red-500 text-xs font-bold uppercase tracking-[0.4em] mb-3">Hall of Fame</p>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
                            En Escena
                        </h2>
                    </div>

                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={{
                            hidden: { opacity: 0 },
                            show: { opacity: 1, transition: { staggerChildren: 0.08 } }
                        }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[150px] md:auto-rows-[220px] grid-flow-dense"
                    >
                        {BENTO_IMAGES.map((img) => (
                            <motion.div
                                key={img.id}
                                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                                onMouseEnter={() => !isTouchDevice && setHoveredImage(img.id)}
                                onMouseLeave={() => !isTouchDevice && setHoveredImage(null)}
                                className={`relative rounded-2xl overflow-hidden bg-zinc-900 cursor-pointer ${img.span} border border-white/5 z-10 hover:z-20`}
                                style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                            >
                                {/* Oscurecimiento de las no-activas */}
                                <div className={`absolute inset-0 bg-black transition-opacity duration-300 z-10 pointer-events-none hidden md:block ${hoveredImage !== null && hoveredImage !== img.id ? 'opacity-60' : 'opacity-0'}`} />

                                <img
                                    src={img.src}
                                    alt={img.alt}
                                    loading="lazy"
                                    decoding="async"
                                    className={`w-full h-full object-cover transition-transform duration-500 ease-out will-change-transform ${hoveredImage === img.id ? 'scale-110' : 'scale-100'}`}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />

                                {!isTouchDevice && hoveredImage === img.id && (
                                    <div className="absolute inset-0 border-2 border-red-500/50 rounded-2xl pointer-events-none z-20" />
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* ── CARRUSEL DE LOGROS ── */}
                <div>
                    {/* Encabezado */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
                        <div className="text-center md:text-left">
                            <p className="text-red-500 text-xs font-bold uppercase tracking-[0.4em] mb-3">Palmarés</p>
                            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-3">
                                Nuestros Logros
                            </h2>
                            <p className="text-zinc-400 text-sm md:text-base max-w-xl">
                                Cada reconocimiento es fruto de esfuerzo, disciplina y pasión en el escenario.
                            </p>
                        </div>

                        {/* Flechas — solo desktop */}
                        <div className="hidden md:flex items-center gap-3 shrink-0">
                            <button
                                onClick={() => scroll('left')}
                                aria-label="Anterior"
                                className="w-12 h-12 rounded-full border border-zinc-700 bg-zinc-900/80 hover:bg-red-950/60 hover:border-red-500/60 flex items-center justify-center transition-all duration-200 group"
                            >
                                <ChevronLeftIcon className="w-5 h-5 text-zinc-400 group-hover:text-red-400 transition-colors" />
                            </button>
                            <button
                                onClick={() => scroll('right')}
                                aria-label="Siguiente"
                                className="w-12 h-12 rounded-full border border-zinc-700 bg-zinc-900/80 hover:bg-red-950/60 hover:border-red-500/60 flex items-center justify-center transition-all duration-200 group"
                            >
                                <ChevronRightIcon className="w-5 h-5 text-zinc-400 group-hover:text-red-400 transition-colors" />
                            </button>
                        </div>
                    </div>

                    {/* Carrusel horizontal 360° */}
                    <div
                        ref={scrollRef}
                        className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory hide-scroll-bar px-1 items-stretch"
                    >
                        {INFINITE_ITEMS.map((item, i) =>
                            item.type === 'divider' ? (
                                <div
                                    key={`d-${i}`}
                                    className="snap-start shrink-0 w-[110px] flex flex-col items-center justify-center rounded-2xl border border-red-900/30 bg-gradient-to-b from-red-950/20 to-zinc-950 px-3 py-5 text-center gap-2"
                                >
                                    <div className="w-px flex-1 bg-gradient-to-b from-transparent via-red-700/60 to-transparent rounded-full" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 leading-snug">{item.label}</span>
                                    <div className="w-px flex-1 bg-gradient-to-b from-transparent via-red-700/60 to-transparent rounded-full" />
                                </div>
                            ) : (
                                <div
                                    key={`a-${i}`}
                                    className={`snap-center shrink-0 w-[200px] group relative rounded-2xl p-5 flex flex-col items-center text-center transition-transform duration-300 hover:-translate-y-1.5 cursor-default
                                        ${item.type === 'gold'
                                            ? 'bg-gradient-to-b from-yellow-950/40 to-zinc-950 border border-yellow-800/30 hover:border-yellow-600/50'
                                            : 'bg-gradient-to-b from-zinc-800/50 to-zinc-950 border border-zinc-700/50 hover:border-zinc-500/60'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-all duration-300
                                        ${item.type === 'gold'
                                            ? 'bg-yellow-950/60 border border-yellow-700/40 group-hover:border-yellow-500/60'
                                            : 'bg-zinc-800/80 border border-zinc-600/40 group-hover:border-zinc-400/60'
                                        }`}
                                    >
                                        <TrophyIcon className={`w-6 h-6 transition-colors duration-300
                                            ${item.type === 'gold' ? 'text-yellow-400 group-hover:text-yellow-300' : 'text-zinc-300 group-hover:text-white'}`}
                                        />
                                    </div>

                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full mb-3
                                        ${item.type === 'gold' ? 'bg-yellow-500/15 text-yellow-500' : 'bg-zinc-600/30 text-zinc-400'}`}
                                    >
                                        {item.type === 'gold' ? '1° Lugar' : 'Distinción'}
                                    </span>

                                    <h3 className="text-sm font-bold text-white mb-1 leading-tight">{item.title}</h3>
                                    <p className="text-zinc-500 text-xs leading-relaxed">{item.org}</p>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* ── CTA — Gran cuadrado con borde animado ── */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="mt-24 flex flex-col items-center"
                >
                    <p className="text-zinc-500 text-xs uppercase tracking-[0.4em] mb-10">¿Quieres ser parte?</p>

                    <div className="moving-border-wrap-card">
                        <div className="moving-border-inner-card">
                            <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black to-zinc-950 rounded-[calc(1.25rem-2px)] pointer-events-none" />
                            <div className="relative z-10 flex flex-col items-center text-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-red-600/10 border border-red-500/30 flex items-center justify-center">
                                    <FireIcon className="w-8 h-8 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase leading-tight">
                                        Únete al equipo<br />
                                        <span className="text-red-500">de campeones</span>
                                    </h2>
                                </div>
                                <div className="flex items-center gap-4 opacity-40 w-full max-w-[200px]">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-red-600" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-red-600" />
                                </div>
                                <button
                                    onClick={onJoinClick}
                                    className="group flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white font-bold text-sm uppercase tracking-widest px-8 py-3.5 rounded-full transition-colors duration-300 shadow-[0_0_24px_rgba(220,38,38,0.35)] hover:shadow-[0_0_40px_rgba(220,38,38,0.65)]"
                                >
                                    Prueba tu clase gratuita
                                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
};

export default CompetitionGallery;
