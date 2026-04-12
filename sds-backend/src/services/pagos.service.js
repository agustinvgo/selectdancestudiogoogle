const PagosModel = require('../models/pagos.model');
const AlumnosModel = require('../models/alumnos.model');
const emailService = require('./email.service');
const PDFService = require('./pdf.service');
const db = require('../config/db');

class PagosService {
    
    // Helper: convierte 'YYYY-MM-DD' a Date local sin desfase UTC (Bug #3 fix)
    static _parseDateLocal(dateStr) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day); // fecha local, no UTC
    }

    static _dateToStr(d) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    // Crear Pago Individual
    static async createPago(pagoData) {
        if (!pagoData.fecha_limite_sin_recargo && pagoData.fecha_vencimiento) {
            // Bug #3 fix: usar fecha local para evitar desfase UTC en zonas UTC-X
            const vencimiento = PagosService._parseDateLocal(pagoData.fecha_vencimiento);
            vencimiento.setDate(vencimiento.getDate() - 2);
            pagoData.fecha_limite_sin_recargo = PagosService._dateToStr(vencimiento);
        }

        if (pagoData.curso_id === '') pagoData.curso_id = null;

        const id = await PagosModel.create(pagoData);

        // Enviar Email
        try {
            const alumno = await AlumnosModel.findById(pagoData.alumno_id);
            const emailDestino = alumno?.usuario_email || alumno?.email || alumno?.email_padre;
            if (alumno && emailDestino) {
                emailService.enviarNotificacionNuevoPago(emailDestino, alumno.nombre, pagoData.concepto, pagoData.monto, pagoData.fecha_vencimiento)
                    .catch(err => console.error('Error enviando Email nuevo pago:', err));
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
                'notas_pago', 'metodo_pago_realizado', 'es_mensual', 'analisis_comprobante'
            ];

            allowedFields.forEach(field => {
                if (pagoData[field] !== undefined) { fields.push(`${field} = ?`); values.push(pagoData[field]); }
            });

            if (fields.length > 0) {
                values.push(id);
                await connection.query(`UPDATE pagos SET ${fields.join(', ')} WHERE id = ?`, values);
            }

            await connection.commit();

            // Enviar Recibo PDF
            if (estaCambiandoAPagado && pagoAnterior.alumno_id) {
                PagosService.enviarReciboPorEmail(pagoAnterior, pagoData.monto || pagoAnterior.monto);
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
            const emailDestino = alumno.email || alumno.email_padre;
            if (!emailDestino) return;

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

            await emailService.enviarReciboPago(
                emailDestino, `${alumno.nombre} ${alumno.apellido}`,
                pagoAnterior.concepto, montoCobrado, new Date(), pdfBuffer
            );
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
        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            const { alumno_id, concepto, monto_total, cuotas, fecha_primera_cuota } = planData;
            const montoPorCuota = Math.round((monto_total / cuotas) * 100) / 100;
            const planId = `PLAN-${Date.now()}-${alumno_id}`;
            const pagosCreados = [];

            for (let i = 1; i <= cuotas; i++) {
                // Bug #3 fix: parseo local para evitar desfase UTC
                const fechaVenc = fecha_primera_cuota
                    ? PagosService._parseDateLocal(fecha_primera_cuota)
                    : new Date();
                fechaVenc.setMonth(fechaVenc.getMonth() + (i - 1));

                const fechaLimite = new Date(fechaVenc);
                fechaLimite.setDate(fechaLimite.getDate() - 2);

                const pagoId = await PagosModel.create({
                    alumno_id, concepto: `${concepto} (Cuota ${i}/${cuotas})`, monto: montoPorCuota, monto_original: montoPorCuota,
                    fecha_vencimiento: PagosService._dateToStr(fechaVenc),
                    fecha_limite_sin_recargo: PagosService._dateToStr(fechaLimite),
                    estado: 'pendiente', plan_cuotas: cuotas, cuota_numero: i, plan_pago_id: planId
                }, connection);
                pagosCreados.push(pagoId);
            }

            await connection.commit();
            return { planId, cuotas, montoPorCuota, montoTotal: monto_total, pagosCreados };
        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = PagosService;
