const express = require('express');
const router = express.Router();
const emailService = require('../services/email.service');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const AlumnosModel = require('../models/alumnos.model');
const PagosModel = require('../models/pagos.model');
const EventosModel = require('../models/eventos.model');

// Todas las rutas requieren autenticación de admin
router.use(verifyToken);
router.use(isAdmin);

/**
 * POST /api/emails/test
 * Probar configuración de email
 */
router.post('/test', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email de destino requerido'
            });
        }

        const result = await emailService.probarConfiguracion(email);

        if (result.success) {
            res.json({
                success: true,
                message: 'Email de prueba enviado correctamente',
                data: result
            });
        } else {
            console.error('Error detallado en servicio:', result.error);
            res.status(500).json({
                success: false,
                message: 'Error al enviar email de prueba: ' + (result.error || 'Error desconocido'),
                error: result.error
            });
        }
    } catch (error) {
        console.error('Error en test de email:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar email de prueba',
            error: error.message
        });
    }
});

/**
 * POST /api/emails/recordatorio-pago
 * Enviar recordatorio de pago a un alumno
 */
router.post('/recordatorio-pago', async (req, res) => {
    try {
        const { email, nombre, concepto, monto, fechaVencimiento } = req.body;

        if (!email || !nombre || !concepto || !monto || !fechaVencimiento) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos'
            });
        }

        const result = await emailService.enviarRecordatorioPago(
            email,
            nombre,
            concepto,
            monto,
            fechaVencimiento
        );

        res.json({
            success: true,
            message: 'Recordatorio de pago enviado',
            data: result
        });
    } catch (error) {
        console.error('Error enviando recordatorio de pago:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar recordatorio de pago',
            error: error.message
        });
    }
});

/**
 * POST /api/emails/recordatorios-masivos
 * Enviar recordatorios de pago a todos los que tienen pagos pendientes
 */
router.post('/recordatorios-masivos', async (req, res) => {
    try {
        const pagosPendientes = await PagosModel.findPendientes();

        let enviados = 0;
        let errores = 0;
        const detallesErrores = [];

        for (const pago of pagosPendientes) {
            try {
                const alumno = await AlumnosModel.findById(pago.alumno_id);
                const emailDestino = alumno ? (alumno.email || alumno.email_padre) : null;

                if (alumno && emailDestino) {
                    const resultado = await emailService.enviarRecordatorioPago(
                        emailDestino,
                        `${alumno.nombre} ${alumno.apellido}`,
                        pago.concepto,
                        pago.monto,
                        pago.fecha_vencimiento
                    );

                    if (resultado.success) {
                        enviados++;
                    } else {
                        errores++;
                        detallesErrores.push(`Error con ${emailDestino}: ${resultado.error}`);
                    }
                } else {
                    errores++;
                    detallesErrores.push(`Alumno ${pago.alumno_id} sin email (ni padre) o no encontrado`);
                }
            } catch (error) {
                console.error(`Error enviando a ${pago.alumno_id}:`, error);
                errores++;
                detallesErrores.push(`Error de sistema con alumno ${pago.alumno_id}: ${error.message}`);
            }
        }

        res.json({
            success: true,
            message: `Proceso finalizado. Enviados: ${enviados}, Errores: ${errores}`,
            data: { enviados, errores, total: pagosPendientes.length, detalles: detallesErrores }
        });
    } catch (error) {
        console.error('Error enviando recordatorios masivos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar recordatorios masivos',
            error: error.message
        });
    }
});

/**
 * POST /api/emails/notificar-evento
 * Enviar notificación de evento
 */
router.post('/notificar-evento', async (req, res) => {
    try {
        const { email, nombre, nombreEvento, fecha, lugar } = req.body;

        if (!email || !nombre || !nombreEvento || !fecha) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos'
            });
        }

        const result = await emailService.enviarNotificacionEvento(
            email,
            nombre,
            nombreEvento,
            fecha,
            lugar
        );

        res.json({
            success: true,
            message: 'Notificación de evento enviada',
            data: result
        });
    } catch (error) {
        console.error('Error enviando notificación de evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar notificación de evento',
            error: error.message
        });
    }
});

