const EventosModel = require('../../models/eventos.model');
const EventosService = require('../../services/eventos.service');

const normalizarMontoOpcional = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    return Number(value);
};

const normalizarPlanPago = (data) => {
    const modalidad = data.modalidad_pago === 'cuotas' ? 'cuotas' : 'unico';
    const cantidadCuotas = modalidad === 'cuotas' ? Number.parseInt(data.cantidad_cuotas, 10) : 1;

    if (modalidad === 'cuotas') {
        if (!Number.isInteger(cantidadCuotas) || cantidadCuotas < 2 || cantidadCuotas > 24) {
            throw new Error('La cantidad de cuotas debe estar entre 2 y 24');
        }
        if (!data.fecha_primera_cuota) {
            throw new Error('La fecha de la primera cuota es obligatoria');
        }
        if (!(Number(data.costo) > 0)) {
            throw new Error('El evento debe tener un costo mayor a cero para pagarlo en cuotas');
        }
    }

    return {
        modalidad_pago: modalidad,
        cantidad_cuotas: cantidadCuotas,
        fecha_primera_cuota: modalidad === 'cuotas' ? data.fecha_primera_cuota : null
    };
};

const EventosController = {
    // Lecturas 1 a 1 de Base de Datos
    async getAll(req, res) {
        try { res.json({ success: true, data: await EventosModel.findAll() }); }
        catch (error) { console.error('[Eventos] getAll:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getById(req, res) {
        try {
            const evento = await EventosModel.findById(req.params.id);
            if (!evento) return res.status(404).json({ success: false, message: 'No encontrado' });
            res.json({ success: true, data: evento });
        } catch (error) { console.error('[Eventos] getById:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getByAlumno(req, res) {
        try { res.json({ success: true, data: await EventosModel.findByAlumno(req.params.id) }); }
        catch (error) { console.error('[Eventos] getByAlumno:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getProximos(req, res) {
        try { res.json({ success: true, data: await EventosModel.getProximosEventos() }); }
        catch (error) { console.error('[Eventos] getProximos:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async getPublicCompetencias(req, res) {
        try {
            const eventos = await EventosModel.getProximosEventos();
            const competencias = eventos
                .filter(e => e.tipo === 'Competencia')
                .map(e => ({ id: e.id, nombre: e.nombre, fecha: e.fecha, lugar: e.lugar, hora: e.hora || '', descripcion: e.descripcion || '' }));
            res.json({ success: true, data: competencias });
        } catch (error) { console.error('[Eventos] getPublicCompetencias:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    // ABM Base
    async create(req, res) {
        try {
            const data = req.body;
            if (!data.nombre || !data.fecha || !data.lugar) return res.status(400).json({ success: false, message: 'Campos requeridos' });
            const planPago = normalizarPlanPago(data);

            const id = await EventosModel.create({
                ...data, ...planPago, descripcion: data.descripcion || '', hora: data.hora || null, ubicacion: data.ubicacion || null,
                tipo: data.tipo || 'Presentación', cupo_maximo: data.cupo_maximo || null, costo_inscripcion: normalizarMontoOpcional(data.costo),
                vestuario_requerido: data.vestimenta || null, maquillaje_instrucciones: data.maquillaje || null,
                peinado_instrucciones: data.peinado || null, costo_vestuario: data.costo_vestuario || 0,
                costo_maquillaje: data.costo_maquillaje || 0, costo_peinado: data.costo_peinado || 0
            });
            res.status(201).json({ success: true, message: 'Creado', data: { id } });
        } catch (error) {
            console.error('Error al crear evento:', error);
            if (error.message.includes('cuota') || error.message.includes('costo mayor')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            res.status(500).json({ success: false, message: 'Error Server' });
        }
    },

    async update(req, res) {
        try {
            const data = req.body;
            if (!data.nombre) return res.status(400).json({ success: false, message: 'Nombre requerido' });
            const planPago = normalizarPlanPago(data);

            const updated = await EventosModel.update(req.params.id, {
                ...data, ...planPago, descripcion: data.descripcion || '', fecha: data.fecha || null, hora: data.hora || null,
                ubicacion: data.ubicacion || null, tipo: data.tipo || 'Presentación', cupo_maximo: data.cupo_maximo || null,
                costo_inscripcion: normalizarMontoOpcional(data.costo), vestuario_requerido: data.vestimenta || null,
                maquillaje_instrucciones: data.maquillaje || null, peinado_instrucciones: data.peinado || null,
                costo_vestuario: data.costo_vestuario || 0, costo_maquillaje: data.costo_maquillaje || 0, costo_peinado: data.costo_peinado || 0
            });
            if (!updated) return res.status(404).json({ success: false, message: 'No encontrado' });
            res.json({ success: true, message: 'Actualizado' });
        } catch (error) {
            console.error('[Eventos] update:', error);
            if (error.message.includes('cuota') || error.message.includes('costo mayor')) {
                return res.status(400).json({ success: false, message: error.message });
            }
            res.status(500).json({ success: false, message: 'Error Server' });
        }
    },

    async delete(req, res) {
        try {
            const deleted = await EventosModel.delete(req.params.id);
            if (!deleted) return res.status(404).json({ success: false, message: 'No encontrado' });
            res.json({ success: true, message: 'Eliminado' });
        } catch (error) { console.error('[Eventos] delete:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
    },

    async updateChecklist(req, res) {
        try {
            const updated = await EventosModel.updateChecklist(req.params.id, req.body);
            if (!updated) return res.status(404).json({ success: false, message: 'No encontrado' });
            res.json({ success: true, message: 'Checklist actualizado' });
        } catch (error) { console.error('[Eventos] updateChecklist:', error); res.status(500).json({ success: false, message: 'Error Server' }); }
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

module.exports = EventosController;
