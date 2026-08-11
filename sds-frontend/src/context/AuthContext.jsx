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
    const [alumnoActivoId, setAlumnoActivoId] = useState(null);

    const alumnos = user?.rol === 'alumno'
        ? (Array.isArray(user?.alumnos) && user.alumnos.length ? user.alumnos : (user?.alumno ? [user.alumno] : []))
        : [];
    const alumnoActivo = alumnos.find((alumno) => String(alumno.id) === String(alumnoActivoId)) || alumnos[0] || null;

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (!user?.id || !alumnos.length) {
            setAlumnoActivoId(null);
            return;
        }
        const storageKey = `alumno-activo:${user.id}`;
        const savedId = localStorage.getItem(storageKey);
        const selectedExists = alumnos.some((alumno) => String(alumno.id) === String(savedId));
        setAlumnoActivoId(selectedExists ? savedId : String(alumnos[0].id));
    }, [user?.id, user?.alumnos, user?.alumno]);

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
                // Verificar si el usuario está viendo la transmisión o si hay un reproductor activo
                const isWatchingVideo = window.location.pathname.includes('/en-vivo') ||
                                        window.location.pathname.includes('/transmisiones') ||
                                        Array.from(document.querySelectorAll('video')).some(v => !v.paused && !v.ended);

                if (isWatchingVideo) {
                    // Mantener la sesión activa si está mirando el video
                    resetTimer();
                    return;
                }

                logout();
                window.location.href = '/login?reason=inactivity';
            }, TIMEOUT_MS);
        };

        // Events to monitor
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

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
            const response = await authAPI.login(email.trim().toLowerCase(), password);
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
        if (user?.id) localStorage.removeItem(`alumno-activo:${user.id}`);
        setUser(null);
    };

    const setAlumnoActivo = (alumnoOrId) => {
        const id = typeof alumnoOrId === 'object' ? alumnoOrId?.id : alumnoOrId;
        const exists = alumnos.some((alumno) => String(alumno.id) === String(id));
        if (!exists) return;
        const normalizedId = String(id);
        setAlumnoActivoId(normalizedId);
        localStorage.setItem(`alumno-activo:${user.id}`, normalizedId);
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
        alumnos,
        alumnoActivo,
        setAlumnoActivo,
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
