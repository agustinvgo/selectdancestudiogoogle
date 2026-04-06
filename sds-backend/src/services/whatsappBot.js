const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const db = require('../config/db');
const ConversacionModel = require('../models/conversacion.model');

// Handlers Modularizados
const BotAIHandler = require('./bot/BotAIHandler');
const BotContextBuilder = require('./bot/BotContextBuilder');
const BotIntentHandler = require('./bot/BotIntentHandler');

class WhatsAppBotService {
    constructor() {
        const chromePath = this.getChromeExecutablePath();
        this.client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                executablePath: chromePath,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            }
        });

        this.qrCode = null;
        this.status = 'disconnected'; 
        this.initializeClient();
    }

    getChromeExecutablePath() {
        if (os.platform() === 'linux') {
            const linuxPaths = ['/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chromium'];
            for (const p of linuxPaths) { if (fs.existsSync(p)) return p; }
            return undefined;
        }

        const projectRoot = path.join(__dirname, '../../');
        const localChromePath = path.join(projectRoot, '.chrome/chrome');
        if (fs.existsSync(localChromePath)) {
            const platforms = fs.readdirSync(localChromePath);
            for (const platform of platforms) {
                const chromePath = path.join(localChromePath, platform, 'chrome-win64/chrome.exe');
                if (fs.existsSync(chromePath)) return chromePath;
            }
        }
        return undefined;
    }

    initializeClient() {
        this.client.on('qr', (qr) => { this.qrCode = qr; this.status = 'qr_ready'; });
        this.client.on('ready', () => { this.status = 'connected'; this.qrCode = null; console.log('✅ WhatsApp Bot Ready'); });
        this.client.on('authenticated', () => { this.status = 'authenticated'; });
        this.client.on('auth_failure', () => { this.status = 'disconnected'; });
        this.client.on('disconnected', () => { this.status = 'disconnected'; this.qrCode = null; this.client.initialize(); });

        this.client.on('message', async (msg) => {
            if (msg.fromMe || msg.from.includes('@g.us')) return;
            console.log(`📩 WAPP Msg: ${msg.from} (Tipo: ${msg.type})`);

            // 🎵 Procesar Audio -> Texto
            if (msg.hasMedia && (msg.type === 'ptt' || msg.type === 'audio')) {
                try {
                    const media = await msg.downloadMedia();
                    if (media) {
                        const transcripcion = await BotAIHandler.transcribirAudio(media);
                        if (transcripcion) msg.body = transcripcion;
                        else return await msg.reply('Perdón, no pude escuchar bien el audio. ¿Podrías escribirlo? 😅');
                    }
                } catch (error) {
                    console.error('Error Audio:', error);
                    return await msg.reply('Disculpá, no pude procesar tu audio. ¿Me escribís? 🙏');
                }
            }
            await this.procesarMensajeRouter(msg);
        });

        this.client.initialize();
    }

    async getStatus() {
        let qrDataUrl = null;
        if (this.qrCode) { try { qrDataUrl = await qrcode.toDataURL(this.qrCode); } catch (e) {} }
        return { status: this.status, qr: qrDataUrl, last_ping: new Date().toISOString() };
    }

    async hardReset() {
        this.status = 'disconnected';
        if (this.client) await this.client.destroy();
        const authPath = path.join(__dirname, '../../.wwebjs_auth');
        if (fs.existsSync(authPath)) fs.rmSync(authPath, { recursive: true, force: true });
        this.qrCode = null;
        this.client.initialize();
        return { success: true };
    }

    async logout() {
        await this.client.logout();
        this.status = 'disconnected'; this.qrCode = null;
        this.client.initialize();
    }

    async procesarMensajeRouter(msg) {
        const telefono = msg.from.replace('@c.us', '');
        const mensaje = msg.body;

        try {
            // 1. Gestionar Conversación DB
            let conversacion = await ConversacionModel.findByTelefono(telefono);
            if (!conversacion) conversacion = await ConversacionModel.create({ telefono, mensajes: [] });

            // 2. Control Manual vs Bot
            if (conversacion.requiere_atencion_humana) {
                if (mensaje.trim().toUpperCase() === 'REINICIAR' || mensaje.trim().toUpperCase() === 'BOT') {
                    await ConversacionModel.update(telefono, { requiere_atencion_humana: false });
                    return await msg.reply('🤖 ¡Entendido! Vuelvo a tomar el control.');
                }
                return; // Silencio bot
            }

            const chat = await msg.getChat();
            await chat.sendStateTyping();

            // 3. Buscar Alumno e Inyectar Contexto Global
            const [alumnoRows] = await db.query('SELECT a.*, u.email, u.telefono, u.nombre, u.apellido FROM alumnos a INNER JOIN usuarios u ON a.usuario_id = u.id WHERE u.telefono = ?', [telefono]);
            const alumno = alumnoRows[0] || null;
            if (alumno && !conversacion.alumno_id) await ConversacionModel.update(telefono, { alumno_id: alumno.id });

            const systemPrompt = await BotContextBuilder.buildSystemPrompt(alumno);

            // 4. Invocar Cerebro AI
            const mensajesGuardados = JSON.parse(conversacion.mensajes || '[]');
            const respuestaBotText = await BotAIHandler.generarRespuesta(mensajesGuardados.slice(-10), mensaje, systemPrompt);

            // 5. Interceptar Comandos [Tags] de la AI
            let respuestaFinal = respuestaBotText;
            let requiereHandoff = false;
            let mediaToSend = null;

            if (respuestaFinal.includes('[HANDOFF_ADMIN]')) {
                requiereHandoff = true;
                respuestaFinal = respuestaFinal.replace(/\[HANDOFF_ADMIN\]/g, '').trim();
            }

            const mediaMatch = respuestaFinal.match(/\[MEDIA:([^\]]+)\]/);
            if (mediaMatch) {
                mediaToSend = mediaMatch[1];
                respuestaFinal = respuestaFinal.replace(mediaMatch[0], '').trim();
            }

            // 6. Ejecutar Salida
            await msg.reply(respuestaFinal);
            
            const nuevoHistorial = [...mensajesGuardados, { role: 'user', content: mensaje, timestamp: new Date() }, { role: 'assistant', content: respuestaBotText, timestamp: new Date() }];
            await ConversacionModel.update(telefono, { mensajes: nuevoHistorial, requiere_atencion_humana: requiereHandoff });

            if (mediaToSend) {
                try {
                    const mediaPath = path.join(__dirname, '../public/bot_assets', mediaToSend);
                    if (fs.existsSync(mediaPath)) await this.client.sendMessage(msg.from, MessageMedia.fromFilePath(mediaPath));
                } catch (e) { console.error('Media error:', e); }
            }

            if (requiereHandoff) await chat.markUnread();

            // 7. Acciones Silenciosas de Base de Datos
            const intencion = BotIntentHandler.detectarIntencion(mensaje, respuestaFinal);
            await BotIntentHandler.ejecutarPostAcciones(intencion, alumno || { telefono }, mensaje);

        } catch (error) {
            console.error('Error procesando msj:', error);
            await msg.reply('Disculpá, tuve un problema técnico 😅 Intenta de nuevo en unos minutos.');
        }
    }

    async enviarMensajeManual(telefono, mensaje) {
        let chatId = telefono;
        if (!chatId.includes('@c.us')) chatId = `${chatId}@c.us`;
        await this.client.sendMessage(chatId, mensaje);
        return true;
    }
}

module.exports = new WhatsAppBotService();
