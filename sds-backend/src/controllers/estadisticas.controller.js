const db = require('../config/db');

const EstadisticasController = {
    // Obtener asistencia promedio general
    async getAsistenciaPromedio(req, res) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    COUNT(*) as total_registros,
                    SUM(CASE WHEN presente = 1 THEN 1 ELSE 0 END) as presentes,
                    SUM(CASE WHEN presente = 0 THEN 1 ELSE 0 END) as ausentes,
                    ROUND((SUM(CASE WHEN presente = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as porcentaje_asistencia
                FROM asistencias
                WHERE YEAR(fecha) = YEAR(CURDATE())
            `);

            res.json({
                success: true,
                data: rows[0]
            });
        } catch (error) {
            console.error('Error obteniendo asistencia promedio:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener asistencia promedio',
                error: error.message
            });
        }
    },

    // Obtener asistencias por mes (últimos 12 meses)
    async getAsistenciasPorMes(req, res) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    DATE_FORMAT(fecha, '%Y-%m') as mes,
                    COUNT(*) as total_registros,
                    SUM(CASE WHEN presente = 1 THEN 1 ELSE 0 END) as presentes,
                    ROUND((SUM(CASE WHEN presente = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as porcentaje
                FROM asistencias
                WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY DATE_FORMAT(fecha, '%Y-%m')
                ORDER BY mes ASC
            `);

            res.json({
                success: true,
                data: rows
            });
        } catch (error) {
            console.error('Error obteniendo asistencias por mes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener asistencias por mes',
                error: error.message
            });
        }
    },

    // Obtener cursos más populares (top 5)
    async getCursosPopulares(req, res) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    c.id,
                    c.nombre,
                    c.profesor,
                    c.dia_semana,
                    c.cupo_maximo,
                    COUNT(ic.id) as alumnos_inscritos,
                    ROUND((COUNT(ic.id) / c.cupo_maximo) * 100, 2) as porcentaje_ocupacion
                FROM cursos c
                LEFT JOIN inscripciones_curso ic ON c.id = ic.curso_id AND ic.activo = 1
                WHERE c.activo = 1
                GROUP BY c.id
                ORDER BY alumnos_inscritos DESC
                LIMIT 5
            `);

            res.json({
                success: true,
                data: rows
            });
        } catch (error) {
            console.error('Error obteniendo cursos populares:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener cursos populares',
                error: error.message
            });
        }
    },

    // Obtener tasa de retención de alumnos
    async getTasaRetencion(req, res) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    COUNT(*) as total_alumnos,
                    SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as alumnos_activos,
                    SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as alumnos_inactivos,
                    ROUND((SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as tasa_retencion
                FROM alumnos
            `);

            res.json({
                success: true,
                data: rows[0]
            });
        } catch (error) {
            console.error('Error obteniendo tasa de retención:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener tasa de retención',
                error: error.message
            });
        }
    },

    // Obtener nuevos alumnos por mes (últimos 6 meses)
    async getNuevosAlumnosPorMes(req, res) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    DATE_FORMAT(fecha_inscripcion, '%Y-%m') as mes,
                    COUNT(*) as nuevos_alumnos
                FROM alumnos
                WHERE fecha_inscripcion >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(fecha_inscripcion, '%Y-%m')
                ORDER BY mes ASC
            `);

            res.json({
                success: true,
                data: rows
            });
        } catch (error) {
            console.error('Error obteniendo nuevos alumnos por mes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener nuevos alumnos por mes',
                error: error.message
            });
        }
    },

    // Obtener distribución de alumnos por curso (para gráfico de torta)
    async getDistribucionPorCurso(req, res) {
        try {
            const [rows] = await db.query(`
                SELECT 
                    c.nombre as curso,
                    COUNT(ic.id) as cantidad_alumnos
                FROM cursos c
                LEFT JOIN inscripciones_curso ic ON c.id = ic.curso_id AND ic.activo = 1
                WHERE c.activo = 1
                GROUP BY c.id, c.nombre
                HAVING cantidad_alumnos > 0
                ORDER BY cantidad_alumnos DESC
            `);

            res.json({
                success: true,
                data: rows
            });
        } catch (error) {
            console.error('Error obteniendo distribución por curso:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener distribución por curso',
                error: error.message
            });
        }
    }
};

module.exports = EstadisticasController;
