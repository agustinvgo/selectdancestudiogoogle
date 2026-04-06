require('dotenv').config();
const emailService = require('./src/services/email.service.js');

async function test() {
    console.log('🧪 Iniciando prueba de diseño de email...');
    try {
        const result = await emailService.probarConfiguracion('agustin@example.com'); // Usar un email dummy para generar el HTML
        console.log('✅ El código de email cargó sin errores de sintaxis.');
        // No enviamos realmente si no queremos, pero al menos validamos que compile y genere el HTML
    } catch (error) {
        console.error('❌ Error en el servicio de email:', error);
        process.exit(1);
    }
}

test();
