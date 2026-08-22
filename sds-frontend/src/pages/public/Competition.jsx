import CompetitionGallery from '../../components/home/CompetitionGallery';
import PageSEO from '../../components/SEO/PageSEO';
import { motion } from 'framer-motion';
import { buildWhatsAppUrl, trackWhatsAppClick } from '../../utils/whatsapp.js';

const HERO_WIDTHS = [768, 1280, 1920, 2560];
const heroSrcSet = (format) => HERO_WIDTHS
    .map((width) => `/optimized/competition/hero-${width}.${format} ${width}w`)
    .join(', ');

const Competition = () => {
    const handleCompetitionContact = () => {
        trackWhatsAppClick({ source: '/competencia-danza-palermo', service: 'equipo_competencia' });
        window.open(
            buildWhatsAppUrl('Hola, vi el equipo de competencia de Select Dance Studio. Quisiera consultar por requisitos, edades, evaluaciones, horarios y vacantes.'),
            '_blank',
            'noopener,noreferrer'
        );
    };

    return (
        <div className="bg-black text-white min-h-screen">
            <PageSEO
                title="Danza competitiva en Palermo, CABA"
                description="Equipo de competición de danza de Select Dance Studio en Palermo, CABA. Formación técnica, preparación escénica y participación en torneos."
                canonical="/competencia-danza-palermo"
                ogImage="/optimized/competition/hero-1280.webp"
                ogImageWidth={1280}
                ogImageHeight={853}
                ogImageAlt="Equipo de competición de Select Dance Studio"
            />

            {/* Hero — parallax solo CSS, sin JS scroll listeners */}
            <div className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">

                {/* Imagen de fondo — parallax CSS puro */}
                <picture className="absolute inset-x-0 h-[120%] -top-[10%] z-0">
                    <source
                        type="image/avif"
                        srcSet={heroSrcSet('avif')}
                        sizes="100vw"
                    />
                    <source
                        type="image/webp"
                        srcSet={heroSrcSet('webp')}
                        sizes="100vw"
                    />
                    <img
                        src="/optimized/competition/hero-1920.webp"
                        alt=""
                        aria-hidden="true"
                        width="1920"
                        height="1280"
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-cover object-center opacity-40"
                    />
                </picture>

                {/* Gradientes */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black z-10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-tr from-red-900/20 via-transparent to-transparent z-10 pointer-events-none" />

                {/* Contenido hero */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                    className="relative z-20 text-center px-4 w-full"
                >
                    <p aria-hidden="true" className="text-7xl md:text-9xl lg:text-[10rem] font-black tracking-tighter uppercase text-white cursor-default select-none mb-2" style={{ textShadow: '0 0 40px rgba(220, 38, 38, 0.8), 0 0 80px rgba(220, 38, 38, 0.4)' }}>
                        BUILT DIFFERENT
                    </p>
                    <h1 className="mx-auto max-w-4xl text-xl font-bold uppercase tracking-[0.12em] text-zinc-200 md:text-3xl">
                        Equipo de competición de danza en Palermo, CABA
                    </h1>
                    <p className="mx-auto mt-3 max-w-3xl text-base font-light tracking-wide text-zinc-400 md:text-xl">
                        Formación técnica, preparación escénica y excelencia en cada escenario.
                    </p>

                    <div className="flex items-center justify-center mt-8 gap-4 opacity-50">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-white" />
                        <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,1)]" />
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-white" />
                    </div>
                </motion.div>
            </div>

            <div className="bg-black relative z-30">
                <CompetitionGallery onJoinClick={handleCompetitionContact} />
            </div>
        </div>
    );
};

export default Competition;
