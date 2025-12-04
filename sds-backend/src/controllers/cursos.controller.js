const CursosModel = require('../models/cursos.model');

const CursosController = {
    // Obtener todos los cursos
    async getAll(req, res) {
        try {
            const cursos = await CursosModel.findAll();
            res.json({
                success: true,
                data: cursos,
                message: 'Cursos obtenidos correctamente'
            });
        } catch (error) {
            console.error('Error en getAll:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener cursos',
                error: error.message
            });
        }
    },

    // Obtener curso por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const curso = await CursosModel.findById(id);

            if (!curso) {
                return res.status(404).json({
                    success: false,
                    message: 'Curso no encontrado'
                });
            }

            res.json({
                success: true,
                data: curso,
                message: 'Curso obtenido correctamente'
            });
        } catch (error) {
            console.error('Error en getById:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener curso',
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
                data: cursos,
                message: 'Cursos del alumno obtenidos correctamente'
            });
        } catch (error) {
            console.error('Error en getByAlumno:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener cursos del alumno',
                error: error.message
            });
        }
    },

    // Crear curso
    async create(req, res) {
        try {
            const { nombre, descripcion, nivel, horario_dia, horario_hora, duracion_minutos, cupo_maximo, profesor, activo } = req.body;

            // Validar campos requeridos
            if (!nombre || !horario_dia || !horario_hora || !duracion_minutos) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos'
                });
            }

            // Calcular hora_fin basándose en hora_inicio y duracion_minutos
            const [hours, minutes] = horario_hora.split(':');
            const startTime = new Date();
            startTime.setHours(parseInt(hours), parseInt(minutes), 0);
            const endTime = new Date(startTime.getTime() + duracion_minutos * 60000);
            const hora_fin = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

            const cursoData = {
                nombre,
                descripcion: descripcion || null,
                profesor: profesor || null,
                nivel: nivel || 'Principiante',
                dia_semana: horario_dia,
                hora_inicio: horario_hora,
                hora_fin,
                cupo_maximo: cupo_maximo || 15
            };

            const cursoId = await CursosModel.create(cursoData);

            res.status(201).json({
                success: true,
                data: { id: cursoId },
                message: 'Curso creado exitosamente'
            });
        } catch (error) {
            console.error('Error en create:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear curso',
                error: error.message
            });
        }
    },

    // Actualizar curso
    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, descripcion, nivel, horario_dia, horario_hora, duracion_minutos, cupo_maximo, profesor, activo } = req.body;

            // Verificar que el curso existe
            const cursoExistente = await CursosModel.findById(id);
            if (!cursoExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Curso no encontrado'
                });
            }

            // Calcular hora_fin
            const [hours, minutes] = horario_hora.split(':');
            const startTime = new Date();
            startTime.setHours(parseInt(hours), parseInt(minutes), 0);
            const endTime = new Date(startTime.getTime() + duracion_minutos * 60000);
            const hora_fin = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

            const cursoData = {
                nombre,
                descripcion: descripcion || null,
                profesor: profesor || null,
                nivel: nivel || 'Principiante',
                dia_semana: horario_dia,
                hora_inicio: horario_hora,
                hora_fin,
                cupo_maximo: cupo_maximo || 15,
                activo: activo ? 1 : 0
            };

            const updated = await CursosModel.update(id, cursoData);

            if (!updated) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo actualizar el curso'
                });
            }

            res.json({
                success: true,
                data: { id },
                message: 'Curso actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error en update:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar curso',
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
            console.error('Error en delete:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar curso',
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
                data: participantes,
                message: 'Participantes obtenidos correctamente'
            });
        } catch (error) {
            console.error('Error en getParticipantes:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener participantes',
                error: error.message
            });
        }
    },

    // Inscribir alumno al curso
    async inscribirAlumno(req, res) {
        try {
            const { id } = req.params;
            const { alumno_id } = req.body;

            if (!alumno_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Se requiere el ID del alumno'
                });
            }

            const inscripcionId = await CursosModel.inscribirAlumno(alumno_id, id);

            res.status(201).json({
                success: true,
                data: { inscripcionId },
                message: 'Alumno inscrito exitosamente'
            });
        } catch (error) {
            console.error('Error en inscribirAlumno:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error al inscribir alumno',
                error: error.message
            });
        }
    },

    // Desinscribir alumno del curso
    async desinscribirAlumno(req, res) {
        try {
            const { id, alumnoId } = req.params;

            const desinscrito = await CursosModel.desinscribirAlumno(alumnoId, id);

            if (!desinscrito) {
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
            console.error('Error en desinscribirAlumno:', error);
            res.status(500).json({
                success: false,
                message: 'Error al desinscribir alumno',
                error: error.message
            });
        }
    }
};

module.exports = CursosController;
