import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';


const DISCIPLINES = [
    {
        title: 'BABY',
        img: '/baby-dance-palermo-select-dance-studio.webp',
        optimized: 'baby',
        imageAlt: 'Clase de danza infantil Baby para niñas de 3 a 5 años en Palermo, Buenos Aires',
        desc: '3 - 5 AÑOS',
        landing: '/danza-infantil-palermo',
        linkLabel: 'Ver danza infantil desde los 3 años',
        details: 'Etapa de iniciación donde se desarrolla la relación con el movimiento, la música y el espacio, favoreciendo la coordinación y la confianza corporal desde edades tempranas.'
    },
    {
        title: 'MINI',
        img: '/mini-danza-palermo-select-dance-studio.webp',
        optimized: 'mini',
        imageAlt: 'Clase de danza Mini para niñas de 6 a 8 años en Palermo, Buenos Aires',
        desc: '6 - 8 AÑOS',
        landing: '/danza-infantil-palermo',
        linkLabel: 'Ver clases de danza para niñas',
        details: 'Periodo de descubrimiento técnico en el que se incorporan nociones de ritmo, alineación y disciplina, estableciendo bases para la formación posterior.'
    },
    {
        title: 'JUNIOR',
        img: '/clase-junior-danza-palermo.webp',
        optimized: 'junior',
        imageAlt: 'Clase de danza Junior para niñas de 9 a 12 años en Palermo, Buenos Aires',
        desc: '9 - 12 AÑOS',
        landing: '/danza-infantil-palermo',
        linkLabel: 'Ver formación Junior de danza',
        details: 'Fase de desarrollo en la que se consolida el control corporal, la musicalidad y la capacidad expresiva, acompañando el crecimiento técnico del estudiante.'
    },
    {
        title: 'TEEN',
        img: '/clase-teen-danza-palermo.webp',
        optimized: 'teen',
        imageAlt: 'Clase de danza Teen para adolescentes en Palermo, Buenos Aires',
        desc: '13 - 17 AÑOS',
        landing: '/danza-infantil-palermo',
        linkLabel: 'Ver danza para adolescentes',
        details: 'Etapa de profundización orientada al perfeccionamiento técnico, la resistencia física y la construcción de identidad escénica.'
    },
    {
        title: 'ADULTOS',
        img: '/clase-senior-danza-palermo.webp',
        optimized: 'senior',
        imageAlt: 'Clase de danza para personas adultas en Palermo, Buenos Aires',
        desc: 'HEELS · FLEX · +18 AÑOS',
        landing: '/clases-danza-adultos-palermo',
        linkLabel: 'Ver clases de danza para adultos',
        details: 'Clases de Heels y Flex para personas adultas que quieren comenzar, retomar o profundizar su práctica con un enfoque técnico, progresivo y consciente.'
    },
    {
        title: 'RECREATIVE',
        img: '/danza-recreativa-palermo-buenos-aires.webp',
        optimized: 'recreative',
        imageAlt: 'Programa de danza recreativa desde los 3 años en Palermo, Buenos Aires',
        desc: 'DESDE LOS 3 AÑOS',
        landing: '/danza-infantil-palermo',
        linkLabel: 'Ver programas de danza infantil',
        details: 'Programa diseñado para niñas y niños que desean aprender danza como actividad recreativa, hacer amigos y adquirir habilidades físicas sin la presión de competir. Se trabaja coordinación, ritmo, postura, imaginación y trabajo en grupo mediante actividades lúdicas y progresivas. Es ideal para quienes desean iniciarse en la danza como deporte artístico, disfrutar del proceso y formar parte de la comunidad del estudio en un ambiente relajado y motivador.'
    },
    {
        title: 'COMPETITION',
        img: '/competicion-danza-select-dance-studio-palermo.webp',
        optimized: 'competition',
        imageAlt: 'Equipo de competición de danza de Select Dance Studio en Palermo, Buenos Aires',
        desc: 'ENTRENAMIENTO DE ALTO RENDIMIENTO DESDE LOS 4 AÑOS',
        details: 'Programa selectivo destinado a alumnos con condiciones, potencial y proyección artística...',
        link: '/competencia-danza-palermo'
    }
];

