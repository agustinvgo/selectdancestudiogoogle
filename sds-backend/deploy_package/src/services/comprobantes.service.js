const PagosModel = require('../models/pagos.model');
const AlumnosModel = require('../models/alumnos.model');
const emailService = require('./email.service');
const OCRService = require('./ocr.service');
const fs = require('fs');
const path = require('path');

class ComprobantesService {

    // Subir y Analizar con OCR en Segundo Plano
    static async subirComprobanteConAnalisis(pagoId, file) {
        const comprobanteUrl = `/uploads/comprobantes/${file.filename}`;
        
        // 1. Snapshot Inmediato
        await PagosModel.update(pagoId, {
            comprobante_url: comprobanteUrl,
            estado: 'revision',
            fecha_pago: new Date().toISOString().split('T')[0]
        });

        // 2. Proceso Lento (Background)
        try {
            const absolutePath = file.path;
            OCRService.analyzeReceipt(absolutePath)
                .then(async (analisisIA) => {
                    const pagoActual = await PagosModel.findById(pagoId);
                    const notasExistentes = pagoActual.notas_pago || '';
                    
                    let nuevoTexto = analisisIA.summary || JSON.stringify(analisisIA);
                    let nuevoEstado = 'revision';
                    let metodopago = null;

                    if (analisisIA.se_pago && analisisIA.monto) {
                        const m = parseFloat(analisisIA.monto);
                        const e = parseFloat(pagoActual.monto);
                        if (Math.abs(m - e) <= (e * 0.01)) {
                            nuevoEstado = 'pagado';
                            nuevoTexto += `\n\n✅ [IA] AUTO-APROBADO: El monto coincide ($${m}) y el comprobante es válido.`;
                            metodopago = analisisIA.metodo || 'Transferencia';
                        } else {
                            nuevoTexto += `\n\n⚠️ [IA] REVISIÓN REQUERIDA: El monto detectado ($${m}) difiere del esperado ($${e}).`;
                        }
                    }

                    const updateData = { notas_pago: `${notasExistentes}\n\n${nuevoTexto}` };
                    if (nuevoEstado === 'pagado') {
                        updateData.estado = 'pagado';
                        updateData.fecha_pago = new Date().toISOString().split('T')[0];
                        if (metodopago) updateData.metodo_pago_realizado = metodopago;
                    }

                    await PagosModel.update(pagoId, updateData);
                }).catch(e => console.error('[IA] OCR processing error:', e));
        } catch (e) {
            console.warn('[IA] OCR not init/failed.');
        }

        // 3. Email Administrativo asíncrono
        PagosModel.findById(pagoId).then(async (p) => {
            const alumno = await AlumnosModel.findById(p.alumno_id);
            emailService.notificarAdminNuevoComprobante(
                { concepto: p.concepto, monto: p.monto },
                { nombre: alumno.nombre, apellido: alumno.apellido }
            );
        });

        return comprobanteUrl;
    }

    // Ruta Física Exacta
    static async obtenerRutaLocalComprobante(pagoId) {
        const pago = await PagosModel.findById(pagoId);
        if (!pago || !pago.comprobante_url) throw new Error('Comprobante no encontrado');

        const relativePath = pago.comprobante_url.startsWith('/') ? pago.comprobante_url.substring(1) : pago.comprobante_url;
        const absolutePath = path.join(__dirname, '../../', relativePath);

        if (!fs.existsSync(absolutePath)) throw new Error('Archivo físico no encontrado');
        return absolutePath;
    }
}

module.exports = ComprobantesService;
