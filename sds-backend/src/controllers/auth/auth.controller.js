const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuariosModel = require('../../models/usuarios.model');
const AlumnosModel = require('../../models/alumnos.model');
const emailService = require('../../services/email.service');
const db = require('../../config/db');

const AuthController = {
    // Helper para validar contraseña
    validatePassword(password) {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{9,}$/;
        if (!regex.test(password)) {
            return {
                valid: false,
                message: 'La contraseña debe tener al menos 9 caracteres, una mayúscula, un número y un símbolo.'
            };
        }
        return { valid: true };
    },

    // Login
    async login(req, res) {
        try {
            const email = req.body.email ? req.body.email.trim() : null;
            const password = req.body.password ? req.body.password.trim() : null;

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

            // Verify password - always use bcrypt
            let passwordMatch = false;
            if (usuario.password_hash.startsWith('$2b$') || usuario.password_hash.startsWith('$2a$') || usuario.password_hash.startsWith('$2y$')) {
                // Standard bcrypt comparison
                passwordMatch = await bcrypt.compare(password, usuario.password_hash);
            } else {
                // Legacy plaintext account - compare and immediately upgrade to bcrypt
                if (password === usuario.password_hash) {
                    passwordMatch = true;
                    const newHash = await bcrypt.hash(password, 12);
                    await UsuariosModel.updatePassword(usuario.id, newHash);
                    console.log(`[Auth] Auto-upgraded plaintext password to bcrypt for user ${usuario.id}`);
                }
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

            // Configuración de cookie
            const isProduction = process.env.NODE_ENV === 'production';
            res.cookie('token', token, {
                httpOnly: true,          // No accesible desde JavaScript
                secure: isProduction,    // Solo HTTPS en prod (HTTP ok en local)
                sameSite: isProduction ? 'strict' : 'lax', // lax permite redirect en dev
                maxAge: 24 * 60 * 60 * 1000  // 1 día en ms
            });

            res.json({
                success: true,
                message: 'Login exitoso',
                data: {
                    token, // Mantenido por compatibilidad con clientes que usen header
                    user: {
                        id: usuario.id,
                        email: usuario.email,
                        rol: usuario.rol,
                        primer_login: usuario.primer_login,
                        alumno: alumnoData
                    }
                }
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el servidor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Logout — invalida la cookie del servidor
    async logout(req, res) {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
        });
        res.json({ success: true, message: 'Sesión cerrada' });
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

            // Validar política de contraseña
            const passwordCheck = AuthController.validatePassword(password);
            if (!passwordCheck.valid) {
                return res.status(400).json({
                    success: false,
                    message: passwordCheck.message
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
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
            const PasswordResetModel = require('../../models/password-reset.model');
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
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

            // Validar política de contraseña
            const passwordCheck = AuthController.validatePassword(newPassword);
            if (!passwordCheck.valid) {
                return res.status(400).json({
                    success: false,
                    message: passwordCheck.message
                });
            }

            // Buscar y validar token
            const PasswordResetModel = require('../../models/password-reset.model');
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

            // Marcar que ya no es primer login
            await UsuariosModel.update(usuario.id, { primer_login: false });

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
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Cambiar contraseña (usuario autenticado)
    async changePassword(req, res) {
        try {
            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Contraseña actual y nueva contraseña son requeridas'
                });
            }

            // Validar política de nueva contraseña
            const passwordCheck = AuthController.validatePassword(newPassword);
            if (!passwordCheck.valid) {
                return res.status(400).json({
                    success: false,
                    message: passwordCheck.message
                });
            }

            // Buscar usuario
            const usuario = await UsuariosModel.findByIdWithPassword(req.user.id);
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Verify current password
            let passwordMatch = false;
            if (usuario.password_hash.startsWith('$2b$') || usuario.password_hash.startsWith('$2a$')) {
                passwordMatch = await bcrypt.compare(oldPassword, usuario.password_hash);
            } else {
                // Legacy plaintext - compare and upgrade immediately on match
                if (oldPassword === usuario.password_hash) {
                    passwordMatch = true;
                    // The new password will be hashed below anyway
                }
            }

            if (!passwordMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña actual es incorrecta'
                });
            }

            // Hashear nueva contraseña
            const password_hash = await bcrypt.hash(newPassword, 10);

            // Actualizar contraseña
            await UsuariosModel.updatePassword(usuario.id, password_hash);

            // Marcar que ya no es primer login
            await UsuariosModel.update(usuario.id, { primer_login: false });

            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente',
                data: {
                    primer_login: false  // Devolver el estado actualizado
                }
            });
        } catch (error) {
            console.error('Error en changePassword:', error);
            res.status(500).json({
                success: false,
                message: 'Error al cambiar la contraseña',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = AuthController;
