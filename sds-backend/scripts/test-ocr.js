const path = require('path');
const { extractText } = require('../src/services/ocr.service');

// Ruta a una imagen que sabemos que existe (el logo)
// Ajustamos la ruta relativa para salir de 'scripts' y entrar a 'sds-frontend/public'
const imagePath = path.resolve(__dirname, '../../sds-frontend/public/logo.jpg');

console.log('🧪 Iniciando Test de OCR...');
console.log(`📂 Imagen de prueba: ${imagePath}`);

async function runTest() {
    try {
        const start = Date.now();
        const text = await extractText(imagePath);
        const duration = (Date.now() - start) / 1000;

        console.log('---------------------------------------------------');
        console.log(`⏱️ Tiempo de procesamiento: ${duration.toFixed(2)}s`);
        console.log('📜 Texto Extraído:');
        console.log('---------------------------------------------------');
        console.log(text.trim());
        console.log('---------------------------------------------------');

        if (text.length > 0) {
            console.log('✅ TEST EXITOSO: Se detectó texto.');
        } else {
            console.log('⚠️ TEST FINALIZADO: No se detectó texto (posiblemente la imagen no tiene texto claro).');
        }

    } catch (error) {
        console.error('❌ TEST FALLIDO:', error);
    }
}

runTest();
