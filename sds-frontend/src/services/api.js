import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
    console.error('VITE_API_URL is not defined in the environment!');
}

// Instancia de Axios
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Envía la cookie HttpOnly automáticamente en cada request
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para manejar errores de respuesta (401 = cookie expirada)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Solo redirigir si NO estamos ya en una ruta pública (evita bucle infinito)
            const publicRoutes = ['/login', '/reset-password', '/forgot-password', '/'];
            const isPublicRoute = publicRoutes.some(route => window.location.pathname.startsWith(route));
            if (!isPublicRoute) {
                // La sesión ahora vive en HttpOnly cookies — solo redirigir
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ===== AUTH =====
export const authAPI = {
    login: (email, password) => api.post('/auth/login', { email, password }),
    logout: () => api.post('/auth/logout'),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
    changePassword: (oldPassword, newPassword) => api.put('/auth/change-password', { oldPassword, newPassword }),
};

// ===== ALUMNOS =====
export const alumnosAPI = {
    getAll: () => api.get('/alumnos'),
    getById: (id) => api.get(`/alumnos/${id}`),
    getFichaCompleta: (id) => api.get(`/alumnos/${id}/ficha-completa`),
    create: (alumnoData) => api.post('/alumnos', alumnoData, {
        headers: alumnoData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    }),
    update: (id, alumnoData) => api.put(`/alumnos/${id}`, alumnoData, {
        headers: alumnoData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    }),
    delete: (id) => api.delete(`/alumnos/${id}`),
};

// ===== ASISTENCIAS =====
export const asistenciasAPI = {
    getByAlumno: (id, mes, anio) => api.get(`/asistencias/alumno/${id}`, { params: { mes, anio } }),
    getMisAsistencias: (mes, anio) => api.get('/asistencias/mis-asistencias', { params: { mes, anio } }), // Para alumno logueado
    getHistoria: (id) => api.get(`/asistencias/alumno/${id}/historia`),
    getByCurso: (id, fecha) => api.get(`/asistencias/curso/${id}`, { params: { fecha } }),
    marcar: (asistenciaData) => api.post('/asistencias', asistenciaData),
    marcarAsistenciasMasivas: (data) => api.post('/asistencias/masivas', data),
};

// ===== PAGOS =====
export const pagosAPI = {
    getAll: (params) => {
        if (typeof params === 'string') {
            return api.get('/pagos', { params: { estado: params } });
        }
        return api.get('/pagos', { params });
    },
    getByAlumno: (id) => api.get(`/pagos/alumno/${id}`),
    getMisPagos: () => api.get('/pagos/mis-pagos'), // Para alumno logueado (no necesita ID)
    getPendientes: () => api.get('/pagos/pendientes'),
    getEstadoFinanciero: (mes = null, anio = null) => api.get('/pagos/estado-financiero', { params: { mes, anio } }),
    create: (pagoData) => api.post('/pagos', pagoData),
    generarMasivos: (data) => api.post('/pagos/masivos', data),
    generarPagosMensuales: (mes, anio) => api.post('/pagos/masivos', { mes, anio }),
    subirComprobante: (id, formData) => api.post(`/pagos/${id}/comprobante`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    verComprobanteUrl: (id) => `${API_URL}/pagos/${id}/archivo-comprobante`,
    update: (id, pagoData) => api.put(`/pagos/${id}`, pagoData),
    // Nuevas funcionalidades
    calcularRecargo: (id) => api.post(`/pagos/calcular-recargo/${id}`),
    aplicarDescuento: (data) => api.post('/pagos/aplicar-descuento', data),
    crearPlanCuotas: (data) => api.post('/pagos/plan-cuotas', data),
    getEstadisticasAvanzadas: () => api.get('/pagos/estadisticas-avanzadas'),
    descargarComprobante: (id) => api.get(`/pagos/${id}/comprobante`, { responseType: 'blob' }),
    verArchivoComprobante: (id) => api.get(`/pagos/${id}/archivo-comprobante`, { responseType: 'blob' }),
};

// ===== MERCADO PAGO =====


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
    desinscribirAlumno: (eventoId, inscripcionId) => api.delete(`/eventos/${eventoId}/inscripcion/${inscripcionId}`),
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
    inscribirAlumno: (id, alumnoId) => api.post(`/cursos/${id}/inscribir`, { alumno_id: alumnoId }),
    desinscribirAlumno: (id, alumnoId) => api.delete(`/cursos/${id}/alumno/${alumnoId}`),
    getMyCourses: () => api.get('/cursos/mis-cursos'),
    getAllPublic: () => api.get('/public/cursos'),  // Sin autenticación — para la página pública
};

export const usuariosAPI = {
    getProfesores: () => api.get('/usuarios/profesores'),
    createProfesor: (data) => api.post('/usuarios/profesores', data),
    updateProfesor: (id, data) => api.put(`/usuarios/profesores/${id}`, data),
    deleteProfesor: (id) => api.delete(`/usuarios/profesores/${id}`),
};

// ===== EMAILS =====
export const emailsAPI = {
    test: (email) => api.post('/emails/test', { email }),
    enviarRecordatorioPago: (data) => api.post('/emails/recordatorio-pago', data),
    enviarRecordatoriosMasivos: (filtros = {}) => api.post('/emails/recordatorios-masivos', filtros),
    enviarNotificacionEvento: (data) => api.post('/emails/notificar-evento', data),
    enviarNotificacionEventoMasivo: (eventoId) => api.post(`/emails/notificar-evento-masivo/${eventoId}`),
    enviarBienvenida: (alumnoId) => api.post(`/emails/bienvenida/${alumnoId}`),
    enviarPersonalizado: (data) => api.post('/emails/personalizado', data),
    enviarMasivoPersonalizado: (data) => api.post('/emails/masivo-personalizado', data),
};

// ===== ESTADÍSTICAS =====
export const estadisticasAPI = {
    getDashboard: () => api.get('/estadisticas/dashboard'),
    getEstadoFinanciero: (params) => api.get('/estadisticas/financiero', { params }),
    getBalanceFinanciero: (mes, anio) => api.get('/estadisticas/balance-financiero', { params: { mes, anio } }),
    getAsistenciaPromedio: () => api.get('/estadisticas/asistencia-promedio'),
    getAsistenciasPorMes: (params) => api.get('/estadisticas/asistencias-por-mes', { params }),
    getMejoresAsistencias: () => api.get('/estadisticas/mejores-asistencias'),
    getDistribucionEdades: () => api.get('/estadisticas/distribucion-edades'),
    getAsistenciaPorDia: () => api.get('/estadisticas/asistencia-por-dia'),
    // Missing methods added:
    getNuevosAlumnosPorMes: () => api.get('/estadisticas/nuevos-alumnos'),
    getDistribucionPorCurso: () => api.get('/estadisticas/distribucion-cursos'),
    getCursosPopulares: () => api.get('/estadisticas/cursos-populares'),
    getTasaRetencion: () => api.get('/estadisticas/tasa-retencion'),
    // Legacy mapping if needed, or remove
    getAsistencias: (params) => api.get('/estadisticas/asistencias-por-mes', { params }),
};

// ===== GASTOS =====
export const gastosAPI = {
    getAll: (params) => api.get('/gastos', { params }),
    create: (data) => api.post('/gastos', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/gastos/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/gastos/${id}`),
    verArchivoComprobante: (id) => api.get(`/gastos/${id}/archivo-comprobante`, { responseType: 'blob' }),
};

// ===== EQUIPO (Quienes Somos) =====
export const equipoAPI = {
    getAll: () => api.get('/equipo'),
    create: (formData) => api.post('/equipo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, formData) => api.put(`/equipo/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/equipo/${id}`),
};

export const whatsappAPI = {
    enviarMensaje: (data) => api.post('/whatsapp/send', data),
    enviarRecordatorio: (pagoId) => api.post('/whatsapp/reminder', { pago_id: pagoId }),
    enviarMasivo: (data) => api.post('/whatsapp/broadcast', data),
    enviarNotificacionEvento: (data) => api.post('/whatsapp/event-notification', data),
    obtenerTemplates: () => api.get('/whatsapp/templates'),
    obtenerVariables: () => api.get('/whatsapp/variables'),
    testCron: () => api.post('/whatsapp/test-cron'),
    getStatus: () => api.get('/whatsapp/status'),
};

// ===== CLASES DE PRUEBA =====
export const clasePruebaAPI = {
    requestTrial: (data) => api.post('/prueba', data),
    getAll: () => api.get('/prueba'),
    updateStatus: (id, estado) => api.put(`/prueba/${id}/estado`, { estado }),
    delete: (id) => api.delete(`/prueba/${id}`),
    // Disponibilidad Manual
    getDisponibles: () => api.get('/prueba/disponibles'),
    addDisponibilidad: (data) => api.post('/prueba/disponibles', data),
    deleteDisponibilidad: (id) => api.delete(`/prueba/disponibles/${id}`),
};

// ===== LISTA DE ESPERA =====
export const esperaAPI = {
    join: (data) => api.post('/espera', data),
};

// ===== CONSULTAS WEB =====
export const consultasAPI = {
    create: (data) => api.post('/consultas', data),
    getAll: () => api.get('/consultas'),
    markAsRead: (id) => api.put(`/consultas/${id}/leido`),
    delete: (id) => api.delete(`/consultas/${id}`),
};

// ===== NOTIFICACIONES =====
export const notificacionesAPI = {
    getCounts: () => api.get('/notificaciones/counts'),
    getAll: () => api.get('/notificaciones'),
    markAsRead: (id) => api.put(`/notificaciones/${id}/read`),
    markAllAsRead: () => api.put('/notificaciones/read-all'),
    delete: (id) => api.delete(`/notificaciones/${id}`),
    send: (data) => api.post('/notificaciones/send', data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    }),
    getSentHistory: () => api.get('/notificaciones/sent-history'),
    deleteBatch: (batchId) => api.delete(`/notificaciones/batch/${batchId}`),
};

// ===== TIENDA / INVENTARIO =====
export const storeAPI = {
    getProductos: () => api.get('/store/productos'),
    createProducto: (data) => api.post('/store/productos', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    updateProducto: (id, data) => api.put(`/store/productos/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteProducto: (id) => api.delete(`/store/productos/${id}`),
    registrarVentaRapida: (data) => api.post('/store/venta-rapida', data),
};

export default api;
