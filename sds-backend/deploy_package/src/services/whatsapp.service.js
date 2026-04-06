const whatsappBot = require('./whatsappBot');

class WhatsAppService {
    constructor() {
        console.log('✅ WhatsApp Notification Service initialized (via Bot Service / Fixed Dependencies)');
    }

    /**
     * Procesa variables en un mensaje template
     * @param {string} mensaje - Mensaje con variables {nombre}, {monto}, etc.
     * @param {Object} datos - Datos del alumno y contexto
     * @returns {string} - Mensaje con variables reemplazadas
     */
    procesarVariables(mensaje, datos) {
        if (!mensaje) return '';

        let mensajeProcesado = mensaje;

        // Variables básicas del alumno
        if (datos.nombre) mensajeProcesado = mensajeProcesado.replace(/{nombre}/g, datos.nombre);
        if (datos.apellido) mensajeProcesado = mensajeProcesado.replace(/{apellido}/g, datos.apellido);
        if (datos.email) mensajeProcesado = mensajeProcesado.replace(/{email}/g, datos.email);
        if (datos.telefono) mensajeProcesado = mensajeProcesado.replace(/{telefono}/g, datos.telefono);

        // Variables de pago
        if (datos.monto !== undefined) mensajeProcesado = mensajeProcesado.replace(/{monto}/g, datos.monto);
        if (datos.fecha_vencimiento) {
            const fecha = new Date(datos.fecha_vencimiento).toLocaleDateString('es-AR');
            mensajeProcesado = mensajeProcesado.replace(/{fecha_vencimiento}/g, fecha);
        }
        if (datos.concepto) mensajeProcesado = mensajeProcesado.replace(/{concepto}/g, datos.concepto);

        // Variables de curso
        if (datos.curso) mensajeProcesado = mensajeProcesado.replace(/{curso}/g, datos.curso);

        // Variables de evento
        if (datos.evento) mensajeProcesado = mensajeProcesado.replace(/{evento}/g, datos.evento);
        if (datos.fecha_evento) {
            const fecha = new Date(datos.fecha_evento).toLocaleDateString('es-AR');
            mensajeProcesado = mensajeProcesado.replace(/{fecha_evento}/g, fecha);
        }
        if (datos.hora_evento) mensajeProcesado = mensajeProcesado.replace(/{hora_evento}/g, datos.hora_evento);
        if (datos.ubicacion) mensajeProcesado = mensajeProcesado.replace(/{ubicacion}/g, datos.ubicacion);

        return mensajeProcesado;
    }

    /**
     * Obtiene la lista de variables disponibles para los templates
     * @returns {Array} - Lista de variables
     */
    obtenerVariablesDisponibles() {
        return [
            { nombre: '{nombre}', descripcion: 'Nombre del alumno', ejemplo: 'Juan' },
            { nombre: '{apellido}', descripcion: 'Apellido del alumno', ejemplo: 'Pérez' },
            { nombre: '{email}', descripcion: 'Email del alumno', ejemplo: 'juan@example.com' },
            { nombre: '{telefono}', descripcion: 'Teléfono del alumno', ejemplo: '+5491112345678' },
            { nombre: '{monto}', descripcion: 'Monto del pago', ejemplo: '5000' },
            { nombre: '{fecha_vencimiento}', descripcion: 'Fecha de vencimiento del pago', ejemplo: '31/12/2024' },
            { nombre: '{concepto}', descripcion: 'Concepto del pago', ejemplo: 'Mensualidad Diciembre' },
            { nombre: '{curso}', descripcion: 'Nombre del curso', ejemplo: 'Salsa Intermedio' },
            { nombre: '{evento}', descripcion: 'Nombre del evento', ejemplo: 'Show de Fin de Año' },
            { nombre: '{fecha_evento}', descripcion: 'Fecha del evento', ejemplo: '15/12/2024' },
            { nombre: '{hora_evento}', descripcion: 'Hora del evento', ejemplo: '20:00' },
            { nombre: '{ubicacion}', descripcion: 'Ubicación del evento', ejemplo: 'Teatro Municipal' }
        ];
    }

