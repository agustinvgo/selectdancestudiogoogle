const EventosModel = require('../../models/eventos.model');
const EventosService = require('../../services/eventos.service');

const EventosController = {
    // Lecturas 1 a 1 de Base de Datos
    async getAll(req, res) {
        try { res.json({ success: true, data: await EventosModel.findAll() }); }
        catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getById(req, res) {
        try {
            const evento = await EventosModel.findById(req.params.id);
            if (!evento) return res.status(404).json({ success: false, message: 'No encontrado' });
            res.json({ success: true, data: evento });
        } catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getByAlumno(req, res) {
        try { res.json({ success: true, data: await EventosModel.findByAlumno(req.params.id) }); }
        catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getProximos(req, res) {
        try { res.json({ success: true, data: await EventosModel.getProximosEventos() }); }
        catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getPublicCompetencias(req, res) {
        try {
            const eventos = await EventosModel.getProximosEventos();
            const competencias = eventos
                .filter(e => e.tipo === 'Competencia')
                .map(e => ({ id: e.id, nombre: e.nombre, fecha: e.fecha, lugar: e.lugar, hora: e.hora || '', descripcion: e.descripcion || '' }));
            res.json({ success: true, data: competencias });
        } catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    // ABM Base
    async create(req, res) {
        try {
            const data = req.body;
            if (!data.nombre || !data.fecha || !data.lugar) return res.status(400).json({ success: false, message: 'Campos requeridos' });

            const id = await EventosModel.create({
                ...data, descripcion: data.descripcion || '', hora: data.hora || null, ubicacion: data.ubicacion || null,
                tipo: data.tipo || 'Presentación', cupo_maximo: data.cupo_maximo || null, costo_inscripcion: data.costo || 0,
                vestuario_requerido: data.vestimenta || null, maquillaje_instrucciones: data.maquillaje || null,
                peinado_instrucciones: data.peinado || null, costo_vestuario: data.costo_vestuario || 0,
                costo_maquillaje: data.costo_maquillaje || 0, costo_peinado: data.costo_peinado || 0
            });
            res.status(201).json({ success: true, message: 'Creado', data: { id } });
        } catch (error) {
            console.error('Error al crear evento:', error);
            res.status(500).json({ success: false, message: 'Error Server' });
        }
    },

    async update(req, res) {
        try {
            const data = req.body;
            if (!data.nombre) return res.status(400).json({ success: false, message: 'Nombre requerido' });

            const updated = await EventosModel.update(req.params.id, {
                ...data, descripcion: data.descripcion || '', fecha: data.fecha || null, hora: data.hora || null,
                ubicacion: data.ubicacion || null, tipo: data.tipo || 'Presentación', cupo_maximo: data.cupo_maximo || null,
                costo_inscripcion: data.costo || 0, vestuario_requerido: data.vestimenta || null,
                maquillaje_instrucciones: data.maquillaje || null, peinado_instrucciones: data.peinado || null,
                costo_vestuario: data.costo_vestuario || 0, costo_maquillaje: data.costo_maquillaje || 0, costo_peinado: data.costo_peinado || 0
            });
            if (!updated) return res.status(404).json({ success: false, message: 'No encontrado' });
            res.json({ success: true, message: 'Actualizado' });
        } catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async delete(req, res) {
        try {
            const deleted = await EventosModel.delete(req.params.id);
            if (!deleted) return res.status(404).json({ success: false, message: 'No encontrado' });
            res.json({ success: true, message: 'Eliminado' });
        } catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async updateChecklist(req, res) {
        try {
            const updated = await EventosModel.updateChecklist(req.params.id, req.body);
            if (!updated) return res.status(404).json({ success: false, message: 'No encontrado' });
            res.json({ success: true, message: 'Checklist actualizado' });
        } catch (error) { res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    // ----------------------------------------
    // Inyección de Lógica de Negocio Densa
    // ----------------------------------------

    async inscribirAlumno(req, res) {
        try {
            if (!req.body.alumno_id) return res.status(400).json({ success: false, message: 'alumno_id requerido' });
            const result = await EventosService.inscribirAlumnoConPagos(req.body.alumno_id, req.params.id);
            res.status(201).json({ success: true, message: 'Alumno inscrito exitosamente', data: result });
        } catch (error) {
            if (error.message === 'Evento no encontrado') return res.status(404).json({ success: false, message: error.message });
            res.status(500).json({ success: false, message: 'Error Server' });
        }
    },

    async desinscribirAlumno(req, res) {
        try {
            await EventosService.desinscribirAlumnoConNotificacion(req.params.inscripcionId);
            res.json({ success: true, message: 'Alumno desinscrito exitosamente' });
        } catch (error) {
            if (error.message.includes('No encontrad')) return res.status(404).json({ success: false, message: error.message });
            res.status(500).json({ success: false, message: 'Error Server' });
        }
    }
};

module.exports = { EventosController };
