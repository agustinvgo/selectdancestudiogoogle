import { Link } from 'react-router-dom';
import { ArrowRightIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

const DISCIPLINES = [
    {
        title: 'BABY',
        img: '/baby-dance-palermo-select-dance-studio.webp',
        desc: '3 - 5 AÑOS',
        details: 'Etapa de iniciación donde se desarrolla la relación con el movimiento, la música y el espacio, favoreciendo la coordinación y la confianza corporal desde edades tempranas.'
    },
    {
        title: 'MINI',
        img: '/mini-danza-palermo-select-dance-studio.webp',
        desc: '6 - 8 AÑOS',
        details: 'Periodo de descubrimiento técnico en el que se incorporan nociones de ritmo, alineación y disciplina, estableciendo bases para la formación posterior.'
    },
    {
        title: 'JUNIOR',
        img: '/clase-junior-danza-palermo.webp',
        desc: '9 - 12 AÑOS',
        details: 'Fase de desarrollo en la que se consolida el control corporal, la musicalidad y la capacidad expresiva, acompañando el crecimiento técnico del estudiante.'
    },
    {
        title: 'TEEN',
        img: '/clase-teen-danza-palermo.webp',
        desc: '13 - 17 AÑOS',
        details: 'Etapa de profundización orientada al perfeccionamiento técnico, la resistencia física y la construcción de identidad escénica.'
    },
    {
        title: 'SENIOR',
        img: '/clase-senior-danza-palermo.webp',
        desc: '+ 18 AÑOS',
        details: 'Instancia de formación continua destinada a jóvenes y adultos que buscan sostener y perfeccionar su práctica con un enfoque técnico y consciente.'
    },
    {
        title: 'RECREATIVE',
        img: '/danza-recreativa-palermo-buenos-aires.webp',
        desc: 'DESDE LOS 3 AÑOS',
        details: 'Programa diseñado para niñas y niños que desean aprender danza como actividad recreativa, hacer amigos y adquirir habilidades físicas sin la presión de competir. Se trabaja coordinación, ritmo, postura, imaginación y trabajo en grupo mediante actividades lúdicas y progresivas. Es ideal para quienes desean iniciarse en la danza como deporte artístico, disfrutar del proceso y formar parte de la comunidad del estudio en un ambiente relajado y motivador.'
    },
    {
        title: 'COMPETITION',
        img: '/competicion-danza-select-dance-studio-palermo.webp',
        desc: 'ENTRENAMIENTO DE ALTO RENDIMIENTO DESDE LOS 4 AÑOS',
        details: 'Programa selectivo destinado a alumnos con condiciones, potencial y proyección artística...',
        link: '/competition'
    }
];

const FlipCard = ({ item, className = "", height = "aspect-[4/5] sm:aspect-[3/4] min-h-[400px]" }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    // If item has a link, render a Link wrapper instead of flip logic
    if (item.link) {
        return (
            <Link
                to={item.link}
                className={`relative ${height} w-full block group overflow-hidden rounded-2xl shadow-2xl ${className}`}
            >
                {/* Same Image Layer as Front Face */}
                <div className="absolute inset-0 w-full h-full">
                    <img
                        src={item.img}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 z-10">
                    <div className="h-1 w-12 bg-red-500 mb-4 rounded-full"></div>
                    <h3 className="text-5xl font-bold text-white mb-2 tracking-tighter drop-shadow-lg flex items-center gap-4">
                        {item.title}
                        <ArrowRightIcon className="w-8 h-8 text-red-500 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </h3>
                    <p className="text-gray-200 font-medium text-lg drop-shadow-md">
                        {item.desc}
                    </p>
                </div>
            </Link>
        );
    }

    return (
        <div
            className={`relative ${height} w-full perspective-1000 cursor-pointer group ${className}`}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, animationDirection: "normal" }}
                className="w-full h-full relative shadow-2xl rounded-2xl"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* FRONT FACE */}
                <motion.div
                    className="absolute inset-0 w-full h-full overflow-hidden rounded-2xl border border-white/10"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <img
                        src={item.img}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>

                    <div className="absolute bottom-0 left-0 w-full p-8">
                        <div className="h-1 w-12 bg-red-500 mb-4 rounded-full"></div>
                        <h3 className="text-5xl font-bold text-white mb-2 tracking-tighter drop-shadow-lg">{item.title}</h3>
                        <p className="text-gray-200 font-medium text-lg drop-shadow-md">
                            {item.desc}
                        </p>
                    </div>
                </motion.div>

                {/* BACK FACE */}
                <motion.div
                    className="absolute inset-0 w-full h-full bg-zinc-900/95 backdrop-blur-xl border border-red-500/30 p-10 flex flex-col items-center justify-center text-center rounded-2xl shadow-[0_0_50px_-12px_rgba(239,68,68,0.25)]"
                    style={{
                        transform: 'rotateY(180deg)',
                        backfaceVisibility: 'hidden'
                    }}
                >
                    <span className="text-red-500 text-sm font-bold tracking-[0.3em] uppercase mb-4">Detalles</span>
                    <h3 className="text-3xl font-bold text-white mb-8">{item.title}</h3>

                    <p className="text-gray-300 text-lg leading-relaxed font-light">
                        {item.details}
                    </p>

                    <div className="mt-8">
                        <span className="text-xs text-zinc-500 uppercase tracking-widest border-t border-zinc-800 pt-4 px-4 block">Select Dance Studio</span>
                    </div>

                </motion.div>
            </motion.div>
        </div>
    );
};

const FeaturedClasses = () => {
    const shouldReduceMotion = useReducedMotion();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: shouldReduceMotion ? 0 : 0.1
            }
        }
    };

    return (
        <section className="py-32 bg-transparent px-6 transition-colors duration-500">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-24"
                >
                    <span className="text-red-500 tracking-[0.3em] text-xs font-bold uppercase">Trayectoria Formativa</span>
                    <h2 className="text-4xl md:text-5xl font-bold mt-4 text-inherit transition-colors duration-500">NEW GENERATION OF MOVEMENT</h2>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 content-center"
                >
                    {DISCIPLINES.map((item, index) => {
                        const isCompetition = item.title === 'COMPETITION';
                        return (
                            <FlipCard
                                key={index}
                                item={item}
                                index={index}
                                className={isCompetition ? "md:col-span-2 lg:col-span-3" : ""}
                                height={isCompetition ? "aspect-square md:aspect-[21/9] min-h-[300px]" : "aspect-[4/5] sm:aspect-[3/4] min-h-[400px]"}
                            />
                        );
                    })}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: shouldReduceMotion ? 0 : 0.5, duration: 1 }}
                    className="text-center mt-16"
                >
                    <Link to="/cursos" className="inline-flex items-center gap-2 text-inherit border-b border-red-500 pb-1 hover:text-red-500 transition-colors uppercase tracking-widest text-xs font-bold">
                        Ver todos los horarios <ArrowRightIcon className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </section >
    );
};


export default FeaturedClasses;

