const whatsappService = require('../../services/whatsapp.service');
const db = require('../../config/db');
const cronService = require('../../services/cron.service');

const WhatsAppController = {
    /**
     * Enviar mensaje individual
     * POST /api/whatsapp/send
     * Body: { telefono, mensaje } o { alumno_id, mensaje }
     */
    async enviarMensaje(req, res) {
        try {
            const { telefono, mensaje, alumno_id } = req.body;

            if (!mensaje) {
                return res.status(400).json({
                    success: false,
                    message: 'El mensaje es requerido'
                });
            }

            let telefonoFinal = telefono;
            let mensajeFinal = mensaje;

            // Si se proporciona alumno_id, obtener sus datos automáticamente
            if (alumno_id) {
                const [alumnos] = await db.query(`
                    SELECT a.id as alumno_id, a.usuario_id, u.nombre, u.apellido, u.telefono, u.email
                    FROM alumnos a
                    INNER JOIN usuarios u ON a.usuario_id = u.id
                    WHERE a.id = ?
                `, [alumno_id]);

                if (alumnos.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: 'Alumno no encontrado'
                    });
                }

                const alumno = alumnos[0];
                telefonoFinal = alumno.telefono;

                if (!telefonoFinal) {
                    return res.status(400).json({
                        success: false,
                        message: 'El alumno no tiene teléfono registrado'
                    });
                }

                // Obtener datos adicionales del alumno
                const [pagos] = await db.query(`
                    SELECT monto, fecha_vencimiento, concepto
                    FROM pagos
                    WHERE alumno_id = ?
                    AND estado IN ('pendiente', 'parcial')
                    ORDER BY fecha_vencimiento ASC
                    LIMIT 1
                `, [alumno_id]);

                if (pagos.length > 0) {
                    alumno.monto = pagos[0].monto;
                    alumno.fecha_vencimiento = pagos[0].fecha_vencimiento;
                    alumno.concepto = pagos[0].concepto;
                }

                const [cursos] = await db.query(`
                    SELECT c.nombre
                    FROM cursos c
                    INNER JOIN inscripciones_curso ic ON c.id = ic.curso_id
                    WHERE ic.alumno_id = ?
                    LIMIT 1
                `, [alumno_id]);

                if (cursos.length > 0) {
                    alumno.curso = cursos[0].nombre;
                }

                const [eventos] = await db.query(`
                    SELECT e.nombre, e.fecha, e.hora, e.ubicacion
                    FROM eventos e
                    INNER JOIN inscripciones_evento ie ON e.id = ie.evento_id
                    WHERE ie.alumno_id = ?
                    AND e.fecha >= CURDATE()
                    ORDER BY e.fecha ASC
                    LIMIT 1
                `, [alumno_id]);

                if (eventos.length > 0) {
                    alumno.evento = eventos[0].nombre;
                    alumno.fecha_evento = eventos[0].fecha;
                    alumno.hora_evento = eventos[0].hora;
                    alumno.ubicacion = eventos[0].ubicacion;
                }

                // Procesar variables en el mensaje
                mensajeFinal = whatsappService.procesarVariables(mensaje, alumno);
            }

            if (!telefonoFinal) {
                return res.status(400).json({
                    success: false,
                    message: 'Teléfono es requerido'
                });
            }

            const resultado = await whatsappService.enviarMensaje(telefonoFinal, mensajeFinal);

            if (resultado.success) {
                res.json({
                    success: true,
                    message: 'Mensaje enviado exitosamente',
                    data: resultado
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al enviar mensaje',
                    error: resultado.error
                });
            }
        } catch (error) {
            console.error('Error en enviarMensaje:', error);
            res.status(500).json({
                success: false,
                message: 'Error al enviar mensaje',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * Enviar recordatorio de pago
     * POST /api/whatsapp/reminder
     * Body: { pago_id }
     */
    async enviarRecordatorio(req, res) {
        try {
            const { pago_id } = req.body;

            if (!pago_id) {
                return res.status(400).json({
                    success: false,
                    message: 'pago_id es requerido'
                });
            }

            // Obtener datos del pago y alumno (JOIN correcto post-normalización)
            const [rows] = await db.query(`
                SELECT p.*, u.nombre, u.apellido, u.email, u.telefono
                FROM pagos p
                INNER JOIN alumnos a ON p.alumno_id = a.id
                INNER JOIN usuarios u ON a.usuario_id = u.id
                WHERE p.id = ?
            `, [pago_id]);

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Pago no encontrado'
                });
            }

            const pago = rows[0];

            if (!pago.telefono) {
                return res.status(400).json({
                    success: false,
                    message: 'El alumno no tiene número de teléfono registrado'
                });
            }

            const resultado = await whatsappService.enviarRecordatorioPago(pago, pago);

            if (resultado.success) {
                res.json({
                    success: true,
                    message: 'Recordatorio enviado exitosamente',
                    data: resultado
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Error al enviar recordatorio',
                    error: resultado.error
                });
            }
        } catch (error) {
            console.error('Error en enviarRecordatorio:', error);
            res.status(500).json({
                success: false,
                message: 'Error al enviar recordatorio',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * Enviar mensaje masivo
     * POST /api/whatsapp/broadcast
     * Body: { alumno_ids: [], mensaje }
     */
    async enviarMasivo(req, res) {
        try {
            const { alumno_ids, mensaje } = req.body;

            if (!alumno_ids || !Array.isArray(alumno_ids) || alumno_ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'alumno_ids debe ser un array con al menos un ID'
                });
            }

            if (!mensaje) {
                return res.status(400).json({
                    success: false,
                    message: 'mensaje es requerido'
                });
            }

            // Obtener alumnos con todos sus datos
            const placeholders = alumno_ids.map(() => '?').join(',');
            const [alumnos] = await db.query(`
                SELECT a.id as alumno_id, a.usuario_id, u.nombre, u.apellido, u.telefono, u.email
                FROM alumnos a
                INNER JOIN usuarios u ON a.usuario_id = u.id
                WHERE a.id IN (${placeholders})
                AND u.telefono IS NOT NULL
            `, alumno_ids);

            if (alumnos.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No se encontraron alumnos con teléfono registrado'
                });
            }

            // Enriquecer cada alumno con sus datos de pagos y cursos
            for (let alumno of alumnos) {
                // Obtener el último pago pendiente o próximo a vencer
                const [pagos] = await db.query(`
                    SELECT monto, fecha_vencimiento, concepto, estado
                    FROM pagos
                    WHERE alumno_id = ?
                    AND estado IN ('pendiente', 'parcial')
                    ORDER BY fecha_vencimiento ASC
                    LIMIT 1
                `, [alumno.alumno_id]);

                if (pagos.length > 0) {
                    alumno.monto = pagos[0].monto;
                    alumno.fecha_vencimiento = pagos[0].fecha_vencimiento;
                    alumno.concepto = pagos[0].concepto;
                }

                // Obtener cursos del alumno
                const [cursos] = await db.query(`
                    SELECT c.nombre
                    FROM cursos c
                    INNER JOIN inscripciones_curso ic ON c.id = ic.curso_id
                    WHERE ic.alumno_id = ?
                    LIMIT 1
                `, [alumno.alumno_id]);

                if (cursos.length > 0) {
                    alumno.curso = cursos[0].nombre;
                }

                // Obtener próximo evento inscrito
                const [eventos] = await db.query(`
                    SELECT e.nombre, e.fecha, e.hora, e.ubicacion
                    FROM eventos e
                    INNER JOIN inscripciones_evento ie ON e.id = ie.evento_id
                    WHERE ie.alumno_id = ?
                    AND e.fecha >= CURDATE()
                    ORDER BY e.fecha ASC
                    LIMIT 1
                `, [alumno.alumno_id]);

                if (eventos.length > 0) {
                    alumno.evento = eventos[0].nombre;
                    alumno.fecha_evento = eventos[0].fecha;
                    alumno.hora_evento = eventos[0].hora;
                    alumno.ubicacion = eventos[0].ubicacion || eventos[0].lugar;
                }
            }

            const resultados = await whatsappService.enviarMensajeMasivo(alumnos, mensaje);

            const exitosos = resultados.filter(r => r.success).length;
            const fallidos = resultados.filter(r => !r.success).length;

            res.json({
                success: true,
                message: `Mensajes enviados: ${exitosos} exitosos, ${fallidos} fallidos`,
                data: {
                    total: resultados.length,
                    exitosos,
                    fallidos,
                    resultados
                }
            });
        } catch (error) {
            console.error('Error en enviarMasivo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al enviar mensajes masivos',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * Enviar notificación de evento
     * POST /api/whatsapp/event-notification
     * Body: { evento_id, alumno_ids: [] }
     */
    async enviarNotificacionEvento(req, res) {
        try {
            const { evento_id, alumno_ids } = req.body;

            if (!evento_id) {
                return res.status(400).json({
                    success: false,
                    message: 'evento_id es requerido'
                });
            }

            // Obtener evento
            const [eventos] = await db.query('SELECT * FROM eventos WHERE id = ?', [evento_id]);

            if (eventos.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Evento no encontrado'
                });
            }

            const evento = eventos[0];

            // Si no se especifican alumnos, enviar a todos los inscritos
            let alumnos;
            if (alumno_ids && alumno_ids.length > 0) {
                const placeholders = alumno_ids.map(() => '?').join(',');
                [alumnos] = await db.query(`
                    SELECT a.id as alumno_id, u.nombre, u.apellido, u.telefono
                    FROM alumnos a
                    INNER JOIN usuarios u ON a.usuario_id = u.id
                    WHERE a.id IN (${placeholders})
                    AND u.telefono IS NOT NULL
                `, alumno_ids);
            } else {
                [alumnos] = await db.query(`
                    SELECT a.id as alumno_id, u.nombre, u.apellido, u.telefono
                    FROM alumnos a
                    INNER JOIN usuarios u ON a.usuario_id = u.id
                    INNER JOIN inscripciones_evento ie ON a.id = ie.alumno_id
                    WHERE ie.evento_id = ?
                    AND u.telefono IS NOT NULL
                `, [evento_id]);
            }

            if (alumnos.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No se encontraron alumnos con teléfono registrado'
                });
            }

            const resultados = [];
            for (const alumno of alumnos) {
                const resultado = await whatsappService.enviarNotificacionEvento(alumno, evento);
                resultados.push({
                    alumno_id: alumno.alumno_id,
                    nombre: alumno.nombre,
                    ...resultado
                });
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            const exitosos = resultados.filter(r => r.success).length;

            res.json({
                success: true,
                message: `Notificaciones enviadas: ${exitosos}/${resultados.length}`,
                data: resultados
            });
        } catch (error) {
            console.error('Error en enviarNotificacionEvento:', error);
            res.status(500).json({
                success: false,
                message: 'Error al enviar notificación de evento',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * Obtener templates de mensajes
     * GET /api/whatsapp/templates
     */
    async obtenerTemplates(req, res) {
        try {
            const templates = [
                {
                    id: 'recordatorio_pago',
                    nombre: 'Recordatorio de Pago',
                    mensaje: '🔔 Hola {nombre}!\n\nTe recordamos que tu pago de *${monto}* vence el *{fecha_vencimiento}*.\n\nConcepto: {concepto}\n\nPodés abonar en el estudio o por transferencia.\n\n¡Gracias! 💃\nSelect Dance Studio',
                    variables: ['nombre', 'monto', 'fecha_vencimiento', 'concepto']
                },
                {
                    id: 'pago_vencido',
                    nombre: 'Pago Vencido',
                    mensaje: '⚠️ Hola {nombre},\n\nTu pago de *${monto}* venció el {fecha_vencimiento}.\n\nPor favor, comunicate con nosotros para regularizar tu situación.\n\nGracias 🙏\nSelect Dance Studio',
                    variables: ['nombre', 'monto', 'fecha_vencimiento']
                },
                {
                    id: 'evento_proximo',
                    nombre: 'Evento Próximo',
                    mensaje: '🎉 ¡Hola {nombre}!\n\nTe recordamos que el evento *{evento}* es el *{fecha_evento}* a las {hora_evento}.\n\n📍 Lugar: {ubicacion}\n\n¡Te esperamos! 💃🕺\nSelect Dance Studio',
                    variables: ['nombre', 'evento', 'fecha_evento', 'hora_evento', 'ubicacion']
                },
                {
                    id: 'bienvenida',
                    nombre: 'Bienvenida',
                    mensaje: '¡Hola {nombre}! 👋\n\nBienvenido/a a Select Dance Studio 💃🕺\n\nEstamos muy felices de tenerte en nuestro curso de {curso}.\n\n¡Nos vemos en clase!',
                    variables: ['nombre', 'curso']
                },
                {
                    id: 'mensaje_general',
                    nombre: 'Mensaje General',
                    mensaje: 'Hola {nombre} {apellido}!\n\n[Tu mensaje aquí]\n\nSaludos,\nSelect Dance Studio',
                    variables: ['nombre', 'apellido']
                }
            ];

            res.json({
                success: true,
                data: templates
            });
        } catch (error) {
            console.error('Error en obtenerTemplates:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener templates',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    /**
     * Obtener variables disponibles
     * GET /api/whatsapp/variables
     */
    async obtenerVariables(req, res) {
        try {
            const variables = whatsappService.obtenerVariablesDisponibles();
            res.json({
                success: true,
                data: variables
            });
        } catch (error) {
            console.error('Error al obtener variables:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener variables'
            });
        }
    },

    /**
     * Test manual de cron jobs
     * POST /api/whatsapp/test-cron
     */
    async testCron(req, res) {
        try {
            console.log('🧪 Ejecutando test manual de cron jobs...');

            // Ejecutar recordatorios de pago
            await cronService.notificarRecordatoriosPago();

            res.json({
                success: true,
                message: 'Test de cron ejecutado correctamente. Revisa la consola del servidor para detalles.'
            });
        } catch (error) {
            console.error('Error en test de cron:', error);
            res.status(500).json({
                success: false,
                message: 'Error ejecutando test de cron'
            });
        }
    },

    /**
     * Obtener estado de conexión y QR
     * GET /api/whatsapp/status
     */
    async getStatus(req, res) {
        try {
            const whatsappBot = require('../../services/whatsappBot');
            const status = await whatsappBot.getStatus();
            res.json({
                success: true,
                data: status
            });
        } catch (error) {
            console.error('Error obteniendo estado de WhatsApp:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo estado'
            });
        }
    },

    /**
     * Enviar resumen diario de clases - uno por profesor (cron job)
     * GET /api/whatsapp/send-summary
     */
    async enviarResumenClases(req, res) {
        try {
            const resultado = await whatsappService.enviarResumenDiarioProfesor();
            res.json({ success: true, data: resultado });
        } catch (error) {
            console.error('Error en enviarResumenClases:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    /**
     * Disparar manualmente el resumen diario de cursos del día (desde la UI admin)
     * POST /api/whatsapp/send-summary
     */
    async enviarResumenManual(req, res) {
        try {
            console.log('📅 [MANUAL] Admin disparando resumen de cursos del día...');
            const resultado = await cronService.enviarResumenProfesor();
            res.json({
                success: true,
                message: 'Resumen de cursos del día enviado correctamente por WhatsApp.',
                data: resultado
            });
        } catch (error) {
            console.error('Error en enviarResumenManual:', error);
            res.status(500).json({
                success: false,
                message: 'Error al enviar resumen de cursos: ' + error.message
            });
        }
    }
};

module.exports = WhatsAppController;

