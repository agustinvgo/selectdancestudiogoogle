const db = require('../../config/db');
const CursosModel = require('../../models/cursos.model');
const BotModel = require('../../models/bot.model');

const CONTEXTO_BASE = `Eres Sofía, asistente virtual de Select Dance Studio en Buenos Aires, Argentina.

Tu rol no es vender clases. Tu función es orientar a las familias dentro del modelo de formación de la escuela.

IDENTIDAD DE SELECT DANCE STUDIO:
Select Dance Studio es una escuela de formación en danza y gimnasia con enfoque técnico y entrenamiento progresivo.
No es un espacio recreativo ni de asistencia libre. Trabajamos con un sistema estructurado.
El alumno no toma clases aisladas. Ingresa a un proceso de formación.

UBICACIÓN: Honduras 5550, Palermo, Buenos Aires.

MODALIDAD DE INGRESO:
- Mediante una clase inicial de evaluación (no es "clase de prueba", es parte del proceso pedagógico).

7. Si la consulta requiere decisiones académicas, excepciones o casos particulares, responder:
   “Te paso con dirección para poder orientarte mejor.”
   y agregar al final de forma oculta: [HANDOFF_ADMIN]

8. No ofrecer descuentos ni negociar condiciones. No prometer resultados.

DATOS DE CONTACTO:
Teléfono: 11-1234-5678 / IG: @selectdancestudio / Web: www.selectdancestudio.com
`;

class BotContextBuilder {

    // Extraer horarios desde Base de Datos
    static async buildHorarios() {
        const cursos = await CursosModel.findAll();
        let horariosTexto = "\n\nHORARIOS DE CLASES 2026:\n";
        const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        const cursosPorDia = {};
        
        cursos.forEach(c => {
            const dia = c.dia_semana || c.horario_dia;
            if (!cursosPorDia[dia]) cursosPorDia[dia] = [];
            cursosPorDia[dia].push(c);
        });

        diasOrden.forEach(dia => {
            if (cursosPorDia[dia] && cursosPorDia[dia].length > 0) {
                horariosTexto += `\n${dia.toUpperCase()}: \n`;
                cursosPorDia[dia].forEach(c => {
                    const hora = c.hora_inicio ? c.hora_inicio.substring(0, 5) : 'A confirmar';
                    const horaFin = c.hora_fin ? c.hora_fin.substring(0, 5) : '';
                    let niveles = '';
                    try { niveles = c.nivel ? (c.nivel.startsWith('[') ? JSON.parse(c.nivel).join(', ') : c.nivel) : ''; } 
                    catch (e) { niveles = c.nivel || ''; }
                    horariosTexto += `- ${hora} a ${horaFin}: ${c.nombre} (${niveles}) - ${c.categoria} \n`;
                });
            }
        });
        return horariosTexto;
    }

    // Construir el prompt global uniendo las piezas
    static async buildSystemPrompt(alumno) {
        let systemPrompt = await BotModel.getConfig('system_prompt');
        if (!systemPrompt) systemPrompt = CONTEXTO_BASE;

        // Reglas de Horarios y Handoff
        systemPrompt += `\n\nINSTRUCCIÓN SOBRE HORARIOS:
PREGUNTA PRIMERO: "¿Qué día te gustaría venir?" o "¿Tenes algún estilo en mente?".
Solo muestra la lista completa si el usuario dice "todos", "ver todo" o insiste.

🔴 DETECCIÓN DE NECESIDAD HUMANA (HANDOFF):
Si piden un humano o tienen problemas graves, responde: "Entiendo, te derivo con la administración para que te ayuden personalmente. Aguarda un momento por favor. [HANDOFF_ADMIN]"

📸 USO DE IMÁGENES:
Usa estos tags al final:
- Ubicación: [MEDIA:mapa.jpg]
- Horarios completos (solo si aplica): [MEDIA:horarios.jpg]
- Lugar/Fotos: [MEDIA:estudio.jpg]`;

        // Base de conocimiento Dinámica
        const knowledgeBase = await BotModel.getAllKnowledge(true);
        let knowledgeText = "";
        if (knowledgeBase.length > 0) {
            knowledgeText = "\n\nBASE DE CONOCIMIENTO:\n";
            knowledgeBase.forEach(k => { knowledgeText += `- [${k.tema}]: ${k.contenido}\n`; });
        }

        const horariosTexto = await this.buildHorarios();
        let contextoFinal = systemPrompt + knowledgeText + horariosTexto;

        // Contexto específico del Alumno logueado/detectado
        if (alumno) {
            const [pagosRows] = await db.query('SELECT COUNT(*) as count FROM pagos WHERE alumno_id = ? AND estado = ?', [alumno.id, 'pendiente']);
            const pagosPendientes = pagosRows[0].count;
            const [ultimoPagoRows] = await db.query('SELECT * FROM pagos WHERE alumno_id = ? AND estado = ? ORDER BY fecha_vencimiento ASC LIMIT 1', [alumno.id, 'pendiente']);
            const ultimoPago = ultimoPagoRows[0] || null;

            contextoFinal += `\n\nINFORMACIÓN DEL ALUMNO (${alumno.nombre} ${alumno.apellido}):
- Salúdalo por su nombre.
- Pagos pendientes: ${pagosPendientes}
${ultimoPago ? `- Próximo pago vencerá/venció $${ultimoPago.monto} el ${ultimoPago.fecha_vencimiento}` : ''}`;
        }

        return contextoFinal;
    }
}

module.exports = BotContextBuilder;
