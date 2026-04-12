const PagosModel = require('../../models/pagos.model');
const AlumnosModel = require('../../models/alumnos.model');
const PDFService = require('../../services/pdf.service');
const PagosService = require('../../services/pagos.service');
const ComprobantesService = require('../../services/comprobantes.service');

const PagosController = {
    // Lecturas 1 a 1 de Base de Datos
    async getByAlumno(req, res) {
        try {
            const pagos = await PagosModel.findByAlumno(req.params.id);
            res.json({ success: true, data: pagos });
        } catch (error) {
            console.error('[PagosController.getByAlumno] Error:', error);
            res.status(500).json({ success: false, message: 'Error Server' });
        }
    },

    async getMisPagos(req, res) {
        try {
            const alumno = await AlumnosModel.findByUsuarioId(req.user.id);
            if (!alumno) return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
            const pagos = await PagosModel.findByAlumno(alumno.id);
            res.json({ success: true, data: pagos });
        } catch (error) {
            console.error('[PagosController.getMisPagos] Error:', error);
            res.status(500).json({ success: false, message: 'Error Server' });
        }
    },

    async getAll(req, res) {
        try {
            const { page, limit, estado, mes, anio, alumno_id, search } = req.query;
            const params = {
                page: page ? parseInt(page) : undefined, limit: limit ? parseInt(limit) : undefined,
                estado: estado === 'todos' ? undefined : estado, mes: mes ? parseInt(mes) : undefined,
                anio: anio ? parseInt(anio) : undefined, alumno_id: alumno_id ? parseInt(alumno_id) : undefined,
                search
            };

            const [result, statsRaw] = await Promise.all([PagosModel.findAll(params), PagosModel.getStats(params)]);

            const stats = {
                total: parseInt(statsRaw?.total) || 0, pendientes: parseInt(statsRaw?.pendientes) || 0,
                pagados: parseInt(statsRaw?.pagados) || 0, revision: parseInt(statsRaw?.revision) || 0
            };

            res.json({ success: true, data: result.data || result, total: result.total, stats, page: params.page, limit: params.limit });
        } catch (error) {
            console.error('[PagosController.getAll] Error:', error);
            res.status(500).json({ success: false, message: 'Error Server' });
        }
    },

    async getPendientes(req, res) {
        try {
            res.json({ success: true, data: await PagosModel.findPendientes() });
        } catch (error) {
            console.error('[PagosController.getPendientes] Error:', error);
            res.status(500).json({ success: false, message: 'Error Server' });
        }
    },

    // ----------------------------------------
    // Inyección de Servicios (Escrituras)
    // ----------------------------------------
    
    async create(req, res) {
        try {
            if (!req.body.alumno_id || !req.body.concepto || !req.body.monto || !req.body.fecha_vencimiento) {
                return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
            }
            const id = await PagosService.createPago(req.body);
            res.status(201).json({ success: true, message: 'Pago registrado exitosamente', data: { id } });
        } catch (error) { 
            console.error('Error en PagosController.create:', error);
            res.status(500).json({ success: false, message: 'Error Server' }); 
        }
    },

    async update(req, res) {
        try {
            const result = await PagosService.updatePagoSeguro(req.params.id, req.body);
            if (result.yaPagado) return res.json({ success: true, message: 'El pago ya se encontraba registrado' });
            res.json({ success: true, message: 'Pago actualizado exitosamente' });
        } catch (error) {
            if (error.message === 'Pago no encontrado') return res.status(404).json({ success: false, message: error.message });
            res.status(500).json({ success: false, message: 'Error al actualizar pago' });
        }
    },

    async calcularRecargo(req, res) {
        try {
            const data = await PagosService.calcularRecargoMora(req.params.id);
            if (data.diasMora === 0) return res.json({ success: true, message: 'Sin mora', data });
            res.json({ success: true, message: `Recargo calculado: ${data.diasMora} días`, data });
        } catch (error) {
            res.status(error.message === 'Pago no encontrado' ? 404 : 400).json({ success: false, message: error.message });
        }
    },

    async aplicarDescuentoFamiliar(req, res) {
        try {
            if (!req.body.email_padre) return res.status(400).json({ success: false, message: 'Email requerido' });
            const data = await PagosService.aplicarDescuentoFamiliar(req.body.email_padre);
            if (!data.descuentoAplicado) return res.json({ success: true, message: 'No aplica descuento', data });
            res.json({ success: true, message: `Descuento familiar aplicado a ${data.descuentosAplicados} pagos`, data });
        } catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async crearPlanCuotas(req, res) {
        try {
            const data = await PagosService.crearPlanDeCuotas(req.body);
            res.status(201).json({ success: true, message: `Plan de ${data.cuotas} cuotas creado exitosamente`, data });
        } catch (error) { 
            console.error('Error en crearPlanCuotas:', error);
            res.status(500).json({ success: false, message: 'Error Server' }); 
        }
    },

    // ----------------------------------------
    // Módulo de Comprobantes Inyectado
    // ----------------------------------------

    async subirComprobante(req, res) {
        try {
            if (!req.file) return res.status(400).json({ success: false, message: 'No hay archivo' });
            const url = await ComprobantesService.subirComprobanteConAnalisis(req.params.id, req.file);
            res.json({ success: true, message: 'Comprobante subido (En Revisión).', data: { comprobante_url: url } });
        } catch (error) { res.status(500).json({ success: false, message: 'Error al subir comprobante' }); }
    },

    async verComprobante(req, res) {
        try {
            const absolutePath = await ComprobantesService.obtenerRutaLocalComprobante(req.params.id);
            res.sendFile(absolutePath);
        } catch (error) { res.status(error.message.includes('encontrado') ? 404 : 500).json({ success: false, message: error.message }); }
    },

    async generarComprobante(req, res) {
        try {
            const [pagos] = await require('../../config/db').query(`
                SELECT p.*, u.nombre, u.apellido, u.email as usuario_email, u.telefono, c.nombre as curso_nombre
                FROM pagos p INNER JOIN alumnos a ON p.alumno_id = a.id INNER JOIN usuarios u ON a.usuario_id = u.id LEFT JOIN cursos c ON p.curso_id = c.id
                WHERE p.id = ?`, [req.params.id]);

            if (!pagos || pagos.length === 0) return res.status(404).json({ success: false, message: 'Pago no encontrado' });
            if (pagos[0].estado !== 'pagado') return res.status(400).json({ success: false, message: 'Debe estar pagado' });

            const doc = PDFService.generarComprobante(pagos[0], pagos[0]);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=comprobante_${String(req.params.id).padStart(8, '0')}.pdf`);
            doc.pipe(res); doc.end();
        } catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    // Lógicas delegadas a modelos y DB Tools
    async getEstadoFinanciero(req, res) {
        try {
            const { mes, anio } = req.query;
            const estado = await PagosModel.getEstadoFinanciero(mes ? parseInt(mes) : null, anio ? parseInt(anio) : null);
            const totalEsperado = parseFloat(estado.totalMes) || 0;
            const totalCobrado = parseFloat(estado.cobradoMes) || 0;
            res.json({ success: true, data: {
                total_cobrado: totalCobrado, total_pendiente: parseFloat(estado.pendientes) || 0,
                total_esperado: totalEsperado, tasa_cobro: totalEsperado > 0 ? (totalCobrado / totalEsperado) * 100 : 0,
                vencidos: parseFloat(estado.vencidos) || 0, ingresosMensuales: estado.ingresosMensuales
            }});
        } catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async generarMasivos(req, res) {
        try {
            if (!req.body.mes || !req.body.anio) return res.status(400).json({ success: false, message: 'Mes y año' });
            const result = await PagosModel.generarMasivosInternal(parseInt(req.body.mes), parseInt(req.body.anio));
            res.json({ success: true, message: `Generados: ${result.generados}, Omitidos: ${result.omitidos}`, data: result });
        } catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getEstadisticasAvanzadas(req, res) {
        try { res.json({ success: true, data: await PagosModel.getEstadisticasAvanzadas() }); } 
        catch (error) { res.status(500).json({ success: false, message: 'Error' }); }
    },

    async delete(req, res) {
        try {
            const deleted = await PagosModel.delete(req.params.id);
            if (!deleted) return res.status(404).json({ success: false, message: 'No encontrado' });
            res.json({ success: true, message: 'Eliminado' });
        } catch (error) { res.status(500).json({ success: false, message: 'Error' }); }
    }
};

module.exports = PagosController;
