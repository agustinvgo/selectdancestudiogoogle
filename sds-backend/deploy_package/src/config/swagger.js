const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Select Dance Studio API',
            version: '1.0.0',
            description: 'API REST para gestión de academia de danza. Incluye módulos de alumnos, pagos, eventos, asistencias, estadísticas y bot de WhatsApp.',
            contact: { email: 'selectdancestudio.ar@gmail.com' }
        },
        servers: [
            { url: 'http://localhost:5000', description: 'Desarrollo Local' },
            { url: 'https://selectdancestudio.com', description: 'Producción' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: 'Auth', description: 'Autenticación y sesión' },
            { name: 'Alumnos', description: 'Gestión de alumnos' },
            { name: 'Pagos', description: 'Facturación y cobranza' },
            { name: 'Eventos', description: 'Competencias y presentaciones' },
            { name: 'Cursos', description: 'Gestión de clases y horarios' },
            { name: 'Estadísticas', description: 'Dashboard y métricas' },
            { name: 'WhatsApp', description: 'Bot y mensajería' },
        ]
    },
    apis: ['./src/routes/**/*.js'], // Escanear anotaciones en rutas
};

const specs = swaggerJsdoc(options);

function setupSwagger(app) {
    if (process.env.NODE_ENV !== 'production') {
        app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
            customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
            customSiteTitle: 'SDS API Docs'
        }));
        console.log('📚 Swagger UI disponible en /api/docs');
    }
}

module.exports = setupSwagger;
