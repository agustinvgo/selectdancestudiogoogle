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
     * Método público para test manual
     */
    async notificarRecordatoriosPago() {
        console.log('🧪 Iniciando test cron manual...');
        await PagosCron.procesarRecordatorios();
        await PagosCron.procesarVencidos();
        await AlumnosCron.procesarCumpleanos();
        console.log('✅ Test Cron manual finalizado exitosamente.');
    }
};

module.exports = CronService;
