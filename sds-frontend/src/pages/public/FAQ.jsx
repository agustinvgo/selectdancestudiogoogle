import { ChevronDown } from 'lucide-react';
import PageSEO from '../../components/SEO/PageSEO.jsx';
import SchemaBreadcrumb from '../../components/SEO/SchemaBreadcrumb.jsx';
import SchemaFAQ from '../../components/SEO/SchemaFAQ.jsx';
import { FAQ_ITEMS } from '../../data/faqData.js';

const FAQ = () => (
    <div className="min-h-screen bg-black px-5 pb-24 pt-32 text-white">
        <PageSEO
            title="Preguntas frecuentes sobre clases de danza en Palermo"
            description="Respuestas sobre edades, estilos, clases de prueba, competencia, aranceles y alquiler de salas en Select Dance Studio Palermo."
            canonical="/faq"
        />
        <SchemaFAQ />
        <SchemaBreadcrumb items={[
            { name: 'Inicio', url: '/' },
            { name: 'Preguntas frecuentes', url: '/faq' },
        ]} />

        <section className="mx-auto max-w-4xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-red-500">Información útil</p>
            <h1 className="max-w-3xl text-4xl font-black uppercase tracking-tight sm:text-6xl">
                Preguntas frecuentes
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
                Todo lo que necesitás saber antes de comenzar tus clases en Select Dance Studio.
            </p>

            <div className="mt-14 divide-y divide-white/10 border-y border-white/10">
                {FAQ_ITEMS.map(({ question, answer }) => (
                    <details key={question} className="group py-2">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-semibold">
                            <span>{question}</span>
                            <ChevronDown className="h-5 w-5 shrink-0 text-red-500 transition-transform group-open:rotate-180" aria-hidden="true" />
                        </summary>
                        <p className="max-w-3xl pb-7 pr-10 leading-7 text-zinc-400">{answer}</p>
                    </details>
                ))}
            </div>
        </section>
    </div>
);

export default FAQ;