/**
 * POST /api/emails/notificar-evento-masivo/:eventoId
 * Enviar notificación a todos los inscritos en un evento
 */
router.post('/notificar-evento-masivo/:eventoId', async (req, res) => {
    try {
        const { eventoId } = req.params;
        const evento = await EventosModel.findById(eventoId);

        if (!evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        let enviados = 0;
        let errores = 0;

        for (const inscrito of evento.inscritos) {
            try {
                const alumno = await AlumnosModel.findById(inscrito.id);
                const emailDestino = alumno ? (alumno.email || alumno.email_padre) : null;

                if (alumno && emailDestino) {
                    await emailService.enviarNotificacionEvento(
                        emailDestino,
                        `${alumno.nombre} ${alumno.apellido}`,
                        evento.nombre,
                        evento.fecha,
                        evento.lugar
                    );
                    enviados++;
                }
            } catch (error) {
                console.error(`Error enviando a ${inscrito.id}:`, error);
                errores++;
            }
        }

        res.json({
            success: true,
            message: `Notificaciones enviadas: ${enviados}, Errores: ${errores}`,
            data: { enviados, errores, total: evento.inscritos.length }
        });
    } catch (error) {
        console.error('Error enviando notificaciones de evento:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar notificaciones de evento',
            error: error.message
        });
    }
});

/**
 * POST /api/emails/bienvenida/:alumnoId
 * Enviar email de bienvenida a un alumno
 */
router.post('/bienvenida/:alumnoId', async (req, res) => {
    try {
        const { alumnoId } = req.params;
        const alumno = await AlumnosModel.findById(alumnoId);

        if (!alumno) {
            return res.status(404).json({
                success: false,
                message: 'Alumno no encontrado'
            });
        }

        const result = await emailService.enviarEmailBienvenida(
            alumno.email,
            `${alumno.nombre} ${alumno.apellido}`
        );

        res.json({
            success: true,
            message: 'Email de bienvenida enviado',
            data: result
        });
    } catch (error) {
        console.error('Error enviando email de bienvenida:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar email de bienvenida',
            error: error.message
        });
    }
});

/**
 * POST /api/emails/personalizado
 * Enviar email personalizado a un alumno
 */
router.post('/personalizado', async (req, res) => {
    try {
        const { email, nombre, asunto, mensaje } = req.body;

        if (!email || !asunto || !mensaje) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos (email, asunto, mensaje)'
            });
        }

        const result = await emailService.enviarEmailPersonalizado(
            email,
            nombre || 'Alumno',
            asunto,
            mensaje
        );

        res.json({
            success: true,
            message: 'Email personalizado enviado',
            data: result
        });
    } catch (error) {
        console.error('Error enviando email personalizado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar email personalizado',
            error: error.message
        });
    }
});

/**
 * POST /api/emails/masivo-personalizado
 * Enviar email personalizado a TODOS los alumnos
 */
router.post('/masivo-personalizado', async (req, res) => {
    try {
        const { asunto, mensaje } = req.body;

        if (!asunto || !mensaje) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos (asunto, mensaje)'
            });
        }

        const alumnos = await AlumnosModel.findAll();
        let enviados = 0;
        let errores = 0;
        const detallesErrores = [];

        for (const alumno of alumnos) {
            try {
                const emailDestino = alumno.email || alumno.email_padre;

                if (emailDestino) {
                    await emailService.enviarEmailPersonalizado(
                        emailDestino,
                        `${alumno.nombre} ${alumno.apellido}`,
                        asunto,
                        mensaje
                    );
                    enviados++;
                } else {
                    errores++;
                    detallesErrores.push(`Alumno ${alumno.nombre} ${alumno.apellido} sin email`);
                }
            } catch (error) {
                console.error(`Error enviando a ${alumno.id}:`, error);
                errores++;
                detallesErrores.push(`Error con alumno ${alumno.id}: ${error.message}`);
            }
        }

        res.json({
            success: true,
            message: `Envío masivo finalizado. Enviados: ${enviados}, Errores: ${errores}`,
            data: { enviados, errores, total: alumnos.length, detalles: detallesErrores }
        });
    } catch (error) {
        console.error('Error enviando emails masivos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar emails masivos',
            error: error.message
        });
    }
});

module.exports = router;
