const cron = require('node-cron');
const whatsappService = require('../whatsapp.service');

const ProfesoresCron = {
    init() {
        // RESUMEN DIARIO A PROFESORES: Todos los días a las 07:00 AM
        cron.schedule('0 7 * * *', async () => {
            console.log('📅 [CRON-PROFESORES] Enviando agenda del día a profesores...');
            try {
                await whatsappService.enviarResumenDiarioProfesor();
            } catch (error) {
                console.error('❌ [CRON-PROFESORES] Error enviando agenda:', error);
            }
        });
    }
};

module.exports = ProfesoresCron;
