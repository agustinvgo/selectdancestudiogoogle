import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificacionesAPI } from '../services/api';
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
    ChatBubbleLeftIcon,
    UserPlusIcon,
    SparklesIcon,
    XMarkIcon,
    EnvelopeIcon,
    BanknotesIcon,
    ShoppingBagIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';


const Sidebar = ({ isOpen, onClose, onToggle }) => {
    const { user, isAdmin } = useAuth();
    const [counts, setCounts] = useState({ pagosRevision: 0, consultasPendientes: 0 });

    useEffect(() => {
        if (isAdmin) {
            const fetchCounts = async () => {
                try {
                    const response = await notificacionesAPI.getCounts();
                    if (response.data.success) {
                        setCounts(response.data.data);
                    }
                } catch (error) {
                    console.error('Error fetching notification counts', error);
                }
            };
            fetchCounts();

            // Poll every 60 seconds
            const interval = setInterval(fetchCounts, 60000);
            return () => clearInterval(interval);
        }
    }, [isAdmin]);

    // Grouped Admin Links
    const adminGroups = [
        {
            title: null,
            items: [
                { to: '/admin', icon: HomeIcon, label: 'Dashboard' }
            ]
        },
        {
            title: 'Académico',
            items: [
                { to: '/admin/cursos', icon: AcademicCapIcon, label: 'Cursos' },
                { to: '/admin/alumnos', icon: UserGroupIcon, label: 'Alumnos' },
                { to: '/admin/profesores', icon: AcademicCapIcon, label: 'Profesores' },
                { to: '/admin/asistencias', icon: ClipboardDocumentCheckIcon, label: 'Asistencias' },
                { to: '/admin/prueba', icon: SparklesIcon, label: 'Clases Prueba' },
            ]
        },
        {
            title: 'Finanzas',
            items: [
                { to: '/admin/pagos', icon: CurrencyDollarIcon, label: 'Pagos', badge: counts.pagosRevision },
                { to: '/admin/gastos', icon: BanknotesIcon, label: 'Gastos' },
            ]
        },
        {
            title: 'Gestión',
            items: [
                { to: '/admin/eventos', icon: CalendarDaysIcon, label: 'Eventos' },
                { to: '/admin/inventario', icon: ShoppingBagIcon, label: 'Inventario' },
                { to: '/admin/equipo', icon: UserPlusIcon, label: 'Equipo' },
            ]
        },
        {
            title: 'Comunicación',
            items: [
                { to: '/admin/mensajeria', icon: ChatBubbleLeftIcon, label: 'WhatsApp' },
                { to: '/admin/notificaciones', icon: BellAlertIcon, label: 'Correos / Notif.' },
                { to: '/admin/comunicados', icon: ChatBubbleLeftIcon, label: 'Comunicados' },
                { to: '/admin/consultas', icon: EnvelopeIcon, label: 'Contacto Web', badge: counts.consultasPendientes },
                { to: '/admin/bot-training', icon: SparklesIcon, label: 'Entrenar Bot IA' },
            ]
        }
    ];

    const alumnoLinks = [
        { to: '/alumno', icon: HomeIcon, label: 'Inicio' },
        { to: '/alumno/perfil', icon: UserCircleIcon, label: 'Mi Perfil' },
        { to: '/alumno/clases', icon: AcademicCapIcon, label: 'Mis Clases' },
        { to: '/alumno/asistencias', icon: ChartBarIcon, label: 'Asistencias' },
        { to: '/alumno/pagos', icon: CurrencyDollarIcon, label: 'Pagos' },
        { to: '/alumno/eventos', icon: CalendarDaysIcon, label: 'Eventos' },
    ];

    const profesorLinks = [
        { to: '/admin', icon: HomeIcon, label: 'Dashboard' },
        { to: '/admin/cursos', icon: AcademicCapIcon, label: 'Mis Cursos' },
        { to: '/admin/asistencias', icon: ClipboardDocumentCheckIcon, label: 'Tomar Lista' },
    ];

    // Determine navigation structure
    let navigationGroups = [];
    if (isAdmin) {
        navigationGroups = adminGroups;
    } else if (user?.rol === 'profesor') {
        navigationGroups = [{ title: null, items: profesorLinks }];
    } else {
        navigationGroups = [{ title: null, items: alumnoLinks }];
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-white/20 backdrop-blur-sm z-20 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-30
                bg-white border-r border-gray-200 h-full
                transition-all duration-300 ease-in-out flex flex-col shadow-sm
                ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'}
            `}>
                {/* Header */}
                <div className={`flex items-center h-16 border-b border-gray-100 flex-shrink-0 transition-all duration-300 ${isOpen ? 'px-6 justify-between' : 'px-0 justify-center'}`}>
                    <div className="flex items-center space-x-2 overflow-hidden">
                        <span className={`text-gray-900 font-bold text-xl tracking-tight whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'lg:opacity-0 lg:hidden'}`}>
                            SDS studio
                        </span>
                        {/* Logo icon for collapsed state if desired */}
                        {!isOpen && <span className="hidden lg:block text-2xl font-black text-zinc-900">S</span>}
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-600 lg:hidden">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-6 space-y-6 custom-scrollbar">
                    {navigationGroups.map((group, groupIdx) => (
                        <div key={groupIdx}>
                            {group.title && (
                                <h3 className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 transition-all duration-300 ${isOpen ? 'px-3 opacity-100' : 'px-0 text-center opacity-0 lg:hidden'}`}>
                                    {group.title}
                                </h3>
                            )}
                            {/* Separator for collapsed mode if title is hidden */}
                            {!isOpen && group.title && <div className="hidden lg:block w-8 h-px bg-gray-200 mx-auto mb-3" />}

                            <div className="space-y-1">
                                {group.items.map((link) => (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => window.innerWidth < 1024 && onClose && onClose()}
                                        end={link.to === '/admin' || link.to === '/alumno'}
                                        title={!isOpen ? link.label : ''}
                                        className={({ isActive }) =>
                                            `group flex items-center rounded-xl text-sm font-medium transition-all duration-200 relative
                                            ${isOpen ? 'px-3 py-2.5 justify-start' : 'px-0 py-2.5 justify-center'}
                                            ${isActive
                                                ? 'bg-zinc-50 text-zinc-900 shadow-sm ring-1 ring-zinc-200/50'
                                                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                                            }`
                                        }
                                    >
                                        <link.icon className={`transition-colors duration-200 flex-shrink-0
                                            ${isOpen ? 'h-5 w-5 mr-3' : 'h-6 w-6'}
                                            group-hover:text-zinc-900
                                        `} />

                                        <span className={`whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100 w-auto' : 'hidden lg:hidden w-0'}`}>
                                            {link.label}
                                        </span>

                                        {/* Badge - Adjusted for collapsed state */}
                                        {link.badge > 0 && (
                                            <span className={`
                                                absolute bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center
                                                ${isOpen ? 'right-2 top-2.5 h-5 px-1.5 min-w-[1.25rem]' : 'top-1 right-1 h-3 w-3 p-0 border border-white'}
                                            `}>
                                                {isOpen ? link.badge : ''}
                                            </span>
                                        )}

                                        {/* Hover Tooltip for Collapsed State */}
                                        {!isOpen && (
                                            <div className="hidden lg:group-hover:block absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-zinc-800 text-white text-xs px-2 py-1 rounded shadow-lg z-50 whitespace-nowrap">
                                                {link.label}
                                            </div>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer Toggle Button (Desktop Only) */}
                <div className="hidden lg:flex items-center justify-center h-16 border-t border-gray-100 p-4">
                    <button
                        onClick={onToggle}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors focus:outline-none"
                    >
                        {isOpen ? (
                            <div className="flex items-center space-x-2">
                                <ChevronLeftIcon className="h-5 w-5" />
                                <span className="text-sm font-medium">Contraer</span>
                            </div>
                        ) : (
                            <ChevronRightIcon className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

