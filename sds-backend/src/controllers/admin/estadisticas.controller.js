const EstadisticasService = require('../../services/estadisticas.service');

const EstadisticasController = {
    // Rendimiento Financiero
    async getBalanceFinanciero(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getBalanceFinanciero(req.query.mes, req.query.anio) }); }
        catch (error) { console.error('[Estadisticas] getBalanceFinanciero:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    // Rendimiento Deportivo General
    async getAsistenciaPromedio(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getAsistenciaPromedio() }); }
        catch (error) { console.error('[Estadisticas] getAsistenciaPromedio:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getAsistenciasPorMes(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getAsistenciasPorMes() }); }
        catch (error) { console.error('[Estadisticas] getAsistenciasPorMes:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getAsistenciaPorDia(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getAsistenciaPorDia() }); }
        catch (error) { console.error('[Estadisticas] getAsistenciaPorDia:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getMejoresAsistencias(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getMejoresAsistencias() }); }
        catch (error) { console.error('[Estadisticas] getMejoresAsistencias:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    // Rendimiento Comercial y Demográfico
    async getCursosPopulares(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getCursosPopulares() }); }
        catch (error) { console.error('[Estadisticas] getCursosPopulares:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getTasaRetencion(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getTasaRetencion() }); }
        catch (error) { console.error('[Estadisticas] getTasaRetencion:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getNuevosAlumnosPorMes(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getNuevosAlumnosPorMes() }); }
        catch (error) { console.error('[Estadisticas] getNuevosAlumnosPorMes:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getDistribucionPorCurso(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getDistribucionPorCurso() }); }
        catch (error) { console.error('[Estadisticas] getDistribucionPorCurso:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getDistribucionEdades(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getDistribucionEdades() }); }
        catch (error) { console.error('[Estadisticas] getDistribucionEdades:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
    }
};

module.exports = EstadisticasController;
