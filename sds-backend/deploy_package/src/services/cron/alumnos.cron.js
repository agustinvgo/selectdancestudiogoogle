const cron = require('node-cron');
const AlumnosModel = require('../../models/alumnos.model');
const emailService = require('../email.service');
const whatsappService = require('../whatsapp.service');

const AlumnosCron = {
    init() {
        // CUMPLEAÑOS: Todos los días a las 09:00 AM
        cron.schedule('0 9 * * *', async () => await this.procesarCumpleanos());
    },

    async procesarCumpleanos() {
        console.log('🔔 [CRON-ALUMNOS] Buscando cumpleañeros de hoy...');
        try {
            const now = new Date();
            const cumpleaneros = await AlumnosModel.findCumpleanos(now.getMonth() + 1, now.getDate());

            if (!cumpleaneros.length) return console.log('ℹ️ [CRON-ALUMNOS] Hoy no cumple años nadie.');

            console.log(`🎂 [CRON-ALUMNOS] Saludando a ${cumpleaneros.length} cumpleañeros...`);
            for (const alumno of cumpleaneros) {
                const emailDestino = alumno.usuario_email || alumno.email || alumno.email_padre;
                if (emailDestino) await emailService.enviarFelicitacionCumpleaños(emailDestino, alumno.nombre);
                if (alumno.telefono) await whatsappService.enviarFelicitacionCumpleaños(alumno);
                await new Promise(r => setTimeout(r, 200));
            }
        } catch (error) { console.error('❌ [CRON-ALUMNOS] Error saludos cumpleaños:', error); }
    }
};

module.exports = AlumnosCron;
