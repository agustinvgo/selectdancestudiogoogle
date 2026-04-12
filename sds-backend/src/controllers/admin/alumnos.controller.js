const AlumnosModel = require('../../models/alumnos.model');
const UsuariosModel = require('../../models/usuarios.model');
const bcrypt = require('bcryptjs');
const PagosModel = require('../../models/pagos.model');
const emailService = require('../../services/email.service');
const db = require('../../config/db');

const AlumnosController = {
    // Listar todos los alumnos (admin only)
    async getAll(req, res) {
        try {
            let alumnos;
            const { page, limit, search, activo } = req.query;

            // Si es profesor, solo mostrar sus alumnos
            if (req.user.rol === 'profesor') {
                alumnos = await AlumnosModel.findByProfesorId(req.user.id);
            } else {
                // Admin ve todos (paginado)
                // Bug #1 fix: pasar un único objeto params compatible con la firma corregida
                const params = {
                    page: parseInt(req.query.page) || 1,
                    limit: parseInt(req.query.limit) || 1000,
                    search: req.query.search || '',
                    activo: req.query.activo
                };

                // Fetch data and stats in parallel
                const [result, stats] = await Promise.all([
                    AlumnosModel.findAll(params),
                    AlumnosModel.getStats()
                ]);

                alumnos = result; // { data, total }
                alumnos.stats = stats;
            }

            res.json({
                success: true,
                data: alumnos.data || alumnos, // Handle array or paginated object
                total: alumnos.total,
                stats: alumnos.stats, // Include stats
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined
            });
        } catch (error) {
            console.error('Error obteniendo alumnos:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Crear alumno (admin only)
    async create(req, res) {
        let connection;
        try {
            connection = await db.getConnection();
            await connection.beginTransaction();

            let { email, password, nombre, apellido, fecha_nacimiento, dni, telefono, email_padre, direccion, pagosIniciales, cursoIds } = req.body;

            // Parsear campos si vienen como string (FormData)
            if (typeof pagosIniciales === 'string') {
                try { pagosIniciales = JSON.parse(pagosIniciales); } catch (e) { console.error('Error parsing pagos', e); }
            }
            if (typeof cursoIds === 'string') {
                try { cursoIds = JSON.parse(cursoIds); } catch (e) { console.error('Error parsing cursos', e); }
            }

            // Validaciones (Ideally handled by express-validator now)
            if (!email || !password || !nombre || !apellido) {
                throw new Error('Email, contraseña, nombre y apellido son requeridos');
            }

            // Verificar que el email no exista
            const existeUsuario = await UsuariosModel.findByEmail(email);
            if (existeUsuario) {
                await connection.rollback();
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
                rol: 'alumno',
                nombre,
                apellido,
                telefono: telefono || null,
                foto_perfil: req.file ? `/uploads/perfiles/${req.file.filename}` : null
            }, connection);

            const alumnoId = await AlumnosModel.create({
                usuario_id: usuarioId,
                fecha_nacimiento: fecha_nacimiento || null,
                dni: dni || null,
                nombre_padre: req.body.nombre_padre || null,
                email_padre: email_padre || null,
                direccion: direccion || null
            }, connection);

            // Crear pagos iniciales si existen
            if (pagosIniciales && Array.isArray(pagosIniciales) && pagosIniciales.length > 0) {
                for (const pago of pagosIniciales) {
                    await PagosModel.create({
                        alumno_id: alumnoId,
                        monto: pago.monto,
                        concepto: pago.concepto,
                        fecha_vencimiento: pago.fecha_vencimiento || new Date().toISOString().split('T')[0],
                        estado: 'pendiente',
                        es_mensual: pago.es_mensual // Pass the flag
                    }, connection);
                }
            }

            await connection.commit();

            // Enviar mensaje de bienvenida por Email (async, no bloquea)
            if (email) {
                emailService.enviarEmailBienvenida(email, nombre)
                    .then(result => {
                        if (result.success) {
                            console.log(`✅ Email bienvenida enviado a ${nombre}`);
                        } else {
                            console.log(`⚠️ No se pudo enviar Email de bienvenida: ${result.error}`);
                        }
                    })
                    .catch(err => console.error('Error enviando Email bienvenida:', err));
            }

            res.status(201).json({
                success: true,
                message: 'Alumno creado exitosamente',
                data: { id: alumnoId, usuario_id: usuarioId }
            });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Error creando alumno:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } finally {
            if (connection) connection.release();
        }
    },

    // Actualizar alumno (admin only)
    async update(req, res) {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };

            // Si se está actualizando el estado activo
            if (updateData.activo !== undefined) {
                const estadoActualizado = await AlumnosModel.setActivo(id, updateData.activo);
                if (!estadoActualizado) {
                    return res.status(404).json({
                        success: false,
                        message: 'Alumno no encontrado'
                    });
                }
                return res.json({
                    success: true,
                    message: `Alumno ${updateData.activo ? 'activado' : 'desactivado'} exitosamente`
                });
            }

            // 1. Actualizar Usuario if needed
            const updateUsuario = {};
            let isUserUpdate = false;

            // Error #5 fix: usar !== undefined en vez de truthy check
            // para permitir borrar campos enviando string vacío ("")
            if (updateData.nombre !== undefined) { updateUsuario.nombre = updateData.nombre; isUserUpdate = true; }
            if (updateData.apellido !== undefined) { updateUsuario.apellido = updateData.apellido; isUserUpdate = true; }
            if (updateData.telefono !== undefined) { updateUsuario.telefono = updateData.telefono || null; isUserUpdate = true; }
            if (req.file) { updateUsuario.foto_perfil = `/uploads/perfiles/${req.file.filename}`; isUserUpdate = true; }
            if (updateData.email !== undefined) { updateUsuario.email = updateData.email; isUserUpdate = true; }

            let updatedUsuario = false;
            if (isUserUpdate) {
                // Find user id of this student
                const alumno = await AlumnosModel.findById(id);
                if (alumno) {
                    updatedUsuario = await UsuariosModel.update(alumno.usuario_id, updateUsuario);
                }
            }

            // 2. Actualizar Alumno specific info
            const updatedAlumno = await AlumnosModel.update(id, updateData);

            if (!updatedAlumno && !updatedUsuario) {
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
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = AlumnosController;
