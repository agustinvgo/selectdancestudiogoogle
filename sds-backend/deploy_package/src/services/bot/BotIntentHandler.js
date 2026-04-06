const ClasePruebaModel = require('../../models/clase_prueba.model');

class BotIntentHandler {
    
    static detectarIntencion(mensajeUsuario, respuestaBot) {
        const texto = (mensajeUsuario + ' ' + respuestaBot).toLowerCase();
        if (texto.match(/prueba|probar|conocer|primera clase|visitar|agendar/i)) return { tipo: 'CLASE_PRUEBA' };
        if (texto.match(/precio|costo|cuanto|vale|pagar/i)) return { tipo: 'CONSULTA_PRECIO' };
        if (texto.match(/horario|cuando|que dia|agenda/i)) return { tipo: 'CONSULTA_HORARIO' };
        if (texto.match(/deuda|debo|pago|estado.*pago|vencimiento/i)) return { tipo: 'CONSULTA_PAGO' };
        return { tipo: 'GENERAL' };
    }

    static async ejecutarPostAcciones(intencion, datosReceptor, mensajeOriginal) {
        if (intencion.tipo === 'CLASE_PRUEBA') {
            try {
                await ClasePruebaModel.create({
                    nombre: datosReceptor.nombre || 'A confirmar (WhatsApp)',
                    apellido: datosReceptor.apellido || '',
                    email: datosReceptor.email || 'whatsapp@selectdance.com',
                    telefono: datosReceptor.telefono,
                    interes: 'Consulta General (Bot)',
                    horario: 'A coordinar',
                    observaciones: `Solicitud desde Bot.\nMensaje original: ${mensajeOriginal}`
                });
                console.log(`✅ Solicitud de clase de prueba auto-generada para ${datosReceptor.telefono}`);
            } catch (error) {
                console.error('Error creando solicitud de clase (Bot):', error);
            }
        }
    }
}

module.exports = BotIntentHandler;
