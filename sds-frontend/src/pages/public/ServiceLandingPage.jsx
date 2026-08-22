import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
    ArrowRightIcon,
    CheckCircleIcon,
    MapPinIcon,
    SparklesIcon,
    UserGroupIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';
import PageSEO from '../../components/SEO/PageSEO.jsx';
import WhatsAppCTA from '../../components/public/WhatsAppCTA.jsx';
import { SERVICE_LANDING_PAGES, SERVICE_PAGE_LIST } from '../../data/serviceLandingPages.js';

const responsiveImage = (image, width, format = 'webp') => (
    image.replace(/-1280\.webp$/, `-${width}.${format}`)
);

const QUICK_FACTS = [
    { label: 'Modalidad', value: 'Clases presenciales', icon: UserGroupIcon },
    { label: 'Ubicación', value: 'Honduras 5550 · Palermo', icon: MapPinIcon },
    { label: 'Orientación', value: 'Por edad, nivel y objetivo', icon: SparklesIcon },
];

const DEFAULT_STEPS = [
    ['Contanos sobre la alumna', 'Edad, experiencia previa, disciplina de interés y disponibilidad horaria.'],
    ['Recibí una recomendación', 'El equipo identifica el grupo y nivel más adecuado para comenzar o continuar.'],
    ['Confirmá la vacante', 'Te informamos horarios vigentes, disponibilidad y aranceles directamente por WhatsApp.'],
];

/* ── Animated section wrapper ── */
const Section = ({ children, className = '', delay = 0 }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-80px' });
    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 32 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

/* ── FAQ Accordion Item ── */
const FaqItem = ({ question, answer }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border-b border-white/10 last:border-b-0">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full cursor-pointer items-center justify-between gap-5 py-6 text-left text-lg font-bold"
                aria-expanded={open}
            >
                <span>{question}</span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/15 text-red-400"
                >
                    <ChevronDownIcon className="h-4 w-4" />
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="max-w-2xl pb-6 pr-12 leading-relaxed text-zinc-400">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ── Highlight Card ── */
const HighlightCard = ({ title, text, index }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.article
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: index * 0.12 }}
            className="group relative min-h-80 overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/45 p-8 shadow-2xl transition-all duration-500 hover:-translate-y-1.5 hover:border-red-500/50 hover:shadow-[0_20px_60px_rgba(127,29,29,0.15)]"
        >
            {/* Top gradient accent on hover */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/0 to-transparent transition-all duration-500 group-hover:via-red-500/70" />

            {/* Big background number */}
            <span className="absolute right-5 top-3 select-none text-8xl font-black tracking-tighter text-white/[0.03] transition-all duration-500 group-hover:text-red-500/[0.06]">
                0{index + 1}
            </span>

            {/* Red accent line */}
            <div className="h-0.5 w-10 bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500 group-hover:w-16" />

            {/* Icon */}
            <div className="mt-10 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition-all duration-300 group-hover:border-red-500/40 group-hover:bg-red-500/20">
                <CheckCircleIcon className="h-5 w-5" />
            </div>

            <h3 className="relative mt-6 text-xl font-bold uppercase tracking-tight">{title}</h3>
            <p className="relative mt-4 leading-7 text-zinc-400">{text}</p>

            {/* Bottom glow on hover */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-red-950/0 to-transparent opacity-0 transition-opacity duration-500 group-hover:from-red-950/20 group-hover:opacity-100" />
        </motion.article>
    );
};

/* ── Timeline Step ── */
const TimelineStep = ({ title, text, index }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '-60px' });
    return (
        <motion.li
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: index * 0.15 }}
            className="relative flex flex-col gap-4 px-6 py-8 sm:px-10 md:px-8 lg:px-10"
        >
            {/* Step number bubble */}
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-red-500/40 bg-red-950/30 text-sm font-black text-red-400 shadow-[0_0_20px_rgba(220,38,38,0.15)]">
                <span>0{index + 1}</span>
                <span className="absolute inset-0 animate-ping rounded-full border border-red-500/20 [animation-duration:2.5s]" />
            </div>

            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-sm leading-7 text-zinc-400">{text}</p>
        </motion.li>
    );
};

