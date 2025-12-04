const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuariosModel = require('../models/usuarios.model');
const AlumnosModel = require('../models/alumnos.model');
const emailService = require('../services/email.service');

const AuthController = {
    // Login
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validar datos
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
            }

            // Buscar usuario
            const usuario = await UsuariosModel.findByEmail(email);
            if (!usuario) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verificar contraseña (soporta tanto hash como texto plano)
            let passwordMatch = false;

            // Intentar con bcrypt primero (si está hasheada)
            if (usuario.password_hash.startsWith('$2b$') || usuario.password_hash.startsWith('$2a$')) {
                passwordMatch = await bcrypt.compare(password, usuario.password_hash);
            } else {
                // Si no es hash, comparar texto plano (solo para desarrollo)
                passwordMatch = (password === usuario.password_hash);
            }

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Generar JWT
            const token = jwt.sign(
                { id: usuario.id, email: usuario.email, rol: usuario.rol },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            // Si es alumno, obtener datos del alumno
            let alumnoData = null;
            if (usuario.rol === 'alumno') {
                alumnoData = await AlumnosModel.findByUsuarioId(usuario.id);
            }

            res.json({
                success: true,
                message: 'Login exitoso',
                data: {
                    token,
                    user: {
                        id: usuario.id,
                        email: usuario.email,
                        rol: usuario.rol,
                        alumno: alumnoData
                    }
                }
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Registro (solo admin puede crear usuarios)
    async register(req, res) {
        try {
            const { email, password, rol, alumnoData } = req.body;

            // Validar datos
            if (!email || !password || !rol) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, contraseña y rol son requeridos'
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

            // Hashear contraseña
            const password_hash = await bcrypt.hash(password, 10);

            // Crear usuario
            const usuarioId = await UsuariosModel.create({
                email,
                password_hash,
                rol
            });

            // Si es alumno, crear también el registro de alumno
            if (rol === 'alumno' && alumnoData) {
                await AlumnosModel.create({
                    usuario_id: usuarioId,
                    ...alumnoData
                });

                // Enviar email de bienvenida
                try {
                    const nombreCompleto = `${alumnoData.nombre} ${alumnoData.apellido}`;
                    await emailService.enviarEmailBienvenida(email, nombreCompleto);
                    console.log('✅ Email de bienvenida enviado a:', email);
                } catch (emailError) {
                    console.error('⚠️ Error enviando email de bienvenida:', emailError.message);
                    // No fallar el registro si falla el email
                }
            }

            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                data: { id: usuarioId }
            });
        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Obtener datos del usuario autenticado
    async me(req, res) {
        try {
            const usuario = await UsuariosModel.findById(req.user.id);

            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            let alumnoData = null;
            if (usuario.rol === 'alumno') {
                alumnoData = await AlumnosModel.findByUsuarioId(usuario.id);
            }

            res.json({
                success: true,
                data: {
                    ...usuario,
                    alumno: alumnoData
                }
            });
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Solicitar recuperación de contraseña
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'El email es requerido'
                });
            }

            // Buscar usuario por email
            const usuario = await UsuariosModel.findByEmail(email);

            // Por seguridad, siempre retornar success aunque el email no exista
            // Esto previene que atacantes descubran qué emails están registrados
            if (!usuario) {
                return res.json({
                    success: true,
                    message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
                });
            }

            // Crear token de reset
            const PasswordResetModel = require('../models/password-reset.model');
            const { token } = await PasswordResetModel.create(email);

            // Enviar email con token
            let nombreUsuario = '';
            if (usuario.rol === 'alumno') {
                const alumno = await AlumnosModel.findByUsuarioId(usuario.id);
                if (alumno) {
                    nombreUsuario = `${alumno.nombre} ${alumno.apellido}`;
                }
            }

            await emailService.enviarResetPassword(email, nombreUsuario, token);

            res.json({
                success: true,
                message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
            });
        } catch (error) {
            console.error('Error en forgotPassword:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    },

    // Restablecer contraseña con token
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Token y nueva contraseña son requeridos'
                });
            }

            // Validar longitud de contraseña
            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                });
            }

            // Buscar y validar token
            const PasswordResetModel = require('../models/password-reset.model');
            const resetRecord = await PasswordResetModel.findValidToken(token);

            if (!resetRecord) {
                return res.status(400).json({
                    success: false,
                    message: 'Token inválido o expirado'
                });
            }

            // Hashear nueva contraseña
            const password_hash = await bcrypt.hash(newPassword, 10);

            // Actualizar contraseña del usuario
            const usuario = await UsuariosModel.findByEmail(resetRecord.email);
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            await UsuariosModel.updatePassword(usuario.id, password_hash);

            // Marcar token como usado
            await PasswordResetModel.markAsUsed(token);

            // Invalidar otros tokens pendientes del mismo usuario
            await PasswordResetModel.invalidateAllForEmail(resetRecord.email);

            res.json({
                success: true,
                message: 'Contraseña restablecida exitosamente'
            });
        } catch (error) {
            console.error('Error en resetPassword:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: error.message
            });
        }
    }
};

module.exports = AuthController;
