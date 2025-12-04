import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <div className="bg-sds-red w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xl">
                            SDS
                        </div>
                        <span className="ml-3 text-xl font-bold text-white">
                            Select Dance Studio
                        </span>
                    </div>
                </div>

                {/* User info & logout */}
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <p className="text-sm font-medium text-white">
                            {user?.alumno ? `${user.alumno.nombre} ${user.alumno.apellido}` : user?.email}
                        </p>
                        <p className="text-xs text-gray-400">
                            {user?.rol === 'admin' ? 'Administrador' : 'Alumno'}
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        <span className="text-sm">Salir</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