    /**
     * Normaliza número de teléfono para WhatsApp Web
     * @param {string} telefono - Número en cualquier formato (con o sin +)
     * @returns {string} - Número limpio para whatsapp-web.js (ej: 54911...)
     */
    normalizarTelefono(telefono) {
        if (!telefono) return null;

        // Remover espacios, guiones, paréntesis y símbolos +
        let numero = telefono.replace(/[\s\-()]/g, '');

        if (numero.startsWith('+')) {
            numero = numero.substring(1);
        }

        // Reglas básicas de normalización si no empieza con country code
        // (Asumimos que si tiene menos de 10 dígitos le falta algo, pero whatsapp-web prefiere numero completo)
        // Por ahora lo dejamos simple, o adaptamos la logica anterior:

        // Logica anterior adaptada para devolver SIN 'whatsapp:' y SIN '+'
        // Si ya tiene country code (54...), lo dejamos.

        // Argentina: 15... -> 54911...
        if (numero.startsWith('15')) {
            numero = '549' + numero.replace(/^15/, '11'); // Asume CABA 11 si empieza con 15? Ojo. 
            // Mejor: si empieza con 11 o 15, agregar 549
        } else if (numero.startsWith('11')) {
            numero = '549' + numero;
        }

        // Si empieza con 549, está ok.

        return numero;
    }

