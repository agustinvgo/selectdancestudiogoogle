const PDFService = require('./src/services/pdf.service');
const fs = require('fs');

const pagoMock = {
    id: 999,
    concepto: 'Prueba de Concepto',
    monto: 15000,
    monto_original: 15000,
    estado: 'pagado',
    fecha_pago: new Date(),
    metodo_pago_realizado: 'efectivo',
    curso_nombre: 'Danza Jazz - Nivel 1'
};

const alumnoMock = {
    nombre: 'Juan',
    apellido: 'Perez',
    usuario_email: 'juan@test.com',
    telefono: '123456789'
};

console.log('Generando PDF de prueba...');

try {
    const doc = PDFService.generarComprobante(pagoMock, alumnoMock);
    const stream = fs.createWriteStream('test_comprobante.pdf');

    doc.pipe(stream);
    doc.end();

    stream.on('finish', () => {
        console.log('✅ PDF generado exitosamente: test_comprobante.pdf');
        // Verificar tamaño
        const stats = fs.statSync('test_comprobante.pdf');
        console.log(`Tamaño del archivo: ${stats.size} bytes`);
    });

    stream.on('error', (err) => {
        console.error('❌ Error escribiendo archivo:', err);
    });

} catch (error) {
    console.error('❌ Error generando PDF:', error);
}