/* ── Related Page Card ── */
const RelatedCard = ({ item }) => (
    <Link
        to={item.canonical}
        className="group relative min-h-64 overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
    >
        <img
            src={item.image}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-40 transition-all duration-700 group-hover:scale-110 group-hover:opacity-65"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <span className="absolute inset-0 bg-gradient-to-t from-red-950/30 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {/* Category tag */}
        <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-300 backdrop-blur-sm">
            Select Studio
        </span>

        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
            <span className="text-base font-bold leading-tight">{item.heading}</span>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-all duration-300 group-hover:border-red-500/50 group-hover:bg-red-500/20 group-hover:translate-x-0.5">
                <ArrowRightIcon className="h-4 w-4" />
            </span>
        </span>
    </Link>
);

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const ServiceLandingPage = ({ serviceKey }) => {
    const page = SERVICE_LANDING_PAGES[serviceKey];
    const relatedPages = SERVICE_PAGE_LIST.filter((item) => item.canonical !== page.canonical);
    const steps = page.steps || DEFAULT_STEPS;

    return (
        <div className="min-h-screen overflow-hidden bg-[#080808] text-white">
            <PageSEO
                title={page.title}
                description={page.description}
                canonical={page.canonical}
                ogImage={page.image}
                ogImageAlt={page.imageAlt}
                ogImageWidth={page.imageWidth}
                ogImageHeight={page.imageHeight}
            />
            {/* ── HERO ── */}
            <header className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
                <picture className="absolute inset-0">
                    <source
                        type="image/avif"
                        srcSet={`${responsiveImage(page.image, 480, 'avif')} 480w, ${responsiveImage(page.image, 768, 'avif')} 768w, ${responsiveImage(page.image, 1280, 'avif')} ${page.imageWidth}w`}
                        sizes="100vw"
                    />
                    <img
                        src={page.image}
                        srcSet={`${responsiveImage(page.image, 480)} 480w, ${responsiveImage(page.image, 768)} 768w, ${page.image} ${page.imageWidth}w`}
                        sizes="100vw"
                        alt={page.imageAlt}
                        fetchPriority="high"
                        className="h-full w-full object-cover object-center opacity-50"
                    />
                </picture>

                {/* Gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black" />
                <div className="absolute inset-0 bg-gradient-to-tr from-red-900/25 via-transparent to-transparent" />

                {/* Diagonal decorative lines */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-20">
                    <div className="absolute -left-20 top-1/3 h-px w-96 rotate-[30deg] bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />
                    <div className="absolute right-10 top-1/4 h-px w-72 -rotate-[20deg] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    <div className="absolute bottom-1/4 left-1/4 h-px w-80 rotate-[15deg] bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
                </div>

                <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-24 text-center">
                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-xs font-light uppercase tracking-[0.45em] text-zinc-300 sm:text-sm"
                    >
                        {page.eyebrow} · Palermo
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: 32 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
                        className="mx-auto mt-5 max-w-6xl text-5xl font-black uppercase leading-none tracking-tighter text-white sm:text-7xl lg:text-8xl"
                    >
                        {page.heading}
                    </motion.h1>

                    {/* Animated red separator */}
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: '5rem', opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.5, ease: 'easeOut' }}
                        className="mx-auto mt-7 h-1 bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_12px_rgba(220,38,38,0.5)]"
                    />

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.4 }}
                        className="mx-auto mt-7 max-w-3xl text-base font-light leading-relaxed text-zinc-200 sm:text-xl"
                    >
                        {page.intro}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.55 }}
                        className="mt-9 flex flex-row items-center justify-center gap-3 sm:gap-5"
                    >
                        <WhatsAppCTA
                            message={page.whatsappMessage}
                            source={page.canonical}
                            service={page.service}
                            className="inline-flex min-h-12 w-1/2 max-w-60 items-center justify-center gap-2 bg-white px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-black shadow-lg shadow-white/10 transition-all hover:-translate-y-0.5 hover:bg-zinc-100 sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
                        >
                            Consultar WhatsApp <ArrowRightIcon className="h-4 w-4" />
                        </WhatsAppCTA>
                        <Link
                            to="/cursos"
                            className="inline-flex min-h-12 w-1/2 max-w-60 items-center justify-center border border-white/30 bg-white/5 px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/10 sm:w-auto sm:max-w-none sm:px-8 sm:text-xs"
                        >
                            Ver clases
                        </Link>
                    </motion.div>

                    {/* Scroll cue */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.8 }}
                        className="mx-auto mt-16 flex flex-col items-center gap-2"
                    >
                        <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Explorar</span>
                        <motion.div
                            animate={{ y: [0, 6, 0] }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                            className="h-6 w-px bg-gradient-to-b from-zinc-500 to-transparent"
                        />
                    </motion.div>
                </div>
            </header>

            <main>
                {/* ── QUICK FACTS ── */}
                <section
                    className="border-y border-white/10 bg-zinc-950/60 px-6 backdrop-blur-sm lg:px-8"
                    aria-label="Información esencial"
                >
                    <div className="mx-auto grid max-w-7xl divide-y divide-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
                        {QUICK_FACTS.map(({ label, value, icon: Icon }, i) => (
                            <Section key={label} delay={i * 0.1} className="flex items-center gap-4 py-7 md:px-8 md:first:pl-0 md:last:pr-0">
                                <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-red-600/10 text-red-400 ring-1 ring-red-500/20">
                                    <Icon className="h-5 w-5" />
                                    <span className="absolute inset-0 animate-ping rounded-full bg-red-500/5 [animation-duration:3s]" />
                                </span>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">{label}</p>
                                    <p className="mt-1 font-semibold text-zinc-100">{value}</p>
                                </div>
                            </Section>
                        ))}
                    </div>
                </section>

                <section className="px-6 py-24 lg:px-8 lg:py-32">
                    <div className="mx-auto max-w-7xl">

                        {/* ── HIGHLIGHTS HEADER ── */}
                        <Section className="mb-20 text-center">
                            <p className="text-xs font-bold uppercase tracking-[0.35em] text-red-500">La propuesta</p>
                            <h2 className="mt-4 text-4xl font-black uppercase tracking-tighter sm:text-5xl">
                                {page.proposalHeading}
                            </h2>
                            <p className="mx-auto mt-5 max-w-2xl font-light leading-relaxed text-zinc-400">
                                Cada programa combina objetivos técnicos, acompañamiento docente y una progresión adecuada para sostener el aprendizaje.
                            </p>
                        </Section>

                        {/* ── HIGHLIGHTS CARDS ── */}
                        <div className="grid gap-4 md:grid-cols-3">
                            {page.highlights.map(([title, text], index) => (
                                <HighlightCard key={title} title={title} text={text} index={index} />
                            ))}
                        </div>

                        {/* ── ENFOQUE SECTIONS ── */}
                        <div className="mt-28 grid gap-5 lg:grid-cols-2">
                            {page.sections.map(([title, text], index) => (
                                <Section key={title} delay={index * 0.1}>
                                    <article
                                        className={`relative h-full overflow-hidden rounded-2xl border p-8 sm:p-10 ${
                                            index === 0
                                                ? 'border-red-500/25 bg-red-950/10'
                                                : 'border-zinc-800/70 bg-zinc-900/35'
                                        }`}
                                    >
                                        {/* Decorative number */}
                                        <span className="absolute right-6 top-4 select-none text-9xl font-black leading-none tracking-tighter text-white/[0.025]">
                                            {String(index + 1).padStart(2, '0')}
                                        </span>

                                        {index === 0 && (
                                            <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-red-500 via-red-600 to-red-500/0" />
                                        )}

                                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-400">
                                            Enfoque {String(index + 1).padStart(2, '0')}
                                        </p>
                                        <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
                                        <p className="mt-5 text-base leading-8 text-zinc-400">{text}</p>
                                    </article>
                                </Section>
                            ))}
                        </div>

                        {/* ── TIMELINE: CÓMO EMPEZAR ── */}
                        <Section className="mt-28">
                            <div className="overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/40">
                                <div className="border-b border-white/10 px-7 py-7 sm:px-10">
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">Cómo empezar</p>
                                    <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Una orientación simple y personalizada</h2>
                                </div>
                                <ol className="grid md:grid-cols-3 md:divide-x md:divide-white/10">
                                    {steps.map(([title, text], index) => (
                                        <TimelineStep key={title} title={title} text={text} index={index} />
                                    ))}
                                </ol>
                            </div>
                        </Section>

                        {/* ── FAQ ── */}
                        <Section className="mt-28">
                            <div className="grid gap-10 lg:grid-cols-[.65fr_1.35fr] lg:gap-16" aria-labelledby={`${serviceKey}-faq-title`}>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">Antes de consultar</p>
                                    <h2 id={`${serviceKey}-faq-title`} className="mt-5 text-4xl font-bold tracking-tight">
                                        Preguntas frecuentes
                                    </h2>
                                    <p className="mt-5 leading-relaxed text-zinc-400">
                                        Respuestas rápidas para que puedas elegir con más claridad.
                                    </p>
                                    {/* Decorative lines */}
                                    <div className="mt-8 hidden lg:block">
                                        <div className="h-px w-16 bg-gradient-to-r from-red-500 to-transparent" />
                                        <div className="mt-4 h-px w-10 bg-gradient-to-r from-red-500/50 to-transparent" />
                                        <div className="mt-4 h-px w-6 bg-gradient-to-r from-red-500/25 to-transparent" />
                                    </div>
                                </div>
                                <div className="border-y border-white/10">
                                    {page.questions.map(([question, answer]) => (
                                        <FaqItem key={question} question={question} answer={answer} />
                                    ))}
                                </div>
                            </div>
                        </Section>

                        {/* ── CTA FINAL ── */}
                        <Section className="mt-28">
                            <div className="relative overflow-hidden rounded-[2.75rem] border-2 border-red-900/60 px-6 py-14 text-center shadow-[0_0_100px_rgba(127,29,29,.2)] sm:px-12 sm:py-20">
                                <img
                                    src={page.image}
                                    alt=""
                                    loading="lazy"
                                    aria-hidden="true"
                                    className="absolute inset-0 h-full w-full object-cover object-center opacity-20"
                                />
                                <div className="absolute inset-0 bg-black/85" />
                                <div className="absolute inset-0 bg-gradient-to-t from-red-950/40 via-black/20 to-black/70" />

                                {/* Corner glows */}
                                <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-red-600/10 blur-3xl" />
                                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-red-900/10 blur-3xl" />

                                <div className="relative mx-auto max-w-5xl">
                                    <motion.span
                                        animate={{ scale: [1, 1.05, 1] }}
                                        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                                        className="mx-auto grid h-20 w-20 place-items-center rounded-full border-2 border-red-800/60 bg-red-950/40 text-red-400 shadow-[0_0_50px_rgba(220,38,38,0.2)] sm:h-24 sm:w-24"
                                    >
                                        <SparklesIcon className="h-9 w-9 sm:h-11 sm:w-11" />
                                    </motion.span>

                                    <h2 className="mx-auto mt-10 text-4xl font-black uppercase leading-[0.95] tracking-tighter text-white sm:text-6xl lg:text-7xl">
                                        Hablemos de tu<br />
                                        <span className="bg-gradient-to-r from-red-400 via-red-500 to-red-400 bg-clip-text text-transparent">
                                            próximo paso
                                        </span>
                                    </h2>

                                    <div className="mx-auto my-9 flex max-w-xs items-center gap-4" aria-hidden="true">
                                        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-red-700" />
                                        <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
                                        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-red-700" />
                                    </div>

                                    <WhatsAppCTA
                                        message={page.whatsappMessage}
                                        source={`${page.canonical}_bottom`}
                                        service={page.service}
                                        className="inline-flex w-full max-w-2xl items-center justify-center gap-5 rounded-full bg-gradient-to-r from-red-600 to-red-500 px-6 py-5 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-xl shadow-red-950/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-900/40 sm:px-10 sm:py-6 sm:text-base"
                                    >
                                        Consultar por WhatsApp <ArrowRightIcon className="h-5 w-5" />
                                    </WhatsAppCTA>
                                </div>
                            </div>
                        </Section>

                        {/* ── TAMBIÉN PUEDE INTERESARTE ── */}
                        <Section className="mt-28">
                            <nav aria-label="Otros servicios">
                                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">Explorá el estudio</p>
                                        <h2 className="mt-3 text-3xl font-bold tracking-tight">También puede interesarte</h2>
                                    </div>
                                    <Link
                                        to="/cursos"
                                        className="group flex items-center gap-2 text-sm font-bold text-zinc-300 underline decoration-red-500 underline-offset-4 transition-colors hover:text-white"
                                    >
                                        Ver todos los cursos
                                        <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                    </Link>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {relatedPages.map((item) => (
                                        <RelatedCard key={item.canonical} item={item} />
                                    ))}
                                </div>
                            </nav>
                        </Section>

                    </div>
                </section>
            </main>

            {/* ── STICKY WHATSAPP (mobile) ── */}
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
