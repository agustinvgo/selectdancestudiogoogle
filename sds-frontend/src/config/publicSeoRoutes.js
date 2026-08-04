import { SERVICE_PAGE_LIST } from '../data/serviceLandingPages.js';

const CORE_ROUTES = [
    {
        canonical: '/',
        title: 'Academia de danza en Palermo para niñas y adolescentes',
        description: 'Clases de danza, ballet, jazz, acrobacia y gimnasia acrobática para niñas y adolescentes en Palermo, Buenos Aires.',
        heading: 'Academia de danza y gimnasia en Palermo',
        summary: 'Formación técnica y artística por edades y niveles en Honduras 5550, Palermo. Consultá horarios, vacantes y aranceles por WhatsApp.',
        image: '/optimized/home/hero-1024.webp',
        service: 'academia_danza',
    },
    {
        canonical: '/cursos',
        title: 'Cursos de danza en Palermo — Horarios y niveles',
        description: 'Cursos de ballet, jazz, danza contemporánea, acrobacia y gimnasia en Palermo. Consultá niveles, horarios, vacantes y aranceles.',
        heading: 'Cursos y horarios de danza en Palermo',
        summary: 'Conocé la oferta de clases de Select Dance Studio y encontrá el grupo adecuado según edad, experiencia y objetivos.',
        image: '/optimized/home/junior-1280.webp',
        service: 'cursos_danza',
    },
    {
        canonical: '/competencia-danza-palermo',
        title: 'Equipo de competición de danza en Palermo',
        description: 'Equipo de competición de Select Dance Studio en Palermo. Formación técnica, preparación escénica y participación en torneos.',
        heading: 'Equipo de competición de danza en Palermo',
        summary: 'Un programa selectivo de formación, disciplina y preparación escénica para alumnas con compromiso y proyección artística.',
        image: '/optimized/competition/hero-1280.webp',
        service: 'equipo_competencia',
    },
    {
        canonical: '/nosotros',
        title: 'Select Dance Studio — Equipo y método de enseñanza',
        description: 'Conocé el equipo docente, la propuesta formativa y el método de Select Dance Studio, academia de danza en Palermo.',
        heading: 'Quiénes somos',
        summary: 'Acompañamos la formación técnica y artística de niñas y adolescentes con una enseñanza progresiva y atención a cada etapa.',
        image: '/optimized/home/hero-1024.webp',
        service: 'institucional',
    },
    {
        canonical: '/faq',
        title: 'Preguntas frecuentes — Clases de danza en Palermo',
        description: 'Respuestas sobre edades, niveles, horarios, inscripción, aranceles, competencia y alquiler de salas en Select Dance Studio.',
        heading: 'Preguntas frecuentes',
        summary: 'Información útil para elegir una clase, conocer los niveles y consultar vacantes, horarios y aranceles.',
        image: '/optimized/home/hero-1024.webp',
        service: 'preguntas_frecuentes',
    },
    {
        canonical: '/contacto',
        title: 'Contacto y ubicación — Academia de danza en Palermo',
        description: 'Contactá a Select Dance Studio en Honduras 5550, Palermo. Consultá clases, niveles, horarios, vacantes, aranceles y salas.',
        heading: 'Contacto con Select Dance Studio',
        summary: 'Escribinos por WhatsApp para recibir una recomendación personalizada. Estamos en Honduras 5550, Oficina 105, Palermo.',
        image: '/optimized/home/hero-1024.webp',
        service: 'contacto',
    },
];

const SERVICE_ROUTES = SERVICE_PAGE_LIST.map((page) => ({
    canonical: page.canonical,
    title: page.title,
    description: page.description,
    heading: page.heading,
    summary: page.intro,
    image: page.image,
    imageAlt: page.imageAlt,
    service: page.service,
}));

export const PUBLIC_SEO_ROUTES = [...CORE_ROUTES, ...SERVICE_ROUTES];
