/**
 * WhatsApp Bot Service — Baileys Edition
 * Reemplaza whatsapp-web.js + Puppeteer por Baileys (WebSocket nativo).
 * Misma interfaz pública: getStatus(), hardReset(), logout(), enviarMensajeManual()
 */

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    downloadMediaMessage,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    Browsers,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const ConversacionModel = require('../models/conversacion.model');

// Handlers Modularizados (sin cambios)
const BotAIHandler = require('./bot/BotAIHandler');
const BotContextBuilder = require('./bot/BotContextBuilder');
const BotIntentHandler = require('./bot/BotIntentHandler');

// Logger silencioso para Baileys (evita spam en consola)
const logger = pino({ level: 'silent' });

// Carpeta donde se guarda la sesión (en vez del browser profile de Puppeteer)
const AUTH_FOLDER = path.join(__dirname, '../../baileys_auth');

class WhatsAppBotService {
    constructor() {
        this.qrCode = null;
        this.status = 'disconnected';
        this.sock = null;
        this._connecting = false;
        this._connect();
    }

    // ──────────────────────────────────────────────
    // CONEXIÓN
    // ──────────────────────────────────────────────

    async _connect() {
        if (this._connecting) return;
        this._connecting = true;

        try {
            // Asegurar que existe la carpeta de auth
            if (!fs.existsSync(AUTH_FOLDER)) fs.mkdirSync(AUTH_FOLDER, { recursive: true });

            const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
            const { version } = await fetchLatestBaileysVersion();

            this.sock = makeWASocket({
                version,
                logger,
                auth: state,
                browser: Browsers.ubuntu('Chrome'),
                printQRInTerminal: false,         // Manejamos el QR nosotros
                syncFullHistory: false,
                markOnlineOnConnect: false,
            });

            // Guardar credenciales automáticamente cuando cambien
            this.sock.ev.on('creds.update', saveCreds);

            // ── Eventos de conexión ──
            this.sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    this.qrCode = qr;
                    this.status = 'qr_ready';
                    console.log('📱 [Baileys] QR generado, listo para escanear');
                }

                if (connection === 'open') {
                    this.status = 'connected';
                    this.qrCode = null;
                    this._connecting = false;
                    console.log('✅ [Baileys] WhatsApp Bot conectado');
                }

                if (connection === 'close') {
                    const shouldReconnect =
                        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

                    console.log(`🔌 [Baileys] Desconectado. Reconectar: ${shouldReconnect}`);
                    this.status = 'disconnected';
                    this._connecting = false;

                    if (shouldReconnect) {
                        // Espera 3s y reconecta automáticamente
                        setTimeout(() => this._connect(), 3000);
                    } else {
                        // Fue logout manual → limpiar sesión
                        this._clearAuthFolder();
                        this.qrCode = null;
                    }
                }
            });

            // ── Mensajes entrantes ──
            this.sock.ev.on('messages.upsert', async ({ messages, type }) => {
                if (type !== 'notify') return;

                for (const msg of messages) {
                    // Ignorar mensajes propios o grupos
                    if (msg.key.fromMe) continue;
                    if (msg.key.remoteJid?.endsWith('@g.us')) continue;

                    console.log(`📩 [Baileys] Msg de: ${msg.key.remoteJid} Tipo: ${msg.message ? Object.keys(msg.message)[0] : 'desconocido'}`);

                    try {
                        // Procesar audios (PTT / audio)
                        const hasAudio = msg.message?.audioMessage || msg.message?.pttMessage;
                        if (hasAudio) {
                            try {
                                const buffer = await downloadMediaMessage(msg, 'buffer', {}, { logger });
                                if (buffer) {
                                    // BotAIHandler.transcribirAudio recibe { data, mimetype } — adaptamos Baileys
                                    const mimetype = msg.message?.audioMessage?.mimetype || 'audio/ogg; codecs=opus';
                                    const transcripcion = await BotAIHandler.transcribirAudio({ data: buffer.toString('base64'), mimetype });
                                    if (transcripcion) {
                                        msg._textOverride = transcripcion;
                                    } else {
                                        await this._reply(msg, 'Perdón, no pude escuchar bien el audio. ¿Podrías escribirlo? 😅');
                                        continue;
                                    }
                                }
                            } catch (audioErr) {
                                console.error('[Baileys] Error procesando audio:', audioErr);
                                await this._reply(msg, 'Disculpá, no pude procesar tu audio. ¿Me escribís? 🙏');
                                continue;
                            }
                        }

                        await this.procesarMensajeRouter(msg);
                    } catch (err) {
                        console.error('[Baileys] Error procesando mensaje:', err);
                    }
                }
            });

        } catch (err) {
            console.error('❌ [Baileys] Error al conectar:', err.message);
            this.status = 'disconnected';
            this._connecting = false;
            // Reintentar en 10s si falla el arranque
            setTimeout(() => this._connect(), 10000);
        }
    }

    // ──────────────────────────────────────────────
    // HELPERS INTERNOS
    // ──────────────────────────────────────────────

    /**
     * Extrae el texto de un mensaje de Baileys (texto plano, caption, etc.)
     */
    _getText(msg) {
        if (msg._textOverride) return msg._textOverride;
        const m = msg.message;
        if (!m) return '';
        return (
            m.conversation ||
            m.extendedTextMessage?.text ||
            m.imageMessage?.caption ||
            m.videoMessage?.caption ||
            m.documentMessage?.caption ||
            ''
        );
    }

    /**
     * Convierte número de teléfono a JID de Baileys
     * whatsapp-web.js: "54911..." → Baileys: "54911...@s.whatsapp.net"
     */
    _toJid(telefono) {
        let num = telefono.replace(/[^\d]/g, '');
        if (!num.endsWith('@s.whatsapp.net')) {
            return `${num}@s.whatsapp.net`;
        }
        return num;
    }

    /**
     * Extrae el número limpio del JID
     * Baileys: "54911...@s.whatsapp.net" → "54911..."
     */
    _fromJid(jid) {
        return jid?.replace('@s.whatsapp.net', '').replace('@c.us', '') || '';
    }

    /**
     * Responde a un mensaje (equivalente a msg.reply() de whatsapp-web.js)
     */
    async _reply(msg, text) {
        if (!this.sock || !text) return;
        await this.sock.sendMessage(
            msg.key.remoteJid,
            { text },
            { quoted: msg }
        );
    }

    /**
     * Borra la carpeta de autenticación de Baileys
     */
    _clearAuthFolder() {
        try {
            if (fs.existsSync(AUTH_FOLDER)) {
                fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
                console.log('🧹 [Baileys] Carpeta de sesión eliminada');
            }
        } catch (e) {
            console.warn('[Baileys] No se pudo limpiar auth folder:', e.message);
        }
    }

    // ──────────────────────────────────────────────
    // API PÚBLICA (misma interfaz que whatsapp-web.js)
    // ──────────────────────────────────────────────

    async getStatus() {
        let qrDataUrl = null;
        if (this.qrCode) {
            try { qrDataUrl = await qrcode.toDataURL(this.qrCode); } catch (e) {}
        }
        return { status: this.status, qr: qrDataUrl, last_ping: new Date().toISOString() };
    }

    async hardReset() {
        this.status = 'disconnected';
        this.qrCode = null;

        // 1. Cerrar conexión actual
        try {
            if (this.sock) {
                this.sock.ev.removeAllListeners();
                await this.sock.logout().catch(() => {});
                this.sock.end();
                this.sock = null;
            }
        } catch (e) {
            console.warn('[Baileys] Advertencia al cerrar socket:', e.message);
        }

        // 2. Esperar que cierre limpiamente
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 3. Borrar sesión guardada
        this._clearAuthFolder();

        // 4. Reconectar (generará nuevo QR)
        this._connecting = false;
        this._connect();

        return { success: true, message: 'Hard reset ejecutado. El QR aparecerá en unos segundos.' };
    }

    async logout() {
        try {
            if (this.sock) {
                await this.sock.logout().catch(() => {});
                this.sock.end();
                this.sock = null;
            }
        } catch (e) {
            console.warn('[Baileys] Error al cerrar sesión:', e.message);
        }
        this._clearAuthFolder();
        this.status = 'disconnected';
        this.qrCode = null;
        // Reconectar para generar nuevo QR
        this._connecting = false;
        this._connect();
    }

    async enviarMensajeManual(telefono, mensaje) {
        if (!this.sock || this.status !== 'connected') {
            throw new Error('WhatsApp no está conectado. Por favor escanea el QR.');
        }
        const jid = this._toJid(telefono);
        await this.sock.sendMessage(jid, { text: mensaje });
        return true;
    }

    // ──────────────────────────────────────────────
    // ROUTER DE MENSAJES ENTRANTES (sin cambios lógicos)
    // ──────────────────────────────────────────────

    async procesarMensajeRouter(msg) {
        const telefono = this._fromJid(msg.key.remoteJid);
        const mensaje = this._getText(msg);

        if (!mensaje) return; // Ignora mensajes sin texto (stickers, etc.)

        try {
            // 1. Gestionar Conversación DB
            let conversacion = await ConversacionModel.findByTelefono(telefono);
            if (!conversacion) conversacion = await ConversacionModel.create({ telefono, mensajes: [] });

            // 2. Control Manual vs Bot
            if (conversacion.requiere_atencion_humana) {
                if (mensaje.trim().toUpperCase() === 'REINICIAR' || mensaje.trim().toUpperCase() === 'BOT') {
                    await ConversacionModel.update(telefono, { requiere_atencion_humana: false });
                    return await this._reply(msg, '🤖 ¡Entendido! Vuelvo a tomar el control.');
                }
                return; // Silencio bot
            }

            // Simular "escribiendo..."
            await this.sock.sendPresenceUpdate('composing', msg.key.remoteJid).catch(() => {});

            // 3. Buscar Alumno e Inyectar Contexto Global
            const [alumnoRows] = await db.query(
                'SELECT a.*, u.email, u.telefono, u.nombre, u.apellido FROM alumnos a INNER JOIN usuarios u ON a.usuario_id = u.id WHERE u.telefono = ?',
                [telefono]
            );
            const alumno = alumnoRows[0] || null;
            if (alumno && !conversacion.alumno_id) await ConversacionModel.update(telefono, { alumno_id: alumno.id });

            const systemPrompt = await BotContextBuilder.buildSystemPrompt(alumno);

            // 4. Invocar Cerebro AI
            let mensajesGuardados = [];
            try {
                mensajesGuardados = JSON.parse(conversacion.mensajes || '[]');
            } catch (jsonError) {
                console.error(`Error parseando historial para ${telefono}, reseteando a [].`, jsonError.message);
            }

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
            await this._reply(msg, respuestaFinal);

            const nuevoHistorial = [
                ...mensajesGuardados,
                { role: 'user', content: mensaje, timestamp: new Date() },
                { role: 'assistant', content: respuestaBotText, timestamp: new Date() }
            ];
            await ConversacionModel.update(telefono, { mensajes: nuevoHistorial, requiere_atencion_humana: requiereHandoff });

            // Enviar media si corresponde
            if (mediaToSend) {
                try {
                    const mediaPath = path.join(__dirname, '../public/bot_assets', mediaToSend);
                    if (fs.existsSync(mediaPath)) {
                        await this.sock.sendMessage(msg.key.remoteJid, {
                            document: fs.readFileSync(mediaPath),
                            fileName: mediaToSend,
                            mimetype: 'application/octet-stream'
                        });
                    }
                } catch (e) { console.error('[Baileys] Media error:', e); }
            }

            // Marcar como no leído si requiere atención humana
            if (requiereHandoff) {
                await this.sock.chatModify({ markRead: false }, msg.key.remoteJid).catch(() => {});
            }

            // 7. Acciones Silenciosas de Base de Datos
            const intencion = BotIntentHandler.detectarIntencion(mensaje, respuestaFinal);
            await BotIntentHandler.ejecutarPostAcciones(intencion, alumno || { telefono }, mensaje);

        } catch (error) {
            console.error('[Baileys] Error procesando mensaje:', error);
            await this._reply(msg, 'Disculpá, tuve un problema técnico 😅 Intenta de nuevo en unos minutos.');
        }
    }
}

// Singleton — se crea la primera vez que se require este módulo
let _instance = null;
const getBotInstance = () => {
    if (!_instance) {
        _instance = new WhatsAppBotService();
    }
    return _instance;
};

module.exports = getBotInstance();
