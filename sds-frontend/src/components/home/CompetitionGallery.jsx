import React, { useState, useEffect } from 'react';
import { TrophyIcon, FireIcon, ArrowRightIcon, StarIcon } from '@heroicons/react/24/solid';

// Palmarés real agrupado por torneo — cada uno con su foto del equipo
const TOURNAMENTS = [
    {
        name: 'FED 2025',
        subtitle: 'Torneo Nacional',
        photoId: 3,
        golds: ['1° Baby', '1° Mini', '1° Junior'],
        honors: ['Mejor Coach', 'Mejor Coreografía', 'Mejor Técnica', 'Dúo Destacado'],
    },
    {
        name: 'LID 2025',
        subtitle: 'Córdoba',
        photoId: 5,
        highlight: 'Pase al Mundial de Danzas',
        golds: ['1° Baby', '1° Mini', '1° Junior'],
        honors: ['Mejor Coach', 'Mejor Coreografía', 'Dúo Destacado'],
    },
    {
        name: 'Martín Fierro',
        subtitle: 'Danzas Académicas',
        photoId: 7,
        golds: [],
        honors: ['Baile Grupal Infantil', 'Dúo Infantil'],
    },
];

const BENTO_IMAGES = [
    { id: 1, alt: "Competencia 1", span: "md:col-span-2 md:row-span-2", sizes: "(min-width: 1400px) 680px, (min-width: 768px) 50vw, 100vw" },
    { id: 2, alt: "Competencia 2", span: "md:col-span-1 md:row-span-1", sizes: "(min-width: 1400px) 340px, (min-width: 768px) 25vw, 50vw" },
    { id: 3, alt: "Competencia 3", span: "md:col-span-1 md:row-span-1", sizes: "(min-width: 1400px) 340px, (min-width: 768px) 25vw, 50vw" },
    { id: 4, alt: "Competencia 4", span: "md:col-span-1 md:row-span-1", sizes: "(min-width: 1400px) 340px, (min-width: 768px) 25vw, 50vw" },
    { id: 5, alt: "Competencia 5", span: "md:col-span-1 md:row-span-1", sizes: "(min-width: 1400px) 340px, (min-width: 768px) 25vw, 50vw" },
    { id: 6, alt: "Competencia 6", span: "md:col-span-2 md:row-span-1", sizes: "(min-width: 1400px) 680px, (min-width: 768px) 50vw, 100vw" },
    { id: 7, alt: "Competencia 7", span: "md:col-span-2 md:row-span-1", sizes: "(min-width: 1400px) 680px, (min-width: 768px) 50vw, 100vw" },
];

const IMAGE_WIDTHS = [640, 960, 1280, 1920];
const imageSrcSet = (id, format) => IMAGE_WIDTHS
    .map((width) => `/optimized/competition/hof-${id}-${width}.${format} ${width}w`)
    .join(', ');

