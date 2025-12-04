const PagosModel = require('../models/pagos.model');
const AlumnosModel = require('../models/alumnos.model');
const PDFService = require('../services/pdf.service');

const PagosController = {
    // Obtener pagos de un alumno
    async getByAlumno(req, res) {
        try {
            const { id } = req.params;
            const pagos = await PagosModel.findByAlumno(id);

            res.json({
                success: true,
                data: pagos
            });
        } catch (error) {
            console.error('Error obteniendo pagos:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Obtener todos los pagos con filtros
    async getAll(req, res) {
        try {
            const { estado } = req.query;
            const pagos = await PagosModel.findAll(estado);

            res.json({
                success: true,
                data: pagos
            });
        } catch (error) {
            console.error('Error obteniendo pagos:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Obtener pagos pendientes
    async getPendientes(req, res) {
        try {
            const pagos = await PagosModel.findPendientes();

            res.json({
                success: true,
                data: pagos
            });
        } catch (error) {
            console.error('Error obteniendo pagos pendientes:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    async create(req, res) {
        try {
            const pagoData = req.body;

            if (!pagoData.alumno_id || !pagoData.concepto || !pagoData.monto || !pagoData.fecha_vencimiento) {
                return res.status(400).json({
                    success: false,
                    message: 'alumno_id, concepto, monto y fecha_vencimiento son requeridos'
                });
            }

            // If fecha_limite_sin_recargo is not provided, default to 2 days before vencimiento
            if (!pagoData.fecha_limite_sin_recargo && pagoData.fecha_vencimiento) {
                const vencimiento = new Date(pagoData.fecha_vencimiento);
                vencimiento.setDate(vencimiento.getDate() - 2);
                pagoData.fecha_limite_sin_recargo = vencimiento.toISOString().split('T')[0];
            }

            const id = await PagosModel.create(pagoData);

            res.status(201).json({
                success: true,
                message: 'Pago registrado exitosamente',
                data: { id }
            });
        } catch (error) {
            console.error('Error creando pago:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Actualizar pago
    async update(req, res) {
        try {
            const { id } = req.params;
            const pagoData = req.body;

            const updated = await PagosModel.update(id, pagoData);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Pago no encontrado o sin cambios'
                });
            }

            res.json({
                success: true,
                message: 'Pago actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando pago:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Obtener estado financiero general
    async getEstadoFinanciero(req, res) {
        try {
            const { mes, anio } = req.query;
            const estado = await PagosModel.getEstadoFinanciero(
                mes ? parseInt(mes) : null,
                anio ? parseInt(anio) : null
            );

            res.json({
                success: true,
                data: estado
            });
        } catch (error) {
            console.error('Error obteniendo estado financiero:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Generar pagos masivos (mensualidades)
    async generarMasivos(req, res) {
        try {
            const { mes, anio } = req.body;

            if (!mes || !anio) {
                return res.status(400).json({
                    success: false,
                    message: 'Mes y año son requeridos'
                });
            }

            const alumnos = await AlumnosModel.findAll();
            let generados = 0;
            let omitidos = 0;
            let errores = 0;

            for (const alumno of alumnos) {
                if (!alumno.usuario_activo) continue;

                try {
                    // Verificar si ya tiene pago para este mes
                    const existe = await PagosModel.existsForMonth(alumno.id, mes, anio);
                    if (existe) {
                        omitidos++;
                        continue;
                    }

                    // Buscar último pago para heredar monto
                    const ultimoPago = await PagosModel.findLastMensualidad(alumno.id);
                    const monto = ultimoPago ? ultimoPago.monto : 0;

                    // Calcular fecha vencimiento (día 10 del mes seleccionado)
                    const fechaVencimiento = new Date(anio, mes - 1, 10);

                    // Calcular límite sin recargo (día 8 del mes seleccionado)
                    const fechaLimite = new Date(anio, mes - 1, 8);

                    await PagosModel.create({
                        alumno_id: alumno.id,
                        concepto: 'Mensualidad',
                        monto: monto,
                        monto_original: monto,
                        fecha_vencimiento: fechaVencimiento.toISOString().split('T')[0],
                        fecha_limite_sin_recargo: fechaLimite.toISOString().split('T')[0],
                        estado: 'pendiente'
                    });

                    generados++;
                } catch (err) {
                    console.error(`Error generando pago para alumno ${alumno.id}:`, err);
                    errores++;
                }
            }

            res.json({
                success: true,
                message: `Proceso finalizado. Generados: ${generados}, Omitidos: ${omitidos}, Errores: ${errores}`,
                data: { generados, omitidos, errores }
            });

        } catch (error) {
            console.error('Error generando pagos masivos:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Calcular recargo por mora
    async calcularRecargo(req, res) {
        try {
            const { id } = req.params;
            const pago = await PagosModel.findById(id);

            if (!pago) {
                return res.status(404).json({
                    success: false,
                    message: 'Pago no encontrado'
                });
            }

            if (pago.estado === 'pagado') {
                return res.status(400).json({
                    success: false,
                    message: 'El pago ya fue abonado'
                });
            }

            const hoy = new Date();
            const fechaLimite = new Date(pago.fecha_limite_sin_recargo || pago.fecha_vencimiento);

            // Calcular días de mora
            const diasMora = Math.floor((hoy - fechaLimite) / (1000 * 60 * 60 * 24));

            if (diasMora <= 0) {
                return res.json({
                    success: true,
                    message: 'No hay recargo, todavía está dentro del plazo',
                    data: { recargo: 0, diasMora: 0 }
                });
            }

            // Calcular recargo: 2% por día de mora sobre el monto original
            const montoBase = pago.monto_original || pago.monto;
            const recargo = Math.round(montoBase * 0.02 * diasMora * 100) / 100;
            const montoTotal = montoBase + recargo;

            // Actualizar el pago con el recargo
            await PagosModel.update(id, {
                recargo_aplicado: recargo,
                monto: montoTotal
            });

            res.json({
                success: true,
                message: `Recargo calculado: ${diasMora} días de mora`,
                data: {
                    diasMora,
                    recargo,
                    montoOriginal: montoBase,
                    montoTotal
                }
            });

        } catch (error) {
            console.error('Error calculando recargo:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Aplicar descuento familiar
    async aplicarDescuentoFamiliar(req, res) {
        try {
            const { email_padre } = req.body;

            if (!email_padre) {
                return res.status(400).json({
                    success: false,
                    message: 'Email del padre es requerido'
                });
            }

            // Buscar alumnos de la misma familia
            const alumnos = await AlumnosModel.findByEmailPadre(email_padre);

            if (alumnos.length < 2) {
                return res.json({
                    success: true,
                    message: 'No aplica descuento familiar (menos de 2 alumnos)',
                    data: { alumnosEncontrados: alumnos.length, descuentoAplicado: false }
                });
            }

            // Descuento: 10% para el 2do alumno, 15% del 3ro en adelante
            let descuentosAplicados = 0;

            for (let i = 0; i < alumnos.length; i++) {
                const porcentajeDescuento = i === 1 ? 0.10 : (i >= 2 ? 0.15 : 0);

                if (porcentajeDescuento > 0) {
                    // Obtener pagos pendientes del alumno
                    const pagosPendientes = await PagosModel.findPendientesByAlumno(alumnos[i].id);

                    for (const pago of pagosPendientes) {
                        const montoBase = pago.monto_original || pago.monto;
                        const descuento = Math.round(montoBase * porcentajeDescuento * 100) / 100;
                        const montoConDescuento = montoBase - descuento;

                        await PagosModel.update(pago.id, {
                            descuento_aplicado: descuento,
                            monto: montoConDescuento,
                            tipo_descuento: 'familiar'
                        });

                        descuentosAplicados++;
                    }
                }
            }

            res.json({
                success: true,
                message: `Descuento familiar aplicado a ${descuentosAplicados} pagos`,
                data: {
                    alumnosEncontrados: alumnos.length,
                    descuentosAplicados,
                    descuentoAplicado: true
                }
            });

        } catch (error) {
            console.error('Error aplicando descuento familiar:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Crear plan de pago en cuotas
    async crearPlanCuotas(req, res) {
        try {
            const { alumno_id, concepto, monto_total, cuotas, fecha_primera_cuota } = req.body;

            if (!alumno_id || !concepto || !monto_total || !cuotas) {
                return res.status(400).json({
                    success: false,
                    message: 'alumno_id, concepto, monto_total y cuotas son requeridos'
                });
            }

            const montoPorCuota = Math.round((monto_total / cuotas) * 100) / 100;
            const planId = `PLAN-${Date.now()}-${alumno_id}`;
            const pagosCreados = [];

            for (let i = 1; i <= cuotas; i++) {
                const fechaVenc = new Date(fecha_primera_cuota || Date.now());
                fechaVenc.setMonth(fechaVenc.getMonth() + (i - 1));

                const fechaLimite = new Date(fechaVenc);
                fechaLimite.setDate(fechaLimite.getDate() - 2);

                const pagoId = await PagosModel.create({
                    alumno_id,
                    concepto: `${concepto} (Cuota ${i}/${cuotas})`,
                    monto: montoPorCuota,
                    monto_original: montoPorCuota,
                    fecha_vencimiento: fechaVenc.toISOString().split('T')[0],
                    fecha_limite_sin_recargo: fechaLimite.toISOString().split('T')[0],
                    estado: 'pendiente',
                    plan_cuotas: cuotas,
                    cuota_numero: i,
                    plan_pago_id: planId
                });

                pagosCreados.push(pagoId);
            }

            res.status(201).json({
                success: true,
                message: `Plan de ${cuotas} cuotas creado exitosamente`,
                data: {
                    planId,
                    cuotas,
                    montoPorCuota,
                    montoTotal: monto_total,
                    pagosCreados
                }
            });

        } catch (error) {
            console.error('Error creando plan de cuotas:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Obtener estadísticas avanzadas para dashboard
    async getEstadisticasAvanzadas(req, res) {
        try {
            const stats = await PagosModel.getEstadisticasAvanzadas();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Generar comprobante PDF
    async generarComprobante(req, res) {
        try {
            const { id } = req.params;

            // Obtener datos del pago con información del alumno y curso
            const [pagos] = await require('../config/db').query(`
                SELECT p.*, a.nombre, a.apellido, a.email as usuario_email, a.telefono,
                       c.nombre as curso_nombre
                FROM pagos p
                INNER JOIN alumnos a ON p.alumno_id = a.id
                LEFT JOIN cursos c ON p.curso_id = c.id
                WHERE p.id = ?
            `, [id]);

            if (!pagos || pagos.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Pago no encontrado'
                });
            }

            const pago = pagos[0];
            console.log('Datos del pago recuperados:', JSON.stringify(pago, null, 2));

            // Verificar que el pago esté pagado
            if (pago.estado !== 'pagado') {
                return res.status(400).json({
                    success: false,
                    message: 'Solo se pueden generar comprobantes para pagos completados'
                });
            }

            // Generar PDF
            console.log('Generando comprobante para pago:', id);
            const doc = PDFService.generarComprobante(pago, pago);
            console.log('PDF generado, enviando respuesta...');

            // Configurar headers para descarga
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=comprobante_${String(id).padStart(8, '0')}.pdf`);

            // Enviar PDF
            doc.pipe(res);
            doc.end();

        } catch (error) {
            console.error('Error generando comprobante:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
};

module.exports = PagosController;
