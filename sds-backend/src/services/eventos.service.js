const EventosModel = require('../models/eventos.model');
const AlumnosModel = require('../models/alumnos.model');
const PagosModel = require('../models/pagos.model');
const emailService = require('./email.service');

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
            ? (typeof evento.fecha === 'string' ? evento.fecha.split('T')[0] : new Date(evento.fecha).toISOString().split('T')[0])
            : new Date().toISOString().split('T')[0];

        // Bug #2 fix: parsear fecha local para evitar desfase UTC al extraer mes/año
        let mesEvento, anioEvento;
        if (evento.fecha) {
            const fechaStr = typeof evento.fecha === 'string' ? evento.fecha.split('T')[0] : new Date(evento.fecha).toISOString().split('T')[0];
            const [y, m] = fechaStr.split('-').map(Number);
            mesEvento = m;
            anioEvento = y;
        } else {
            const hoy = new Date();
            mesEvento = hoy.getMonth() + 1;
            anioEvento = hoy.getFullYear();
        }

        const costos = [
            { tipo: 'Inscripción', monto: evento.costo_inscripcion },
            { tipo: 'Vestuario', monto: evento.costo_vestuario, concepto_tipo: 'Uniforme' },
            { tipo: 'Maquillaje', monto: evento.costo_maquillaje, concepto_tipo: 'Otro' },
            { tipo: 'Peinado', monto: evento.costo_peinado, concepto_tipo: 'Otro' }
        ];

        for (const costo of costos) {
            if (costo.monto && costo.monto > 0) {
                try {
                    const id = await PagosModel.create({
                        alumno_id: alumno_id,
                        concepto: `${costo.tipo} - ${evento.nombre}`,
                        tipo: costo.concepto_tipo || 'Evento',
                        monto: costo.monto,
                        fecha_vencimiento: fechaVencimiento,
                        estado: 'pendiente', // Bug #5 fix: minúscula para coincidir con el resto del sistema
                        mes: mesEvento,
                        anio: anioEvento
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
            const emailDestino = alumno?.usuario_email || alumno?.email || alumno?.email_padre;
            
            if (alumno && emailDestino) {
                emailService.enviarConfirmacionInscripcionEvento(emailDestino, alumno.nombre, evento.nombre, evento.fecha, evento.lugar)
                    .catch(err => console.error('Error enviando Email de evento:', err));
            }
        } catch (emailError) {
            console.error('Error preparando Email de evento:', emailError);
        }

        return {
            inscripcion_id: inscripcionId,
            pagos_creados: pagosCreados,
            total_pagos: pagosCreados.reduce((a, b) => a + b.monto, 0)
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
