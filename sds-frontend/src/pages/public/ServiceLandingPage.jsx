import { Link } from 'react-router-dom';
import {
    ArrowRightIcon,
    CheckCircleIcon,
    MapPinIcon,
    SparklesIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import PageSEO from '../../components/SEO/PageSEO.jsx';
import SchemaBreadcrumb from '../../components/SEO/SchemaBreadcrumb.jsx';
import SchemaService from '../../components/SEO/SchemaService.jsx';
import WhatsAppCTA from '../../components/public/WhatsAppCTA.jsx';
import { SERVICE_LANDING_PAGES, SERVICE_PAGE_LIST } from '../../data/serviceLandingPages.js';

const responsiveImage = (image, width, format = 'webp') => (
    image.replace(/-1280\.webp$/, `-${width}.${format}`)
);

const QUICK_FACTS = [
    {
        label: 'Modalidad',
        value: 'Clases presenciales',
        icon: UserGroupIcon,
    },
    {
        label: 'Ubicación',
        value: 'Honduras 5550 · Palermo',
        icon: MapPinIcon,
    },
    {
        label: 'Orientación',
        value: 'Por edad, nivel y objetivo',
        icon: SparklesIcon,
    },
];

const STEPS = [
    ['Contanos sobre la alumna', 'Edad, experiencia previa, disciplina de interés y disponibilidad horaria.'],
    ['Recibí una recomendación', 'El equipo identifica el grupo y nivel más adecuado para comenzar o continuar.'],
    ['Confirmá la vacante', 'Te informamos horarios vigentes, disponibilidad y aranceles directamente por WhatsApp.'],
];

const ServiceLandingPage = ({ serviceKey }) => {
    const page = SERVICE_LANDING_PAGES[serviceKey];
    const relatedPages = SERVICE_PAGE_LIST.filter((item) => item.canonical !== page.canonical);

    return (
        <div className="min-h-screen overflow-hidden bg-[#080808] text-white">
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

            <header className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
                <picture className="absolute inset-0">
                    <source
                        type="image/avif"
                        srcSet={`${responsiveImage(page.image, 480, 'avif')} 480w, ${responsiveImage(page.image, 768, 'avif')} 768w, ${responsiveImage(page.image, 1280, 'avif')} 1280w`}
                        sizes="100vw"
                    />
                    <img
                        src={page.image}
                        srcSet={`${responsiveImage(page.image, 480)} 480w, ${responsiveImage(page.image, 768)} 768w, ${page.image} 1280w`}
                        sizes="100vw"
                        alt={page.imageAlt}
                        fetchPriority="high"
                        className="h-full w-full object-cover object-center opacity-55"
                    />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/30 to-black" />
                <div className="absolute inset-0 bg-gradient-to-tr from-red-900/20 via-transparent to-transparent" />

                <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-24 text-center">
                    <p className="text-xs font-light uppercase tracking-[0.45em] text-zinc-300 sm:text-sm">
                        {page.eyebrow} · Palermo
                    </p>
                    <h1 className="mx-auto mt-5 max-w-6xl text-5xl font-bold uppercase leading-none tracking-tighter text-white sm:text-7xl lg:text-8xl">
                        {page.heading}
                    </h1>
                    <div className="mx-auto mt-7 h-1 w-20 bg-red-600 sm:w-24" />
                    <p className="mx-auto mt-7 max-w-3xl text-base font-light leading-relaxed text-zinc-200 sm:text-xl">
                        {page.intro}
                    </p>
                    <div className="mt-9 flex flex-row items-center justify-center gap-3 sm:gap-5">
                        <WhatsAppCTA
                            message={page.whatsappMessage}
                            source={page.canonical}
                            service={page.service}
                            className="inline-flex min-h-12 w-1/2 max-w-60 items-center justify-center gap-2 bg-white px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-black transition hover:bg-zinc-200 sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
                        >
                            Consultar WhatsApp <ArrowRightIcon className="h-4 w-4" />
                        </WhatsAppCTA>
                        <Link
                            to="/cursos"
                            className="inline-flex min-h-12 w-1/2 max-w-60 items-center justify-center border border-white/35 bg-black/10 px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm transition hover:bg-white/10 sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
                        >
                            Ver clases
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                <section className="border-y border-white/10 bg-zinc-950/80 px-6 lg:px-8" aria-label="Información esencial">
                    <div className="mx-auto grid max-w-7xl divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
                        {QUICK_FACTS.map(({ label, value, icon: Icon }) => (
                            <div key={label} className="flex items-center gap-4 py-7 md:px-8 md:first:pl-0 md:last:pr-0">
                                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-600/10 text-red-400">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">{label}</p>
                                    <p className="mt-1 font-semibold text-zinc-100">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="px-6 py-24 lg:px-8 lg:py-32">
                    <div className="mx-auto max-w-7xl">
                        <div className="mb-20 text-center">
                            <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-500">La propuesta</p>
                            <h2 className="mt-4 text-4xl font-bold uppercase tracking-tighter sm:text-5xl">New generation of movement</h2>
                            <p className="mx-auto mt-5 max-w-2xl font-light leading-relaxed text-zinc-400">Cada programa combina objetivos técnicos, acompañamiento docente y una progresión adecuada para sostener el aprendizaje.</p>
                        </div>

                        <div className="grid gap-1 md:grid-cols-3">
                            {page.highlights.map(([title, text], index) => (
                                <article key={title} className="group relative min-h-80 overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/45 p-8 shadow-2xl transition duration-300 hover:border-red-500/40">
                                    <span className="absolute right-6 top-4 text-7xl font-bold tracking-tighter text-white/[0.035]">0{index + 1}</span>
                                    <div className="h-1 w-12 bg-red-500" />
                                    <CheckCircleIcon className="relative mt-10 h-7 w-7 text-red-500" />
                                    <h3 className="relative mt-6 text-2xl font-bold uppercase tracking-tight">{title}</h3>
                                    <p className="relative mt-4 leading-7 text-zinc-400">{text}</p>
                                </article>
                            ))}
                        </div>

                        <div className="mt-28 grid gap-6 lg:grid-cols-2">
                            {page.sections.map(([title, text], index) => (
                                <article
                                    key={title}
                                    className={`rounded-2xl border p-8 sm:p-10 ${index === 0 ? 'border-red-500/25 bg-red-950/15' : 'border-zinc-800/70 bg-zinc-900/35'}`}
                                >
                                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-400">Enfoque {String(index + 1).padStart(2, '0')}</p>
                                    <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
                                    <p className="mt-6 text-lg leading-8 text-zinc-400">{text}</p>
                                </article>
                            ))}
                        </div>

                        <div className="mt-28 overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/40">
                            <div className="border-b border-white/10 px-7 py-7 sm:px-10">
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">Cómo empezar</p>
                                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Una orientación simple y personalizada</h2>
                            </div>
                            <ol className="grid md:grid-cols-3">
                                {STEPS.map(([title, text], index) => (
                                    <li key={title} className="border-b border-white/10 p-7 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 sm:p-10">
                                        <span className="text-sm font-bold text-red-500">0{index + 1}</span>
                                        <h3 className="mt-6 text-xl font-bold">{title}</h3>
                                        <p className="mt-3 text-sm leading-7 text-zinc-400">{text}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <section className="mt-28 grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:gap-16" aria-labelledby={`${serviceKey}-faq-title`}>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">Antes de consultar</p>
                                <h2 id={`${serviceKey}-faq-title`} className="mt-5 text-4xl font-bold tracking-tight">Preguntas frecuentes</h2>
                                <p className="mt-5 leading-relaxed text-zinc-400">Respuestas rápidas para que puedas elegir con más claridad.</p>
                            </div>
                            <div className="divide-y divide-white/10 border-y border-white/10">
                                {page.questions.map(([question, answer]) => (
                                    <details key={question} className="group py-6">
                                        <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-lg font-bold marker:content-none">
                                            {question}
                                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-xl font-light transition group-open:rotate-45">+</span>
                                        </summary>
                                        <p className="max-w-2xl pr-12 pt-4 leading-relaxed text-zinc-400">{answer}</p>
                                    </details>
                                ))}
                            </div>
                        </section>

                        <section className="relative mt-28 overflow-hidden rounded-[2.75rem] border-2 border-red-900/70 px-6 py-14 text-center shadow-[0_0_80px_rgba(127,29,29,.16)] sm:px-12 sm:py-20" aria-label="Consultar por WhatsApp">
                            <img
                                src={page.image}
                                alt=""
                                loading="lazy"
                                aria-hidden="true"
                                className="absolute inset-0 h-full w-full object-cover object-center opacity-25"
                            />
                            <div className="absolute inset-0 bg-black/80" />
                            <div className="absolute inset-0 bg-gradient-to-t from-red-950/35 via-black/20 to-black/60" />

                            <div className="relative mx-auto max-w-5xl">
                                <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-red-800/70 bg-red-950/40 text-red-500 shadow-[0_0_40px_rgba(220,38,38,.16)] sm:h-24 sm:w-24">
                                    <SparklesIcon className="h-9 w-9 sm:h-11 sm:w-11" />
                                </span>

                                <h2 className="mx-auto mt-10 text-4xl font-bold uppercase leading-[0.95] tracking-tighter text-white sm:text-6xl lg:text-7xl">
                                    Hablemos de tu<br />
                                    <span className="text-red-500">próximo paso</span>
                                </h2>

                                <div className="mx-auto my-9 flex max-w-xs items-center gap-4" aria-hidden="true">
                                    <span className="h-px flex-1 bg-gradient-to-r from-transparent to-red-700" />
                                    <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
                                    <span className="h-px flex-1 bg-gradient-to-l from-transparent to-red-700" />
                                </div>

                                <WhatsAppCTA
                                    message={page.whatsappMessage}
                                    source={`${page.canonical}_bottom`}
                                    service={page.service}
                                    className="inline-flex w-full max-w-2xl items-center justify-center gap-5 rounded-full bg-red-600 px-6 py-5 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-xl shadow-red-950/40 transition hover:-translate-y-0.5 hover:bg-red-500 sm:px-10 sm:py-6 sm:text-base"
                                >
                                    Consultar por WhatsApp <ArrowRightIcon className="h-5 w-5" />
                                </WhatsAppCTA>
                            </div>
                        </section>

                        <nav className="mt-28" aria-label="Otros servicios">
                            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">Explorá el estudio</p>
                                    <h2 className="mt-3 text-3xl font-bold tracking-tight">También puede interesarte</h2>
                                </div>
                                <Link to="/cursos" className="text-sm font-bold text-zinc-300 underline decoration-red-500 underline-offset-4">Ver todos los cursos</Link>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {relatedPages.map((item) => (
                                    <Link key={item.canonical} to={item.canonical} className="group relative min-h-72 overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                                        <img src={item.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-500 group-hover:scale-105 group-hover:opacity-60" />
                                        <span className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                                        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                                            <span className="text-lg font-bold leading-tight">{item.heading}</span>
                                            <ArrowRightIcon className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </nav>
                    </div>
                </section>
            </main>

            <WhatsAppCTA
                message={page.whatsappMessage}
                source={`${page.canonical}_mobile_sticky`}
                service={page.service}
                className="fixed inset-x-4 bottom-4 z-50 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-sm font-bold uppercase tracking-wider text-black shadow-2xl md:hidden"
            >
                Consultar por WhatsApp <ArrowRightIcon className="h-4 w-4" />
            </WhatsAppCTA>
        </div>
    );
};

export default ServiceLandingPage;
