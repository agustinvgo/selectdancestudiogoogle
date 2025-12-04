import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HomeIcon,
    UserGroupIcon,
    ClipboardDocumentCheckIcon,
    CurrencyDollarIcon,
    CalendarDaysIcon,
    UserCircleIcon,
    AcademicCapIcon,
    ChartBarIcon,
    BellAlertIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
    const { user, isAdmin } = useAuth();

    const adminLinks = [
        { to: '/admin', icon: HomeIcon, label: 'Dashboard' },
        { to: '/admin/alumnos', icon: UserGroupIcon, label: 'Alumnos' },
        { to: '/admin/cursos', icon: AcademicCapIcon, label: 'Cursos' },
        { to: '/admin/asistencias', icon: ClipboardDocumentCheckIcon, label: 'Asistencias' },
        { to: '/admin/pagos', icon: CurrencyDollarIcon, label: 'Pagos' },
        { to: '/admin/eventos', icon: CalendarDaysIcon, label: 'Eventos' },
        { to: '/admin/notificaciones', icon: BellAlertIcon, label: 'Notificaciones' },
    ];

    const alumnoLinks = [
        { to: '/alumno', icon: HomeIcon, label: 'Inicio' },
        { to: '/alumno/perfil', icon: UserCircleIcon, label: 'Mi Perfil' },
        { to: '/alumno/clases', icon: AcademicCapIcon, label: 'Mis Clases' },
        { to: '/alumno/asistencias', icon: ChartBarIcon, label: 'Asistencias' },
        { to: '/alumno/pagos', icon: CurrencyDollarIcon, label: 'Pagos' },
        { to: '/alumno/eventos', icon: CalendarDaysIcon, label: 'Eventos' },
    ];

    const links = isAdmin ? adminLinks : alumnoLinks;

    return (
        <aside className="w-64 bg-gray-800 border-r border-gray-700 min-h-screen">
            <nav className="p-4 space-y-2">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === '/admin' || link.to === '/alumno'}
                        className={({ isActive }) =>
                            `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-sds-red text-white'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        <link.icon className="h-5 w-5" />
                        <span className="font-medium">{link.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
