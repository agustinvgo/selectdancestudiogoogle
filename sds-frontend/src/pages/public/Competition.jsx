import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import CompetitionGallery from '../../components/home/CompetitionGallery';
import PageSEO from '../../components/SEO/PageSEO';
import SchemaBreadcrumb from '../../components/SEO/SchemaBreadcrumb';
import { motion } from 'framer-motion';
import TrialModal from '../../components/public/TrialModal';
import { clasePruebaAPI } from '../../services/api';

const Competition = () => {
    const [trialModalOpen, setTrialModalOpen] = useState(false);

    const { data: courses = [] } = useQuery({
        queryKey: ['trial-slots-competition'],
        queryFn: async () => {
            const response = await clasePruebaAPI.getDisponibles();
            const slots = response.data.data || [];

            // Extract unique names for the dropdown
            const uniqueNames = [...new Set(slots.map(s => s.titulo || s.curso_nombre))].filter(Boolean);
            return uniqueNames.map(name => ({ id: name, nombre: name, activo: 1 }));
        },
        staleTime: 5 * 60 * 1000,
    });

    return (
        <div className="bg-black text-white min-h-screen pt-20">
            <PageSEO
                title="Equipo de Competición de Danza — Palermo Buenos Aires"
                description="El equipo de competición de Select Dance Studio participa en torneos y festivales de danza a nivel nacional. Conocé nuestro Hall of Fame y cómo sumarte."
                canonical="/competition"
                ogImage="/competicion-danza-select-dance-studio-palermo.webp"
            />
            <SchemaBreadcrumb items={[
                { name: 'Inicio', url: '/' },
                { name: 'Equipo de Competición', url: '/competition' },
            ]} />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Hero / Intro for the Page */}
                <div className="relative h-[40vh] overflow-hidden flex items-center justify-center bg-gray-900">
                    <div className="absolute inset-0 bg-[url('/competicion-danza-select-dance-studio-palermo.webp')] bg-cover bg-center opacity-40"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>

                    <div className="relative z-10 text-center px-4">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-4">
                            OUR TEAM
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200 font-light max-w-2xl mx-auto">
                            Pasión, disciplina y excelencia en cada escenario.
                        </p>
                    </div>
                </div>

                <CompetitionGallery onJoinClick={() => setTrialModalOpen(true)} />

                <TrialModal
                    isOpen={trialModalOpen}
                    onClose={() => setTrialModalOpen(false)}
                    courses={courses}
                    selectedCourse="Competición"
                />

            </motion.div>
        </div>
    );
};

export default Competition;
