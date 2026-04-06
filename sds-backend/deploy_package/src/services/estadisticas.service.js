const db = require('../config/db');

class EstadisticasService {
    
    // Balance Financiero (Ingresos vs Gastos)
    static async getBalanceFinanciero(mes, anio) {
        const currentMonth = mes || new Date().getMonth() + 1;
        const currentYear = anio || new Date().getFullYear();

        const [viewResult] = await db.query(`
            SELECT ingresos_pagos, ingresos_tienda, total_gastos, balance_neto 
            FROM vw_balance_financiero 
            WHERE mes = ? AND anio = ?
        `, [currentMonth, currentYear]);

        let totalIngresos = 0, totalGastos = 0, balanceNeto = 0;
        if (viewResult.length > 0) {
            totalIngresos = parseFloat(viewResult[0].ingresos_pagos) + parseFloat(viewResult[0].ingresos_tienda);
            totalGastos = parseFloat(viewResult[0].total_gastos);
            balanceNeto = parseFloat(viewResult[0].balance_neto);
        }

        return { ingresos: totalIngresos, gastos: totalGastos, balance: balanceNeto, mes: currentMonth, anio: currentYear };
    }

    // Asistencia Promedio General
    static async getAsistenciaPromedio() {
        const [rows] = await db.query(`
            SELECT 
                COUNT(*) as total_registros,
                SUM(CASE WHEN presente = 1 THEN 1 ELSE 0 END) as presentes,
                SUM(CASE WHEN presente = 0 THEN 1 ELSE 0 END) as ausentes,
                ROUND((SUM(CASE WHEN presente = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as porcentaje_asistencia
            FROM asistencias
            WHERE YEAR(fecha) = YEAR(CURDATE())
        `);
        return rows[0];
    }

    // Asistencias Mes a Mes (Últimos 12 meses)
    static async getAsistenciasPorMes() {
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
        return rows;
    }

    // Top 5 Cursos Populares
    static async getCursosPopulares() {
        const [rows] = await db.query(`
            SELECT 
                c.id, c.nombre, u.nombre as profesor_nombre, u.apellido as profesor_apellido,
                c.dia_semana, c.cupo_maximo, COUNT(ic.id) as alumnos_inscritos,
                ROUND((COUNT(ic.id) / c.cupo_maximo) * 100, 2) as porcentaje_ocupacion
            FROM cursos c
            LEFT JOIN usuarios u ON c.profesor_id = u.id
            LEFT JOIN inscripciones_curso ic ON c.id = ic.curso_id AND ic.activo = 1
            WHERE c.activo = 1
            GROUP BY c.id
            ORDER BY alumnos_inscritos DESC
            LIMIT 5
        `);
        return rows;
    }

    // Tasa de Retencion Anual (Vista DB)
    static async getTasaRetencion() {
        const [rows] = await db.query(`SELECT * FROM vw_retencion_alumnos`);
        return rows[0];
    }

    // Nuevos Alumnos mes a mes (Últimos 6 meses)
    static async getNuevosAlumnosPorMes() {
        const [rows] = await db.query(`
            SELECT DATE_FORMAT(created_at, '%Y-%m') as mes, COUNT(*) as nuevos_alumnos
            FROM alumnos
            WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY mes ASC
        `);
        return rows;
    }

    // Distribución por Curso (Torta)
    static async getDistribucionPorCurso() {
        const [rows] = await db.query(`
            SELECT c.nombre as curso, COUNT(ic.id) as cantidad_alumnos
            FROM cursos c
            LEFT JOIN inscripciones_curso ic ON c.id = ic.curso_id AND ic.activo = 1
            WHERE c.activo = 1
            GROUP BY c.id, c.nombre
            HAVING cantidad_alumnos > 0
            ORDER BY cantidad_alumnos DESC
        `);
        return rows;
    }

    // Top 5 Mejores Asistencias Deportivas
    static async getMejoresAsistencias() {
        const [rows] = await db.query(`
            SELECT 
                u.nombre, u.apellido, c.nombre as curso, COUNT(*) as total_clases,
                SUM(CASE WHEN asis.presente = 1 THEN 1 ELSE 0 END) as asistencias,
                ROUND((SUM(CASE WHEN asis.presente = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as asistencia
            FROM asistencias asis
            JOIN alumnos a ON asis.alumno_id = a.id
            JOIN usuarios u ON a.usuario_id = u.id
            LEFT JOIN cursos c ON asis.curso_id = c.id
            WHERE asis.fecha >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH) AND u.activo = 1
            GROUP BY a.id, u.nombre, u.apellido, c.nombre
            HAVING total_clases >= 4
            ORDER BY asistencia DESC
            LIMIT 5
        `);
        return rows;
    }

    // Distribucion Demográfica (Edades)
    static async getDistribucionEdades() {
        const [rows] = await db.query(`
            SELECT 
                CASE 
                    WHEN TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) BETWEEN 0 AND 5 THEN '0-5'
                    WHEN TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) BETWEEN 6 AND 12 THEN '6-12'
                    WHEN TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) BETWEEN 13 AND 17 THEN '13-17'
                    WHEN TIMESTAMPDIFF(YEAR, fecha_nacimiento, CURDATE()) BETWEEN 18 AND 25 THEN '18-25'
                    ELSE '26+' 
                END as rango_edad,
                COUNT(*) as cantidad
            FROM alumnos a
            JOIN usuarios u ON a.usuario_id = u.id
            WHERE u.activo = 1 AND a.fecha_nacimiento IS NOT NULL
            GROUP BY rango_edad
            ORDER BY 
                CASE rango_edad
                    WHEN '0-5' THEN 1 WHEN '6-12' THEN 2 WHEN '13-17' THEN 3 WHEN '18-25' THEN 4 WHEN '26+' THEN 5
                END
        `);
        return rows;
    }

    // Asistencia por dia de la semana (L a S)
    static async getAsistenciaPorDia() {
        const [rows] = await db.query(`
            SELECT 
                DAYOFWEEK(fecha) as dia_numero,
                CASE DAYOFWEEK(fecha)
                    WHEN 1 THEN 'Domingo' WHEN 2 THEN 'Lunes' WHEN 3 THEN 'Martes' WHEN 4 THEN 'Miércoles'
                    WHEN 5 THEN 'Jueves' WHEN 6 THEN 'Viernes' WHEN 7 THEN 'Sábado'
                END as dia_nombre,
                COUNT(*) as total_clases,
                SUM(CASE WHEN presente = 1 THEN 1 ELSE 0 END) as asistencias,
                ROUND((SUM(CASE WHEN presente = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 1) as porcentaje_asistencia
            FROM asistencias
            WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
            GROUP BY dia_numero, dia_nombre
            ORDER BY dia_numero ASC
        `);

        const rowsMap = new Map();
        rows.forEach(row => rowsMap.set(row.dia_numero, row));

        const fullWeekData = [];
        const dayNames = { 2: 'Lunes', 3: 'Martes', 4: 'Miércoles', 5: 'Jueves', 6: 'Viernes', 7: 'Sábado' };

        for (let i = 2; i <= 7; i++) {
            if (rowsMap.has(i)) fullWeekData.push(rowsMap.get(i));
            else fullWeekData.push({ dia_numero: i, dia_nombre: dayNames[i], total_clases: 0, asistencias: 0, porcentaje_asistencia: 0 });
        }

        return fullWeekData;
    }
}

module.exports = EstadisticasService;
