const EventosModel = require('../models/eventos.model');
const CursosModel = require('../models/cursos.model');

const EventosController = {
    // Listar todos los eventos
    async getAll(req, res) {
        try {
            const eventos = await EventosModel.findAll();

            res.json({
                success: true,
                data: eventos
            });
        } catch (error) {
            console.error('Error obteniendo eventos:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Obtener evento por ID con detalles
    async getById(req, res) {
        try {
            const { id } = req.params;
            const evento = await EventosModel.findById(id);

            if (!evento) {
                return res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
            }

            res.json({
                success: true,
                data: evento
            });
        } catch (error) {
            console.error('Error obteniendo evento:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Obtener eventos de un alumno
    async getByAlumno(req, res) {
        try {
            const { id } = req.params;
            const eventos = await EventosModel.findByAlumno(id);

            res.json({
                success: true,
                data: eventos
            });
        } catch (error) {
            console.error('Error obteniendo eventos del alumno:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Crear evento
    async create(req, res) {
        try {
            const eventoData = req.body;

            if (!eventoData.nombre || !eventoData.fecha || !eventoData.lugar) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre, fecha y lugar son requeridos'
                });
            }

            const id = await EventosModel.create(eventoData);

            res.status(201).json({
                success: true,
                message: 'Evento creado exitosamente',
                data: { id }
            });
        } catch (error) {
            console.error('Error creando evento:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Inscribir alumno a evento
    async inscribirAlumno(req, res) {
        try {
            const { id } = req.params; // evento_id
            const { alumno_id } = req.body;

            if (!alumno_id) {
                return res.status(400).json({
                    success: false,
                    message: 'alumno_id es requerido'
                });
            }

            const inscripcionId = await EventosModel.inscribirAlumno(alumno_id, id);

            res.status(201).json({
                success: true,
                message: 'Alumno inscrito exitosamente',
                data: { inscripcion_id: inscripcionId }
            });
        } catch (error) {
            console.error('Error inscribiendo alumno:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error en el servidor'
            });
        }
    },

    // Actualizar checklist de inscripción
    async updateChecklist(req, res) {
        try {
            const { id } = req.params; // inscripcion_id
            const checklistData = req.body;

            const updated = await EventosModel.updateChecklist(id, checklistData);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Inscripción no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Checklist actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando checklist:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Obtener próximos eventos
    async getProximos(req, res) {
        try {
            const eventos = await EventosModel.getProximosEventos();

            res.json({
                success: true,
                data: eventos
            });
        } catch (error) {
            console.error('Error obteniendo próximos eventos:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Eliminar evento
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await EventosModel.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Evento eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando evento:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
};

// Controlador adicional para cursos
const CursosController = {
    // Listar todos los cursos
    async getAll(req, res) {
        try {
            const cursos = await CursosModel.findAll();

            res.json({
                success: true,
                data: cursos
            });
        } catch (error) {
            console.error('Error obteniendo cursos:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Obtener cursos de un alumno
    async getByAlumno(req, res) {
        try {
            const { id } = req.params;
            const cursos = await CursosModel.findByAlumno(id);

            res.json({
                success: true,
                data: cursos
            });
        } catch (error) {
            console.error('Error obteniendo cursos del alumno:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Obtener participantes de un curso
    async getParticipantes(req, res) {
        try {
            const { id } = req.params;
            const participantes = await CursosModel.getAlumnosCurso(id);

            res.json({
                success: true,
                data: participantes
            });
        } catch (error) {
            console.error('Error obteniendo participantes del curso:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Crear curso
    async create(req, res) {
        try {
            const cursoData = req.body;

            // Validar campos requeridos
            if (!cursoData.nombre) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre del curso es requerido'
                });
            }

            // Mapear campos del frontend al modelo de BD
            const cursoMapeado = {
                nombre: cursoData.nombre,
                descripcion: cursoData.descripcion || '',
                profesor: cursoData.profesor || '',
                dia_semana: cursoData.horario_dia || 'Lunes',
                hora_inicio: cursoData.horario_hora || '18:00',
                // Calcular hora_fin sumando duracion_minutos
                hora_fin: calcularHoraFin(cursoData.horario_hora || '18:00', cursoData.duracion_minutos || 60),
                cupo_maximo: cursoData.cupo_maximo || 15
            };

            const id = await CursosModel.create(cursoMapeado);

            res.status(201).json({
                success: true,
                message: 'Curso creado exitosamente',
                data: { id }
            });
        } catch (error) {
            console.error('Error creando curso:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Actualizar curso
    async update(req, res) {
        try {
            const { id } = req.params;
            const cursoData = req.body;

            // Mapear campos del frontend al modelo de BD
            const cursoMapeado = {
                nombre: cursoData.nombre,
                descripcion: cursoData.descripcion || '',
                profesor: cursoData.profesor || '',
                dia_semana: cursoData.horario_dia || 'Lunes',
                hora_inicio: cursoData.horario_hora || '18:00',
                hora_fin: calcularHoraFin(cursoData.horario_hora || '18:00', cursoData.duracion_minutos || 60),
                cupo_maximo: cursoData.cupo_maximo || 15,
                activo: cursoData.activo ? 1 : 0
            };

            const updated = await CursosModel.update(id, cursoMapeado);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Curso no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Curso actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando curso:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Eliminar curso
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await CursosModel.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Curso no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Curso eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando curso:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Inscribir alumno a curso
    async inscribirAlumno(req, res) {
        try {
            const { id } = req.params; // curso_id
            const { alumno_id } = req.body;

            if (!alumno_id) {
                return res.status(400).json({
                    success: false,
                    message: 'alumno_id es requerido'
                });
            }

            const inscripcionId = await CursosModel.inscribirAlumno(alumno_id, id);

            res.status(201).json({
                success: true,
                message: 'Alumno inscrito al curso exitosamente',
                data: { inscripcion_id: inscripcionId }
            });
        } catch (error) {
            console.error('Error inscribiendo alumno al curso:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error en el servidor'
            });
        }
    },

    //Desinscribir alumno de curso
    async desinscribirAlumno(req, res) {
        try {
            const { id, alumnoId } = req.params; // curso_id, alumno_id

            const result = await CursosModel.desinscribirAlumno(alumnoId, id);

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Inscripción no encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Alumno desinscrito exitosamente'
            });
        } catch (error) {
            console.error('Error desinscribiendo alumno:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error en el servidor'
            });
        }
    }
};

// Función auxiliar para calcular hora_fin
function calcularHoraFin(horaInicio, duracionMinutos) {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const totalMinutos = horas * 60 + minutos + duracionMinutos;
    const horasFin = Math.floor(totalMinutos / 60);
    const minutosFin = totalMinutos % 60;
    return `${String(horasFin).padStart(2, '0')}:${String(minutosFin).padStart(2, '0')}`;
}

module.exports = { EventosController, CursosController };
