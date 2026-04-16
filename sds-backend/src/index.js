const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');
require('dotenv').config();

// 🔍 Validar variables de entorno ANTES de cualquier otra cosa
const validateEnv = require('./config/env.validator');
validateEnv();

const logger = require('./config/logger');

const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');

// Importar rutas
const authRoutes = require('./routes/auth/auth.routes');
const alumnosRoutes = require('./routes/admin/alumnos.routes');
const asistenciasRoutes = require('./routes/admin/asistencias.routes');
const pagosRoutes = require('./routes/admin/pagos.routes');
const eventosRoutes = require('./routes/admin/eventos.routes');
const cursosRoutes = require('./routes/admin/cursos.routes');
const emailRoutes = require('./routes/common/email.routes');
const estadisticasRoutes = require('./routes/admin/estadisticas.routes');
const whatsappRoutes = require('./routes/common/whatsapp.routes');
const cronService = require('./services/cron.service');

// Seguridad: Deshabilitar cabecera X-Powered-By
app.disable('x-powered-by');

// Rendimiento: Comprimir respuestas HTTP (GZIP/Brotli)
app.use(compression());

// Seguridad: Helmet (Headers seguros avanzados)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"], // TODO: Remove unsafe-inline in future if possible
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            connectSrc: ["'self'",
                process.env.FRONTEND_URL,
                "http://localhost:5173",
                "http://localhost:5000",
                "http://192.168.100.21:5173",
                "http://192.168.100.21:5000"
            ].filter(Boolean),
            frameSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: null, // Deshabilitar para permitir HTTP en red local
        }
    },
    hsts: {
        maxAge: 31536000, // 1 año
        includeSubDomains: true,
        preload: true
    },
    frameguard: { action: 'deny' },
    noSniff: true
}));

// Trust proxy ANTES del rate limiter (Bug #4 fix):
// Sin esto, req.ip es siempre la IP del contenedor Nginx y el rate limiter
// trata a todos los usuarios como la misma IP — un solo usuario puede bloquear a todos.
app.set('trust proxy', 1);

// Seguridad: Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Estricto en prod, laxo en dev
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Demasiadas solicitudes desde esta IP, por favor intente nuevamente en 15 minutos.'
    },
});
app.use('/api/', limiter);

// Seguridad: Geo-Blocking (Solo AR/CL) - Aplicar antes de las rutas
const geoFilter = require('./middlewares/geoFilter.middleware');
// Habilitar en producción o si ENABLE_GEO_BLOCK es true
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_GEO_BLOCK === 'true') {
    app.use('/api/', geoFilter);
}

// Configuración de CORS
const isProduction = process.env.NODE_ENV === 'production';

const frontendUrl = process.env.FRONTEND_URL || 'https://selectdancestudio.com';
const allowedOrigins = [
    frontendUrl,
    'https://selectdancestudio.com',
    'https://www.selectdancestudio.com',
    // En desarrollo, permitir localhost y cualquier IP de red local
    ...(!isProduction ? [
        'http://localhost:5173',
        'http://localhost:5000',
        'http://localhost:3000',
    ] : [])
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Permitir requests sin origin (Postman, curl, server-side)
        if (!origin) return callback(null, true);

        // En desarrollo: permitir localhost y cualquier IP local
        if (!isProduction) {
            const localNetworkPattern = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/;
            if (localNetworkPattern.test(origin)) {
                return callback(null, true);
            }
        }

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Log for debugging CORS rejections
            console.warn(`[CORS] Rejected origin: ${origin}`);
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// Servir archivos estáticos (imágenes subidas) — requiere autenticación
const { verifyToken } = require('./middlewares/auth.middleware');
app.use('/uploads', verifyToken, express.static(path.join(__dirname, '../uploads'), {
    maxAge: '7d',
    etag: true,
    lastModified: true,
}));

// Servir assets públicos (imágenes de cursos, logo, etc.) sin autenticación
// con cache agresivo para mejorar LCP y Core Web Vitals
app.use('/assets/public', express.static(path.join(__dirname, 'assets'), {
    maxAge: '30d',
    immutable: true,
    etag: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.webp') || filePath.endsWith('.avif')) {
            res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
        } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg') || filePath.endsWith('.png')) {
            res.setHeader('Cache-Control', 'public, max-age=604800'); // 7 días
        }
    }
}));


// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/estadisticas', estadisticasRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/usuarios', require('./routes/admin/usuarios.routes'));
app.use('/api/equipo', require('./routes/admin/equipo.routes'));
app.use('/api/prueba', require('./routes/admin/clase_prueba.routes'));
app.use('/api/consultas', require('./routes/admin/consultas.routes'));
app.use('/api/notificaciones', require('./routes/common/notificaciones.routes'));
app.use('/api/gastos', require('./routes/admin/gastos.routes'));
app.use('/api/store', require('./routes/public/store.routes'));
app.use('/api/public/eventos', require('./routes/public/eventos.routes'));
app.use('/api/public/cursos', require('./routes/public/cursos.routes'));
app.use('/api/espera', require('./routes/admin/espera.routes'));
app.use('/api/admin/bot', require('./routes/admin/bot.routes'));
app.use('/api/chatbot', require('./routes/chatbot.routes'));



// 📚 Documentación Swagger (solo en desarrollo)
const setupSwagger = require('./config/swagger');
setupSwagger(app);

// 🩺 Health Check Endpoint (para UptimeRobot / Load Balancers)
const db = require('./config/db');
app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            version: '1.0.0',
            memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
            db: 'connected'
        });
    } catch (error) {
        res.status(503).json({ status: 'error', db: 'disconnected', error: error.message });
    }
});

app.get('/', (req, res) => {
    res.json({
        message: 'Select Dance Studio API',
        version: '1.0.0'
    });
});


// Manejo de errores global
const errorHandler = require('./middlewares/error.middleware');
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Iniciar servidor
const BackupService = require('./services/backup.service');
const dbInit = require('./config/dbInit');

// Initialize Database Sync/Repair
dbInit.initialize();

// Initialize Backup Scheduler
BackupService.init();

const server = app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend permitido: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);

    // Iniciar cron jobs
    cronService.init();
});

// 🛑 Graceful Shutdown (para PM2, Docker, CTRL+C)
const gracefulShutdown = (signal) => {
    console.log(`\n⚠️ Señal ${signal} recibida. Cerrando servidor...`);
    server.close(() => {
        console.log('✅ Servidor HTTP cerrado.');
        db.end(() => {
            console.log('✅ Pool de conexiones DB cerrado.');
            process.exit(0);
        });
    });

    // Forzar cierre si tarda más de 10 segundos
    setTimeout(() => {
        console.error('❌ Timeout de gracia excedido, forzando cierre.');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 🔄 Soporte para Nodemon (evita `Too many connections` y `EADDRINUSE` al guardar archivos frecuentemente)
process.once('SIGUSR2', () => {
    console.log('\n⚠️ Señal SIGUSR2 (Nodemon restart) recibida. Reiniciando...');
    server.close(() => {
        db.end(() => {
            console.log('✅ Recursos liberados para el reinicio de Nodemon.');
            process.kill(process.pid, 'SIGUSR2');
        });
    });
});