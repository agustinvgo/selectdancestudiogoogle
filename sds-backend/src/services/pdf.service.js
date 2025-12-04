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

        try {
            this.drawHeader(doc, pagoData);
            this.drawStudentInfo(doc, alumnoData);
            this.drawPaymentDetails(doc, pagoData);
            this.drawFooter(doc);
        } catch (error) {
            console.error('Error generando secciones del PDF:', error);
            // Intentar escribir el error en el PDF para depuración si es posible
            doc.addPage();
            doc.fontSize(12).fillColor('red').text(`Error generando comprobante: ${error.message}`);
        }

        return doc;
    },

    drawHeader(doc, pagoData) {
        try {
            doc.fontSize(20).font('Helvetica-Bold')
                .text('SELECT DANCE STUDIO', { align: 'center' })
                .fontSize(10).font('Helvetica')
                .text('Comprobante de Pago', { align: 'center' })
                .moveDown(2);

            doc.moveTo(50, doc.y)
                .lineTo(550, doc.y)
                .stroke();
            doc.moveDown();

            const fechaEmision = new Date().toLocaleDateString('es-AR');
            const pagoId = pagoData && pagoData.id ? String(pagoData.id).padStart(8, '0') : '--------';

            doc.fontSize(10).font('Helvetica')
                .text(`Fecha de Emisión: ${fechaEmision}`, 50)
                .text(`N° Comprobante: ${pagoId}`, 50)
                .moveDown();
        } catch (e) {
            console.error('Error en drawHeader:', e);
            doc.text('Error en encabezado');
        }
    },

    drawStudentInfo(doc, alumnoData) {
        try {
            const nombre = alumnoData ? `${alumnoData.nombre || ''} ${alumnoData.apellido || ''}`.trim() : 'Alumno Desconocido';
            const email = alumnoData && alumnoData.usuario_email ? alumnoData.usuario_email : 'No especificado';
            const telefono = alumnoData && alumnoData.telefono ? alumnoData.telefono : 'No especificado';

            doc.fontSize(12).font('Helvetica-Bold')
                .text('Datos del Alumno', 50)
                .fontSize(10).font('Helvetica')
                .text(`Nombre: ${nombre}`, 50)
                .text(`Email: ${email}`, 50)
                .text(`Teléfono: ${telefono}`, 50)
                .moveDown(1.5);
        } catch (e) {
            console.error('Error en drawStudentInfo:', e);
            doc.text('Error en datos del alumno');
        }
    },

    drawPaymentDetails(doc, pagoData) {
        try {
            doc.fontSize(12).font('Helvetica-Bold')
                .text('Detalles del Pago', 50)
                .fontSize(10).font('Helvetica');

            const yPos = doc.y + 10;
            const tableTop = yPos;
            const col1X = 50;
            const col2X = 350;

            // Safe helpers
            const safeText = (text) => text || '-';
            const safeCurrency = (amount) => {
                const num = Number(amount);
                return isNaN(num) ? '$0' : `$${num.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
            };

            doc.text('Concepto:', col1X, tableTop)
                .text(safeText(pagoData.concepto), col2X, tableTop);

            if (pagoData.curso_nombre) {
                doc.text('Curso:', col1X, tableTop + 20)
                    .text(pagoData.curso_nombre, col2X, tableTop + 20);
            }

            const montoOriginal = pagoData.monto_original !== undefined && pagoData.monto_original !== null
                ? pagoData.monto_original
                : (pagoData.monto || 0);

            doc.text('Monto Original:', col1X, tableTop + (pagoData.curso_nombre ? 40 : 20))
                .text(safeCurrency(montoOriginal), col2X, tableTop + (pagoData.curso_nombre ? 40 : 20));

            let currentY = tableTop + (pagoData.curso_nombre ? 60 : 40);

            if (pagoData.descuento_aplicado && pagoData.descuento_aplicado > 0) {
                doc.text('Descuento Aplicado:', col1X, currentY)
                    .text(`- ${safeCurrency(pagoData.descuento_aplicado)}`, col2X, currentY);
                currentY += 20;
            }

            if (pagoData.recargo_aplicado && pagoData.recargo_aplicado > 0) {
                doc.text('Recargo Aplicado:', col1X, currentY)
                    .text(`+ ${safeCurrency(pagoData.recargo_aplicado)}`, col2X, currentY);
                currentY += 20;
            }

            // Monto total
            doc.fontSize(14).font('Helvetica-Bold')
                .text('TOTAL ABONADO:', col1X, currentY + 10)
                .text(safeCurrency(pagoData.monto), col2X, currentY + 10);

            currentY += 50;

            // Información de pago adicional
            doc.fontSize(10).font('Helvetica');

            if (pagoData.fecha_pago) {
                try {
                    const fecha = new Date(pagoData.fecha_pago).toLocaleDateString('es-AR');
                    doc.text(`Fecha de Pago: ${fecha}`, col1X, currentY);
                } catch (e) {
                    doc.text(`Fecha de Pago: ${pagoData.fecha_pago}`, col1X, currentY);
                }
            }

            if (pagoData.metodo_pago_realizado) {
                doc.text(`Método de Pago: ${String(pagoData.metodo_pago_realizado).toUpperCase()}`, col1X, currentY + 20);
            }

            if (pagoData.plan_cuotas) {
                doc.text(`Plan de Cuotas: ${pagoData.cuota_numero || '?'}/${pagoData.plan_cuotas}`, col1X, currentY + 40);
            }

        } catch (e) {
            console.error('Error en drawPaymentDetails:', e);
            doc.text('Error en detalles del pago');
        }
    },

    drawFooter(doc) {
        try {
            doc.fontSize(8).font('Helvetica')
                .text('Este comprobante es válido como constancia de pago.', 50, 750, { align: 'center' })
                .text('Select Dance Studio - Comprobante generado electrónicamente', 50, 765, { align: 'center' });
        } catch (e) {
            console.error('Error en drawFooter:', e);
        }
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
