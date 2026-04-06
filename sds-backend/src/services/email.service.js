const nodemailer = require('nodemailer');
const path = require('path');
const { formatSchedule } = require('../utils/formatters');

/**
 * Servicio de envío de emails
 */

// Configurar transporter de nodemailer
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Helper: Obtener adjunto del logo
const getLogoAttachment = () => {
    try {
        const fs = require('fs');
        // Ruta en desarrollo local
        const localPath = path.join(__dirname, '../../../sds-frontend/public/logo.jpg');
        if (fs.existsSync(localPath)) {
            return { filename: 'logo.jpg', path: localPath, cid: 'sdslogo' };
        }
        // Ruta dentro del contenedor Docker
        const dockerPath = path.join(__dirname, '../../public/logo.jpg');
        if (fs.existsSync(dockerPath)) {
            return { filename: 'logo.jpg', path: dockerPath, cid: 'sdslogo' };
        }
        // No hay logo local disponible
        return null;
    } catch (error) {
        return null;
    }
};

/**
 * Template base para emails (Modo Claro Premium)
 */
const emailTemplate = (title, content) => {
    const year = new Date().getFullYear();

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <!--[if mso]>
    <xml>
    <o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        body {
            margin: 0;
            padding: 0;
            background-color: #F3F4F6;
            font-family: 'Inter', Arial, sans-serif;
            color: #1F2937;
        }
        
        table { border-spacing: 0; width: 100%; }
        td { padding: 0; }
        img { border: 0; -ms-interpolation-mode: bicubic; }
        
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background: repeating-linear-gradient(
                135deg,
                #ffffff,
                #ffffff 20px,
                #f8d7da 20px,
                #f8d7da 22px
            );
            padding: 40px 0;
        }
        
        .main {
            background-color: #FFFFFF;
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 25px rgba(0,0,0,0.08);
            border: 1px solid #E5E7EB;
        }
        
        .header {
            padding: 30px 20px;
            text-align: center;
            background-color: #FFFFFF;
            border-bottom: 4px solid #DC2626;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 50%;
            border: 3px solid #F3F4F6;
        }
        
        .brand-name {
            color: #111827;
            font-size: 28px;
            font-weight: 800;
            margin: 0;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        
        .brand-subtitle {
            font-size: 12px;
            color: #777777;
            margin-top: 4px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .content-body { padding: 30px 40px; text-align: center; }
        
        @media screen and (max-width: 600px) {
            .content-body { padding: 30px 20px; }
        }
        
        h2 { font-size: 24px; margin-bottom: 25px; text-align: center; color: #111827; font-weight: 700; }
        p { margin: 0 0 18px 0; line-height: 1.7; color: #4B5563; font-size: 16px; }
        ul { color: #4B5563; padding-left: 20px; line-height: 1.8; }
        
        .button-container { text-align: center; margin: 35px 0; }
        .button {
            display: inline-block;
            padding: 16px 40px;
            background-color: #111827;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 700;
            font-size: 16px;
            border-bottom: 4px solid #000000;
        }
        .button:hover { background-color: #DC2626; border-bottom-color: #B91C1C; }
        
        .info-box {
            background-color: #F9FAFB;
            border-top: 4px solid #DC2626;
            padding: 25px;
            margin: 30px 0;
            border-radius: 12px;
            border: 1px solid #E5E7EB;
        }
        .info-box h3 { color: #DC2626; font-size: 18px; margin-bottom: 12px; margin-top: 0; }
        
        .footer {
            background-color: #F9FAFB;
            padding: 30px 20px;
            text-align: center;
            font-size: 14px;
            color: #9CA3AF;
        }
        .footer a { color: #4B5563; text-decoration: none; margin: 0 12px; font-weight: 600; }
        strong { color: #111827; font-weight: 700; }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main">
            <tr>
                <td class="header">
                    <img src="cid:sdslogo" alt="SDS Logo" class="logo">
                    <h1 class="brand-name">SDS</h1>
                    <div class="brand-subtitle">SELECT DANCE STUDIO</div>
                </td>
            </tr>
            <tr>
                <td class="content-body">
                    ${content}
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <p>&copy; ${year} Select Dance Studio. Todos los derechos reservados.</p>
                    <div class="social-links">
                        <a href="https://www.instagram.com/selectdance.studio/">Instagram</a> • 
                        <a href="${process.env.FRONTEND_URL || '#'}">Sitio Web</a>
                    </div>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
    `;
};

// Helper universal para enviar emails
const sendEmail = async (mailOptions) => {
    const transporter = createTransporter();
    const attachments = mailOptions.attachments || [];
    const logoAttachment = getLogoAttachment();
    if (logoAttachment && !attachments.some(a => a.cid === 'sdslogo')) {
        attachments.push(logoAttachment);
    }

    try {
        const info = await transporter.sendMail({ ...mailOptions, attachments });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        // Si falla por el logo (archivo no encontrado), reintentar sin logo
        if (error.code === 'ESTREAM' || error.code === 'ENOENT') {
            console.warn('⚠️ Logo no disponible, enviando email sin logo...');
            try {
                const cleanAttachments = (mailOptions.attachments || []).filter(a => a.cid !== 'sdslogo');
                const info = await transporter.sendMail({ ...mailOptions, attachments: cleanAttachments });
                return { success: true, messageId: info.messageId, logoOmitted: true };
            } catch (retryError) {
                console.error('Error sending email (retry):', retryError);
                return { success: false, error: retryError.message };
            }
        }
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

/** Métodos de envío específicos */

const enviarEmailBienvenida = async (email, nombre) => {
    const content = `
        <h1>¡Bienvenido/a ${nombre}! 🎉</h1>
        <p>Estamos muy felices de tenerte en <strong>Select Dance Studio</strong>.</p>
        <p>Tu cuenta ha sido creada exitosamente. Ahora puedes ver tus clases, horarios y pagos desde tu panel.</p>
        <div class="button-container">
            <a href="${process.env.FRONTEND_URL || '#'}" class="button">Ir a mi Panel</a>
        </div>
        <p>¡Nos vemos en clase!</p>
    `;
    return sendEmail({
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `¡Bienvenido/a a Select Dance Studio! 🩰`,
        html: emailTemplate('Bienvenida', content)
    });
};

const enviarRecordatorioPago = async (email, nombre, concepto, monto, fechaVencimiento) => {
    const content = `
        <h1>Recordatorio de Pago 💳</h1>
        <p>Hola <strong>${nombre}</strong>,<br>te recordamos que tienes un pago pendiente:</p>
        <div class="info-box">
            <p><strong>Concepto:</strong> ${concepto}</p>
            <p><strong>Monto:</strong> $${monto}</p>
            <p><strong>Vencimiento:</strong> ${new Date(fechaVencimiento).toLocaleDateString('es-AR')}</p>
        </div>
        <p>Por favor, acércate al estudio para regularizar tu situación. ¡Gracias!</p>
    `;
    return sendEmail({
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Recordatorio de Pago - ${concepto}`,
        html: emailTemplate('Recordatorio de Pago', content)
    });
};

const enviarConfirmacionInscripcion = async (email, nombre, nombreCurso, horario) => {
    const cleanHorario = formatSchedule(horario);
    const content = `
        <h1>¡Inscripción Confirmada! ✅</h1>
        <p>Hola <strong>${nombre}</strong>,<br>¡te has inscrito exitosamente!</p>
        <div class="info-box">
            <h3>${nombreCurso}</h3>
            <p><strong>Horario:</strong> ${cleanHorario}</p>
        </div>
        <p>Te esperamos preparada para bailar. ¡Trae mucha energía!</p>
    `;
    return sendEmail({
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Confirmación de Inscripción - ${nombreCurso}`,
        html: emailTemplate('Inscripción Confirmada', content)
    });
};

const probarConfiguracion = async (emailDestino) => {
    const content = `
        <h2>Test de Diseño Premium ✅</h2>
        <p>Este es el nuevo formato de email con <strong>Fondo Blanco</strong> y acentos en <strong>Rojo y Negro</strong>.</p>
        <div class="info-box">
            <h3>Información de Prueba</h3>
            <p>Este bloque resalta los datos importantes como horarios o montos.</p>
        </div>
        <div class="button-container">
            <a href="#" class="button">Botón de Acción</a>
        </div>
        <p>Si el diseño te gusta, ¡ya podemos usarlo para todos los envíos!</p>
    `;
    return sendEmail({
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: emailDestino,
        subject: 'Test de Diseño - Select Dance Studio',
        html: emailTemplate('Test de Diseño', content)
    });
};

const enviarResetPassword = async (email, nombre, token) => {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    const content = `
        <h1>Recuperación de Contraseña 🔐</h1>
        <p>Hola <strong>${nombre || 'profe'}</strong>,<br>recibimos una solicitud para restablecer tu contraseña.</p>
        <div class="button-container">
            <a href="${resetLink}" class="button">Restablecer Contraseña</a>
        </div>
        <p style="font-size: 13px; color: #9CA3AF;">Este enlace es válido por 1 hora.</p>
    `;
    return sendEmail({
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Recuperación de Contraseña',
        html: emailTemplate('Recuperación de Contraseña', content)
    });
};

const enviarConfirmacionSolicitudPrueba = async (email, nombre, interes, horario) => {
    const cleanHorario = formatSchedule(horario);
    const content = `
        <h1>¡Solicitud Recibida! 🩰</h1>
        <p>Hola <strong>${nombre}</strong>,<br>recibimos tu solicitud para una clase de prueba.</p>
        <div class="info-box">
            <h3>${interes}</h3>
            <p><strong>Horario preferido:</strong> ${cleanHorario || 'A coordinar'}</p>
        </div>
        <p>Nos pondremos en contacto contigo muy pronto para confirmar.</p>
    `;
    return sendEmail({
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Solicitud de Clase de Prueba',
        html: emailTemplate('Solicitud Recibida', content)
    });
};

const enviarConfirmacionAgendamiento = async (email, nombre, interes, horario) => {
    const cleanHorario = formatSchedule(horario);
    const content = `
        <h1>¡Clase Agendada! 📅</h1>
        <p>Hola <strong>${nombre}</strong>,<br>tu clase de prueba ha sido confirmada.</p>
        <div class="info-box">
            <h3>${interes}</h3>
            <p><strong>Horario:</strong> ${cleanHorario}</p>
        </div>
        <p>¡Te esperamos en el estudio!</p>
    `;
    return sendEmail({
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Clase de Prueba Agendada 💃',
        html: emailTemplate('Clase Agendada', content)
    });
};

const enviarReciboPago = async (email, nombre, concepto, monto, fechaPago, pdfBuffer) => {
    const content = `
        <h1>¡Pago Recibido! 🧾</h1>
        <p>Hola <strong>${nombre}</strong>,<br>hemos recibido tu pago correctamente.</p>
        <div class="info-box">
            <p><strong>Concepto:</strong> ${concepto}</p>
            <p><strong>Monto:</strong> $${monto}</p>
            <p><strong>Fecha:</strong> ${new Date(fechaPago).toLocaleDateString('es-AR')}</p>
            <p><strong>Estado:</strong> Pagado ✔</p>
        </div>
        <p>Adjunto encontrarás tu comprobante oficial en PDF.</p>
    `;
    return sendEmail({
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Comprobante de Pago - ${concepto}`,
        html: emailTemplate('Pago Recibido', content),
        attachments: [{ filename: `recibo_pago.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
    });
};

const notificarAdminNuevoComprobante = async (pagoInfo, alumnoInfo) => {
    const content = `
        <h1>Nuevo Comprobante Recibido 📄</h1>
        <p>Un alumno ha subido un comprobante que requiere revisión:</p>
        <div class="info-box">
            <p><strong>Alumno:</strong> ${alumnoInfo.nombre} ${alumnoInfo.apellido}</p>
            <p><strong>Concepto:</strong> ${pagoInfo.concepto}</p>
            <p><strong>Monto:</strong> $${pagoInfo.monto}</p>
        </div>
        <div class="button-container">
            <a href="${process.env.FRONTEND_URL || '#'}/admin/pagos" class="button">Validar en Admin</a>
        </div>
    `;
    return sendEmail({
        from: `"Sistema SDS" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
        subject: `[Admin] Nuevo Comprobante - ${alumnoInfo.nombre}`,
        html: emailTemplate('Revisión Pendiente', content)
    });
};

const notificarAdminNuevaConsulta = async (consultaInfo) => {
    const content = `
        <h1>Nueva Consulta Web 💬</h1>
        <div class="info-box">
            <p><strong>Nombre:</strong> ${consultaInfo.nombre}</p>
            <p><strong>Email:</strong> ${consultaInfo.email}</p>
            <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 15px 0;">
            <p><strong>Mensaje:</strong></p>
            <p style="font-style: italic;">"${consultaInfo.mensaje}"</p>
        </div>
    `;
    return sendEmail({
        from: `"Web SDS" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
        subject: `[Web] Nueva Consulta de ${consultaInfo.nombre}`,
        html: emailTemplate('Nueva Consulta', content)
    });
};

module.exports = {
    enviarEmailBienvenida,
    enviarRecordatorioPago,
    enviarConfirmacionInscripcion,
    probarConfiguracion,
    enviarResetPassword,
    enviarConfirmacionSolicitudPrueba,
    enviarConfirmacionAgendamiento,
    enviarReciboPago,
    notificarAdminNuevoComprobante,
    notificarAdminNuevaConsulta,

    // Métodos alias para compatibilidad
    enviarEmailPersonalizado: async (email, nombre, asunto, mensaje) => {
        const content = `<h1>Hola <strong>${nombre}</strong>, 👋</h1><p>${mensaje}</p>`;
        return sendEmail({ from: `"Select Dance Studio" <${process.env.SMTP_USER}>`, to: email, subject: asunto, html: emailTemplate(asunto, content) });
    },
    enviarNotificacionEvento: async (email, nombre, nombreEvento, fecha, lugar) => {
        const content = `<h1>¡Evento Próximo! 🎭</h1><div class="info-box"><h3>${nombreEvento}</h3><p><strong>Fecha:</strong> ${new Date(fecha).toLocaleDateString('es-AR')}</p><p><strong>Lugar:</strong> ${lugar || '-'}</p></div>`;
        return sendEmail({ from: `"Select Dance Studio" <${process.env.SMTP_USER}>`, to: email, subject: `Recordatorio: ${nombreEvento}`, html: emailTemplate('Evento', content) });
    }
};
