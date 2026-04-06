/**
 * @file whatsapp.service.js
 * @description Servicio Singleton que gestiona la conexión del bot de WhatsApp.
 * Utiliza la librería `whatsapp-web.js` para simular una sesión de WhatsApp Web
 * y `qrcode` para generar la imagen QR que el administrador escanea desde su celular.
 * 
 * La sesión se persiste en disco (LocalAuth) para evitar re-escanear el QR 
 * cada vez que el servidor se reinicia.
 */
const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');

class WhatsAppService {
    constructor() {
        // Estado actual del bot: 'disconnected' | 'qr_pending' | 'connected'
        this.status = 'disconnected';
        // Último QR generado como Data URI (base64 PNG)
        this.qrDataUrl = null;
        // Información del número conectado
        this.connectedInfo = null;
        // Instancia del cliente de WhatsApp
        this.client = null;
        // Flag para evitar múltiples inicializaciones
        this.isInitializing = false;
    }

    /**
     * @method initialize
     * @description Crea e inicializa el cliente de WhatsApp Web.
     * Configura los listeners de eventos (qr, ready, disconnected, auth_failure).
     */
    async initialize() {
        if (this.isInitializing || this.status === 'connected') {
            console.log('[WhatsApp] Ya está inicializado o en proceso.');
            return;
        }

        this.isInitializing = true;
        console.log('[WhatsApp] Inicializando cliente...');

        try {
            this.client = new Client({
                authStrategy: new LocalAuth({
                    dataPath: './whatsapp-session'
                }),
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-accelerated-2d-canvas',
                        '--no-first-run',
                        '--no-zygote',
                        '--disable-gpu'
                    ]
                }
            });

            // Evento: Se genera un nuevo código QR para escanear
            this.client.on('qr', async (qr) => {
                console.log('[WhatsApp] Nuevo QR generado. Esperando escaneo...');
                this.status = 'qr_pending';
                try {
                    this.qrDataUrl = await QRCode.toDataURL(qr, {
                        width: 300,
                        margin: 2,
                        color: { dark: '#000000', light: '#ffffff' }
                    });
                } catch (err) {
                    console.error('[WhatsApp] Error generando imagen QR:', err);
                }
            });

            // Evento: Cliente autenticado y listo para enviar mensajes
            this.client.on('ready', () => {
                console.log('[WhatsApp] ✅ Bot conectado y listo!');
                this.status = 'connected';
                this.qrDataUrl = null; // Ya no necesitamos el QR
                
                // Guardar info del número conectado
                const info = this.client.info;
                this.connectedInfo = {
                    pushname: info?.pushname || 'Bot',
                    phone: info?.wid?.user || 'Desconocido'
                };
                console.log(`[WhatsApp] Conectado como: ${this.connectedInfo.pushname} (${this.connectedInfo.phone})`);
            });

            // Evento: Sesión autenticada (ya tenía sesión guardada)
            this.client.on('authenticated', () => {
                console.log('[WhatsApp] Sesión autenticada desde caché.');
            });

            // Evento: Fallo en la autenticación
            this.client.on('auth_failure', (msg) => {
                console.error('[WhatsApp] ❌ Error de autenticación:', msg);
                this.status = 'disconnected';
                this.qrDataUrl = null;
            });

            // Evento: Cliente desconectado
            this.client.on('disconnected', (reason) => {
                console.log('[WhatsApp] Desconectado:', reason);
                this.status = 'disconnected';
                this.qrDataUrl = null;
                this.connectedInfo = null;
                this.client = null;
                this.isInitializing = false;
            });

            await this.client.initialize();
        } catch (error) {
            console.error('[WhatsApp] Error fatal al inicializar:', error.message);
            this.status = 'disconnected';
            this.isInitializing = false;
            throw error;
        }

        this.isInitializing = false;
    }

    /**
     * @method getStatus
     * @returns {{ status: string, connectedInfo: object|null }}
     */
    getStatus() {
        return {
            status: this.status,
            connectedInfo: this.connectedInfo
        };
    }

    /**
     * @method getQR
     * @returns {string|null} Data URI del QR en base64, o null si no hay QR pendiente.
     */
    getQR() {
        return this.qrDataUrl;
    }

    /**
     * @method sendMessage
     * @description Envía un mensaje de texto a un número de teléfono.
     * @param {string} phone - Número en formato internacional sin '+' (ej: '5491155804522')
     * @param {string} message - Texto del mensaje a enviar
     */
    async sendMessage(phone, message) {
        if (this.status !== 'connected' || !this.client) {
            throw new Error('El bot de WhatsApp no está conectado.');
        }

        // Formatear el número al formato que espera whatsapp-web.js: 'XXXXXXXXXXX@c.us'
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const chatId = `${cleanPhone}@c.us`;

        try {
            await this.client.sendMessage(chatId, message);
            console.log(`[WhatsApp] Mensaje enviado a ${cleanPhone}`);
            return { success: true, phone: cleanPhone };
        } catch (error) {
            console.error(`[WhatsApp] Error enviando mensaje a ${cleanPhone}:`, error.message);
            throw error;
        }
    }

    /**
     * @method logout
     * @description Cierra la sesión del bot y borra los datos de autenticación local.
     */
    async logout() {
        if (this.client) {
            try {
                await this.client.logout();
                console.log('[WhatsApp] Sesión cerrada correctamente.');
            } catch (error) {
                console.error('[WhatsApp] Error al cerrar sesión:', error.message);
            }
            try {
                await this.client.destroy();
            } catch (e) {
                // Ignorar errores de destroy
            }
        }
        this.status = 'disconnected';
        this.qrDataUrl = null;
        this.connectedInfo = null;
        this.client = null;
        this.isInitializing = false;
    }
}

// Exportar como Singleton — una única instancia para todo el servidor
module.exports = new WhatsAppService();
