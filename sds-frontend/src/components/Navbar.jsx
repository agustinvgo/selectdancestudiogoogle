import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRightOnRectangleIcon, Bars3Icon } from '@heroicons/react/24/outline';
import logo from '../assets/logo-select-dance-studio.webp';

const Navbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 shadow-sm z-40 relative">
            <div className="flex items-center justify-between">
                {/* Left Side: Menu + Logo */}
                <div className="flex items-center space-x-4">
                    {/* Hamburger Button (Mobile & Desktop) */}
                    <button
                        onClick={onMenuClick}
                        className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg focus:outline-none transition-colors lg:hidden"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>

                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 ring-2 ring-gray-50">
                            <img src={logo} alt="SDS" className="w-full h-full object-cover" />
                        </div>
                        <span className="ml-3 text-lg md:text-xl font-bold text-gray-900 hidden md:block tracking-tight">
                            Select Dance Studio
                        </span>
                        <span className="ml-3 text-lg font-bold text-gray-900 md:hidden">
                            SDS
                        </span>
                    </div>
                </div>

                {/* User info & logout */}
                <div className="flex items-center space-x-4">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-semibold text-gray-900">
                            {user?.alumno ? `${user.alumno.nombre} ${user.alumno.apellido}` : user?.email}
                        </p>
                        <p className="text-xs text-gray-500">
                            {user?.rol === 'admin' ? 'Administrador' : user?.rol === 'profesor' ? 'Profesor' : 'Alumno'}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-3 py-2 md:px-4 md:py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-red-600 rounded-lg transition-all duration-200 shadow-sm"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        <span className="text-sm font-medium hidden md:inline">Salir</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
