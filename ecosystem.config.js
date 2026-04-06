// ecosystem.config.js - Configuración PM2 para Producción
// Uso en servidor: pm2 start ecosystem.config.js --env production

module.exports = {
    apps: [
        {
            name: 'sds-backend',
            script: './src/index.js',
            cwd: __dirname,

            // ⚠️ IMPORTANTE: NO usar cluster mode.
            // El Bot de WhatsApp (whatsapp-web.js) usa Puppeteer con sesión local.
            // Múltiples instancias crean conflictos de sesión y duplican mensajes.
            instances: 1,
            exec_mode: 'fork',

            // Variables de entorno
            env: {
                NODE_ENV: 'development',
                PORT: 5000,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5000,
            },

            // Auto-reinicio en caso de fallo
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',

            // Reintentos con delay exponencial
            max_restarts: 10,
            restart_delay: 4000,

            // Logs
            time: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            merge_logs: true,

            // Graceful shutdown: esperar que terminen las requests activas
            kill_timeout: 10000,
            listen_timeout: 3000,
            shutdown_with_message: true,
        }
    ]
};
