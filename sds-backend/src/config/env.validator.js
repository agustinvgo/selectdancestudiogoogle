/**
 * Validador de Variables de Entorno
 * Se ejecuta al arrancar el servidor. Si falta una variable CRÍTICA, aborta el proceso.
 * Si falta una OPCIONAL, emite un warning pero continúa.
 */

const REQUIRED_VARS = [
    { name: 'DB_HOST', description: 'Host de la base de datos MySQL' },
    { name: 'DB_USER', description: 'Usuario de la base de datos' },
    { name: 'DB_NAME', description: 'Nombre de la base de datos' },
    { name: 'JWT_SECRET', description: 'Secreto para firmar tokens JWT' },
];

const OPTIONAL_VARS = [
    { name: 'OPENAI_API_KEY', description: 'API Key de OpenAI (Bot de WhatsApp)' },
    { name: 'SMTP_USER', description: 'Email remitente para envío de correos' },
    { name: 'SMTP_PASS', description: 'Contraseña/App Password del email remitente' },
    { name: 'FRONTEND_URL', description: 'URL del frontend (CORS)', default: 'http://localhost:5173' },
    { name: 'NODE_ENV', description: 'Entorno de ejecución', default: 'development' },
    { name: 'PORT', description: 'Puerto del servidor', default: '5000' },
    { name: 'MERCADOPAGO_ACCESS_TOKEN', description: 'Token de Mercado Pago' },
];

function validateEnv() {
    console.log('🔍 Validando variables de entorno...');
    const missing = [];
    const warnings = [];

    // Verificar obligatorias
    for (const v of REQUIRED_VARS) {
        if (!process.env[v.name] || process.env[v.name].trim() === '') {
            missing.push(`  ❌ ${v.name} — ${v.description}`);
        }
    }

    // Verificar opcionales
    for (const v of OPTIONAL_VARS) {
        if (!process.env[v.name] || process.env[v.name].trim() === '') {
            if (v.default) {
                process.env[v.name] = v.default;
                warnings.push(`  ⚠️ ${v.name} no definida → usando default: "${v.default}"`);
            } else {
                warnings.push(`  ⚠️ ${v.name} no definida — ${v.description} (funcionalidad limitada)`);
            }
        }
    }

    // Mostrar warnings
    if (warnings.length > 0) {
        console.warn('⚠️ Variables opcionales faltantes:');
        warnings.forEach(w => console.warn(w));
    }

    // Si faltan obligatorias, abortar
    if (missing.length > 0) {
        console.error('\n🚨 ERROR FATAL: Variables de entorno obligatorias no definidas:');
        missing.forEach(m => console.error(m));
        console.error('\n💡 Solución: Crea/edita el archivo .env en la raíz del backend con las variables faltantes.');
        console.error('📄 Referencia: Revisa .env.example si existe.\n');
        process.exit(1);
    }

    console.log('✅ Variables de entorno validadas correctamente.\n');
}

module.exports = validateEnv;
