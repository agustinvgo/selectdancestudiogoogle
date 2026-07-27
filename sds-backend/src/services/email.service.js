const nodemailer = require('nodemailer');
const path = require('path');
const { formatSchedule } = require('../utils/formatters');
const notifSettings = require('./notifSettings');

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
            rejectUnauthorized: process.env.NODE_ENV !== 'production'
        }
    });
};

// Helper: Obtener adjunto del logo
const getLogoAttachment = () => {
    try {
        const fs = require('fs');
        const pathsToTry = [
            path.join(__dirname, '../public/logo.jpg'),
            path.join(__dirname, '../../public/logo.jpg'),
            path.join(__dirname, '../../../sds-frontend/public/logo.jpg')
        ];
        for (const p of pathsToTry) {
            if (fs.existsSync(p)) {
                return { filename: 'logo.jpg', path: p, cid: 'sdslogo' };
            }
        }
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

    let formattedContent = content;
    // Insertar la marca de garras rojas debajo del título principal si existe
    if (formattedContent.includes('</h1>')) {
        formattedContent = formattedContent.replace('</h1>', '</h1><div class="greeting-line"><svg width="40" height="16" viewBox="0 0 40 16" style="display: inline-block; vertical-align: middle;" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 C14 5, 16 9, 17 14" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/><path d="M20 2 C22 5, 24 9, 25 14" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/><path d="M28 2 C30 5, 32 9, 33 14" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/></svg></div>');
    } else if (formattedContent.includes('</h2>')) {
        formattedContent = formattedContent.replace('</h2>', '</h2><div class="greeting-line"><svg width="40" height="16" viewBox="0 0 40 16" style="display: inline-block; vertical-align: middle;" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 C14 5, 16 9, 17 14" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/><path d="M20 2 C22 5, 24 9, 25 14" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/><path d="M28 2 C30 5, 32 9, 33 14" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/></svg></div>');
    }

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
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Oswald:wght@500;700&display=swap');
        
        body {
            margin: 0;
            padding: 0;
            background-color: #f3f4f6;
            font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
            color: #1f2937;
            -webkit-font-smoothing: antialiased;
        }
        
        table { border-spacing: 0; width: 100%; }
        td { padding: 0; }
        img { border: 0; -ms-interpolation-mode: bicubic; }
        
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f3f4f6;
            padding: 40px 0;
        }
        
        .main {
            background-color: #ffffff;
            margin: 0 auto;
            width: 100%;
            max-width: 600px;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            border: 1px solid #e5e7eb;
        }
        
        .header {
            background-color: #000000;
            padding: 24px 20px;
            text-align: center;
        }
        
        .header-logo {
            max-height: 90px;
            max-width: 100%;
            width: auto;
            height: auto;
            display: block;
            margin: 0 auto;
            filter: drop-shadow(0px 0px 8px rgba(220, 38, 38, 0.35));
        }

        .divider-red {
            height: 4px;
            background-color: #dc2626;
        }

        .claw-divider-container {
            background-color: #ffffff;
            padding: 18px 0 6px 0;
            text-align: center;
        }
        
        .content-body {
            padding: 30px 50px 45px 50px;
            text-align: center;
            background-color: #ffffff;
        }
        
        @media screen and (max-width: 600px) {
            .content-body { padding: 30px 24px; }
            .wrapper { padding: 20px 0; }
        }
        
        h1, h2, h3 { 
            color: #000000; 
            margin-top: 0;
            font-family: 'Oswald', Arial, sans-serif;
            text-transform: uppercase;
            font-weight: 700;
            letter-spacing: 1px;
        }

        h1 {
            font-size: 24px;
            line-height: 1.3;
            margin-bottom: 8px;
        }

        .greeting-line {
            margin: 16px auto 24px auto;
            text-align: center;
            line-height: 0;
        }
        
        p { 
            margin: 0 0 18px 0; 
            line-height: 1.8; 
            color: #374151; 
            font-size: 16px; 
        }

        p:last-child {
            margin-bottom: 0;
        }
        
        ul { 
            color: #374151; 
            padding-left: 20px; 
            line-height: 1.8; 
            text-align: left;
            margin-bottom: 20px;
        }
        
        .button-container { 
            text-align: center; 
            margin: 32px 0; 
        }

        .button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #000000;
            color: #ffffff !important;
            text-decoration: none;
            font-family: 'Oswald', sans-serif;
            font-weight: 700;
            font-size: 15px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            border: 2px solid #000000;
            box-shadow: 4px 4px 0px #dc2626;
            transition: all 0.15s ease;
        }

        .button:hover { 
            background-color: #dc2626; 
            border-color: #dc2626;
            box-shadow: 2px 2px 0px #000000;
            transform: translate(2px, 2px);
        }
        
        .info-box {
            background-color: #f9fafb;
            border-left: 4px solid #dc2626;
            padding: 24px;
            margin: 28px 0;
            border-radius: 4px;
            border-top: 1px dashed #e5e7eb;
            border-right: 1px dashed #e5e7eb;
            border-bottom: 1px dashed #e5e7eb;
            text-align: left;
            box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.03);
        }

        .info-box h3 { 
            color: #dc2626; 
            font-size: 17px; 
            margin-bottom: 12px; 
            margin-top: 0; 
            font-weight: 700;
        }

        .info-box p {
            font-size: 15px;
            margin-bottom: 8px;
        }

        .info-box p:last-child {
            margin-bottom: 0;
        }
        
        .footer {
            background-color: #000000;
            padding: 35px 24px;
            text-align: center;
        }

        .footer p {
            color: #9ca3af;
            font-size: 13px;
            margin: 0;
            line-height: 1.5;
        }

        .footer-line {
            width: 50px;
            height: 1px;
            background-color: #dc2626;
            margin: 16px auto;
        }

        .social-links {
            margin-top: 5px;
        }

        .social-links a { 
            color: #ffffff; 
            text-decoration: none; 
            margin: 0 8px; 
            font-weight: 600;
            font-size: 13px;
            transition: color 0.15s ease;
        }

        .social-links a:hover {
            color: #dc2626;
        }

        .bullet-divider {
            color: #dc2626;
            font-weight: bold;
        }
        
        strong { 
            color: #000000; 
            font-weight: 700; 
        }

        .info-box strong {
            color: #000000;
        }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main">
            <tr>
                <td class="header">
                    <img src="cid:sdslogo" alt="SDS Logo" class="header-logo">
                </td>
            </tr>
            <tr>
                <td class="divider-red"></td>
            </tr>
            <tr>
                <td class="claw-divider-container">
                    <svg width="60" height="24" viewBox="0 0 60 24" style="display: inline-block; vertical-align: middle;" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 3 C19 7, 21 13, 23 21" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M26 3 C29 7, 31 13, 33 21" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/>
                        <path d="M36 3 C39 7, 41 13, 43 21" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/>
                    </svg>
                </td>
            </tr>
            <tr>
                <td class="content-body">
                    ${formattedContent}
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <p>&copy; ${year} Select Dance Studio. Todos los derechos reservados.</p>
                    <div class="footer-line"></div>
                    <div class="social-links">
                        <a href="https://www.instagram.com/selectdance.studio/">Instagram</a>
                        <span class="bullet-divider">•</span> 
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

