import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Loader from './components/Loader';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import GestionAlumnos from './pages/GestionAlumnos';
import GestionCursos from './pages/GestionCursos';
import GestionAsistencias from './pages/GestionAsistencias';
import GestionPagos from './pages/GestionPagos';
import GestionEventos from './pages/GestionEventos';
import CalendarioGeneral from './pages/CalendarioGeneral';
import AlumnoDashboard from './pages/AlumnoDashboard';
import PerfilAlumno from './pages/PerfilAlumno';
import MisClases from './pages/MisClases';
import MisAsistencias from './pages/MisAsistencias';
import MisPagos from './pages/MisPagos';
import MisEventos from './pages/MisEventos';
import Notificaciones from './pages/Notificaciones';

// Layout para rutas protegidas
const ProtectedLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <div className="flex">
                <Sidebar />
                <main className="flex-1 p-8">
                    {children}
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
        <Routes>
            {/* Rutas públicas */}
            <Route
                path="/login"
                element={user ? <Navigate to={user.rol === 'admin' ? '/admin' : '/alumno'} replace /> : <Login />}
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Rutas de Admin */}
            <Route
                path="/admin"
                element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <ProtectedLayout>
                            <AdminDashboard />
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
                path="/admin/cursos"
                element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <ProtectedLayout>
                            <GestionCursos />
                        </ProtectedLayout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/admin/asistencias"
                element={
                    <PrivateRoute allowedRoles={['admin']}>
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
                path="/admin/notificaciones"
                element={
                    <PrivateRoute allowedRoles={['admin']}>
                        <ProtectedLayout>
                            <Notificaciones />
                        </ProtectedLayout>
                    </PrivateRoute>
                }
            />

            {/* Rutas de Alumno */}
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

            {/* Ruta por defecto */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;
