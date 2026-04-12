const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analiza un comprobante (Imagen o PDF) usando Inteligencia Artificial (GPT-4o-mini).
 * @param {string} filePath Ruta absoluta al archivo.
 * @returns {Promise<Object>} Objeto con los datos extraídos (monto, fecho, concepto, etc).
 */
async function analyzeReceipt(filePath) {
    try {
        console.log(`🤖 [IA] Iniciando análisis inteligente para: ${path.basename(filePath)}`);

        const ext = path.extname(filePath).toLowerCase();

        // --- ESTRATEGIA 1: PDF (Extracción de Texto + IA) ---
        if (ext === '.pdf') {
            return await processPdfWithAI(filePath);
        }

        // --- ESTRATEGIA 2: IMÁGENES (Visión + IA) ---
        // Soportamos jpg, png, jpeg, webp, etc.
        return await processImageWithVision(filePath);

    } catch (error) {
        console.error('❌ Error en Servicio de Recibos IA:', error);
        return {
            error: true,
            raw_text: "No se pudo analizar el comprobante.",
            summary: "Error en el análisis inteligente."
        };
    }
}

/**
 * Procesa un PDF extrayendo texto y enviándolo a GPT-4o-mini.
 */
async function processPdfWithAI(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        const textContent = data.text.trim();

        if (textContent.length < 10) {
            return {
                warning: "PDF sin texto seleccionable (posible imagen escaneada).",
                raw_text: "PDF escaneado, no se pudo leer texto."
            };
        }

        const prompt = `Analiza el siguiente texto extraído de un comprobante de pago.
        Extrae la siguiente información en formato JSON puro:
        - monto: (número sin símbolos, ej: 4500.00. Si hay varios importes, busca el 'Total Pagado' o similar)
        - fecha: (string dd/mm/aaaa)
        - concepto: (string)
        - remitente: (string)
        - banco_destino: (string)
        - se_pago: (boolean, true si indica 'Transferencia Exitosa', 'Pago Realizado', etc)
        - metodo: (string, ej: 'Mercado Pago', 'Transferencia')
        
        Texto del PDF:
        ${textContent.substring(0, 3000)}`; // Limitamos caracteres para no exceder tokens innecesariamente

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: "Eres un asistente contable experto en leer comprobantes de Argentina." },
                { role: "user", content: prompt }
            ],
            temperature: 0,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(response.choices[0].message.content);
        return formatResult(result);

    } catch (error) {
        console.error('Error procesando PDF con IA:', error);
        throw error;
    }
}

/**
 * Procesa una imagen usando GPT-4o-mini Vision.
 */
async function processImageWithVision(filePath) {
    try {
        // Leer imagen y convertir a Base64
        const imageBuffer = fs.readFileSync(filePath);
        const base64Image = imageBuffer.toString('base64');
        // Bug #4 fix: detectar MIME type real en vez de hardcodear jpeg para todos los archivos
        const ext = path.extname(filePath).toLowerCase();
        const extToMime = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' };
        const mimeType = extToMime[ext] || 'image/jpeg';
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analiza esta imagen de un comprobante de pago. Extrae en formato JSON puro:\n - monto: (número sin símbolos, ej: 10500.50)\n - fecha: (string dd/mm/aaaa)\n - concepto: (string)\n - remitente: (string)\n - banco_destino: (string)\n - se_pago: (boolean, true si parece un comprobante de transferencia EXITOSA)\n - metodo: (string, ej: 'Mercado Pago', 'Transferencia', 'Efectivo')" },
                        {
                            type: "image_url",
                            image_url: {
                                "url": dataUrl,
                                "detail": "high"
                            }
                        }
                    ],
                }
            ],
            response_format: { type: "json_object" },
            max_tokens: 300
        });

        const result = JSON.parse(response.choices[0].message.content);
        return formatResult(result);

    } catch (error) {
        console.error('Error procesando Imagen con Visión:', error);
        throw error;
    }
}

function formatResult(json) {
    // Formatear para que sea fácil de leer en las notas
    const summary = `
[IA] Análisis Automático:
💰 Monto: $${json.monto || '?'}
📅 Fecha: ${json.fecha || '?'}
📝 Concepto: ${json.concepto || '-'}
👤 Remitente: ${json.remitente || '-'}
🏦 Banco: ${json.banco_destino || '-'}
`.trim();

    return {
        ...json,
        summary
    };
}

module.exports = {
    analyzeReceipt,
    // Mantenemos extractText por compatibilidad si algo más lo usa, pero redirige a analyzeReceipt
    extractText: async (path) => {
        const res = await analyzeReceipt(path);
        return res.summary || res.raw_text || "";
    }
};