const ResponsiveDisciplineImage = ({ item, sizes }) => {
    const base = `/optimized/home/${item.optimized}`;
    const srcSet = (format) => [480, 768, 1280]
        .map((width) => `${base}-${width}.${format} ${width}w`)
        .join(', ');

    return (
        <picture>
            <source type="image/avif" srcSet={srcSet('avif')} sizes={sizes} />
            <source type="image/webp" srcSet={srcSet('webp')} sizes={sizes} />
            <img
                src={`${base}-768.webp`}
                alt={item.imageAlt || item.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
            />
        </picture>
    );
};

const FlipCard = ({ item, className = "", height = "aspect-[4/5] sm:aspect-[3/4] min-h-[400px]" }) => {
    const [showDetails, setShowDetails] = useState(false);
    const imageSizes = item.link
        ? '(min-width: 1024px) 1280px, 100vw'
        : '(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw';

    if (item.link) {
        return (
            <Link
                to={item.link}
                className={`relative ${height} w-full block overflow-hidden rounded-2xl shadow-2xl ${className}`}
            >
                <ResponsiveDisciplineImage item={item} sizes={imageSizes} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-0 left-0 w-full p-8 z-10">
                    <div className="h-1 w-12 bg-red-500 mb-4 rounded-full" />
                    <h3 className="text-5xl font-bold text-white mb-2 tracking-tighter flex items-center gap-4">
                        {item.title}
                        <ArrowRightIcon className="w-8 h-8 text-red-500" />
                    </h3>
                    <p className="text-gray-200 font-medium text-lg">{item.desc}</p>
                </div>
            </Link>
        );
    }

    return (
        <div
            className={`relative ${height} w-full cursor-pointer overflow-hidden rounded-2xl shadow-2xl ${className}`}
            onClick={() => setShowDetails(!showDetails)}
        >
            <ResponsiveDisciplineImage item={item} sizes={imageSizes} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

            {!showDetails ? (
                <div className="absolute bottom-0 left-0 w-full p-8 z-10">
                    <div className="h-1 w-12 bg-red-500 mb-4 rounded-full" />
                    <h3 className="text-5xl font-bold text-white mb-2 tracking-tighter">{item.title}</h3>
                    <p className="text-gray-200 font-medium text-lg">{item.desc}</p>
                    {item.landing && (
                        <Link
                            to={item.landing}
                            onClick={(event) => event.stopPropagation()}
                            className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white underline decoration-red-500 underline-offset-4"
                        >
                            {item.linkLabel} <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            ) : (
                <div className="absolute inset-0 bg-zinc-900/95 border border-red-500/30 p-10 flex flex-col items-center justify-center text-center z-20">
                    <span className="text-red-500 text-sm font-bold tracking-[0.3em] uppercase mb-4">Detalles</span>
                    <h3 className="text-3xl font-bold text-white mb-8">{item.title}</h3>
                    <p className="text-gray-300 text-lg leading-relaxed font-light">{item.details}</p>
                    <span className="text-xs text-zinc-500 uppercase tracking-widest border-t border-zinc-800 pt-4 px-4 block mt-8">Toca para volver</span>
                </div>
            )}
        </div>
    );
};

const FeaturedClasses = () => {
    return (
        <section className="py-32 bg-transparent px-6">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-24">
                    <span className="text-red-500 tracking-[0.3em] text-xs font-bold uppercase">Trayectoria Formativa</span>
                    <h2 className="text-4xl md:text-5xl font-bold mt-4 text-inherit">FORMACIÓN EN DANZA POR EDADES</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 content-center">
                    {DISCIPLINES.map((item, index) => {
                        const isCompetition = item.title === 'COMPETITION';
                        return (
                            <FlipCard
                                key={index}
                                item={item}
                                className={isCompetition ? "md:col-span-2 lg:col-span-3" : ""}
                                height={isCompetition ? "aspect-square md:aspect-[21/9] min-h-[300px]" : "aspect-[4/5] sm:aspect-[3/4] min-h-[400px]"}
                            />
                        );
                    })}
                </div>
                <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-center">
                    <Link to="/cursos" className="inline-flex items-center gap-2 text-inherit border-b border-red-500 pb-1 hover:text-red-500 uppercase tracking-widest text-xs font-bold">
                        Ver todos los horarios <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                    <Link to="/clases-particulares-danza-palermo" className="inline-flex items-center gap-2 text-inherit border-b border-red-500 pb-1 hover:text-red-500 uppercase tracking-widest text-xs font-bold">
                        Clases particulares de danza <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedClasses;

