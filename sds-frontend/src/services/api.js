import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Instancia de Axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ===== AUTH =====
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

// ===== ALUMNOS =====
export const alumnosAPI = {
    getAll: () => api.get('/alumnos'),
    getById: (id) => api.get(`/alumnos/${id}`),
    getFichaCompleta: (id) => api.get(`/alumnos/${id}/ficha-completa`),
    create: (alumnoData) => api.post('/alumnos', alumnoData),
    update: (id, alumnoData) => api.put(`/alumnos/${id}`, alumnoData),
    delete: (id) => api.delete(`/alumnos/${id}`),
};

// ===== ASISTENCIAS =====
export const asistenciasAPI = {
    getByAlumno: (id, mes, anio) => api.get(`/asistencias/alumno/${id}`, { params: { mes, anio } }),
    getByCurso: (id, fecha) => api.get(`/asistencias/curso/${id}`, { params: { fecha } }),
    marcar: (asistenciaData) => api.post('/asistencias', asistenciaData),
    marcarAsistenciasMasivas: (data) => api.post('/asistencias/masivas', data),
};

// ===== PAGOS =====
export const pagosAPI = {
    getAll: (estado) => api.get('/pagos', { params: { estado } }),
    getByAlumno: (id) => api.get(`/pagos/alumno/${id}`),
    getPendientes: () => api.get('/pagos/pendientes'),
    getEstadoFinanciero: (mes = null, anio = null) => api.get('/pagos/estado-financiero', { params: { mes, anio } }),
    create: (pagoData) => api.post('/pagos', pagoData),
    generarMasivos: (data) => api.post('/pagos/masivos', data),
    update: (id, pagoData) => api.put(`/pagos/${id}`, pagoData),
    // Nuevas funcionalidades
    calcularRecargo: (id) => api.post(`/pagos/calcular-recargo/${id}`),
    aplicarDescuento: (data) => api.post('/pagos/aplicar-descuento', data),
    crearPlanCuotas: (data) => api.post('/pagos/plan-cuotas', data),
    getEstadisticasAvanzadas: () => api.get('/pagos/estadisticas-avanzadas'),
    descargarComprobante: (id) => api.get(`/pagos/${id}/comprobante`, { responseType: 'blob' }),
};

// ===== EVENTOS =====
export const eventosAPI = {
    getAll: () => api.get('/eventos'),
    getById: (id) => api.get(`/eventos/${id}`),
    getByAlumno: (id) => api.get(`/eventos/alumno/${id}`),
    getProximos: () => api.get('/eventos/proximos'),
    create: (eventoData) => api.post('/eventos', eventoData),
    update: (id, eventoData) => api.put(`/eventos/${id}`, eventoData),
    delete: (id) => api.delete(`/eventos/${id}`),
    inscribirAlumno: (eventoId, data) => api.post(`/eventos/${eventoId}/inscribir`, data),
    updateChecklist: (inscripcionId, checklistData) => api.put(`/eventos/inscripcion/${inscripcionId}/checklist`, checklistData),
};

// ===== CURSOS =====
export const cursosAPI = {
    getAll: () => api.get('/cursos'),
    getById: (id) => api.get(`/cursos/${id}`),
    getByAlumno: (id) => api.get(`/cursos/alumno/${id}`),
    getParticipantes: (id) => api.get(`/cursos/${id}/participantes`),
    create: (cursoData) => api.post('/cursos', cursoData),
    update: (id, cursoData) => api.put(`/cursos/${id}`, cursoData),
    delete: (id) => api.delete(`/cursos/${id}`),
    inscribirAlumno: (cursoId, data) => api.post(`/cursos/${cursoId}/inscribir`, data),
    desinscribirAlumno: (cursoId, alumnoId) => api.delete(`/cursos/${cursoId}/alumno/${alumnoId}`),
};

// ===== EMAILS =====
export const emailsAPI = {
    test: (email) => api.post('/emails/test', { email }),
    enviarRecordatorioPago: (data) => api.post('/emails/recordatorio-pago', data),
    enviarRecordatoriosMasivos: () => api.post('/emails/recordatorios-masivos'),
    enviarNotificacionEvento: (data) => api.post('/emails/notificar-evento', data),
    enviarNotificacionEventoMasivo: (eventoId) => api.post(`/emails/notificar-evento-masivo/${eventoId}`),
    enviarBienvenida: (alumnoId) => api.post(`/emails/bienvenida/${alumnoId}`),
    enviarPersonalizado: (data) => api.post('/emails/personalizado', data),
    enviarMasivoPersonalizado: (data) => api.post('/emails/masivo-personalizado', data),
};

// ===== ESTADISTICAS =====
export const estadisticasAPI = {
    getAsistenciaPromedio: () => api.get('/estadisticas/asistencia-promedio'),
    getAsistenciasPorMes: () => api.get('/estadisticas/asistencias-por-mes'),
    getCursosPopulares: () => api.get('/estadisticas/cursos-populares'),
    getTasaRetencion: () => api.get('/estadisticas/tasa-retencion'),
    getNuevosAlumnosPorMes: () => api.get('/estadisticas/nuevos-alumnos'),
    getDistribucionPorCurso: () => api.get('/estadisticas/distribucion-cursos'),
};


export default api;
