import { Link } from 'react-router-dom';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import PageSEO from '../../components/SEO/PageSEO.jsx';
import SchemaBreadcrumb from '../../components/SEO/SchemaBreadcrumb.jsx';
import SchemaService from '../../components/SEO/SchemaService.jsx';
import WhatsAppCTA from '../../components/public/WhatsAppCTA.jsx';
import { SERVICE_LANDING_PAGES, SERVICE_PAGE_LIST } from '../../data/serviceLandingPages.js';

const ServiceLandingPage = ({ serviceKey }) => {
    const page = SERVICE_LANDING_PAGES[serviceKey];

    return (
        <div className="min-h-screen bg-black text-white">
            <PageSEO
                title={page.title}
                description={page.description}
                canonical={page.canonical}
                ogImage={page.image}
                ogImageAlt={page.imageAlt}
            />
            <SchemaBreadcrumb items={[
                { name: 'Inicio', url: '/' },
                { name: page.heading, url: page.canonical },
            ]} />
            <SchemaService
                name={page.heading}
                description={page.description}
                canonical={page.canonical}
                audience={page.audience}
            />

            <section className="relative flex min-h-[82vh] items-end overflow-hidden px-6 pb-20 pt-32 lg:px-8">
                <img
                    src={page.image}
                    alt={page.imageAlt}
                    fetchPriority="high"
                    className="absolute inset-0 h-full w-full object-cover opacity-45"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/30" />
                <div className="relative mx-auto w-full max-w-7xl">
                    <p className="mb-5 text-xs font-bold uppercase tracking-[0.35em] text-red-400">{page.eyebrow}</p>
                    <h1 className="max-w-5xl text-5xl font-black tracking-tighter sm:text-6xl lg:text-8xl">{page.heading}</h1>
                    <p className="mt-7 max-w-3xl text-lg leading-relaxed text-zinc-200 sm:text-xl">{page.intro}</p>
                    <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                        <WhatsAppCTA
                            message={page.whatsappMessage}
                            source={page.canonical}
                            service={page.service}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-7 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-green-500"
                        >
                            Consultar por WhatsApp <ArrowRightIcon className="h-4 w-4" />
                        </WhatsAppCTA>
                        <Link to="/cursos" className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-4 text-sm font-bold uppercase tracking-wider hover:bg-white/10">
                            Ver horarios
                        </Link>
                    </div>
                </div>
            </section>

            <section className="px-6 py-24 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-5 md:grid-cols-3">
                        {page.highlights.map(([title, text]) => (
                            <article key={title} className="rounded-2xl border border-white/10 bg-zinc-950 p-7">
                                <CheckCircleIcon className="h-7 w-7 text-red-500" />
                                <h2 className="mt-5 text-xl font-bold">{title}</h2>
                                <p className="mt-3 leading-relaxed text-zinc-400">{text}</p>
                            </article>
                        ))}
                    </div>

                    <div className="mt-24 grid gap-12 lg:grid-cols-2">
                        {page.sections.map(([title, text]) => (
                            <article key={title}>
                                <h2 className="text-3xl font-black tracking-tight">{title}</h2>
                                <p className="mt-5 text-lg leading-relaxed text-zinc-400">{text}</p>
                            </article>
                        ))}
                    </div>

                    <div className="mt-24 rounded-3xl border border-white/10 bg-zinc-950 p-7 sm:p-10">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">Preguntas frecuentes</p>
                        <div className="mt-7 divide-y divide-white/10">
                            {page.questions.map(([question, answer]) => (
                                <article key={question} className="py-6 first:pt-0 last:pb-0">
                                    <h2 className="text-lg font-bold">{question}</h2>
                                    <p className="mt-2 leading-relaxed text-zinc-400">{answer}</p>
                                </article>
                            ))}
                        </div>
                    </div>

                    <div className="mt-24 text-center">
                        <h2 className="text-3xl font-black sm:text-4xl">Contanos qué estás buscando</h2>
                        <p className="mx-auto mt-4 max-w-2xl text-zinc-400">Te orientamos según edad, experiencia, objetivos y disponibilidad actual.</p>
                        <WhatsAppCTA
                            message={page.whatsappMessage}
                            source={`${page.canonical}_bottom`}
                            service={page.service}
                            className="mt-7 inline-flex items-center gap-2 rounded-full bg-green-600 px-8 py-4 font-bold text-white hover:bg-green-500"
                        >
                            Hablar por WhatsApp <ArrowRightIcon className="h-4 w-4" />
                        </WhatsAppCTA>
                    </div>

                    <nav className="mt-24 border-t border-white/10 pt-10" aria-label="Otros servicios">
                        <p className="mb-5 text-xs font-bold uppercase tracking-[0.25em] text-zinc-500">También puede interesarte</p>
                        <div className="flex flex-wrap gap-3">
                            {SERVICE_PAGE_LIST.filter((item) => item.canonical !== page.canonical).map((item) => (
                                <Link key={item.canonical} to={item.canonical} className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-300 hover:border-red-500 hover:text-white">
                                    {item.heading}
                                </Link>
                            ))}
                        </div>
                    </nav>
                </div>
            </section>
        </div>
    );
};

export default ServiceLandingPage;
