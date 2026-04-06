const EstadisticasService = require('../../services/estadisticas.service');

const EstadisticasController = {
    // Rendimiento Financiero
    async getBalanceFinanciero(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getBalanceFinanciero(req.query.mes, req.query.anio) }); }
        catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    // Rendimiento Deportivo General
    async getAsistenciaPromedio(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getAsistenciaPromedio() }); }
        catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getAsistenciasPorMes(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getAsistenciasPorMes() }); }
        catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getAsistenciaPorDia(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getAsistenciaPorDia() }); }
        catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getMejoresAsistencias(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getMejoresAsistencias() }); }
        catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    // Rendimiento Comercial y Demográfico
    async getCursosPopulares(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getCursosPopulares() }); }
        catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getTasaRetencion(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getTasaRetencion() }); }
        catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getNuevosAlumnosPorMes(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getNuevosAlumnosPorMes() }); }
        catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getDistribucionPorCurso(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getDistribucionPorCurso() }); }
        catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getDistribucionEdades(req, res) {
        try { res.json({ success: true, data: await EstadisticasService.getDistribucionEdades() }); }
        catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    }
};

module.exports = EstadisticasController;