    /**
     * Envía un mensaje de WhatsApp a un número usando el Bot
     * @param {string} telefono - Número de teléfono
     * @param {string} mensaje - Mensaje a enviar
     * @returns {Promise<Object>} - Resultado del envío
     */
    async enviarMensaje(telefono, mensaje) {
        try {
            const numeroNormalizado = this.normalizarTelefono(telefono);

            if (!numeroNormalizado) {
                throw new Error('Número de teléfono inválido');
            }

            console.log(`📤 Enviando mensaje a ${numeroNormalizado} vía Bot...`);

            // Usar el servicio del Bot
            await whatsappBot.enviarMensajeManual(numeroNormalizado, mensaje);

            return {
                success: true,
                telefono: numeroNormalizado,
                method: 'whatsapp-web.js'
            };
        } catch (error) {
            console.error('Error enviando WhatsApp (Bot):', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Envía recordatorio de pago a un alumno
     * @param {Object} alumno - Datos del alumno
     * @param {Object} pago - Datos del pago
     * @returns {Promise<Object>}
     */
    async enviarRecordatorioPago(alumno, pago) {
        const mensaje = `🔔 Hola ${alumno.nombre}!

Te recordamos que tu pago de *$${pago.monto}* vence el *${new Date(pago.fecha_vencimiento).toLocaleDateString('es-AR')}*.

Concepto: ${pago.concepto}

Podés abonar en el estudio o por transferencia.

¡Gracias! 💃
Select Dance Studio`;

        return await this.enviarMensaje(alumno.telefono, mensaje);
    }

    /**
     * Envía notificación de pago vencido
     * @param {Object} alumno - Datos del alumno
     * @param {Object} pago - Datos del pago
     * @returns {Promise<Object>}
     */
    async enviarNotificacionVencido(alumno, pago) {
        const diasVencido = Math.floor((new Date() - new Date(pago.fecha_vencimiento)) / (1000 * 60 * 60 * 24));

        const mensaje = `⚠️ Hola ${alumno.nombre},

Tu pago de *$${pago.monto}* venció hace ${diasVencido} días.

Concepto: ${pago.concepto}
Fecha de vencimiento: ${new Date(pago.fecha_vencimiento).toLocaleDateString('es-AR')}

Por favor, comunicate con nosotros para regularizar tu situación.

Gracias 🙏
Select Dance Studio`;

        return await this.enviarMensaje(alumno.telefono, mensaje);
    }

    /**
     * Envía notificación de evento próximo
     * @param {Object} alumno - Datos del alumno
     * @param {Object} evento - Datos del evento
     * @returns {Promise<Object>}
     */
    async enviarNotificacionEvento(alumno, evento) {
        const mensaje = `🎉 ¡Hola ${alumno.nombre}!

Te recordamos que el evento *${evento.nombre}* es el *${new Date(evento.fecha).toLocaleDateString('es-AR')}* a las ${evento.hora}.

📍 Lugar: ${evento.ubicacion || evento.lugar || 'A confirmar'}

¡Te esperamos! 💃🕺
Select Dance Studio`;

        return await this.enviarMensaje(alumno.telefono, mensaje);
    }

    /**
     * Confirma inscripción a evento
     * @param {Object} alumno - Datos del alumno
     * @param {Object} evento - Datos del evento
     * @returns {Promise<Object>}
     */
    async confirmarInscripcionEvento(alumno, evento) {
        const mensaje = `✅ ¡Hola ${alumno.nombre}!

Tu inscripción al evento *${evento.nombre}* fue confirmada.

📅 Fecha: ${new Date(evento.fecha).toLocaleDateString('es-AR')}
🕐 Hora: ${evento.hora}
📍 Lugar: ${evento.ubicacion || evento.lugar}

¡Nos vemos! 🎭
Select Dance Studio`;

        return await this.enviarMensaje(alumno.telefono, mensaje);
    }

    /**
     * Envía mensaje de bienvenida a nuevo alumno
     * @param {Object} alumno - Datos del alumno (nombre, apellido, telefono)
     * @returns {Promise<Object>}
     */
    async enviarBienvenida(alumno) {
        const mensaje = `🎉 ¡Bienvenido/a ${alumno.nombre} ${alumno.apellido}!

Nos alegra que formes parte de *Select Dance Studio* 💃🕺

Estamos para ayudarte en lo que necesites.

¡Te esperamos en clase!
Select Dance Studio`;

        console.log(`📱 Enviando bienvenida a ${alumno.nombre} (${alumno.telefono})`);
        return await this.enviarMensaje(alumno.telefono, mensaje);
    }

    /**
     * Envía confirmación de inscripción a curso
     * @param {Object} alumno - Datos del alumno
     * @param {Object} curso - Datos del curso
     * @returns {Promise<Object>}
     */
    async enviarConfirmacionCurso(alumno, curso) {
        const mensaje = `📚 ¡Hola ${alumno.nombre}!

Tu inscripción al curso *${curso.nombre}* fue confirmada ✅

${curso.horarios ? `🕐 Horarios: ${curso.horarios}` : ''}
${curso.profesor ? `👨‍🏫 Profesor: ${curso.profesor}` : ''}

¡Te esperamos en clase! 💃
Select Dance Studio`;

        console.log(`📱 Enviando confirmación de curso a ${alumno.nombre} (${alumno.telefono})`);
        return await this.enviarMensaje(alumno.telefono, mensaje);
    }

    /**
     * Envía confirmación de desinscripción de curso
     * @param {Object} alumno - Datos del alumno
     * @param {Object} curso - Datos del curso
     * @returns {Promise<Object>}
     */
    async enviarDesinscripcionCurso(alumno, curso) {
        const mensaje = `Hola ${alumno.nombre} 👋

Te confirmamos que te has desinscribido del curso:
📚 *${curso.nombre}*

Esperamos verte pronto en otro curso. ¡Sigue bailando! 💃
Select Dance Studio`;

        console.log(`📱 Enviando desinscripción de curso a ${alumno.nombre} (${alumno.telefono})`);
        return await this.enviarMensaje(alumno.telefono, mensaje);
    }
    /**
     * Envía confirmación de pago recibido
     * @param {Object} alumno - Datos del alumno
     * @param {Object} pago - Datos del pago
     * @returns {Promise<Object>}
     */
    async enviarConfirmacionPago(alumno, pago) {
        const mensaje = `¡Hola ${alumno.nombre}! ✅

Confirmamos la recepción de tu pago:
💰 Monto: $${pago.monto}
📝 Concepto: ${pago.concepto}
📅 Fecha: ${pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleDateString('es-AR') : new Date().toLocaleDateString('es-AR')}

¡Muchas gracias! 🙏`;

        return this.enviarMensaje(alumno.telefono, mensaje);
    }

    // ========== FASE 1: NOTIFICACIONES INMEDIATAS ==========

    /**
     * Notifica inscripción a curso
     * @param {Object} alumno - Datos del alumno
     * @param {Object} curso - Datos del curso
     * @returns {Promise<Object>}
     */
    async enviarNotificacionInscripcionCurso(alumno, curso) {
        const mensaje = `¡Hola ${alumno.nombre}! 👋

Te confirmamos tu inscripción al curso:
📚 ${curso.nombre}
📅 ${curso.dias || 'Por confirmar'} - ${curso.horario || 'Por confirmar'}
${curso.profesor ? `👨‍🏫 Profesor: ${curso.profesor}` : ''}

¡Nos vemos en clase! 💃`;

        return this.enviarMensaje(alumno.telefono, mensaje);
    }

    /**
     * Notifica creación de nuevo pago
     * @param {Object} alumno - Datos del alumno
     * @param {Object} pago - Datos del pago
     * @returns {Promise<Object>}
     */
    async enviarNotificacionNuevoPago(alumno, pago) {
        const fechaVenc = new Date(pago.fecha_vencimiento).toLocaleDateString('es-AR');
        const mensaje = `Hola ${alumno.nombre} 👋

Se ha generado un nuevo pago:
💰 Monto: $${pago.monto}
📝 Concepto: ${pago.concepto}
📅 Vence: ${fechaVenc}

Puedes realizar el pago en el estudio. ¡Gracias!`;

        return this.enviarMensaje(alumno.telefono, mensaje);
    }

    /**
     * Envía mensaje de bienvenida
     * @param {Object} alumno - Datos del alumno
     * @returns {Promise<Object>}
     */
    async enviarMensajeBienvenida(alumno) {
        const mensaje = `¡Bienvenido/a a Select Dance Studio, ${alumno.nombre}! 🎉💃

Estamos muy felices de tenerte con nosotros.

Tu cuenta ya está activa y podrás consultar:
✅ Tus cursos
✅ Tus pagos
✅ Próximos eventos

¡Nos vemos en el estudio! ✨`;

        return this.enviarMensaje(alumno.telefono, mensaje);
    }

    // ========== FASE 2: RECORDATORIOS CRÍTICOS ==========

    /**
     * Notifica pago vencido
     * @param {Object} alumno - Datos del alumno
     * @param {Object} pago - Datos del pago
     * @returns {Promise<Object>}
     */
    async enviarNotificacionPagoVencido(alumno, pago) {
        const fechaVenc = new Date(pago.fecha_vencimiento);
        const hoy = new Date();
        const diasVencido = Math.floor((hoy - fechaVenc) / (1000 * 60 * 60 * 24));

        const mensaje = `Hola ${alumno.nombre} 👋

Tienes un pago vencido:
💰 Monto: $${pago.monto}
📝 Concepto: ${pago.concepto}
📅 Venció: ${fechaVenc.toLocaleDateString('es-AR')}
⏰ Días vencido: ${diasVencido}

Por favor, acércate al estudio para regularizar tu situación.`;

        return this.enviarMensaje(alumno.telefono, mensaje);
    }

    // ========== FASE 3: ENGAGEMENT ==========

    /**
     * Envía felicitación de cumpleaños
     * @param {Object} alumno - Datos del alumno
     * @returns {Promise<Object>}
     */
    async enviarFelicitacionCumpleaños(alumno) {
        const mensaje = `🎉🎂 ¡FELIZ CUMPLEAÑOS, ${alumno.nombre}! 🎂🎉

Todo el equipo de Select Dance Studio te desea un día maravilloso lleno de alegría y baile.

¡Que cumplas muchos más! 💃✨

Con cariño,
Select Dance Studio 💕`;

        return this.enviarMensaje(alumno.telefono, mensaje);
    }

    /**
     * Envía recordatorio de clase del día
     * @param {Object} alumno - Datos del alumno
     * @param {Object} curso - Datos del curso
     * @param {string} horario - Horario de la clase
     * @returns {Promise<Object>}
     */
    async enviarRecordatorioClase(alumno, curso, horario) {
        const mensaje = `¡Hola ${alumno.nombre}! 👋

Recordatorio: Hoy tienes clase de:
📚 ${curso.nombre}
🕐 Hora: ${horario}
${curso.ubicacion ? `📍 ${curso.ubicacion}` : ''}

¡Te esperamos! 💃`;

        return this.enviarMensaje(alumno.telefono, mensaje);
    }

    /**
     * Envía recordatorio de evento próximo (3 días antes)
     * @param {Object} alumno - Datos del alumno
     * @param {Object} evento - Datos del evento
     * @returns {Promise<Object>}
     */
    async enviarRecordatorioEventoProximo(alumno, evento) {
        const fechaEvento = new Date(evento.fecha);
        const mensaje = `¡Hola ${alumno.nombre}! 🎭

Recordatorio: En 3 días tenemos el evento:
🎉 ${evento.nombre}
📅 ${fechaEvento.toLocaleDateString('es-AR')} ${evento.hora ? `a las ${evento.hora}` : ''}
${evento.lugar ? `📍 ${evento.lugar}` : ''}

¿Ya tienes todo listo? ✨`;

        return this.enviarMensaje(alumno.telefono, mensaje);
    }

    // ========== FASE 4: ANÁLISIS Y RETENCIÓN ==========

    /**
     * Alerta de baja asistencia
     * @param {Object} alumno - Datos del alumno
     * @param {Object} stats - Estadísticas (porcentaje)
     * @returns {Promise<Object>}
     */
    async enviarAlertaBajaAsistencia(alumno, stats) {
        const mensaje = `Hola ${alumno.nombre} 👋

Notamos que tu asistencia ha bajado últimamente:
📉 Últimas 4 semanas: ${stats.porcentaje}%

¿Todo bien? Si tienes algún inconveniente, cuéntanos. Estamos para ayudarte 💙

Select Dance Studio`;

        return this.enviarMensaje(alumno.telefono, mensaje);
    }

    /**
     * Envía mensaje personalizado a múltiples destinatarios
     * @param {Array} alumnos - Array de alumnos
     * @param {string} mensaje - Mensaje template con variables
     * @returns {Promise<Array>} - Resultados de envío
     */
    async enviarMensajeMasivo(alumnos, mensaje) {
        const resultados = [];

        for (const alumno of alumnos) {
            try {
                const mensajeFinal = this.procesarVariables(mensaje, alumno);
                const resultado = await this.enviarMensaje(alumno.telefono, mensajeFinal);

                resultados.push({
                    alumno: `${alumno.nombre} ${alumno.apellido}`,
                    telefono: alumno.telefono,
                    success: resultado.success,
                    messageSid: resultado.messageSid
                });

                // Pequeña pausa entre mensajes para no saturar API
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                resultados.push({
                    alumno: `${alumno.nombre} ${alumno.apellido}`,
                    telefono: alumno.telefono,
                    success: false,
                    error: error.message
                });
            }
        }

        return resultados;
    }

    /**
     * Envía resumen diario de clases a cada profesor
     * Consulta los cursos de hoy agrupados por profesor y envía un mensaje con las alumnas inscriptas
     */
    async enviarResumenDiarioProfesor() {
        try {
            const db = require('../config/db');

            // Obtener el nombre del día actual en español para comparar con dia_semana
            const diasES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            const hoy = diasES[new Date().getDay()];

            console.log(`📅 [CRON Debug] Día actual generado: "${hoy}"`);

            // Buscar cursos del día de hoy con su profesor (incluyendo teléfono del profesor)
            const [cursos] = await db.query(`
                SELECT 
                    c.id as curso_id,
                    c.nombre as curso_nombre,
                    c.hora_inicio,
                    c.hora_fin,
                    u.nombre as profesor,
                    u.id as profesor_id,
                    u.telefono as profesor_telefono
                FROM cursos c
                LEFT JOIN usuarios u ON c.profesor_id = u.id
                WHERE c.dia_semana = ? AND c.activo = 1
                ORDER BY c.hora_inicio
            `, [hoy]);

            console.log(`📅 [CRON Debug] Cursos encontrados para "${hoy}": ${cursos.length}`);
            if (cursos.length > 0) {
                console.log(`📅 [CRON Debug] Primer curso encontrado: ${cursos[0].curso_nombre} (Profesor: ${cursos[0].profesor})`);
            }

            if (cursos.length === 0) {
                console.log(`ℹ️ [CRON] No hay clases el ${hoy}.`);
                return { success: true, enviados: 0, mensaje: 'Sin clases hoy', dia: hoy };
            }

            // Agrupar cursos por profesor
            const porProfesor = {};
            for (const curso of cursos) {
                const key = curso.profesor_id || curso.profesor || 'sin_profesor';
                if (!porProfesor[key]) {
                    porProfesor[key] = {
                        nombre: curso.profesor || 'Professor',
                        telefono: curso.profesor_telefono,
                        cursos: []
                    };
                }

                // Obtener alumnas inscriptas en este curso (con nombre desde usuarios)
                const [alumnas] = await db.query(`
                    SELECT u.nombre, u.apellido
                    FROM inscripciones_curso ic
                    INNER JOIN alumnos a ON ic.alumno_id = a.id
                    INNER JOIN usuarios u ON a.usuario_id = u.id
                    WHERE ic.curso_id = ?
                    ORDER BY u.nombre
                `, [curso.curso_id]);

                console.log(`📅 [CRON Debug] Alumnas para ${curso.curso_nombre}: ${alumnas.length}`);

                porProfesor[key].cursos.push({
                    nombre: curso.curso_nombre,
                    hora_inicio: curso.hora_inicio,
                    hora_fin: curso.hora_fin,
                    alumnas
                });
            }

            console.log(`📅 [CRON Debug] Grupos de profesores generados: ${Object.keys(porProfesor).length}`);

            let enviados = 0;
            const resultados = [];

            for (const [key, data] of Object.entries(porProfesor)) {
                // Construir mensaje por profesor
                let mensaje = `🗓️ *Resumen de clases de la mujer mas hermosa del mundo- ${hoy}*\n`;
                mensaje += `Hola ${data.nombre.split(' ')[0]}! Acá está tu agenda de hoy:\n\n`;

                for (const curso of data.cursos) {
                    const hora = curso.hora_inicio ? curso.hora_inicio.substring(0, 5) : '?';
                    const horaFin = curso.hora_fin ? curso.hora_fin.substring(0, 5) : '?';
                    mensaje += `📚 *${curso.nombre}* — ${hora} a ${horaFin}\n`;

                    if (curso.alumnas.length === 0) {
                        mensaje += `   _Sin alumnas inscriptas_\n`;
                    } else {
                        mensaje += `👥 Alumnas (${curso.alumnas.length}):\n`;
                        for (const a of curso.alumnas) {
                            mensaje += `   • ${a.nombre} ${a.apellido}\n`;
                        }
                    }
                    mensaje += `\n`;
                }

                mensaje += `¡Que tengas un excelente día! 💃\n*Select Dance Studio*`;

                // === Enviar a TODOS los números de administrador (admite múltiples separados por coma) ===
                const adminPhones = (process.env.ADMIN_PHONE || "5491100000000")
                    .split(',')
                    .map(n => n.trim())
                    .filter(n => n.length > 0);

                for (const numeroAdmin of adminPhones) {
                    console.log(`[CRON] Enviando agenda del profesor ${data.nombre} → ${numeroAdmin}`);
                    const resultado = await this.enviarMensaje(numeroAdmin, mensaje);
                    if (resultado.success) enviados++;
                    resultados.push({ profesor: data.nombre, telefono: numeroAdmin, ...resultado });
                    await new Promise(r => setTimeout(r, 500));
                }

                // Pequeña pausa entre grupos de mensajes
                await new Promise(r => setTimeout(r, 1500));
            }

            console.log(`✅ [CRON] Resúmenes diarios enviados: ${enviados}/${Object.keys(porProfesor).length}`);
            return { enviados, resultados };

        } catch (error) {
            console.error('❌ [CRON] Error enviando resumen diario:', error);
            return { enviados: 0, error: error.message };
        }
    }
}

module.exports = new WhatsAppService();
