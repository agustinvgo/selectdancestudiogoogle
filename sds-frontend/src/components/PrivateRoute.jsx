import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <Loader />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.primer_login == 1) {
        return <Navigate to="/cambiar-password" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
        // Usuario autenticado pero sin permisos para esta ruta
        return <Navigate to={user.rol === 'admin' || user.rol === 'profesor' ? '/admin' : '/alumno'} replace />;
    }

    return children;
};

export default PrivateRoute;
