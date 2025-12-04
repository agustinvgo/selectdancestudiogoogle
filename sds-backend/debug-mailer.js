require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('--- DIAGNÓSTICO DE NODEMAILER ---');
console.log('1. Tipo de exportación:', typeof nodemailer);
console.log('2. Propiedades disponibles:', Object.keys(nodemailer));
console.log('3. ¿createTransporter existe?:', typeof nodemailer.createTransporter);

if (typeof nodemailer.createTransporter !== 'function') {
    console.error('❌ CRÍTICO: createTransporter no es una función. La librería parece dañada o incorrecta.');
} else {
    console.log('✅ La función createTransporter existe.');

    try {
        console.log('4. Intentando crear transporter...');
        const transporter = nodemailer.createTransporter({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER || 'test',
                pass: process.env.SMTP_PASS || 'test'
            }
        });
        console.log('✅ Transporter creado exitosamente.');
    } catch (error) {
        console.error('❌ Error al crear transporter:', error);
    }
}
console.log('--- FIN DEL DIAGNÓSTICO ---');
