import { Link } from 'react-router-dom';
import heroBg from '../../assets/hero_bg.jpg';

const HeroSection = () => {
    return (
        <section className="relative w-full min-h-[100dvh] flex flex-col justify-center overflow-hidden">
            {/* Background: Ken Burns Effect on High-Res Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src={heroBg}
                    alt="Select Dance Studio Team"
                    className="w-full h-full object-cover opacity-60 animate-ken-burns"
                    fetchPriority="high"
                    loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full h-full flex flex-col justify-center items-center text-center px-4 pt-16">
                <div className="animate-fade-in-up flex flex-col items-center w-full max-w-4xl mx-auto">
                    <p className="text-[10px] sm:text-xs md:text-base font-light tracking-[0.4em] md:tracking-[0.5em] uppercase text-gray-300 md:text-gray-600 mb-2 md:mb-6">
                        Est. 2024 • Buenos Aires
                    </p>
                    <h1 className="text-fluid-h1 font-bold leading-none mb-4 md:mb-8 text-white mix-blend-overlay text-center w-full">
                        <span className="sr-only">Select Dance Studio - Escuela de Danza y Gimnasia en Palermo</span>
                        SELECT<br />DANCE<br />STUDIO
                    </h1>
                    <div className="w-16 md:w-24 h-1 bg-red-600 mx-auto mb-6 md:mb-8"></div>

                    <div className="flex flex-row gap-3 md:gap-6 mt-2 md:mt-8 w-full justify-center items-center">
                        <Link
                            to="/cursos"
                            className="w-1/2 sm:w-auto px-2 sm:px-6 py-3 md:px-10 md:py-4 bg-white text-black font-bold tracking-widest text-[9px] sm:text-xs md:text-sm hover:bg-gray-200 transition-all transform hover:scale-105 text-center"
                        >
                            VER CLASES
                        </Link>
                        <Link
                            to="/login"
                            className="w-1/2 sm:w-auto px-2 sm:px-6 py-3 md:px-10 md:py-4 border border-white/30 text-white font-bold tracking-[0.1em] sm:tracking-widest text-[9px] sm:text-xs md:text-sm hover:bg-white/10 transition-all backdrop-blur-sm text-center"
                        >
                            AREA ALUMNOS
                        </Link>
                    </div>
                </div>
            </div>

        </section>
    );
};

export default HeroSection;

