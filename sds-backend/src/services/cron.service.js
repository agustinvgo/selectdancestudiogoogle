const PagosCron = require('./cron/pagos.cron');
const AlumnosCron = require('./cron/alumnos.cron');
const ProfesoresCron = require('./cron/profesores.cron');

const CronService = {
    init() {
        console.log('⏰ Inicializando Orchestrador de CRON...');
        
        PagosCron.init();
        AlumnosCron.init();
        ProfesoresCron.init();

        console.log('✅ Cron Service Activo: Módulos de Pagos, Alumnos y Profesores conectados.');
    },

    /**
     * Método público para test manual — recordatorios de pagos
     */
    async notificarRecordatoriosPago() {
        console.log('🧪 Iniciando test cron manual...');
        await PagosCron.procesarRecordatorios();
        await PagosCron.procesarVencidos();
        await AlumnosCron.procesarCumpleanos();
        console.log('✅ Test Cron manual finalizado exitosamente.');
    },

    /**
     * Enviar resumen diario de cursos a profesores (test manual)
     */
    async enviarResumenProfesor() {
        console.log('📅 [CRON-MANUAL] Disparando resumen diario de cursos...');
        const whatsappService = require('./whatsapp.service');
        const resultado = await whatsappService.enviarResumenDiarioProfesor();
        console.log('✅ [CRON-MANUAL] Resumen diario enviado.');
        return resultado;
    }
};

module.exports = CronService;
