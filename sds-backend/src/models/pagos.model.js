const db = require('../config/db');

const PagosModel = {
    // Pagos de un alumno
    async findByAlumno(alumnoId) {
        try {
            const [rows] = await db.query(`
        SELECT p.*, c.nombre as curso_nombre, c.profesor, c.dia_semana, c.hora_inicio
        FROM pagos p
        LEFT JOIN cursos c ON p.curso_id = c.id
        WHERE p.alumno_id = ?
        ORDER BY p.fecha_vencimiento DESC, p.created_at DESC
      `, [alumnoId]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Listar pagos pendientes
    async findPendientes() {
        try {
            const [rows] = await db.query(`
        SELECT p.*, a.nombre as alumno_nombre, a.apellido as alumno_apellido,
               c.nombre as curso_nombre, c.profesor
        FROM pagos p
        INNER JOIN alumnos a ON p.alumno_id = a.id
        LEFT JOIN cursos c ON p.curso_id = c.id
        WHERE p.estado IN ('pendiente', 'parcial')
        ORDER BY p.fecha_vencimiento ASC
      `);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Todos los pagos con filtros
    async findAll(estado = null) {
        try {
            let query = `
        SELECT p.*, a.nombre as alumno_nombre, a.apellido as alumno_apellido,
               c.nombre as curso_nombre, c.profesor, c.dia_semana, c.hora_inicio
        FROM pagos p
        INNER JOIN alumnos a ON p.alumno_id = a.id
        LEFT JOIN cursos c ON p.curso_id = c.id
      `;
            const params = [];

            if (estado) {
                query += ' WHERE p.estado = ?';
                params.push(estado);
            }

            query += ' ORDER BY p.created_at DESC';

            const [rows] = await db.query(query, params);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Buscar pago por ID
    async findById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM pagos WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Buscar pagos pendientes de un alumno
    async findPendientesByAlumno(alumnoId) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM pagos WHERE alumno_id = ? AND estado IN ("pendiente", "parcial")',
                [alumnoId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Crear pago
    async create(pagoData) {
        try {
            const fields = [];
            const placeholders = [];
            const values = [];

            const allowedFields = [
                'alumno_id', 'curso_id', 'concepto', 'monto', 'fecha_vencimiento',
                'fecha_limite_sin_recargo', 'fecha_pago', 'estado', 'metodo_pago',
                'comprobante_url', 'observaciones', 'monto_original', 'recargo_aplicado',
                'descuento_aplicado', 'comprobante_numero', 'plan_cuotas', 'cuota_numero',
                'plan_pago_id', 'referencia_externa', 'tipo_descuento', 'notas_pago',
                'metodo_pago_realizado'
            ];

            allowedFields.forEach(field => {
                if (pagoData[field] !== undefined) {
                    fields.push(field);
                    placeholders.push('?');
                    values.push(pagoData[field]);
                }
            });

            const [result] = await db.query(
                `INSERT INTO pagos (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`,
                values
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar pago
    async update(id, pagoData) {
        try {
            const fields = [];
            const values = [];

            const allowedFields = [
                'curso_id', 'concepto', 'monto', 'fecha_vencimiento',
                'fecha_limite_sin_recargo', 'fecha_pago', 'estado',
                'metodo_pago', 'comprobante_url', 'observaciones',
                'monto_original', 'recargo_aplicado', 'descuento_aplicado',
                'comprobante_numero', 'plan_cuotas', 'cuota_numero',
                'plan_pago_id', 'referencia_externa', 'tipo_descuento',
                'notas_pago', 'metodo_pago_realizado'
            ];

            allowedFields.forEach(field => {
                if (pagoData[field] !== undefined) {
                    fields.push(`${field} = ?`);
                    values.push(pagoData[field]);
                }
            });

            if (fields.length === 0) return false;

            values.push(id);
            const [result] = await db.query(
                `UPDATE pagos SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Obtener estado financiero general
    async getEstadoFinanciero(mes = null, anio = null) {
        try {
            // Si no se especifica mes/año, usar el actual
            const mesConsulta = mes || new Date().getMonth() + 1;
            const anioConsulta = anio || new Date().getFullYear();

            // Total a cobrar este mes (basado en fecha_vencimiento)
            const [totalMes] = await db.query(`
                SELECT COALESCE(SUM(monto), 0) as total
                FROM pagos
                WHERE MONTH(fecha_vencimiento) = ?
                AND YEAR(fecha_vencimiento) = ?
            `, [mesConsulta, anioConsulta]);

            // Total cobrado este mes (basado en fecha_pago)
            const [cobradoMes] = await db.query(`
                SELECT COALESCE(SUM(monto), 0) as total
                FROM pagos
                WHERE estado = 'pagado'
                AND MONTH(fecha_pago) = ?
                AND YEAR(fecha_pago) = ?
            `, [mesConsulta, anioConsulta]);

            // Pendientes de este mes
            const [pendientes] = await db.query(`
                SELECT COALESCE(SUM(monto), 0) as total
                FROM pagos
                WHERE estado IN ('pendiente', 'parcial')
                AND MONTH(fecha_vencimiento) = ?
                AND YEAR(fecha_vencimiento) = ?
            `, [mesConsulta, anioConsulta]);

            // Ingresos por mes (últimos 6 meses)
            const [ingresosMensuales] = await db.query(`
                SELECT 
                    DATE_FORMAT(fecha_pago, '%Y-%m') as mes,
                    SUM(monto) as total
                FROM pagos
                WHERE estado = 'pagado'
                AND fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(fecha_pago, '%Y-%m')
                ORDER BY mes ASC
            `);

            // Vencidos de este mes
            const [vencidos] = await db.query(`
                SELECT COALESCE(SUM(monto), 0) as total
                FROM pagos
                WHERE estado IN ('pendiente', 'parcial')
                AND fecha_vencimiento < CURDATE()
                AND MONTH(fecha_vencimiento) = ?
                AND YEAR(fecha_vencimiento) = ?
            `, [mesConsulta, anioConsulta]);

            return {
                totalMes: totalMes[0].total,
                cobradoMes: cobradoMes[0].total,
                pendientes: pendientes[0].total,
                vencidos: vencidos[0].total,
                ingresosMensuales
            };
        } catch (error) {
            throw error;
        }
    },

    // Buscar último pago de mensualidad de un alumno
    async findLastMensualidad(alumnoId) {
        try {
            const [rows] = await db.query(`
                SELECT * FROM pagos 
                WHERE alumno_id = ? AND concepto = 'Mensualidad'
                ORDER BY created_at DESC
                LIMIT 1
            `, [alumnoId]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Verificar si ya existe pago de mensualidad para un mes/año específico
    async existsForMonth(alumnoId, mes, anio) {
        try {
            // Buscamos pagos que venzan en ese mes/año
            const [rows] = await db.query(`
                SELECT id FROM pagos 
                WHERE alumno_id = ? 
                AND concepto = 'Mensualidad'
                AND MONTH(fecha_vencimiento) = ?
                AND YEAR(fecha_vencimiento) = ?
            `, [alumnoId, mes, anio]);
            return rows.length > 0;
        } catch (error) {
            throw error;
        }
    },

    // Estadísticas avanzadas para dashboard
    async getEstadisticasAvanzadas() {
        try {
            // Ingresos por mes (últimos 6 meses)
            const [ingresosPorMes] = await db.query(`
                SELECT 
                    DATE_FORMAT(fecha_pago, '%Y-%m') as mes,
                    MONTHNAME(fecha_pago) as nombre_mes,
                    SUM(monto) as total
                FROM pagos
                WHERE estado = 'pagado'
                    AND fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(fecha_pago, '%Y-%m'), MONTHNAME(fecha_pago)
                ORDER BY mes ASC
            `);

            // Distribución por método de pago
            const [metodosPago] = await db.query(`
                SELECT 
                    COALESCE(metodo_pago_realizado, 'No especificado') as metodo,
                    COUNT(*) as cantidad,
                    SUM(monto) as total
                FROM pagos
                WHERE estado = 'pagado'
                    AND fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
                GROUP BY metodo_pago_realizado
                ORDER BY total DESC
            `);

            // Evolución de morosidad (últimos 6 meses)
            const [morosidad] = await db.query(`
                SELECT 
                    DATE_FORMAT(fecha_vencimiento, '%Y-%m') as mes,
                    COUNT(*) as total_vencidos,
                    SUM(monto) as monto_vencido
                FROM pagos
                WHERE estado IN ('pendiente', 'parcial')
                    AND fecha_vencimiento < CURDATE()
                    AND fecha_vencimiento >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(fecha_vencimiento, '%Y-%m')
                ORDER BY mes ASC
            `);

            // Top 10 mejores pagadores
            const [mejoresPagadores] = await db.query(`
                SELECT 
                    a.nombre,
                    a.apellido,
                    COUNT(p.id) as pagos_realizados,
                    SUM(p.monto) as total_pagado
                FROM alumnos a
                INNER JOIN pagos p ON a.id = p.alumno_id
                WHERE p.estado = 'pagado'
                    AND p.fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY a.id, a.nombre, a.apellido
                ORDER BY total_pagado DESC
                LIMIT 10
            `);

            // Top 10 morosos
            const [morosos] = await db.query(`
                SELECT 
                    a.nombre,
                    a.apellido,
                    COUNT(p.id) as pagos_vencidos,
                    SUM(p.monto) as deuda_total
                FROM alumnos a
                INNER JOIN pagos p ON a.id = p.alumno_id
                WHERE p.estado IN ('pendiente', 'parcial')
                    AND p.fecha_vencimiento < CURDATE()
                GROUP BY a.id, a.nombre, a.apellido
                ORDER BY deuda_total DESC
                LIMIT 10
            `);

            // Resumen de recargos y descuentos
            const [recargoDescuento] = await db.query(`
                SELECT 
                    SUM(recargo_aplicado) as total_recargos,
                    SUM(descuento_aplicado) as total_descuentos,
                    COUNT(DISTINCT CASE WHEN recargo_aplicado > 0 THEN id END) as pagos_con_recargo,
                    COUNT(DISTINCT CASE WHEN descuento_aplicado > 0 THEN id END) as pagos_con_descuento
                FROM pagos
                WHERE fecha_vencimiento >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            `);

            return {
                ingresosPorMes,
                metodosPago,
                morosidad,
                mejoresPagadores,
                morosos,
                recargoDescuento: recargoDescuento[0]
            };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = PagosModel;
