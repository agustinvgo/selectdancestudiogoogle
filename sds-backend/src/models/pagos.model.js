const db = require('../config/db');

const PagosModel = {
    // Pagos de un alumno
    async findByAlumno(alumnoId) {
        try {
            const [rows] = await db.query(`
        SELECT p.*, c.nombre as curso_nombre, c.profesor_id, c.dia_semana, c.hora_inicio
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
        SELECT p.*, u.nombre as alumno_nombre, u.apellido as alumno_apellido,
               c.nombre as curso_nombre, c.profesor_id
        FROM pagos p
        INNER JOIN alumnos a ON p.alumno_id = a.id
                INNER JOIN usuarios u ON a.usuario_id = u.id
                LEFT JOIN cursos c ON p.curso_id = c.id
        WHERE p.estado IN ('pendiente', 'parcial', 'revision')
        ORDER BY p.fecha_vencimiento ASC
      `);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Listar pagos pendientes filtrados por mes y año
    async findPendientesByMonth(mes, anio) {
        try {
            const [rows] = await db.query(`
        SELECT p.*, u.nombre as alumno_nombre, u.apellido as alumno_apellido,
               c.nombre as curso_nombre, c.profesor_id
        FROM pagos p
        INNER JOIN alumnos a ON p.alumno_id = a.id
                INNER JOIN usuarios u ON a.usuario_id = u.id
                LEFT JOIN cursos c ON p.curso_id = c.id
        WHERE p.estado IN ('pendiente', 'parcial', 'revision')
        AND MONTH(p.fecha_vencimiento) = ?
        AND YEAR(p.fecha_vencimiento) = ?
        ORDER BY p.fecha_vencimiento ASC
      `, [mes, anio]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Todos los pagos con filtros y paginación
    async findAll(params = {}) {
        try {
            const { page, limit, estado, mes, anio, alumno_id, search } = params;

            // Base query joins
            const baseQuery = `
                FROM pagos p
                INNER JOIN alumnos a ON p.alumno_id = a.id
                INNER JOIN usuarios u ON a.usuario_id = u.id
                LEFT JOIN cursos c ON p.curso_id = c.id
            `;

            const whereClauses = [];
            const queryParams = [];

            // Filters
            if (estado && estado !== 'todos') {
                whereClauses.push('p.estado = ?');
                queryParams.push(estado);
            }

            if (mes && mes !== '0') {
                whereClauses.push('MONTH(p.fecha_vencimiento) = ?');
                queryParams.push(mes);
            }

            if (anio && anio !== '0') {
                whereClauses.push('YEAR(p.fecha_vencimiento) = ?');
                queryParams.push(anio);
            }

            if (alumno_id) {
                whereClauses.push('p.alumno_id = ?');
                queryParams.push(alumno_id);
            }

            if (search) {
                whereClauses.push('(u.nombre LIKE ? OR u.apellido LIKE ? OR p.concepto LIKE ?)');
                const term = `%${search}%`;
                queryParams.push(term, term, term);
            }

            const whereSql = whereClauses.length > 0 ? ' WHERE ' + whereClauses.join(' AND ') : '';

            // If page and limit are provided, paginate. Otherwise return all (legacy support)
            if (page && limit) {
                const offset = (parseInt(page) - 1) * parseInt(limit);

                const dataQuery = `
                    SELECT p.*, u.nombre as alumno_nombre, u.apellido as alumno_apellido, u.telefono as alumno_telefono,
                           c.nombre as curso_nombre, c.profesor_id, c.dia_semana, c.hora_inicio
                    ${baseQuery}
                    ${whereSql}
                    ORDER BY p.fecha_vencimiento DESC, p.created_at DESC
                    LIMIT ? OFFSET ?
                `; // Use separate params array for data query to include limit/offset

                const dataParams = [...queryParams, parseInt(limit), parseInt(offset)];

                const countQuery = `SELECT COUNT(*) as total ${baseQuery} ${whereSql}`;

                const [rows] = await db.query(dataQuery, dataParams);
                const [countResult] = await db.query(countQuery, queryParams);

                return {
                    data: rows,
                    total: countResult[0].total
                };
            } else {
                // Legacy non-paginated behavior (but applying filters if any)
                const query = `
                    SELECT p.*, u.nombre as alumno_nombre, u.apellido as alumno_apellido, u.telefono as alumno_telefono,
                           c.nombre as curso_nombre, c.profesor_id, c.dia_semana, c.hora_inicio
                    ${baseQuery}
                    ${whereSql}
                    ORDER BY p.created_at DESC
                `;
                const [rows] = await db.query(query, queryParams);
                return rows;
            }
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
                'SELECT * FROM pagos WHERE alumno_id = ? AND estado IN ("pendiente", "parcial", "revision")',
                [alumnoId]
            );
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Obtener estadísticas de pagos (conteo por estado)
    async getStats(params = {}) {
        try {
            const { mes, anio, alumno_id, search } = params;

            let query = `
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN p.estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                    SUM(CASE WHEN p.estado = 'pagado' THEN 1 ELSE 0 END) as pagados,
                    SUM(CASE WHEN p.estado = 'revision' THEN 1 ELSE 0 END) as revision
                FROM pagos p
                INNER JOIN alumnos a ON p.alumno_id = a.id
                INNER JOIN usuarios u ON a.usuario_id = u.id
            `;

            const whereClauses = [];
            const queryParams = [];

            if (mes && mes !== '0') {
                whereClauses.push('MONTH(p.fecha_vencimiento) = ?');
                queryParams.push(mes);
            }

            if (anio && anio !== '0') {
                whereClauses.push('YEAR(p.fecha_vencimiento) = ?');
                queryParams.push(anio);
            }

            if (alumno_id) {
                whereClauses.push('p.alumno_id = ?');
                queryParams.push(alumno_id);
            }

            if (search) {
                whereClauses.push('(u.nombre LIKE ? OR u.apellido LIKE ? OR p.concepto LIKE ?)');
                const term = `%${search}%`;
                queryParams.push(term, term, term);
            }

            if (whereClauses.length > 0) {
                query += ' WHERE ' + whereClauses.join(' AND ');
            }

            const [rows] = await db.query(query, queryParams);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Crear pago
    async create(pagoData, connection = null) {
        try {
            const dbRef = connection || db;
            const fields = [];
            const placeholders = [];
            const values = [];

            const allowedFields = [
                'alumno_id', 'curso_id', 'concepto', 'monto', 'fecha_vencimiento',
                'fecha_limite_sin_recargo', 'fecha_pago', 'estado', 'metodo_pago',
                'comprobante_url', 'observaciones', 'monto_original', 'recargo_aplicado',
                'descuento_aplicado', 'comprobante_numero', 'plan_cuotas', 'cuota_numero',
                'plan_pago_id', 'referencia_externa', 'tipo_descuento', 'notas_pago',
                'metodo_pago_realizado', 'es_mensual', 'codigo_unico'
            ];

            allowedFields.forEach(field => {
                if (pagoData[field] !== undefined) {
                    fields.push(field);
                    placeholders.push('?');
                    values.push(pagoData[field]);
                }
            });

            // Use INSERT IGNORE if codigo_unico is present to safely skip duplicates without throwing error
            const query = pagoData.codigo_unico
                ? `INSERT IGNORE INTO pagos (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`
                : `INSERT INTO pagos (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`;

            const [result] = await dbRef.query(query, values);

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
                'notas_pago', 'metodo_pago_realizado', 'es_mensual',
                'analisis_comprobante'
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

            // Total cobrado este mes (basado en fecha_vencimiento, no fecha_pago)
            // Esto permite que la tasa de cobro sea precisa: pagos que VENCEN este mes y están PAGADOS
            const [cobradoMes] = await db.query(`
                SELECT COALESCE(SUM(monto), 0) as total
                FROM pagos
                WHERE estado = 'pagado'
                AND MONTH(fecha_vencimiento) = ?
                AND YEAR(fecha_vencimiento) = ?
            `, [mesConsulta, anioConsulta]);

            // Pendientes de este mes
            const [pendientes] = await db.query(`
                SELECT COALESCE(SUM(monto), 0) as total
                FROM pagos
                WHERE estado IN ('pendiente', 'parcial', 'revision')
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
                WHERE estado IN ('pendiente', 'parcial', 'revision')
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

    // Obtener plantillas de pagos recurrentes (últimas ocurrencias de es_mensual=1)
    async findRecurringTemplates(alumnoId) {
        try {
            // Traemos todos los pagos mensuales del alumno, ordenados por fecha recientes
            // El filtrado de "último por concepto" lo haremos en JS o Controller para mayor seguridad SQL
            const [rows] = await db.query(`
                SELECT * FROM pagos 
                WHERE alumno_id = ? AND es_mensual = 1 
                ORDER BY id DESC
            `, [alumnoId]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Buscar último pago de mensualidad (Legacy or Single) de un alumno (usando flag es_mensual)
    async findLastMensualidad(alumnoId) {
        try {
            const [rows] = await db.query(`
                SELECT * FROM pagos 
                WHERE alumno_id = ? AND es_mensual = 1
                ORDER BY created_at DESC
                LIMIT 1
            `, [alumnoId]);

            // Fallback for old data: check by concept if no monthly flag found
            if (rows.length === 0) {
                const [oldRows] = await db.query(`
                    SELECT * FROM pagos 
                    WHERE alumno_id = ? AND concepto LIKE '%Mensualidad%'
                    ORDER BY created_at DESC
                    LIMIT 1
                `, [alumnoId]);
                return oldRows[0];
            }

            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Verificar si ya existe pago de mensualidad para un mes/año específico
    // Bug #3 fix: usar LOWER() y LIKE para no depender del case exacto de 'Mensualidad'
    async existsForMonth(alumnoId, mes, anio) {
        try {
            const [rows] = await db.query(`
                SELECT id FROM pagos 
                WHERE alumno_id = ? 
                AND (LOWER(concepto) LIKE '%mensualidad%' OR es_mensual = 1)
                AND MONTH(fecha_vencimiento) = ?
                AND YEAR(fecha_vencimiento) = ?
                AND estado != 'pagado'
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
                    DATE_FORMAT(fecha_vencimiento, '%Y-%m') as mes,
                    MONTHNAME(fecha_vencimiento) as nombre_mes,
                    SUM(monto) as total
                FROM pagos
                WHERE estado = 'pagado'
                    AND fecha_vencimiento >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY DATE_FORMAT(fecha_vencimiento, '%Y-%m'), MONTHNAME(fecha_vencimiento)
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
                    u.nombre,
                    u.apellido,
                    COUNT(p.id) as pagos_realizados,
                    SUM(p.monto) as total_pagado
                FROM alumnos a
                INNER JOIN usuarios u ON a.usuario_id = u.id
                INNER JOIN pagos p ON a.id = p.alumno_id
                WHERE p.estado = 'pagado'
                    AND p.fecha_pago >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                GROUP BY a.id, u.nombre, u.apellido
                ORDER BY total_pagado DESC
                LIMIT 10
            `);

            // Top 10 morosos
            const [morosos] = await db.query(`
                SELECT 
                    u.nombre,
                    u.apellido,
                    COUNT(p.id) as pagos_vencidos,
                    SUM(p.monto) as deuda_total
                FROM alumnos a
                INNER JOIN usuarios u ON a.usuario_id = u.id
                INNER JOIN pagos p ON a.id = p.alumno_id
                WHERE p.estado IN ('pendiente', 'parcial')
                    AND p.fecha_vencimiento < CURDATE()
                GROUP BY a.id, u.nombre, u.apellido
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
    },

    // Verificar si ya existe un pago con el mismo concepto para el mes/año
    async checkDuplicate(alumnoId, concepto, mes, anio) {
        try {
            const [rows] = await db.query(`
                SELECT id FROM pagos 
                WHERE alumno_id = ? 
                AND concepto = ? 
                AND MONTH(fecha_vencimiento) = ? 
                AND YEAR(fecha_vencimiento) = ?
            `, [alumnoId, concepto, mes, anio]);
            return rows.length > 0;
        } catch (error) {
            throw error;
        }
    },

    // Buscar pagos por vencer (para notificaciones)
    async findPorVencer(dias) {
        try {
            const fechaObjetivo = new Date();
            fechaObjetivo.setDate(fechaObjetivo.getDate() + dias);
            const fechaStr = fechaObjetivo.toISOString().split('T')[0];

            const [rows] = await db.query(`
                SELECT p.*, u.nombre, u.apellido, u.telefono, u.email
                FROM pagos p
                INNER JOIN alumnos a ON p.alumno_id = a.id
                INNER JOIN usuarios u ON a.usuario_id = u.id
                WHERE p.estado = 'pendiente' 
                AND p.fecha_vencimiento = ?
                AND u.telefono IS NOT NULL
                AND u.activo = 1
            `, [fechaStr]);

            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Buscar pagos vencidos hace X días
    async findVencidos(dias) {
        try {
            const fechaObjetivo = new Date();
            fechaObjetivo.setDate(fechaObjetivo.getDate() - dias);
            const fechaStr = fechaObjetivo.toISOString().split('T')[0];

            const [rows] = await db.query(`
                SELECT p.*, u.nombre, u.apellido, u.telefono, u.email
                FROM pagos p
                INNER JOIN alumnos a ON p.alumno_id = a.id
                INNER JOIN usuarios u ON a.usuario_id = u.id
                WHERE p.estado = 'pendiente' 
                AND p.fecha_vencimiento = ?
                AND u.telefono IS NOT NULL
                AND u.activo = 1
            `, [fechaStr]);

            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Generar pagos masivos (Internal Logic for Cron and Controller)
    async generarMasivosInternal(mes, anio) {
        const AlumnosModel = require('./alumnos.model'); // Require inside to avoid circular dependency issues if any

        console.log(`[PagosModel] Iniciando generarMasivosInternal para ${mes}/${anio}`);

        const alumnos = await AlumnosModel.findAll();
        let generados = 0;
        let omitidos = 0;
        let errores = 0;
        let inactivos = 0;

        for (const alumno of alumnos) {
            if (!alumno.usuario_activo) {
                inactivos++;
                continue;
            }

            try {
                // 1. Buscar templates recurrentes
                const templates = await this.findRecurringTemplates(alumno.id);
                const conceptosUnicos = {};

                templates.forEach(t => {
                    if (!conceptosUnicos[t.concepto]) {
                        conceptosUnicos[t.concepto] = t;
                    }
                });

                const listaTemplates = Object.values(conceptosUnicos);

                // Fallback Legacy
                if (listaTemplates.length === 0) {
                    const ultimoPago = await this.findLastMensualidad(alumno.id);
                    if (ultimoPago) {
                        listaTemplates.push(ultimoPago);
                    }
                }

                if (listaTemplates.length === 0) continue;

                for (const template of listaTemplates) {
                    // Generar CODIGO UNICO determinista
                    const conceptoClean = template.concepto.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 10);
                    const mesStr = String(mes).padStart(2, '0');
                    const codigoUnico = `MENS-${anio}${mesStr}-${alumno.id}-${conceptoClean}`;

                    // Calcular fechas locales
                    const fechaVencimiento = new Date(anio, mes - 1, 10);
                    const fechaLimite = new Date(anio, mes - 1, 8);

                    // Función local para YYYY-MM-DD sin desfase UTC
                    const dateToStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

                    const insertId = await this.create({
                        alumno_id: alumno.id,
                        concepto: template.concepto,
                        monto: template.monto,
                        monto_original: template.monto,
                        fecha_vencimiento: dateToStr(fechaVencimiento),
                        fecha_limite_sin_recargo: dateToStr(fechaLimite),
                        estado: 'pendiente',
                        es_mensual: 1,
                        codigo_unico: codigoUnico
                    });

                    if (insertId) {
                        console.log(`[PagosModel] ✅ Generado: ${template.concepto} para ${alumno.nombre} (${codigoUnico})`);
                        generados++;
                    } else {
                        console.log(`[PagosModel] ⏭️ Omitido (Ya existe): ${codigoUnico}`);
                        omitidos++;
                    }
                }
            } catch (err) {
                console.error(`Error generando para alumno ${alumno.id}:`, err);
                errores++;
            }
        }

        return { generados, omitidos, inactivos, errores };
    },

    // Eliminar pago por ID
    async delete(id) {
        try {
            const [result] = await db.query('DELETE FROM pagos WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = PagosModel;
