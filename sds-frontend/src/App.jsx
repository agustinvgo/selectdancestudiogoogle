import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/PrivateRoute.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Loader from './components/Loader.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Lazy Load Pages

// Auth
const Login = lazy(() => import('./pages/auth/Login.jsx'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword.jsx'));
const CambiarPassword = lazy(() => import('./pages/auth/CambiarPassword.jsx'));

// Admin
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const GestionProfesores = lazy(() => import('./pages/admin/GestionProfesores.jsx'));
const GestionAlumnos = lazy(() => import('./pages/admin/GestionAlumnos.jsx'));
const DetalleAlumno = lazy(() => import('./pages/admin/DetalleAlumno.jsx'));
const GestionCursos = lazy(() => import('./pages/admin/GestionCursos.jsx'));
const GestionAsistencias = lazy(() => import('./pages/admin/GestionAsistencias.jsx'));
const GestionPagos = lazy(() => import('./pages/admin/GestionPagos.jsx'));
const GestionEventos = lazy(() => import('./pages/admin/GestionEventos.jsx'));
const GestionEquipo = lazy(() => import('./pages/admin/GestionEquipo.jsx'));
const GestionConsultas = lazy(() => import('./pages/admin/GestionConsultas.jsx'));
const GestionGastos = lazy(() => import('./pages/admin/GestionGastos.jsx'));
const GestionInventario = lazy(() => import('./pages/admin/GestionInventario.jsx'));
const GestionClasesPrueba = lazy(() => import('./pages/admin/GestionClasesPrueba.jsx'));
const EntrenamientoBot = lazy(() => import('./pages/admin/EntrenamientoBot.jsx'));

// Common
const CalendarioGeneral = lazy(() => import('./pages/common/CalendarioGeneral.jsx'));
const Mensajeria = lazy(() => import('./pages/common/Mensajeria.jsx'));
const Notificaciones = lazy(() => import('./pages/common/Notificaciones.jsx'));
const Comunicados = lazy(() => import('./pages/admin/Comunicados.jsx'));

// Alumno
const AlumnoDashboard = lazy(() => import('./pages/alumno/AlumnoDashboard.jsx'));
const PerfilAlumno = lazy(() => import('./pages/alumno/PerfilAlumno.jsx'));
const MisClases = lazy(() => import('./pages/alumno/MisClases.jsx'));
const MisAsistencias = lazy(() => import('./pages/alumno/MisAsistencias.jsx'));
const MisPagos = lazy(() => import('./pages/alumno/MisPagos.jsx'));
const MisEventos = lazy(() => import('./pages/alumno/MisEventos.jsx'));

// Callbacks
const PagoExitoso = lazy(() => import('./pages/callbacks/PagoExitoso.jsx'));
const PagoFallido = lazy(() => import('./pages/callbacks/PagoFallido.jsx'));
const PagoPendiente = lazy(() => import('./pages/callbacks/PagoPendiente.jsx'));

// Public Pages
const PublicLayout = lazy(() => import('./layouts/PublicLayout.jsx'));
const Home = lazy(() => import('./pages/public/Home.jsx'));
const CursosPublicos = lazy(() => import('./pages/public/CursosPublicos.jsx'));
const Competition = lazy(() => import('./pages/public/Competition.jsx'));
const QuienesSomos = lazy(() => import('./pages/public/QuienesSomos.jsx'));
// const Highlights = lazy(() => import('./pages/public/Highlights')); // Removed during cleanup
// const TubelightDemo = lazy(() => import('./pages/public/TubelightDemo')); // Removed during cleanup

// Layout para rutas protegidas
const ProtectedLayout = ({ children }) => {
    // Inicializar en false siempre: evita layout thrashing de window.innerWidth en SSR/hydration
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    React.useEffect(() => {
        // Abrir sidebar en desktop tras el primer paint
        if (window.innerWidth >= 1024) setSidebarOpen(true);
    }, []);

    return (
        <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
            <Navbar onMenuClick={() => setSidebarOpen(prev => !prev)} />
            <div className="flex flex-1 relative overflow-hidden">
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    onToggle={() => setSidebarOpen(prev => !prev)}
                />
                <main className="flex-1 p-4 md:p-8 w-full h-full overflow-y-auto overflow-x-hidden">
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </main>
            </div>
        </div>
    );
};

// Componente principal de rutas
const AppRoutes = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    return (
        <Suspense fallback={<Loader />}>
            <Routes>
                {/* Rutas públicas */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/cursos" element={<CursosPublicos />} />
                    <Route path="/competition" element={<Competition />} />
                    <Route path="/nosotros" element={<QuienesSomos />} />
                    {/* <Route path="/tubelight" element={<TubelightDemo />} /> Removed during cleanup */}
                </Route>

                <Route
                    path="/login"
                    element={user ? <Navigate to={user.rol === 'admin' || user.rol === 'profesor' ? '/admin' : '/alumno'} replace /> : <Login />}
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/cambiar-password" element={<CambiarPassword />} />

                {/* Rutas de Admin */}
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute allowedRoles={['admin', 'profesor']}>
                            <ProtectedLayout>
                                <AdminDashboard />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/profesores"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <ProtectedLayout>
                                <GestionProfesores />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/alumnos"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <ProtectedLayout>
                                <GestionAlumnos />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/alumnos/:id"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <ProtectedLayout>
                                <DetalleAlumno />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/cursos"
                    element={
                        <PrivateRoute allowedRoles={['admin', 'profesor']}>
                            <ProtectedLayout>
                                <GestionCursos />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/asistencias"
                    element={
                        <PrivateRoute allowedRoles={['admin', 'profesor']}>
                            <ProtectedLayout>
                                <GestionAsistencias />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/pagos"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <ProtectedLayout>
                                <GestionPagos />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/eventos"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <ProtectedLayout>
                                <GestionEventos />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/mensajeria"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <ProtectedLayout>
                                <Mensajeria />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/consultas"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <ProtectedLayout>
                                <GestionConsultas />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/notificaciones"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <ProtectedLayout>
                                <Notificaciones />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/comunicados"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <ProtectedLayout>
                                <Comunicados />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/equipo"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <ProtectedLayout>
                                <GestionEquipo />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/gastos"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <ProtectedLayout>
                                <GestionGastos />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/inventario"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <ProtectedLayout>
                                <GestionInventario />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/prueba"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <ProtectedLayout>
                                <GestionClasesPrueba />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/admin/bot-training"
                    element={
                        <PrivateRoute allowedRoles={['admin']}>
                            <ProtectedLayout>
                                <EntrenamientoBot />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/alumno"
                    element={
                        <PrivateRoute allowedRoles={['alumno']}>
                            <ProtectedLayout>
                                <AlumnoDashboard />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/alumno/perfil"
                    element={
                        <PrivateRoute allowedRoles={['alumno']}>
                            <ProtectedLayout>
                                <PerfilAlumno />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/alumno/clases"
                    element={
                        <PrivateRoute allowedRoles={['alumno']}>
                            <ProtectedLayout>
                                <MisClases />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/alumno/asistencias"
                    element={
                        <PrivateRoute allowedRoles={['alumno']}>
                            <ProtectedLayout>
                                <MisAsistencias />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/alumno/pagos"
                    element={
                        <PrivateRoute allowedRoles={['alumno']}>
                            <ProtectedLayout>
                                <MisPagos />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/alumno/eventos"
                    element={
                        <PrivateRoute allowedRoles={['alumno']}>
                            <ProtectedLayout>
                                <MisEventos />
                            </ProtectedLayout>
                        </PrivateRoute>
                    }
                />


                {/* Callback Routes with PublicLayout if needed or standalone */}

                <Route path="/pago-exitoso" element={<PagoExitoso />} />
                <Route path="/pago-fallido" element={<PagoFallido />} />
                <Route path="/pago-pendiente" element={<PagoPendiente />} />

                {/* Ruta por defecto */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};



function App() {
    React.useEffect(() => {
        const handleImageProtection = (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
            }
        };

        document.addEventListener('contextmenu', handleImageProtection);
        document.addEventListener('dragstart', handleImageProtection);

        return () => {
            document.removeEventListener('contextmenu', handleImageProtection);
            document.removeEventListener('dragstart', handleImageProtection);
        };
    }, []);

    return (
        <Router>
            <AuthProvider>
                <ScrollToTop />
                <Toaster />
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;
