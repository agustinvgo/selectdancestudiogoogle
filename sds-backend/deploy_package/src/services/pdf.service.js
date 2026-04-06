const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const PDFService = {
    /**
     * Genera un comprobante de pago en PDF
     * @param {Object} pagoData - Datos del pago
     * @param {Object} alumnoData - Datos del alumno
     * @returns {PDFDocument} - Documento PDF
     */
    generarComprobante(pagoData, alumnoData) {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Colores Institucionales
        const colors = {
            primary: '#DC2626', // Rojo
            secondary: '#000000', // Negro
            text: '#333333', // Gris oscuro
            lightBg: '#F3F4F6' // Gris muy claro
        };

        try {
            this.drawHeader(doc, pagoData, colors);
            this.drawInfoSection(doc, pagoData, alumnoData, colors);
            this.drawTable(doc, pagoData, colors);
            this.drawFooter(doc, colors);
        } catch (error) {
            console.error('Error generando secciones del PDF:', error);
            doc.addPage();
            doc.fontSize(12).fillColor('red').text(`Error generando comprobante: ${error.message}`);
        }

        return doc;
    },

    drawHeader(doc, pagoData, colors) {
        // Logo
        const logoPath = path.join(__dirname, '../assets/logo.jpg');
        if (fs.existsSync(logoPath)) {
            try {
                // Logo centrado arriba
                doc.image(logoPath, 250, 40, { width: 100 });
                doc.moveDown(5);
            } catch (e) {
                console.error('Error cargando logo:', e);
            }
        } else {
            doc.moveDown(2);
        }

        // Título "COMPROBANTE DE PAGO"
        doc.fillColor(colors.secondary)
            .fontSize(20)
            .text('COMPROBANTE DE PAGO', { align: 'center', characterSpacing: 2 })
            .moveDown(0.5);

        doc.fontSize(10)
            .fillColor(colors.text)
            .text('SELECT DANCE STUDIO', { align: 'center', characterSpacing: 1 })
            .moveDown(2);

        // Línea separadora roja
        doc.moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .strokeColor(colors.primary)
            .lineWidth(2)
            .stroke();

        doc.moveDown(2);
    },

    drawInfoSection(doc, pagoData, alumnoData, colors) {
        const startY = doc.y;

        // Columna Izquierda: EMITIDO A
        doc.fontSize(10).fillColor(colors.primary).font('Helvetica-Bold')
            .text('EMITIDO A:', 50, startY);

        doc.font('Helvetica').fillColor(colors.text).moveDown(0.5);
        const nombreAlumno = alumnoData ? `${alumnoData.nombre || ''} ${alumnoData.apellido || ''}`.trim() : 'Alumno Desconocido';
        const email = alumnoData?.usuario_email || 'No especificado';

        doc.text(nombreAlumno)
            .text(email);

        if (alumnoData?.telefono) {
            doc.text(alumnoData.telefono);
        }

        // Columna Derecha: DETALLES DEL RECIBO
        doc.fontSize(10).fillColor(colors.primary).font('Helvetica-Bold')
            .text('INFORMACIÓN:', 350, startY);

        doc.font('Helvetica').fillColor(colors.text).moveDown(0.5);

        const fechaEmision = new Date().toLocaleDateString('es-AR');
        const nroComprobante = pagoData && pagoData.id ? String(pagoData.id).padStart(8, '0') : '--------';

        doc.text(`N° Comprobante: ${nroComprobante}`, 350)
            .text(`Fecha Emisión: ${fechaEmision}`);

        if (pagoData.fecha_pago) {
            doc.text(`Fecha Pago: ${new Date(pagoData.fecha_pago).toLocaleDateString('es-AR')}`);
        } else {
            doc.text(`Fecha Pago: ${new Date().toLocaleDateString('es-AR')}`);
        }

        doc.moveDown(3);
    },

    drawTable(doc, pagoData, colors) {
        const tableTop = doc.y;
        const itemCodeX = 50;
        const descriptionX = 100; // Más espacio para descripción
        const priceX = 450;

        // Encabezados de tabla (Fondo negro, texto blanco)
        doc.rect(50, tableTop, 500, 25).fill(colors.secondary);

        doc.fontSize(9).fillColor('white').font('Helvetica-Bold');
        doc.text('ITEM', itemCodeX + 5, tableTop + 8);
        doc.text('DESCRIPCIÓN', descriptionX, tableTop + 8);
        doc.text('IMPORTE', priceX, tableTop + 8, { align: 'right', width: 90 }); // Alineado a derecha dentro de su celda

        // Contenido de la tabla
        let currentY = tableTop + 35;
        doc.fillColor(colors.text).font('Helvetica');

        // Fila 1: Concepto Principal
        doc.text('01', itemCodeX + 5, currentY);
        doc.text(pagoData.concepto || 'Pago de Cuota', descriptionX, currentY);

        const montoOriginal = pagoData.monto_original !== undefined && pagoData.monto_original !== null
            ? pagoData.monto_original
            : (pagoData.monto || 0);

        doc.text(`$${Number(montoOriginal).toLocaleString('es-AR')}`, priceX, currentY, { align: 'right', width: 90 });

        // Línea sutil debajo
        doc.moveTo(50, currentY + 15).lineTo(550, currentY + 15).strokeColor('#E5E7EB').lineWidth(1).stroke();
        currentY += 25;

        // Subitems (Descuentos/Recargos)
        if (pagoData.descuento_aplicado && Number(pagoData.descuento_aplicado) > 0) {
            doc.text('02', itemCodeX + 5, currentY);
            doc.text('Descuento Aplicado', descriptionX, currentY);
            doc.fillColor('green').text(`-$${Number(pagoData.descuento_aplicado).toLocaleString('es-AR')}`, priceX, currentY, { align: 'right', width: 90 });
            doc.fillColor(colors.text);
            doc.moveTo(50, currentY + 15).lineTo(550, currentY + 15).strokeColor('#E5E7EB').lineWidth(1).stroke();
            currentY += 25;
        }

        if (pagoData.recargo_aplicado && Number(pagoData.recargo_aplicado) > 0) {
            doc.text('03', itemCodeX + 5, currentY);
            doc.text('Recargo por Mora', descriptionX, currentY);
            doc.fillColor(colors.primary).text(`+$${Number(pagoData.recargo_aplicado).toLocaleString('es-AR')}`, priceX, currentY, { align: 'right', width: 90 });
            doc.fillColor(colors.text);
            doc.moveTo(50, currentY + 15).lineTo(550, currentY + 15).strokeColor('#E5E7EB').lineWidth(1).stroke();
            currentY += 25;
        }

        // Si hay curso asociado
        if (pagoData.curso_nombre) {
            doc.fontSize(8).fillColor('#666666')
                .text(`Curso asociado: ${pagoData.curso_nombre}`, descriptionX, currentY - 5);
            currentY += 15;
        }

        // Totales
        currentY += 20;
        const totalBoxTop = currentY;

        // Rectángulo de totales (fondo muy claro)
        doc.rect(350, totalBoxTop, 200, 40).fill(colors.lightBg);

        doc.fontSize(12).fillColor(colors.secondary).font('Helvetica-Bold');
        doc.text('TOTAL', 370, totalBoxTop + 12);

        doc.fontSize(14).fillColor(colors.primary)
            .text(`$${Number(pagoData.monto).toLocaleString('es-AR')}`, 450, totalBoxTop + 10, { align: 'right', width: 90 });

    },

    drawFooter(doc, colors) {
        const bottomY = 700;

        // Mensaje de Agradecimiento
        doc.fontSize(14).fillColor(colors.secondary).font('Helvetica-Oblique') // Cursiva simulada
            .text('Gracias por elegirnos', 50, bottomY, { align: 'center' });

        doc.moveDown(0.5);
        doc.fontSize(8).font('Helvetica').fillColor('#888888')
            .text('Este documento sirve como constancia de pago válida.', { align: 'center' })
            .text('Select Dance Studio | selectdancestudio.ar@gmail.com', { align: 'center' });

        // Barra inferior de color
        doc.rect(0, 780, 600, 20).fill(colors.primary);
    },

    /**
     * Genera y guarda un PDF en el sistema de archivos
     */
    async generarYGuardarComprobante(pagoData, alumnoData, rutaArchivo) {
        return new Promise((resolve, reject) => {
            try {
                const doc = this.generarComprobante(pagoData, alumnoData);
                const writeStream = fs.createWriteStream(rutaArchivo);

                doc.pipe(writeStream);
                doc.end();

                writeStream.on('finish', () => resolve(rutaArchivo));
                writeStream.on('error', reject);
            } catch (error) {
                reject(error);
            }
        });
    }
};

module.exports = PDFService;
