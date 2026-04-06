const cron = require('node-cron');
const PagosModel = require('../../models/pagos.model');
const emailService = require('../email.service');
const whatsappService = require('../whatsapp.service');

const PagosCron = {
    init() {
        // GENERACIÓN DE CUOTAS: Día 1 de cada mes a las 00:00
        cron.schedule('0 0 1 * *', async () => {
            console.log('🔔 [CRON-PAGOS] Generando cuotas automáticas del mes...');
            const now = new Date();
            try {
                const rs = await PagosModel.generarMasivosInternal(now.getMonth() + 1, now.getFullYear());
                console.log(`✅ [CRON-PAGOS] Cuotas generadas. Creadas: ${rs.generados}, Omitidas: ${rs.omitidos}`);
            } catch (e) { console.error('❌ [CRON-PAGOS] Error generando cuotas:', e); }
        });

        // RECORDATORIOS POR VENCER (2 días antes): 14:00 PM
        cron.schedule('0 14 * * *', async () => await this.procesarRecordatorios());

        // AVISOS DE VENCIMIENTO (5 días después): 14:30 PM
        cron.schedule('30 14 * * *', async () => await this.procesarVencidos());
    },

    async procesarRecordatorios() {
        console.log('🔔 [CRON-PAGOS] Buscando pagos por vencer en 2 días...');
        try {
            const pagos = await PagosModel.findPorVencer(2);
            if (!pagos.length) return console.log('ℹ️ [CRON-PAGOS] Ningún pago por vencer.');

            console.log(`📬 [CRON-PAGOS] Recordando a ${pagos.length} alumnos...`);
            for (const pago of pagos) {
                const emailDestino = pago.email || pago.email_alumno || pago.email_padre;
                if (emailDestino) await emailService.enviarRecordatorioPago(emailDestino, pago.nombre, pago.concepto, pago.monto, pago.fecha_vencimiento);
                if (pago.telefono) await whatsappService.enviarRecordatorioPago({ nombre: pago.nombre, telefono: pago.telefono, apellido: '' }, pago);
                await new Promise(r => setTimeout(r, 200));
            }
        } catch (error) { console.error('❌ [CRON-PAGOS] Error recordatorios:', error); }
    },

    async procesarVencidos() {
        console.log('🔔 [CRON-PAGOS] Buscando pagos vencidos hace 5 días...');
        try {
            const pagos = await PagosModel.findVencidos(5);
            if (!pagos.length) return console.log('ℹ️ [CRON-PAGOS] Ningún pago vencido hace 5 días.');

            console.log(`📬 [CRON-PAGOS] Notificando mora a ${pagos.length} alumnos...`);
            for (const pago of pagos) {
                const emailDestino = pago.email || pago.email_alumno || pago.email_padre;
                if (emailDestino) {
                    const dias = Math.floor((new Date() - new Date(pago.fecha_vencimiento)) / 86400000);
                    await emailService.enviarNotificacionVencido(emailDestino, pago.nombre, pago.concepto, pago.monto, pago.fecha_vencimiento, dias);
                }
                if (pago.telefono) await whatsappService.enviarNotificacionVencido({ nombre: pago.nombre, telefono: pago.telefono, apellido: '' }, pago);
                await new Promise(r => setTimeout(r, 200));
            }
        } catch (error) { console.error('❌ [CRON-PAGOS] Error avisos vencimiento:', error); }
    }
};

module.exports = PagosCron;
