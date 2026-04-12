import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import CompetitionGallery from '../../components/home/CompetitionGallery';
import PageSEO from '../../components/SEO/PageSEO';
import SchemaBreadcrumb from '../../components/SEO/SchemaBreadcrumb';
import { motion } from 'framer-motion';
import TrialModal from '../../components/public/TrialModal';
import { clasePruebaAPI } from '../../services/api';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

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
                ogImage="/competicion-danza-select-dance-studio-palermo.webp"
            />
            <SchemaBreadcrumb items={[
                { name: 'Inicio', url: '/' },
                { name: 'Equipo de Competición', url: '/competition' },
            ]} />

            {/* Hero — parallax solo CSS, sin JS scroll listeners */}
            <div className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">

                {/* Imagen de fondo — parallax CSS puro */}
                <div
                    className="absolute inset-0 w-full h-[120%] -top-[10%] bg-[url('/competicion-danza-select-dance-studio-palermo.webp')] bg-cover bg-center opacity-40 z-0"
                    style={{ willChange: 'transform', transform: 'translateZ(0)' }}
                />

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
                    <style>{`
                        .text-outline {
                            color: transparent;
                            -webkit-text-stroke: 1px rgba(255,255,255,0.2);
                            transition: all 0.5s ease;
                        }
                        .text-outline:hover {
                            color: white;
                            -webkit-text-stroke: 1px white;
                            text-shadow: 0 0 40px rgba(220, 38, 38, 0.8);
                        }
                    `}</style>

                    <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-black tracking-tighter uppercase text-outline cursor-default select-none mb-2">
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

                {/* Indicador de scroll */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="absolute bottom-12 z-20 flex flex-col items-center cursor-pointer"
                    onClick={() => window.scrollTo({ top: window.innerHeight - 50, behavior: 'smooth' })}
                >
                    <span className="text-xs uppercase tracking-[0.2em] text-white/50 mb-2">Descubrir</span>
                    <ChevronDownIcon className="w-6 h-6 text-red-500" />
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
