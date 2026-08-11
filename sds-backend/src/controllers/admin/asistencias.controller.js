const AsistenciasModel = require('../../models/asistencias.model');
const AlumnosModel = require('../../models/alumnos.model');
const ResponsablesAlumnosModel = require('../../models/responsables-alumnos.model');

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const isValidIsoDate = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return parsed.getUTCFullYear() === year
        && parsed.getUTCMonth() === month - 1
        && parsed.getUTCDate() === day;
};

const normalizeAttendance = (raw = {}) => {
    const alumnoId = Number(raw.alumno_id);
    const cursoId = Number(raw.curso_id);
    const presenteValido = raw.presente === true || raw.presente === false
        || raw.presente === 1 || raw.presente === 0;

    if (!Number.isInteger(alumnoId) || alumnoId <= 0
        || !Number.isInteger(cursoId) || cursoId <= 0
        || !isValidIsoDate(raw.fecha) || !presenteValido) {
        throw createHttpError('Datos de asistencia inválidos', 400);
    }

    return {
        alumno_id: alumnoId,
        curso_id: cursoId,
        fecha: raw.fecha,
        presente: raw.presente === true || raw.presente === 1 ? 1 : 0,
        observaciones: typeof raw.observaciones === 'string'
            ? raw.observaciones.trim().slice(0, 2000) || null
            : null
    };
};

const sendError = (res, error, fallbackMessage) => {
    console.error(`[Asistencias] ${fallbackMessage}:`, error);
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.statusCode ? error.message : fallbackMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
};

const AsistenciasController = {
    // Obtener asistencias de un alumno
    async getByAlumno(req, res) {
        try {
            const { id } = req.params;
            const { mes, anio } = req.query;

            const asistencias = await AsistenciasModel.findByAlumno(
                id,
                mes ? parseInt(mes) : null,
                anio ? parseInt(anio) : null
            );

            // Obtener estadísticas
            const estadisticas = await AsistenciasModel.getEstadisticas(
                id,
                mes ? parseInt(mes) : null,
                anio ? parseInt(anio) : null
            );

            res.json({
                success: true,
                data: {
                    asistencias,
                    estadisticas
                }
            });
        } catch (error) {
            console.error('Error obteniendo asistencias:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Obtener MIS asistencias (alumno logueado - usa JWT para encontrar su alumno)
    async getMisAsistencias(req, res) {
        try {
            const usuarioId = req.user.id;
            const { mes, anio } = req.query;
            const alumnoId = Number(req.query.alumno_id);
            if (alumnoId && !(await ResponsablesAlumnosModel.canAccessAlumno(usuarioId, alumnoId))) {
                return res.status(403).json({ success: false, message: 'Acceso denegado' });
            }
            const alumno = alumnoId
                ? await AlumnosModel.findById(alumnoId)
                : await AlumnosModel.findByUsuarioId(usuarioId);
            if (!alumno) {
                return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
            }
            const id = alumno.id;
            const asistencias = await AsistenciasModel.findByAlumno(
                id,
                mes ? parseInt(mes) : null,
                anio ? parseInt(anio) : null
            );
            const estadisticas = await AsistenciasModel.getEstadisticas(
                id,
                mes ? parseInt(mes) : null,
                anio ? parseInt(anio) : null
            );
            res.json({ success: true, data: { asistencias, estadisticas } });
        } catch (error) {
            console.error('Error obteniendo mis asistencias:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Obtener historia de asistencias (para gráfico)
    async getHistoria(req, res) {
        try {
            const { id } = req.params;
            const historia = await AsistenciasModel.getAsistenciaHistorica(id);

            res.json({
                success: true,
                data: historia
            });
        } catch (error) {
            console.error('Error obteniendo historia de asistencias:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Obtener lista de asistencia de un curso en una fecha
    async getByCurso(req, res) {
        try {
            const id = Number(req.params.id);
            const { fecha } = req.query;

            if (!Number.isInteger(id) || id <= 0 || !isValidIsoDate(fecha)) {
                throw createHttpError('Curso o fecha inválidos', 400);
            }
            if (!(await AsistenciasModel.canManageCourse(req.user, id))) {
                throw createHttpError('No tienes permisos para consultar este curso', 403);
            }

            const asistencias = await AsistenciasModel.findByCurso(id, fecha);

            res.json({
                success: true,
                data: asistencias
            });
        } catch (error) {
            sendError(res, error, 'Error al obtener las asistencias del curso');
        }
    },

    // Marcar asistencia individual
    async marcarAsistencia(req, res) {
        try {
            const asistencia = normalizeAttendance(req.body);
            const id = await AsistenciasModel.marcarAsistencia(asistencia, req.user);

            res.json({
                success: true,
                message: 'Asistencia registrada exitosamente',
                data: { id }
            });
        } catch (error) {
            sendError(res, error, 'Error al registrar la asistencia');
        }
    },

    // Marcar asistencias masivas
    async marcarAsistenciasMasivas(req, res) {
        try {
            const { asistencias } = req.body;

            if (!Array.isArray(asistencias) || asistencias.length === 0 || asistencias.length > 1000) {
                throw createHttpError('Se requiere entre 1 y 1000 asistencias', 400);
            }
            const normalizedAttendances = asistencias.map(normalizeAttendance);

            await AsistenciasModel.marcarAsistenciasMasivas(normalizedAttendances, req.user);

            res.json({
                success: true,
                message: 'Asistencias registradas exitosamente'
            });
        } catch (error) {
            sendError(res, error, 'Error al registrar las asistencias');
        }
    }
};

module.exports = AsistenciasController;
