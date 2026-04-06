import { SparklesIcon } from '@heroicons/react/24/outline';

const CoursesHero = ({ onOpenModal }) => {
    return (
        <div className="mb-24 flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-12 animate-fade-in-up">
            <div>
                <span className="block text-xs font-bold text-gray-400 tracking-[0.2em] mb-4 uppercase">Explora</span>
                <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">
                    CURSOS
                </h1>
            </div>

            <div className="flex flex-col items-end gap-6 mt-6 md:mt-0">
                <p className="text-gray-400 text-sm md:text-base max-w-sm leading-relaxed font-light text-right">
                    Selección exclusiva de estilos. Eleva tu técnica con nuestros programas especializados.
                </p>
                <button
                    onClick={onOpenModal}
                    className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold tracking-widest uppercase rounded-full hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-700 ease-in-out -skew-x-12 origin-left" />
                    <SparklesIcon className="w-5 h-5 animate-pulse" />
                    <span>Tomar Clase de Prueba</span>
                </button>
            </div>
        </div>
    );
};

export default CoursesHero;

