const helmet = require('helmet');

/**
 * Configura headers de seguridad HTTP para Express.
 * Protege contra XSS, clickjacking, MIME-sniffing y mejora la autoridad SEO.
 *
 * Uso: importar y llamar antes de registrar las rutas en src/index.js
 *   const { configureSecurityHeaders } = require('./middlewares/security.middleware.js');
 *   configureSecurityHeaders(app);
 */
const configureSecurityHeaders = (app) => {
    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: [
                        "'self'",
                        "'unsafe-inline'",
                        'https://www.googletagmanager.com',
                        'https://www.google-analytics.com',
                    ],
                    styleSrc: [
                        "'self'",
                        "'unsafe-inline'",
                        'https://fonts.googleapis.com',
                    ],
                    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
                    imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
                    connectSrc: [
                        "'self'",
                        'https://api.selectdancestudio.com',
                        'https://www.google-analytics.com',
                    ],
                    frameSrc: ["'none'"],
                    objectSrc: ["'none'"],
                    upgradeInsecureRequests: [],
                },
            },
            // HSTS — Le dice a los browsers que usen HTTPS por 1 año
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true,
            },
            referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        })
    );

    // Headers adicionales no cubiertos por Helmet
    app.use((_req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader(
            'Permissions-Policy',
            'camera=(), microphone=(), geolocation=(self)'
        );
        // Ocultar información del servidor
        res.removeHeader('X-Powered-By');
        next();
    });
};

module.exports = { configureSecurityHeaders };
