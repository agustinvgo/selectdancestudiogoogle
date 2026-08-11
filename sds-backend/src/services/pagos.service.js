const PagosModel = require('../models/pagos.model');
const AlumnosModel = require('../models/alumnos.model');
const ResponsablesAlumnosModel = require('../models/responsables-alumnos.model');
const emailService = require('./email.service');
const PDFService = require('./pdf.service');
const db = require('../config/db');

class PagosService {
    static IMPACTOS_VALIDOS = ['ingreso', 'ajuste', 'informativo'];
    
    // Helper: convierte 'YYYY-MM-DD' a Date local sin desfase UTC (Bug #3 fix)
    static _parseDateLocal(dateStr) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day); // fecha local, no UTC
    }

    static _dateToStr(d) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    static _addMonthsClamped(date, months) {
        const firstTargetDay = new Date(date.getFullYear(), date.getMonth() + months, 1);
        const lastTargetDay = new Date(firstTargetDay.getFullYear(), firstTargetDay.getMonth() + 1, 0).getDate();
        return new Date(firstTargetDay.getFullYear(), firstTargetDay.getMonth(), Math.min(date.getDate(), lastTargetDay));
    }

    static async getDestinatariosNotificaciones(alumno) {
        const responsables = await ResponsablesAlumnosModel.findNotificationRecipientsByAlumnoId(alumno.id);
        const emails = responsables.map((responsable) => responsable.email);
        const emailRespaldo = alumno.email || alumno.email_padre;

        if (emailRespaldo) emails.push(emailRespaldo);
        return [...new Set(emails.map((email) => String(email).trim().toLowerCase()).filter(Boolean))];
    }

    static _normalizarMovimiento(pagoData, pagoAnterior = {}) {
        const impacto = pagoData.impacto_financiero || pagoAnterior.impacto_financiero || 'ingreso';
        if (!PagosService.IMPACTOS_VALIDOS.includes(impacto)) {
            throw new Error('Tipo de impacto financiero inválido');
        }

        pagoData.impacto_financiero = impacto;
        if (typeof pagoData.categoria_movimiento === 'string') {
            pagoData.categoria_movimiento = pagoData.categoria_movimiento.trim().slice(0, 50) || null;
        }
        if (typeof pagoData.notas_pago === 'string') {
            pagoData.notas_pago = pagoData.notas_pago.trim().slice(0, 500) || null;
        }

        if (impacto !== 'ingreso') {
            const categoria = pagoData.categoria_movimiento ?? pagoAnterior.categoria_movimiento;
            const nota = pagoData.notas_pago ?? pagoAnterior.notas_pago;
            if (!categoria) throw new Error('La categoría es obligatoria para movimientos no computables');
            if (!nota) throw new Error('La descripción es obligatoria para movimientos no computables');

            pagoData.categoria_movimiento = categoria;
            pagoData.notas_pago = nota;
            pagoData.estado = 'pagado';
            pagoData.fecha_pago = pagoData.fecha_pago || pagoAnterior.fecha_pago || PagosService._dateToStr(new Date());
            pagoData.metodo_pago_realizado = 'No aplica';
            pagoData.es_mensual = 0;
        } else if (pagoData.categoria_movimiento === undefined && !pagoAnterior.id) {
            pagoData.categoria_movimiento = null;
        }

        return pagoData;
    }

    // Crear Pago Individual
    static async createPago(pagoData) {
        PagosService._normalizarMovimiento(pagoData);

        if (!pagoData.fecha_limite_sin_recargo && pagoData.fecha_vencimiento) {
            // Bug #3 fix: usar fecha local para evitar desfase UTC en zonas UTC-X
            const vencimiento = PagosService._parseDateLocal(pagoData.fecha_vencimiento);
            vencimiento.setDate(vencimiento.getDate() - 2);
            pagoData.fecha_limite_sin_recargo = PagosService._dateToStr(vencimiento);
        }

        if (pagoData.curso_id === '') pagoData.curso_id = null;

        const id = await PagosModel.create(pagoData);

        // Los movimientos no computables son internos y no generan avisos de cobro.
        if (pagoData.impacto_financiero !== 'ingreso') return id;

        // Enviar Email
        try {
            const alumno = await AlumnosModel.findById(pagoData.alumno_id);
            if (alumno) {
                const destinatarios = await PagosService.getDestinatariosNotificaciones(alumno);
                destinatarios.forEach((emailDestino) => {
                    emailService.enviarNotificacionNuevoPago(emailDestino, alumno.nombre, pagoData.concepto, pagoData.monto, pagoData.fecha_vencimiento)
                        .catch(err => console.error('Error enviando Email nuevo pago:', err));
                });
            }
        } catch (emailError) {
            console.error('Error preparando Email de nuevo pago:', emailError);
        }

        return id;
    }

    // Actualizar Pago Seguro (Transaction & Locks & Recibos)
    static async updatePagoSeguro(id, pagoData) {
        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            const [rows] = await connection.query('SELECT * FROM pagos WHERE id = ? FOR UPDATE', [id]);
            const pagoAnterior = rows[0];

            if (!pagoAnterior) {
                await connection.rollback();
                throw new Error('Pago no encontrado');
            }

            if (pagoAnterior.estado === 'pagado' && pagoData.estado === 'pagado') {
                await connection.rollback();
                return { yaPagado: true };
            }

            PagosService._normalizarMovimiento(pagoData, pagoAnterior);

            const estaCambiandoAPagado = pagoAnterior.estado !== 'pagado' && pagoData.estado === 'pagado';

            // Error #3 fix: usar helper local en vez de toISOString() que en UTC puede dar el día siguiente
            if (pagoData.estado === 'pagado' && !pagoData.fecha_pago) pagoData.fecha_pago = PagosService._dateToStr(new Date());
            if (pagoData.estado === 'pagado' && !pagoData.metodo_pago_realizado) pagoData.metodo_pago_realizado = pagoData.metodo_pago || 'Efectivo';

            const fields = [];
            const values = [];
            const allowedFields = [
                'curso_id', 'concepto', 'monto', 'fecha_vencimiento', 'fecha_limite_sin_recargo', 'fecha_pago', 'estado',
                'metodo_pago', 'comprobante_url', 'observaciones', 'monto_original', 'recargo_aplicado', 'descuento_aplicado',
                'comprobante_numero', 'plan_cuotas', 'cuota_numero', 'plan_pago_id', 'referencia_externa', 'tipo_descuento',
                'notas_pago', 'metodo_pago_realizado', 'es_mensual', 'analisis_comprobante',
                'impacto_financiero', 'categoria_movimiento'
            ];

            allowedFields.forEach(field => {
                if (pagoData[field] !== undefined) { fields.push(`${field} = ?`); values.push(pagoData[field]); }
            });

            if (fields.length > 0) {
                values.push(id);
                await connection.query(`UPDATE pagos SET ${fields.join(', ')} WHERE id = ?`, values);
            }

            await connection.commit();

            // Enviar Recibo PDF con datos actualizados (post-commit)
            if (estaCambiandoAPagado && pagoAnterior.alumno_id && pagoData.impacto_financiero === 'ingreso') {
                const pagoActualizado = { ...pagoAnterior, ...pagoData };
                PagosService.enviarReciboPorEmail(pagoActualizado, pagoData.monto || pagoAnterior.monto);
            }

            return { success: true };
        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    static async enviarReciboPorEmail(pagoAnterior, montoCobrado) {
        try {
            const alumno = await AlumnosModel.findById(pagoAnterior.alumno_id);
            if (!alumno) return;
            const destinatarios = await PagosService.getDestinatariosNotificaciones(alumno);
            if (!destinatarios.length) return;

            const pdfBuffer = await new Promise((resolve, reject) => {
                try {
                    const buffers = [];
                    const doc = PDFService.generarComprobante(pagoAnterior, alumno);
                    doc.on('data', buffers.push.bind(buffers));
                    doc.on('end', () => resolve(Buffer.concat(buffers)));
                    doc.on('error', reject);
                    doc.end();
                } catch (e) { reject(e); }
            });

            await Promise.all(destinatarios.map((emailDestino) => emailService.enviarReciboPago(
                emailDestino, `${alumno.nombre} ${alumno.apellido}`,
                pagoAnterior.concepto, montoCobrado, new Date(),
                pagoAnterior.fecha_vencimiento, pdfBuffer
            )));
        } catch (error) {
            console.error('Error en enviarReciboPorEmail:', error);
        }
    }

    // Calcular Recargo Semanal/Mensual
    static async calcularRecargoMora(id) {
        const pago = await PagosModel.findById(id);
        if (!pago) throw new Error('Pago no encontrado');
        if (pago.estado === 'pagado') throw new Error('El pago ya fue abonado');

        const hoy = new Date();
        const fechaLimite = new Date(pago.fecha_limite_sin_recargo || pago.fecha_vencimiento);
        const diasMora = Math.floor((hoy - fechaLimite) / (1000 * 60 * 60 * 24));

        if (diasMora <= 0) return { recargo: 0, diasMora: 0, montoOriginal: pago.monto_original || pago.monto, montoTotal: pago.monto_original || pago.monto };

        const montoBase = pago.monto_original || pago.monto;
        const recargo = Math.round(montoBase * 0.02 * diasMora * 100) / 100;
        const montoTotal = montoBase + recargo;

        await PagosModel.update(id, { recargo_aplicado: recargo, monto: montoTotal });
        return { diasMora, recargo, montoOriginal: montoBase, montoTotal };
    }

    // Descuento Familias Interconectadas
    static async aplicarDescuentoFamiliar(email_padre) {
        const alumnos = await AlumnosModel.findByEmailPadre(email_padre);
        if (alumnos.length < 2) return { alumnosEncontrados: alumnos.length, descuentoAplicado: false };

        let descuentosAplicados = 0;
        for (let i = 0; i < alumnos.length; i++) {
            const porcentajeDescuento = i === 1 ? 0.10 : (i >= 2 ? 0.15 : 0);
            if (porcentajeDescuento > 0) {
                const pagosPendientes = await PagosModel.findPendientesByAlumno(alumnos[i].id);
                for (const pago of pagosPendientes) {
                    const montoBase = pago.monto_original || pago.monto;
                    const descuento = Math.round(montoBase * porcentajeDescuento * 100) / 100;
                    await PagosModel.update(pago.id, { descuento_aplicado: descuento, monto: montoBase - descuento, tipo_descuento: 'familiar' });
                    descuentosAplicados++;
                }
            }
        }
        return { alumnosEncontrados: alumnos.length, descuentosAplicados, descuentoAplicado: true };
    }

    // Planes de Cuotas con Generación Múltiple
    static async crearPlanDeCuotas(planData) {
        const alumnoId = Number.parseInt(planData.alumno_id, 10);
        const concepto = String(planData.concepto || '').trim().slice(0, 200);
        const montoTotal = Number(planData.monto_total);
        const cuotas = Number.parseInt(planData.cuotas, 10);
        const fechaPrimeraCuota = planData.fecha_primera_cuota;

        if (!alumnoId || !concepto || !Number.isFinite(montoTotal) || montoTotal <= 0 || !fechaPrimeraCuota) {
            throw new Error('Alumno, concepto, monto total y fecha de primera cuota son obligatorios');
        }
        if (!Number.isInteger(cuotas) || cuotas < 2 || cuotas > 24) {
            throw new Error('El número de cuotas debe estar entre 2 y 24');
        }
        if (Math.round(montoTotal * 100) < cuotas) {
            throw new Error('El monto total es insuficiente para la cantidad de cuotas');
        }
        if ((planData.impacto_financiero || 'ingreso') !== 'ingreso') {
            throw new Error('Los movimientos internos no pueden dividirse en cuotas');
        }

        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            const descripcion = typeof planData.descripcion === 'string'
                ? planData.descripcion.trim().slice(0, 500)
                : '';
            const totalCentavos = Math.round(montoTotal * 100);
            const cuotaBaseCentavos = Math.floor(totalCentavos / cuotas);
            const planId = `PLAN-${Date.now()}-${alumnoId}`;
            const pagosCreados = [];
            const montosCuotas = [];

            for (let i = 1; i <= cuotas; i++) {
                const montoCuotaCentavos = i === cuotas
                    ? totalCentavos - (cuotaBaseCentavos * (cuotas - 1))
                    : cuotaBaseCentavos;
                const montoCuota = montoCuotaCentavos / 100;
                // Bug #3 fix: parseo local para evitar desfase UTC
                const fechaVenc = PagosService._addMonthsClamped(
                    PagosService._parseDateLocal(fechaPrimeraCuota),
                    i - 1
                );

                const fechaLimite = new Date(fechaVenc);
                fechaLimite.setDate(fechaLimite.getDate() - 2);

                const pagoId = await PagosModel.create({
                    alumno_id: alumnoId,
                    curso_id: planData.curso_id || null,
                    concepto: `${concepto} (Cuota ${i}/${cuotas})`,
                    monto: montoCuota,
                    monto_original: montoCuota,
                    fecha_vencimiento: PagosService._dateToStr(fechaVenc),
                    fecha_limite_sin_recargo: PagosService._dateToStr(fechaLimite),
                    estado: 'pendiente', plan_cuotas: cuotas, cuota_numero: i, plan_pago_id: planId,
                    metodo_pago: planData.metodo_pago || null,
                    es_mensual: 0,
                    notas_pago: descripcion || null,
                    referencia_externa: planData.referencia_externa || null,
                    impacto_financiero: 'ingreso'
                }, connection);
                pagosCreados.push(pagoId);
                montosCuotas.push(montoCuota);
            }

            await connection.commit();
            return { planId, cuotas, montosCuotas, montoTotal, pagosCreados };
        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = PagosService;
