const AsistenciasModel = require('../models/asistencias.model');

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
                error: error.message
            });
        }
    },

    // Obtener lista de asistencia de un curso en una fecha
    async getByCurso(req, res) {
        try {
            const { id } = req.params;
            const { fecha } = req.query;

            if (!fecha) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha es requerida'
                });
            }

            const asistencias = await AsistenciasModel.findByCurso(id, fecha);

            res.json({
                success: true,
                data: asistencias
            });
        } catch (error) {
            console.error('Error obteniendo asistencias del curso:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Marcar asistencia individual
    async marcarAsistencia(req, res) {
        try {
            const { alumno_id, curso_id, fecha, presente, observaciones } = req.body;

            if (!alumno_id || !curso_id || !fecha || presente === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'alumno_id, curso_id, fecha y presente son requeridos'
                });
            }

            const id = await AsistenciasModel.marcarAsistencia({
                alumno_id,
                curso_id,
                fecha,
                presente,
                observaciones
            });

            res.json({
                success: true,
                message: 'Asistencia registrada exitosamente',
                data: { id }
            });
        } catch (error) {
            console.error('Error marcando asistencia:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Marcar asistencias masivas
    async marcarAsistenciasMasivas(req, res) {
        try {
            const { asistencias } = req.body;

            if (!asistencias || !Array.isArray(asistencias)) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere un array de asistencias'
                });
            }

            await AsistenciasModel.marcarAsistenciasMasivas(asistencias);

            res.json({
                success: true,
                message: 'Asistencias registradas exitosamente'
            });
        } catch (error) {
            console.error('Error marcando asistencias masivas:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
};

module.exports = AsistenciasController;
