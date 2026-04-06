import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // No necesitamos verificar localStorage — la cookie HttpOnly se envía automáticamente
            const response = await authAPI.getMe();
            setUser(response.data.data);
        } catch (error) {
            // Cookie inválida o expirada, limpiar estado local
            localStorage.removeItem('user');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Inactivity timeout logic
    useEffect(() => {
        if (!user) return; // Only monitor if logged in

        const TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
        let activityTimer;

        const resetTimer = () => {
            if (activityTimer) clearTimeout(activityTimer);
            activityTimer = setTimeout(() => {
                logout();
                // Optionally show a toast here, but logout usually redirects or clears state
                // If you have a toast service available in context or imported:
                // toast.error('Sesión cerrada por inactividad'); 
                // Since toast isn't directly imported here, we rely on the UI reflecting the logout
                window.location.href = '/login?reason=inactivity';
            }, TIMEOUT_MS);
        };

        // Events to monitor
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        // Attach listeners
        events.forEach(event => document.addEventListener(event, resetTimer));

        // Initialize timer
        resetTimer();

        // Cleanup
        return () => {
            if (activityTimer) clearTimeout(activityTimer);
            events.forEach(event => document.removeEventListener(event, resetTimer));
        };
    }, [user]);

    const login = async (email, password) => {
        try {
            const response = await authAPI.login(email, password);
            const { user } = response.data.data;
            // El JWT ya fue guardado en cookie HttpOnly por el servidor
            // Solo guardamos el objeto usuario (sin token) para UI/roles
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            return { success: true, user };
        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Error al iniciar sesión'
            };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout(); // Limpia la cookie HttpOnly en el servidor
        } catch (_) {
            // Si falla el request, igual limpiamos localmente
        }
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateUser = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }));
        // Also update localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            localStorage.setItem('user', JSON.stringify({ ...userData, ...updatedData }));
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        checkAuth,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.rol === 'admin',
        isProfesor: user?.rol === 'profesor',
        isAlumno: user?.rol === 'alumno',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