// Helper universal para enviar emails.
// opts.force = true -> salta la pausa (envíos manuales y críticos como reset de contraseña).
const sendEmail = async (mailOptions, opts = {}) => {
    if (!opts.force && await notifSettings.isPaused('email')) {
        console.log('⏸️ Correos pausados — email automático no enviado.');
        return { success: false, paused: true, skipped: true };
    }
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
    // Crítico: el reset de contraseña SIEMPRE se envía, aunque los correos estén pausados.
    return sendEmail({
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Recuperación de Contraseña',
        html: emailTemplate('Recuperación de Contraseña', content)
    }, { force: true });
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

const enviarAgradecimientoAsistencia = async (email, nombre) => {
    const content = `
        <h1>¡Gracias por asistir a Select Dance Studio! 🌟</h1>
        <p>Hola <strong>${nombre}</strong>,<br>Esperamos que hayas disfrutado muchísimo de tu clase de prueba.</p>
        <p>Nos encantaría contar contigo como parte permanente de nuestro equipo.</p>
        <div class="button-container">
            <a href="${process.env.FRONTEND_URL || '#'}" class="button">Inscribirme ahora</a>
        </div>
        <p>Cualquier consulta no dudes en escribirnos.</p>
    `;
    return sendEmail({
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '¡Gracias por tu visita! 💃',
        html: emailTemplate('Clase Completada', content)
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

const enviarNotificacionNuevoPago = async (email, nombre, concepto, monto, fechaVencimiento) => {
    const content = `
        <h1>Nuevo Pago Registrado 📋</h1>
        <p>Hola <strong>${nombre}</strong>,<br>se ha generado un nuevo pago en tu cuenta.</p>
        <div class="info-box">
            <p><strong>Concepto:</strong> ${concepto}</p>
            <p><strong>Monto:</strong> $${monto}</p>
            <p><strong>Vencimiento:</strong> ${new Date(fechaVencimiento).toLocaleDateString('es-AR')}</p>
        </div>
        <p>Podés abonar desde tu panel o acercarte al estudio. ¡Gracias!</p>
    `;
    return sendEmail({
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Nuevo Pago - ${concepto}`,
        html: emailTemplate('Nuevo Pago', content)
    });
};

const enviarNotificacionVencido = async (email, nombre, concepto, monto, fechaVencimiento, diasMora) => {
    const content = `
        <h1>Pago Vencido ⚠️</h1>
        <p>Hola <strong>${nombre}</strong>,<br>tenés un pago vencido hace <strong>${diasMora} día${diasMora !== 1 ? 's' : ''}</strong>.</p>
        <div class="info-box">
            <p><strong>Concepto:</strong> ${concepto}</p>
            <p><strong>Monto:</strong> $${monto}</p>
            <p><strong>Venció el:</strong> ${new Date(fechaVencimiento).toLocaleDateString('es-AR')}</p>
        </div>
        <p>Por favor regularizá tu situación lo antes posible para evitar recargos adicionales.</p>
    `;
    return sendEmail({
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Pago Vencido - ${concepto}`,
        html: emailTemplate('Pago Vencido', content)
    });
};

const enviarFelicitacionCumpleanos = async (email, nombre) => {
    const content = `
        <h1>¡Feliz Cumpleaños ${nombre}! 🎂🎉</h1>
        <p>Todo el equipo de <strong>Select Dance Studio</strong> te desea un hermoso día lleno de alegría y baile.</p>
        <p>¡Que este nuevo año de vida esté lleno de música y danza!</p>
        <div class="button-container">
            <a href="${process.env.FRONTEND_URL || '#'}" class="button">Ir a mi Panel</a>
        </div>
        <p>Con cariño, el equipo de SDS 💃</p>
    `;
    return sendEmail({
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `¡Feliz Cumpleaños ${nombre}! 🎂`,
        html: emailTemplate('Feliz Cumpleaños', content)
    });
};

const enviarConfirmacionInscripcionEvento = async (email, nombre, nombreEvento, fecha, lugar) => {
    const content = `
        <h1>¡Inscripción al Evento Confirmada! 🎭</h1>
        <p>Hola <strong>${nombre}</strong>,<br>¡te has inscrito exitosamente al evento!</p>
        <div class="info-box">
            <h3>${nombreEvento}</h3>
            <p><strong>Fecha:</strong> ${new Date(fecha).toLocaleDateString('es-AR')}</p>
            <p><strong>Lugar:</strong> ${lugar || '-'}</p>
        </div>
        <p>¡Te esperamos en el estudio para preparar todo junto!</p>
    `;
    return sendEmail({
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Inscripción Confirmada - ${nombreEvento}`,
        html: emailTemplate('Inscripción al Evento', content)
    });
};

const enviarDesinscripcionEvento = async (email, nombre, nombreEvento) => {
    const content = `
        <h1>Desinscripción Procesada 📋</h1>
        <p>Hola <strong>${nombre}</strong>,<br>te confirmamos que has sido desinscrito/a del siguiente evento:</p>
        <div class="info-box">
            <h3>${nombreEvento}</h3>
        </div>
        <p>Si fue un error o querés reinscribirte, contactanos por WhatsApp o acercate al estudio.</p>
    `;
    return sendEmail({
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Desinscripción - ${nombreEvento}`,
        html: emailTemplate('Desinscripción de Evento', content)
    });
};

const enviarDesinscripcionCurso = async (email, nombre, nombreCurso) => {
    const content = `
        <h1>Desinscripción Procesada 📋</h1>
        <p>Hola <strong>${nombre}</strong>,<br>te confirmamos que has sido desinscrito/a del siguiente curso:</p>
        <div class="info-box">
            <h3>${nombreCurso}</h3>
        </div>
        <p>Si fue un error o querés reinscribirte, contactanos por WhatsApp o acercate al estudio.</p>
    `;
    return sendEmail({
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Desinscripción - ${nombreCurso}`,
        html: emailTemplate('Desinscripción de Curso', content)
    });
};

module.exports = {
    enviarEmailBienvenida,
    enviarRecordatorioPago,
    enviarConfirmacionInscripcion,
    enviarConfirmacionInscripcionEvento,
    enviarDesinscripcionEvento,
    enviarDesinscripcionCurso,
    probarConfiguracion,
    enviarResetPassword,
    enviarConfirmacionSolicitudPrueba,
    enviarConfirmacionAgendamiento,
    enviarReciboPago,
    notificarAdminNuevoComprobante,
    notificarAdminNuevaConsulta,
    enviarAgradecimientoAsistencia,
    enviarNotificacionNuevoPago,
    enviarNotificacionVencido,
    enviarFelicitacionCumpleanos,

    // Métodos alias para compatibilidad
    enviarEmailPersonalizado: async (email, nombre, asunto, mensaje, opts = {}) => {
        const content = `<h1>Hola <strong>${nombre}</strong>, 👋</h1><p>${mensaje}</p>`;
        return sendEmail({ from: `"Select Dance Studio" <${process.env.SMTP_USER}>`, to: email, subject: asunto, html: emailTemplate(asunto, content) }, opts);
    },
    enviarNotificacionEvento: async (email, nombre, nombreEvento, fecha, lugar) => {
        const content = `<h1>¡Evento Próximo! 🎭</h1><div class="info-box"><h3>${nombreEvento}</h3><p><strong>Fecha:</strong> ${new Date(fecha).toLocaleDateString('es-AR')}</p><p><strong>Lugar:</strong> ${lugar || '-'}</p></div>`;
        return sendEmail({ from: `"Select Dance Studio" <${process.env.SMTP_USER}>`, to: email, subject: `Recordatorio: ${nombreEvento}`, html: emailTemplate('Evento', content) });
    }
};
