import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarCheck, MapPin, Sparkles } from 'lucide-react';
import PageSEO from '../../components/SEO/PageSEO.jsx';
import SchemaBreadcrumb from '../../components/SEO/SchemaBreadcrumb.jsx';
import TrialModal from '../../components/public/TrialModal.jsx';
import { clasePruebaAPI } from '../../services/api.js';

const ClasePrueba = () => {
    const [trialModalOpen, setTrialModalOpen] = useState(false);

    const { data: courses = [] } = useQuery({
        queryKey: ['trial-slots-public-page'],
        queryFn: async () => {
            const response = await clasePruebaAPI.getDisponibles();
            const slots = response.data.data || [];
            const names = [...new Set(slots.map((slot) => slot.titulo || slot.curso_nombre))].filter(Boolean);
            return names.map((name) => ({ id: name, nombre: name, activo: 1 }));
        },
        staleTime: 5 * 60 * 1000,
    });

    return (
        <div className="min-h-screen bg-black text-white">
            <PageSEO
                title="Clase de prueba de danza en Palermo"
                description="Solicitá una clase de prueba en Select Dance Studio Palermo. Elegí entre los días y horarios disponibles y conocé nuestro método de enseñanza."
                canonical="/clase-de-prueba"
            />
            <SchemaBreadcrumb items={[
                { name: 'Inicio', url: '/' },
                { name: 'Clase de prueba', url: '/clase-de-prueba' },
            ]} />

            <section className="relative isolate overflow-hidden px-5 pb-24 pt-36 sm:pt-44">
                <img
                    src="/optimized/home/hero-1024.webp"
                    alt="Clase de danza en Select Dance Studio Palermo"
                    className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30"
                    width="1024"
                    height="682"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/80 to-black" />
                <div className="mx-auto max-w-6xl">
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-red-500">Tu primera experiencia</p>
                    <h1 className="max-w-4xl text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl lg:text-8xl">
                        Probá una clase de danza en Palermo
                    </h1>
                    <p className="mt-7 max-w-2xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
                        Conocé el estudio, a nuestras profesoras y la dinámica de la clase antes de inscribirte. La reserva está sujeta a los cupos publicados.
                    </p>
                    <button
                        type="button"
                        onClick={() => setTrialModalOpen(true)}
                        className="mt-10 bg-red-600 px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-red-500"
                    >
                        Ver horarios disponibles
                    </button>
                </div>
            </section>

            <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-28 md:grid-cols-3">
                {[
                    [CalendarCheck, 'Elegí tu horario', 'El formulario muestra únicamente las clases de prueba que tienen fechas publicadas.'],
                    [Sparkles, 'Conocé el método', 'Viví una clase real y encontrá el nivel que mejor se adapte a tus objetivos.'],
                    [MapPin, 'Estamos en Palermo', 'Honduras 5550, oficina 105, Ciudad Autónoma de Buenos Aires.'],
                ].map(([Icon, title, description]) => (
                    <article key={title} className="border border-white/10 bg-white/[0.03] p-7">
                        <Icon className="h-7 w-7 text-red-500" aria-hidden="true" />
                        <h2 className="mt-5 text-xl font-bold">{title}</h2>
                        <p className="mt-3 leading-7 text-zinc-400">{description}</p>
                    </article>
                ))}
            </section>

            <TrialModal
                isOpen={trialModalOpen}
                onClose={() => setTrialModalOpen(false)}
                courses={courses}
            />
        </div>
    );
};

export default ClasePrueba;

