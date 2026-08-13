const db = require('../../config/db');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const NotificacionModel = require('../../models/notificacion.model');
const EmailService = require('../../services/email.service');
const ConsultasModel = require('../../models/consultas.model');
const notifSettings = require('../../services/notifSettings');

const notificationUploadDir = path.join(__dirname, '../../../uploads/notificaciones');

const persistNotificationImage = async (file) => {
    if (!file) return null;

    await fs.promises.mkdir(notificationUploadDir, { recursive: true });
    const isGif = file.mimetype === 'image/gif';
    const suffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const extension = isGif ? '.gif' : '.jpg';
    const filename = `noti-${suffix}${extension}`;
    const absolutePath = path.join(notificationUploadDir, filename);

    try {
        const image = sharp(file.buffer, {
            animated: isGif,
            failOn: 'error',
            limitInputPixels: 40_000_000
        });
        await image.metadata();

        if (isGif) {
            await fs.promises.writeFile(absolutePath, file.buffer);
        } else {
            await image
                .rotate()
                .resize({
                    width: 1800,
                    height: 1800,
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .flatten({ background: '#ffffff' })
                .jpeg({ quality: 86, mozjpeg: true })
                .toFile(absolutePath);
        }

        return {
            url: `/uploads/notificaciones/${filename}`,
            absolutePath
        };
    } catch (error) {
        await fs.promises.unlink(absolutePath).catch(() => {});
        throw new Error('No se pudo procesar la imagen. Prueba con JPG, PNG, WebP, GIF, HEIC o AVIF.');
    }
};

const removeNotificationImage = async (imagePath) => {
    if (!imagePath) return;
    const filename = path.basename(imagePath);
    await fs.promises.unlink(path.join(notificationUploadDir, filename)).catch(error => {
        if (error.code !== 'ENOENT') {
            console.warn('[Comunicados] No se pudo eliminar la imagen:', error.message);
        }
    });
};

const NotificacionesController = {
    // Obtener contadores para badge de notificaciones (legacy + nuevo)
    async getPendingCounts(req, res) {
        try {
            const usuario_id = req.user.id;

            // Count pending consultas (si es admin)
            let consultasPendientes = 0;
            let pagosRevision = 0;

            if (req.user.rol === 'admin') {
                consultasPendientes = await ConsultasModel.countPending();
                const [pagosRows] = await db.query('SELECT COUNT(*) as count FROM pagos WHERE estado = "revision"');
                pagosRevision = parseInt(pagosRows[0].count, 10) || 0;
            }

            // Contar notificaciones no leídas del usuario actual
            const notificacionesNoLeidas = await NotificacionModel.countUnread(usuario_id);

            res.json({
                success: true,
                data: {
                    pagosRevision,
                    consultasPendientes,
                    notificacionesNoLeidas,
                    total: pagosRevision + consultasPendientes + notificacionesNoLeidas
                }
            });
        } catch (error) {
            console.error('Error obteniendo contadores:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo notificaciones'
            });
        }
    },

    // Obtener mis notificaciones
    async getMyNotifications(req, res) {
        try {
            const usuario_id = req.user.id;
            const notificaciones = await NotificacionModel.findByUsuario(usuario_id);
            res.json({
                success: true,
                data: notificaciones
            });
        } catch (error) {
            console.error('Error getting notifications:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo notificaciones'
            });
        }
    },

    // Marcar notificación como leída
    async markAsRead(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.user.id;
            await NotificacionModel.markAsRead(id, usuario_id);
            res.json({ success: true, message: 'Notificación marcada como leída' });
        } catch (error) {
            console.error('Error check read:', error);
            res.status(500).json({ success: false, message: 'Error marcando como leída' });
        }
    },

    // Marcar todas como leídas
    async markAllAsRead(req, res) {
        try {
            const usuario_id = req.user.id;
            await NotificacionModel.markAllAsRead(usuario_id);
            res.json({ success: true, message: 'Todas marcadas como leídas' });
        } catch (error) {
            console.error('Error check all read:', error);
            res.status(500).json({ success: false, message: 'Error marcando orden' });
        }
    },

    // Eliminar notificación
    async delete(req, res) {
        try {
            const { id } = req.params;
            const usuario_id = req.user.id;
            await NotificacionModel.delete(id, usuario_id);
            res.json({ success: true, message: 'Notificación eliminada' });
        } catch (error) {
            console.error('Error delete notification:', error);
            res.status(500).json({ success: false, message: 'Error eliminando notificación' });
        }
    },

    // [ADMIN] Enviar notificación
    async sendNotification(req, res) {
        let savedImage = null;
        try {
            const { titulo, mensaje, tipo, filtro, destinatarioId, enviarEmail, remitente } = req.body;
            const batch_id = crypto.randomUUID();
            const shouldSendEmail = enviarEmail === 'true' || enviarEmail === true;

            if (!titulo?.trim() || !mensaje?.trim()) {
                return res.status(400).json({ success: false, message: 'Título y mensaje son obligatorios.' });
            }

            // 1. Identificar destinatarios
            let usuariosDestino = [];

            if (filtro === 'todos') {
                const [users] = await db.query('SELECT id, email, rol, activo FROM usuarios WHERE activo = 1');
                usuariosDestino = users;
            } else if (filtro === 'rol') {
                const [users] = await db.query('SELECT id, email, rol, activo FROM usuarios WHERE activo = 1 AND rol = ?', [destinatarioId]); // destinatarioId acts as role name here? NO, checking Comunicados.jsx
                // In Comunicados.jsx: value={destinatarioId} for role select. values: 'alumno', 'profesor', 'admin'. Correct.
                usuariosDestino = users;
            } else if (filtro === 'curso') {
                // Get users enrolled in the course
                const [users] = await db.query(`
                    SELECT u.id, u.email, u.rol, u.activo 
                    FROM inscripciones_curso ic 
                    JOIN alumnos a ON ic.alumno_id = a.id 
                    JOIN usuarios u ON a.usuario_id = u.id 
                    WHERE ic.curso_id = ? AND ic.activo = 1 AND u.activo = 1
                `, [destinatarioId]);
                usuariosDestino = users;
            } else if (filtro === 'usuario') {
                // Single user (solo si está activo)
                const [users] = await db.query('SELECT id, email, rol, activo FROM usuarios WHERE id = ? AND activo = 1', [destinatarioId]);
                usuariosDestino = users;
            }

            if (usuariosDestino.length === 0) {
                return res.status(404).json({ success: false, message: 'No se encontraron destinatarios para los filtros seleccionados.' });
            }

            if (req.file) {
                try {
                    savedImage = await persistNotificationImage(req.file);
                } catch (imageError) {
                    return res.status(400).json({ success: false, message: imageError.message });
                }
            }

            const imagen_url = savedImage?.url || null;

            // 2. Preparar datos para Bulk Insert
            const notificationsData = usuariosDestino.map(u => ({
                usuario_id: u.id,
                titulo,
                mensaje,
                tipo: tipo || 'info',
                imagen_url,
                remitente,
                batch_id
            }));

            // 3. Guardar en DB (Una sola query rápida)
            const insertedCount = await NotificacionModel.createBulk(notificationsData);

            // 4. Enviar Emails (Asíncrono - No bloquear respuesta)
            // ESTRATEGIA: Responder al cliente YA, y dejar los emails procesando en background.

            if (shouldSendEmail) {
                // Traer nombres desde usuarios en una sola query (optimizado)
                const userIds = usuariosDestino.map(u => u.id);
                const placeholders = userIds.map(() => '?').join(',');
                const [userNames] = await db.query(
                    `SELECT id, nombre FROM usuarios WHERE id IN (${placeholders})`,
                    userIds
                );
                const nombreMap = Object.fromEntries(userNames.map(u => [u.id, u.nombre || 'Usuario']));

                (async () => {
                    console.log('[Background] Iniciando envío de emails masivos...');
                    for (const user of usuariosDestino) {
                        if (!user.email) continue;
                        try {
                            const nombre = nombreMap[user.id] || 'Usuario';
                            // Envío manual desde el panel: sale aunque los correos automáticos estén pausados.
                            await EmailService.enviarEmailPersonalizado(
                                user.email,
                                nombre,
                                titulo,
                                mensaje,
                                { force: true, imagePath: savedImage?.absolutePath || null }
                            );
                        } catch (emailError) {
                            console.error(`[Background] Error enviando email a ${user.email}:`, emailError.message);
                        }
                    }
                    console.log('[Background] Envío de emails finalizado.');
                })().catch(err => console.error('[Background] Error fatal en envío de emails:', err));
            }

            res.json({
                success: true,
                message: `Notificaciones enviadas a ${insertedCount} usuarios. ${shouldSendEmail ? 'Los correos se están enviando en segundo plano.' : ''}`,
                data: { enviados: insertedCount, batch_id }
            });

        } catch (error) {
            await removeNotificationImage(savedImage?.absolutePath);
            console.error('Error enviando notificación:', error);
            console.error('Stack trace:', error.stack);
            res.status(500).json({ success: false, message: 'Error interno al enviar notificación' });
        }
    },

    // [ADMIN] Obtener historial de envíos
    async getSentHistory(req, res) {
        try {
            const history = await NotificacionModel.getSentHistory();
            res.json({ success: true, data: history });
        } catch (error) {
            console.error('[getSentHistory] Error:', error);
            res.status(500).json({ success: false, message: 'Error obteniendo historial' });
        }
    },

    // [ADMIN] Obtener destinatarios de un envío masivo (batch)
    async getBatchRecipients(req, res) {
        try {
            const { batch_id } = req.params;
            const recipients = await NotificacionModel.getBatchRecipients(batch_id);
            res.json({ success: true, data: recipients });
        } catch (error) {
            console.error('[getBatchRecipients] Error:', error);
            res.status(500).json({ success: false, message: 'Error obteniendo destinatarios' });
        }
    },

    // [ADMIN] Eliminar batch
    async deleteBatch(req, res) {
        try {
            const { batch_id } = req.params;
            const imageUrl = await NotificacionModel.getBatchImageUrl(batch_id);
            const deletedCount = await NotificacionModel.deleteBatch(batch_id);
            await removeNotificationImage(imageUrl);
            res.json({ success: true, message: `Se eliminaron ${deletedCount} notificaciones` });
        } catch (error) {
            console.error('Error deleting batch:', error);
            res.status(500).json({ success: false, message: 'Error eliminando notificaciones' });
        }
    },

    // [ADMIN] Estado de pausa de notificaciones automáticas
    async getPausa(req, res) {
        try {
            const estado = await notifSettings.getPausa();
            res.json({ success: true, data: estado });
        } catch (error) {
            console.error('Error getPausa:', error);
            res.status(500).json({ success: false, message: 'Error al leer el estado' });
        }
    },

    // [ADMIN] Pausar / reanudar un canal ({ canal: 'wsp'|'email', pausado: bool })
    async setPausa(req, res) {
        try {
            const { canal, pausado } = req.body;
            if (canal !== 'wsp' && canal !== 'email') {
                return res.status(400).json({ success: false, message: 'Canal inválido' });
            }
            await notifSettings.setPausa(canal, !!pausado);
            const estado = await notifSettings.getPausa();
            res.json({ success: true, data: estado });
        } catch (error) {
            console.error('Error setPausa:', error);
            res.status(500).json({ success: false, message: 'Error al cambiar el estado' });
        }
    }
};

module.exports = NotificacionesController;
