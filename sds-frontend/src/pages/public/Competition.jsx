import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import CompetitionGallery from '../../components/home/CompetitionGallery';
import PageSEO from '../../components/SEO/PageSEO';
import SchemaBreadcrumb from '../../components/SEO/SchemaBreadcrumb';
import { motion } from 'framer-motion';
import TrialModal from '../../components/public/TrialModal';
import { clasePruebaAPI } from '../../services/api';

const HERO_WIDTHS = [768, 1280, 1920, 2560];
const heroSrcSet = (format) => HERO_WIDTHS
    .map((width) => `/optimized/competition/hero-${width}.${format} ${width}w`)
    .join(', ');

const Competition = () => {
    const [trialModalOpen, setTrialModalOpen] = useState(false);

    const { data: courses = [] } = useQuery({
        queryKey: ['trial-slots-competition'],
        queryFn: async () => {
            const response = await clasePruebaAPI.getDisponibles();
            const slots = response.data.data || [];
            const uniqueNames = [...new Set(slots.map(s => s.titulo || s.curso_nombre))].filter(Boolean);
            return uniqueNames.map(name => ({ id: name, nombre: name, activo: 1 }));
        },
        staleTime: 5 * 60 * 1000,
    });

    return (
        <div className="bg-black text-white min-h-screen">
            <PageSEO
                title="Equipo de Competición de Danza — Palermo Buenos Aires"
                description="El equipo de competición de Select Dance Studio participa en torneos y festivales de danza a nivel nacional. Conocé nuestro Salón de la Fama."
                canonical="/competition"
                ogImage="/optimized/competition/hero-1280.webp"
                ogImageWidth={1280}
                ogImageHeight={853}
                ogImageAlt="Equipo de competición de Select Dance Studio"
            />
            <SchemaBreadcrumb items={[
                { name: 'Inicio', url: '/' },
                { name: 'Equipo de Competición', url: '/competition' },
            ]} />

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
                    <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-black tracking-tighter uppercase text-white cursor-default select-none mb-2" style={{ textShadow: '0 0 40px rgba(220, 38, 38, 0.8), 0 0 80px rgba(220, 38, 38, 0.4)' }}>
                        BUILT DIFFERENT
                    </h1>
                    <p className="text-xl md:text-3xl font-light text-zinc-300 max-w-3xl mx-auto tracking-wide">
                        Pasión, disciplina y excelencia en cada escenario.
                    </p>

                    <div className="flex items-center justify-center mt-8 gap-4 opacity-50">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-white" />
                        <div className="w-2 h-2 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,1)]" />
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-white" />
                    </div>
                </motion.div>
            </div>

            <div className="bg-black relative z-30">
                <CompetitionGallery onJoinClick={() => setTrialModalOpen(true)} />
            </div>

            <TrialModal
                isOpen={trialModalOpen}
                onClose={() => setTrialModalOpen(false)}
                courses={courses}
                selectedCourse="Competición"
            />
        </div>
    );
};

export default Competition;