const ResponsiveCompetitionImage = ({
    id,
    alt,
    sizes,
    className,
    loading = 'lazy',
    ariaHidden,
}) => (
    <picture className="contents">
        <source type="image/avif" srcSet={imageSrcSet(id, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={imageSrcSet(id, 'webp')} sizes={sizes} />
        <img
            src={`/optimized/competition/hof-${id}-1280.webp`}
            alt={alt}
            aria-hidden={ariaHidden}
            width="1920"
            height="1280"
            loading={loading}
            decoding="async"
            className={className}
        />
    </picture>
);

const CompetitionGallery = ({ onJoinClick }) => {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [hoveredImage, setHoveredImage]     = useState(null);

    // Touch: solo necesario en móvil
    const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

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


            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* ── GALERÍA BENTO ── */}
                <div
                    className="mb-32"
                    style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 900px' }}
                >
                    <div className="mb-12">
                        <p className="text-red-500 text-xs font-bold uppercase tracking-[0.4em] mb-3">Hall of Fame</p>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase">
                            En Escena
                        </h2>
                    </div>

                    <div
                        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[150px] md:auto-rows-[220px] grid-flow-dense"
                    >
                        {BENTO_IMAGES.map((img) => (
                            <div
                                key={img.id}
                                onMouseEnter={() => !isTouchDevice && setHoveredImage(img.id)}
                                onMouseLeave={() => !isTouchDevice && setHoveredImage(null)}
                                className={`relative rounded-2xl overflow-hidden bg-zinc-900 cursor-pointer ${img.span} border border-white/5 z-10`}
                            >
                                {/* Oscurecimiento de las no-activas */}
                                <div className={`absolute inset-0 bg-black transition-opacity duration-300 z-10 pointer-events-none hidden md:block ${hoveredImage !== null && hoveredImage !== img.id ? 'opacity-60' : 'opacity-0'}`} />

                                <ResponsiveCompetitionImage
                                    id={img.id}
                                    alt={img.alt}
                                    sizes={img.sizes}
                                    className="w-full h-full object-cover"
                                />

                                {!isTouchDevice && hoveredImage === img.id && (
                                    <div className="absolute inset-0 border-2 border-red-500/50 rounded-2xl pointer-events-none z-20" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── LOGROS POR TORNEO — foto real de cada momento ── */}
                <div style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 800px' }}>
                    {/* Encabezado */}
                    <div className="mb-10">
                        <p className="text-red-500 text-xs font-bold uppercase tracking-[0.4em] mb-3">Palmarés 2025</p>
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-3">
                            Nuestros Logros
                        </h2>
                        <p className="text-zinc-400 text-sm md:text-base max-w-xl">
                            Tres torneos, un mismo equipo. Cada foto es un momento que nos llevamos del escenario.
                        </p>
                    </div>

                    {/* Tarjetas de torneo con foto */}
                    <div
                        className="grid md:grid-cols-3 gap-5"
                    >
                        {TOURNAMENTS.map((t) => (
                            <div
                                key={t.name}
                                className="group relative rounded-2xl overflow-hidden min-h-[420px] md:min-h-[500px] flex flex-col justify-end border border-white/10"
                            >
                                {/* Foto de fondo */}
                                <ResponsiveCompetitionImage
                                    id={t.photoId}
                                    alt={`Equipo de Select Dance Studio en ${t.name}`}
                                    sizes="(min-width: 1400px) 450px, (min-width: 768px) 33vw, 100vw"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/20" />

                                {/* Badge del torneo */}
                                <div className="absolute top-4 left-4 z-10">
                                    <span className="inline-block bg-red-600 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                                        {t.name}
                                    </span>
                                    <p className="text-white/70 text-[10px] uppercase tracking-[0.2em] mt-2 pl-1">
                                        {t.subtitle}
                                    </p>
                                </div>

                                {/* Logros */}
                                <div className="relative z-10 p-6">
                                    {t.highlight && (
                                        <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 rounded-xl px-3 py-2.5 mb-4 backdrop-blur-sm">
                                            <TrophyIcon className="w-4 h-4 text-amber-400 shrink-0" />
                                            <span className="text-amber-300 text-sm font-bold leading-tight">{t.highlight}</span>
                                        </div>
                                    )}

                                    {t.golds.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {t.golds.map((g) => (
                                                <span
                                                    key={g}
                                                    className="inline-flex items-center gap-1 bg-yellow-500/15 text-yellow-300 text-xs font-bold px-2.5 py-1 rounded-full border border-yellow-600/30"
                                                >
                                                    <TrophyIcon className="w-3 h-3" />
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        {t.honors.map((h) => (
                                            <div key={h} className="flex items-center gap-2">
                                                <StarIcon className="w-3 h-3 text-zinc-400 shrink-0" />
                                                <span className="text-zinc-200 text-sm">{h}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CTA — Gran cuadrado con borde animado ── */}
                <div
                    className="mt-24 flex flex-col items-center"
                    style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 600px' }}
                >
                    <p className="text-zinc-500 text-xs uppercase tracking-[0.4em] mb-10">¿Quieres ser parte?</p>

                    <div className="relative rounded-3xl border-2 border-red-600/40 w-full max-w-[520px] overflow-hidden" style={{ boxShadow: '0 0 40px -10px rgba(220,38,38,0.3)' }}>
                        <div className="bg-black relative p-12 overflow-hidden">
                            {/* Foto de fondo */}
                            <ResponsiveCompetitionImage
                                id={9}
                                alt=""
                                ariaHidden="true"
                                sizes="(min-width: 640px) 520px, 100vw"
                                className="absolute inset-0 w-full h-full object-cover opacity-35"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/75 to-red-950/40 rounded-[calc(1.25rem-2px)] pointer-events-none" />
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
                                    Consultar por WhatsApp
                                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default CompetitionGallery;
