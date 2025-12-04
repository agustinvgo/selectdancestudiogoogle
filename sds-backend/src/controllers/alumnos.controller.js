const AlumnosModel = require('../models/alumnos.model');
const UsuariosModel = require('../models/usuarios.model');
const bcrypt = require('bcrypt');

const AlumnosController = {
    // Listar todos los alumnos (admin only)
    async getAll(req, res) {
        try {
            const alumnos = await AlumnosModel.findAll();
            res.json({
                success: true,
                data: alumnos
            });
        } catch (error) {
            console.error('Error obteniendo alumnos:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Obtener alumno específico
    async getById(req, res) {
        try {
            const { id } = req.params;
            const alumno = await AlumnosModel.findById(id);

            if (!alumno) {
                return res.status(404).json({
                    success: false,
                    message: 'Alumno no encontrado'
                });
            }

            res.json({
                success: true,
                data: alumno
            });
        } catch (error) {
            console.error('Error obteniendo alumno:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Crear alumno (admin only)
    async create(req, res) {
        try {
            const { email, password, nombre, apellido, fecha_nacimiento, dni, telefono, email_padre, direccion } = req.body;

            // Validaciones
            if (!email || !password || !nombre || !apellido) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, contraseña, nombre y apellido son requeridos'
                });
            }

            // Verificar que el email no exista
            const existeUsuario = await UsuariosModel.findByEmail(email);
            if (existeUsuario) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está registrado'
                });
            }

            // Crear usuario
            const password_hash = await bcrypt.hash(password, 10);
            const usuarioId = await UsuariosModel.create({
                email,
                password_hash,
                rol: 'alumno'
            });

            // Crear alumno
            const alumnoId = await AlumnosModel.create({
                usuario_id: usuarioId,
                nombre,
                apellido,
                fecha_nacimiento: fecha_nacimiento || null,
                dni: dni || null,
                telefono: telefono || null,
                email_padre: email_padre || null,
                direccion: direccion || null
            });

            res.status(201).json({
                success: true,
                message: 'Alumno creado exitosamente',
                data: { id: alumnoId, usuario_id: usuarioId }
            });
        } catch (error) {
            console.error('Error creando alumno:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Actualizar alumno (admin only)
    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const updated = await AlumnosModel.update(id, updateData);

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Alumno no encontrado o sin cambios'
                });
            }

            res.json({
                success: true,
                message: 'Alumno actualizado exitosamente'
            });
        } catch (error) {
            console.error('Error actualizando alumno:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Eliminar alumno (admin only)
    async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await AlumnosModel.delete(id);

            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Alumno no encontrado'
                });
            }

            res.json({
                success: true,
                message: 'Alumno eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error eliminando alumno:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Obtener ficha completa del alumno
    async getFichaCompleta(req, res) {
        try {
            const { id } = req.params;
            const ficha = await AlumnosModel.getFichaCompleta(id);

            if (!ficha) {
                return res.status(404).json({
                    success: false,
                    message: 'Alumno no encontrado'
                });
            }

            res.json({
                success: true,
                data: ficha
            });
        } catch (error) {
            console.error('Error obteniendo ficha completa:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
};

module.exports = AlumnosController;
