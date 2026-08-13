const EventosModel = require('../models/eventos.model');
const AlumnosModel = require('../models/alumnos.model');
const PagosModel = require('../models/pagos.model');
const PagosService = require('./pagos.service');
const ResponsablesAlumnosModel = require('../models/responsables-alumnos.model');
const emailService = require('./email.service');
const { getDateOnlyString } = require('../utils/dateOnly');

class EventosService {
    
    // Inscribir a un Alumno y generar sus deudas automáticamente
    static async inscribirAlumnoConPagos(alumno_id, evento_id) {
        const evento = await EventosModel.findById(evento_id);
        if (!evento) throw new Error('Evento no encontrado');

        // Insertar en tabla de inscripciones
        const inscripcionId = await EventosModel.inscribirAlumno(alumno_id, evento_id);
        const pagosCreados = [];

        // Generar Facturación Automática
        const fechaVencimiento = evento.fecha
            ? getDateOnlyString(evento.fecha)
            : new Date().toISOString().split('T')[0];

        // Bug #2 fix: parsear fecha local para evitar desfase UTC al extraer mes/año
        let mesEvento, anioEvento;
        if (evento.fecha) {
            const fechaStr = getDateOnlyString(evento.fecha);
            const [y, m] = fechaStr.split('-').map(Number);
            mesEvento = m;
            anioEvento = y;
        } else {
            const hoy = new Date();
            mesEvento = hoy.getMonth() + 1;
            anioEvento = hoy.getFullYear();
        }

        const pagoPrincipalEnCuotas = evento.modalidad_pago === 'cuotas'
            && Number(evento.cantidad_cuotas) >= 2;
        const costos = [
            { tipo: 'Inscripción', monto: evento.costo_inscripcion, enCuotas: pagoPrincipalEnCuotas },
            { tipo: 'Vestuario', monto: evento.costo_vestuario, concepto_tipo: 'Uniforme' },
            { tipo: 'Maquillaje', monto: evento.costo_maquillaje, concepto_tipo: 'Otro' },
            { tipo: 'Peinado', monto: evento.costo_peinado, concepto_tipo: 'Otro' }
        ];

        for (const costo of costos) {
            if (costo.monto && costo.monto > 0) {
                try {
                    if (costo.enCuotas) {
                        const plan = await PagosService.crearPlanDeCuotas({
                            alumno_id,
                            concepto: `${costo.tipo} - ${evento.nombre}`,
                            monto_total: Number(costo.monto),
                            cuotas: Number(evento.cantidad_cuotas),
                            fecha_primera_cuota: evento.fecha_primera_cuota || fechaVencimiento,
                            descripcion: `Plan de pago del evento ${evento.nombre}`,
                            referencia_externa: `EVENTO-${evento_id}-INSCRIPCION-${inscripcionId}`
                        });

                        plan.pagosCreados.forEach((id, index) => {
                            pagosCreados.push({
                                tipo: `${costo.tipo} (Cuota ${index + 1}/${plan.cuotas})`,
                                monto: plan.montosCuotas[index],
                                id
                            });
                        });
                        continue;
                    }

                    const id = await PagosModel.create({
                        alumno_id: alumno_id,
                        concepto: `${costo.tipo} - ${evento.nombre}`,
                        tipo: costo.concepto_tipo || 'Evento',
                        monto: costo.monto,
                        fecha_vencimiento: fechaVencimiento,
                        estado: 'pendiente', // Bug #5 fix: minúscula para coincidir con el resto del sistema
                        mes: mesEvento,
                        anio: anioEvento,
                        impacto_financiero: 'ingreso',
                        referencia_externa: `EVENTO-${evento_id}-INSCRIPCION-${inscripcionId}-${costo.tipo.toUpperCase()}`
                    });
                    pagosCreados.push({ tipo: costo.tipo, monto: costo.monto, id });
                } catch (e) {
                    console.error(`Error creando pago de ${costo.tipo}:`, e);
                }
            }
        }

        // Enviar Correo Electrónico Sincrónico-Silencioso
        try {
            const alumno = await AlumnosModel.findById(alumno_id);

            if (alumno) {
                const destinatarios = await ResponsablesAlumnosModel.findNotificationRecipientsByAlumnoId(alumno_id);
                const emails = [...new Set([
                    ...destinatarios.map((responsable) => responsable.email),
                    alumno.email || alumno.email_padre
                ].map((email) => String(email || '').trim().toLowerCase()).filter(Boolean))];
                emails.forEach((emailDestino) => {
                    emailService.enviarConfirmacionInscripcionEvento(emailDestino, alumno.nombre, evento.nombre, evento.fecha, evento.lugar)
                        .catch(err => console.error('Error enviando Email de evento:', err));
                });
            }
        } catch (emailError) {
            console.error('Error preparando Email de evento:', emailError);
        }

        return {
            inscripcion_id: inscripcionId,
            pagos_creados: pagosCreados,
            total_pagos: pagosCreados.reduce((total, pago) => total + Number(pago.monto || 0), 0)
        };
    }

    // Desinscribir de evento
    static async desinscribirAlumnoConNotificacion(inscripcionId) {
        const inscripcion = await EventosModel.findInscripcionById(inscripcionId);
        if (!inscripcion) throw new Error('Inscripción no encontrada');

        const deleted = await EventosModel.desinscribirAlumno(inscripcionId);
        if (!deleted) throw new Error('Fallo al eliminar la inscripción de la DB');

        // Notificación
        try {
            const alumno = await AlumnosModel.findById(inscripcion.alumno_id);
            const evento = await EventosModel.findById(inscripcion.evento_id);
            const emailDestino = alumno?.email || alumno?.email_padre;

            if (alumno && emailDestino && evento) {
                emailService.enviarDesinscripcionEvento(emailDestino, alumno.nombre, evento.nombre)
                    .catch(err => console.error('Error enviando Email desinscripción:', err));
            }
        } catch (error) {
            console.error('Error preparando notificacion de desinscripcion:', error);
        }

        return true;
    }
}

module.exports = EventosService;
