/**
 * @file index.js
 * @description Punto de entrada principal para el servidor de Select Dance Studio.
 * Este archivo inicializa la aplicación Express, configura los middlewares globales
 * (CORS, body parser), enlaza todas las rutas de la API y arranca el servidor.
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');


const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir imágenes/archivos subidos (ej: /uploads/perfiles/...)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    maxAge: '7d',
    etag: true,
    lastModified: true
}));

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const alumnosRoutes = require('./routes/alumnos.routes');
const asistenciasRoutes = require('./routes/asistencias.routes');
const pagosRoutes = require('./routes/pagos.routes');
const eventosRoutes = require('./routes/eventos.routes');
const cursosRoutes = require('./routes/cursos.routes');
const emailRoutes = require('./routes/email.routes');
const estadisticasRoutes = require('./routes/estadisticas.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');


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


// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({
        message: 'API de Select Dance Studio',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            alumnos: '/api/alumnos',
            asistencias: '/api/asistencias',
            pagos: '/api/pagos',
            eventos: '/api/eventos',
            emails: '/api/emails',
            estadisticas: '/api/estadisticas'
        }
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend permitido: ${process.env.FRONTEND_URL || 'http://localhost:5173'}\n`);
});
