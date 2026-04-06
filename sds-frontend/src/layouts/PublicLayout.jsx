import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, BookOpen, Users, Star, LogIn } from 'lucide-react';
import { NavBar } from '../components/ui/TubelightNavbar.jsx';
import { useState, useEffect } from 'react';

const PublicLayout = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const darkPages = ['/', '/competition', '/cursos', '/nosotros'];
    const isDarkPage = darkPages.includes(location.pathname);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Effect to toggle the global dark class on the HTML root
    useEffect(() => {
        const root = document.documentElement;
        if (isDarkPage) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Cleanup when PublicLayout unmounts (e.g. going to /login)
        return () => {
            root.classList.remove('dark');
        };
    }, [isDarkPage]);

    const navItems = [
        { name: 'Inicio', url: '/', icon: Home },
        { name: 'Cursos', url: '/cursos', icon: BookOpen },
        { name: 'Competition', url: '/competition', icon: Star },
        { name: 'Nosotros', url: '/nosotros', icon: Users },
        { name: 'Login', url: '/login', icon: LogIn }
    ];

    return (
        <div className={`min-h-[100dvh] flex flex-col font-sans transition-colors duration-500`}>
            {/* Logo Fixed at Top Left */}
            <Link to="/" className="fixed top-6 left-6 z-[60] flex items-center gap-3 group">
                <img
                    src="/logo-select-dance-studio.webp"
                    alt="Select Dance Studio"
                    className="h-10 w-auto object-contain group-hover:opacity-80 transition-opacity bg-white rounded-sm p-0.5"
                />
                <span className={`hidden lg:block text-lg font-bold tracking-tighter uppercase transition-all duration-300 transform origin-left
                        ${isDarkPage ? 'text-white' : 'text-gray-900'}
                        ${isScrolled ? 'opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden' : 'opacity-100 translate-x-0 w-auto group-hover:text-gray-600'}
                    `}>
                    Select <span className={`font-light ${isDarkPage ? 'text-gray-400' : 'text-gray-500'}`}>Dance Studio</span>
                </span>
            </Link>

            {/* New Tubelight Navbar */}
            <NavBar items={navItems} isLight={!isDarkPage} />

            {/* Main Content */}
            <main className={`${isDarkPage ? 'pt-0' : 'pt-0'} `}>
                <Outlet />
            </main>

            {/* Footer */}
            <footer className={`py-12 border-t transition-colors duration-500
                    ${isDarkPage ? 'bg-black border-white/10' : 'bg-white border-gray-200'}
                `}>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                        {/* Marca / Dirección */}
                        <div className="md:col-span-1">
                            <h3 className={`text-lg font-bold tracking-tight mb-4 ${isDarkPage ? 'text-white' : 'text-gray-900'}`}>
                                Select Dance Studio
                            </h3>
                            <address className={`not-italic text-sm space-y-2 ${isDarkPage ? 'text-gray-400' : 'text-gray-600'}`}>
                                <p>Honduras 5550, Palermo</p>
                                <p>CABA, C1425, Argentina</p>
                                <a
                                    href="https://wa.me/message/ZNBV2CLWYU36H1"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mt-4 text-amber-500 hover:text-amber-400 font-medium transition-colors"
                                >
                                    WhatsApp: Contactar ahora
                                </a>
                            </address>
                        </div>

                        {/* Navegación */}
                        <div>
                            <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDarkPage ? 'text-gray-500' : 'text-gray-400'}`}>Navegación</h4>
                            <ul className={`text-sm space-y-2 ${isDarkPage ? 'text-gray-400' : 'text-gray-600'}`}>
                                <li><Link to="/" className="hover:text-red-500 transition-colors">Inicio</Link></li>
                                <li><Link to="/cursos" className="hover:text-red-500 transition-colors">Cursos & Horarios</Link></li>
                                <li><Link to="/competition" className="hover:text-red-500 transition-colors">Elite Competition</Link></li>
                                <li><Link to="/nosotros" className="hover:text-red-500 transition-colors">Quiénes Somos</Link></li>
                            </ul>
                        </div>

                        {/* Carreras / Formación */}
                        <div>
                            <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDarkPage ? 'text-gray-500' : 'text-gray-400'}`}>Formación</h4>
                            <ul className={`text-sm space-y-2 ${isDarkPage ? 'text-gray-400' : 'text-gray-600'}`}>
                                <li><span className="opacity-50">Baby Dance (3-5)</span></li>
                                <li><span className="opacity-50">Junior & Teens</span></li>
                                <li><span className="opacity-50">Senior (+18)</span></li>
                                <li><span className="opacity-50">Alto Rendimiento</span></li>
                            </ul>
                        </div>

                        {/* Gestión */}
                        <div>
                            <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDarkPage ? 'text-gray-500' : 'text-gray-400'}`}>Acceso</h4>
                            <ul className={`text-sm space-y-2 ${isDarkPage ? 'text-gray-400' : 'text-gray-600'}`}>
                                <li><Link to="/login" className="hover:text-red-500 transition-colors underline decoration-red-500/20">Área de Alumnos</Link></li>
                                <li><Link to="/contacto" className="hover:text-red-500 transition-colors">Contacto</Link></li>
                                <li><a href="mailto:selectdancestudio.ar@gmail.com" className="hover:text-red-500 transition-colors">Email Academia</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className={`text-center text-[10px] tracking-[0.2em] uppercase space-y-1 border-t pt-8 w-full
                            ${isDarkPage ? 'border-white/10 text-gray-600' : 'border-gray-100 text-gray-400'}
                        `}>
                        <p>© {new Date().getFullYear()} Select Dance Studio. Palermo, Buenos Aires.</p>
                        <p>Danza y Gimnasia de Alto Rendimiento.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
