import { Link } from 'react-router-dom';
import WhatsAppCTA from '../public/WhatsAppCTA.jsx';

const heroSources = {
    avif: '/optimized/home/hero-640.avif 640w, /optimized/home/hero-1024.avif 1024w',
    webp: '/optimized/home/hero-640.webp 640w, /optimized/home/hero-1024.webp 1024w',
};

const HeroSection = () => {
    return (
        <section className="relative w-full min-h-[100dvh] flex flex-col justify-center overflow-hidden">
            {/* Background: Ken Burns Effect on High-Res Image */}
            <div className="absolute inset-0 z-0">
                <picture className="absolute inset-0 block">
                    <source type="image/avif" srcSet={heroSources.avif} sizes="100vw" />
                    <source type="image/webp" srcSet={heroSources.webp} sizes="100vw" />
                    <img
                        src="/optimized/home/hero-1024.webp"
                        alt="Alumnas y equipo de Select Dance Studio en Palermo, Buenos Aires"
                        className="w-full h-full object-cover opacity-60 animate-ken-burns"
                        fetchPriority="high"
                        loading="eager"
                        decoding="async"
                    />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-center px-4 pt-16">
                <div className="animate-fade-in-up flex flex-col items-center w-full max-w-4xl mx-auto">
                    <p className="text-[10px] sm:text-xs md:text-base font-light tracking-[0.4em] md:tracking-[0.5em] uppercase text-gray-300 md:text-gray-600 mb-2 md:mb-6">
                        Est. 2024 • Buenos Aires
                    </p>
                    <div aria-hidden="true" className="text-fluid-h1 font-bold leading-none mb-4 text-white mix-blend-overlay text-center w-full">
                        SELECT<br />DANCE<br />STUDIO
                    </div>
                    <h1 className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 sm:text-xs md:mb-7 md:text-sm md:tracking-[0.28em]">
                        Academia de danza en Palermo, CABA · Desde los 3 años
                    </h1>
                    <div className="w-16 md:w-24 h-1 bg-red-600 mx-auto mb-6 md:mb-8"></div>

                    <div className="flex flex-row gap-3 md:gap-6 mt-2 md:mt-8 w-full justify-center items-center">
                        <WhatsAppCTA
                            message="Hola, vi la web de Select Dance Studio. Quisiera consultar qué clase recomiendan según edad y experiencia, además de horarios, vacantes y aranceles."
                            source="/"
                            service="hero_inicio"
                            className="w-1/2 sm:w-auto px-2 sm:px-6 py-3 md:px-10 md:py-4 bg-white text-black font-bold tracking-widest text-[9px] sm:text-xs md:text-sm hover:bg-gray-200 transition-all transform hover:scale-105 text-center"
                        >
                            CONSULTAR WHATSAPP
                        </WhatsAppCTA>
                        <Link
                            to="/cursos"
                            className="w-1/2 sm:w-auto px-2 sm:px-6 py-3 md:px-10 md:py-4 border border-white/30 text-white font-bold tracking-[0.1em] sm:tracking-widest text-[9px] sm:text-xs md:text-sm hover:bg-white/10 transition-all backdrop-blur-sm text-center"
                        >
                            VER CLASES
                        </Link>
                    </div>
                </div>
            </div>

        </section>
    );
};

export default HeroSection;

