const os = require('os');
const fs = require('fs');
const path = require('path');
let OpenAI;

// Inicialización perezosa para evitar caídas en arranque si no hay API KEY
let openai = null;
function getOpenAI() {
    if (!openai) {
        if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY no configurada');
        if (!OpenAI) OpenAI = require('openai');
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return openai;
}

class BotAIHandler {
    
    // Transcripción de Audios a Texto (Whisper)
    static async transcribirAudio(media) {
        try {
            const buffer = Buffer.from(media.data, 'base64');
            const tempFilePath = path.join(os.tmpdir(), `whatsapp_audio_${Date.now()}.ogg`);
            fs.writeFileSync(tempFilePath, buffer);

            const transcription = await getOpenAI().audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: "whisper-1",
            });

            fs.unlinkSync(tempFilePath);
            return transcription.text;
        } catch (error) {
            console.error('Error en Whisper API:', error);
            return null;
        }
    }

    // Generar Respuesta de Chat
    static async generarRespuesta(historialPrevio, mensajeUsuario, promptDelSistema) {
        const mensajes = [
            { role: 'system', content: promptDelSistema },
            ...historialPrevio,
            { role: 'user', content: mensajeUsuario }
        ];

        const respuesta = await getOpenAI().chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: mensajes,
            temperature: 0.7,
            max_tokens: 450
        });

        return respuesta.choices[0].message.content;
    }
}

module.exports = BotAIHandler;
