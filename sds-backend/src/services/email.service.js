const nodemailer = require('nodemailer');

/**
 * Servicio de envío de emails
 */

// Configurar transporter de nodemailer
const createTransporter = () => {
    console.log('Configurando transporter con:', {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER
    });

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

/**
 * Template base para emails
 */
const emailTemplate = (title, content) => {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: #DC2626;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🩰 Select Dance Studio</h1>
    </div>
    <div class="content">
        ${content}
    </div>
    <div class="footer">
        <p>Este es un email automático, por favor no respondas a este mensaje.</p>
        <p>&copy; ${new Date().getFullYear()} Select Dance Studio - Todos los derechos reservados</p>
    </div>
</body>
</html>
    `;
};

/**
 * Enviar email de bienvenida
 */
const enviarEmailBienvenida = async (email, nombre) => {
    const transporter = createTransporter();

    const content = `
        <div style="background: #fff3cd; padding: 10px; margin-bottom: 20px; border: 1px solid #ffeeba; color: #856404;">
            <strong>Nota para Admin:</strong> Este correo es para el alumno/a <strong>${nombre}</strong> (Email registrado: ${email})
        </div>
        <h2>¡Bienvenido/a ${nombre}! 🎉</h2>
        <p>Estamos muy felices de tenerte en <strong>Select Dance Studio</strong>.</p>
        <p>Tu cuenta ha sido creada exitosamente. Ahora puedes:</p>
        <ul>
            <li>Ver tus clases y horarios</li>
            <li>Consultar tu asistencia</li>
            <li>Revisar tus pagos</li>
            <li>Inscribirte en eventos especiales</li>
        </ul>
        <p>Si tienes alguna duda, no dudes en contactarnos.</p>
        <p>¡Nos vemos en clase!</p>
    `;

    const mailOptions = {
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER, // Enviar al admin
        subject: `[PARA: ${nombre}] ¡Bienvenido/a a Select Dance Studio! 🩰`,
        html: emailTemplate('Bienvenida', content)
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email de bienvenida enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando email de bienvenida:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar recordatorio de pago
 */
const enviarRecordatorioPago = async (email, nombre, concepto, monto, fechaVencimiento) => {
    const transporter = createTransporter();

    const content = `
        <div style="background: #fff3cd; padding: 10px; margin-bottom: 20px; border: 1px solid #ffeeba; color: #856404;">
            <strong>Nota para Admin:</strong> Este correo es para el alumno/a <strong>${nombre}</strong> (Email registrado: ${email})
        </div>
        <h2>Recordatorio de Pago 💳</h2>
        <p>Hola ${nombre},</p>
        <p>Te recordamos que tienes un pago pendiente:</p>
        <div style="background: white; padding: 20px; border-left: 4px solid #DC2626; margin: 20px 0;">
            <p><strong>Concepto:</strong> ${concepto}</p>
            <p><strong>Monto:</strong> $${monto}</p>
            <p><strong>Vencimiento:</strong> ${new Date(fechaVencimiento).toLocaleDateString('es-AR')}</p>
        </div>
        <p>Por favor, acércate al estudio para realizar el pago o contactanos para coordinar.</p>
        <p>¡Gracias por tu compromiso con la danza!</p>
    `;

    const mailOptions = {
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER, // Enviar al admin
        subject: `[PARA: ${nombre}] Recordatorio de Pago - ${concepto}`,
        html: emailTemplate('Recordatorio de Pago', content)
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Recordatorio de pago enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando recordatorio de pago:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar confirmación de inscripción a curso
 */
const enviarConfirmacionInscripcion = async (email, nombre, nombreCurso, horario) => {
    const transporter = createTransporter();

    const content = `
        <div style="background: #fff3cd; padding: 10px; margin-bottom: 20px; border: 1px solid #ffeeba; color: #856404;">
            <strong>Nota para Admin:</strong> Este correo es para el alumno/a <strong>${nombre}</strong> (Email registrado: ${email})
        </div>
        <h2>¡Inscripción Confirmada! ✅</h2>
        <p>Hola ${nombre},</p>
        <p>¡Excelente noticia! Te has inscrito exitosamente al curso:</p>
        <div style="background: white; padding: 20px; border-left: 4px solid #10B981; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #DC2626;">${nombreCurso}</h3>
            <p><strong>Horario:</strong> ${horario}</p>
        </div>
        <p>Te esperamos en tu primera clase. ¡Prepárate para bailar!</p>
        <p>Recuerda traer:</p>
        <ul>
            <li>Ropa cómoda para danza</li>
            <li>Calzado adecuado</li>
            <li>Botella de agua</li>
            <li>Muchas ganas de aprender</li>
        </ul>
    `;

    const mailOptions = {
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER, // Enviar al admin
        subject: `[PARA: ${nombre}] Confirmación de Inscripción - ${nombreCurso}`,
        html: emailTemplate('Confirmación de Inscripción', content)
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Confirmación de inscripción enviada:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando confirmación:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar notificación de evento próximo
 */
const enviarNotificacionEvento = async (email, nombre, nombreEvento, fecha, lugar) => {
    const transporter = createTransporter();

    const content = `
        <div style="background: #fff3cd; padding: 10px; margin-bottom: 20px; border: 1px solid #ffeeba; color: #856404;">
            <strong>Nota para Admin:</strong> Este correo es para el alumno/a <strong>${nombre}</strong> (Email registrado: ${email})
        </div>
        <h2>¡Evento Próximo! 🎭</h2>
        <p>Hola ${nombre},</p>
        <p>Te recordamos que tienes un evento próximo:</p>
        <div style="background: white; padding: 20px; border-left: 4px solid #DC2626; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #DC2626;">${nombreEvento}</h3>
            <p><strong>📅 Fecha:</strong> ${new Date(fecha).toLocaleDateString('es-AR')}</p>
            ${lugar ? `<p><strong>📍 Lugar:</strong> ${lugar}</p>` : ''}
        </div>
        <p>¡No te lo pierdas! Estamos emocionados de verte brillar en el escenario.</p>
        <p>Si tienes alguna duda, contacta con nosotros.</p>
    `;

    const mailOptions = {
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER, // Enviar al admin
        subject: `[PARA: ${nombre}] Recordatorio: ${nombreEvento}`,
        html: emailTemplate('Evento Próximo', content)
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Notificación de evento enviada:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando notificación de evento:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Probar configuración de email
 */
const probarConfiguracion = async (emailDestino) => {
    const transporter = createTransporter();

    const content = `
        <h2>Test de Configuración ✅</h2>
        <p>Si estás leyendo este mensaje, la configuración de email funciona correctamente.</p>
        <p>El sistema está listo para enviar notificaciones automáticas.</p>
    `;

    const mailOptions = {
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: emailDestino,
        subject: 'Test de Configuración - Select Dance Studio',
        html: emailTemplate('Test', content)
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

/**
 * Enviar email personalizado
 */
const enviarEmailPersonalizado = async (email, nombre, asunto, mensaje) => {
    const transporter = createTransporter();

    const content = `
        <div style="background: #fff3cd; padding: 10px; margin-bottom: 20px; border: 1px solid #ffeeba; color: #856404;">
            <strong>Nota para Admin:</strong> Este correo es para el alumno/a <strong>${nombre}</strong> (Email registrado: ${email})
        </div>
        <h2>Hola ${nombre}, 👋</h2>
        <div style="white-space: pre-line;">
            ${mensaje}
        </div>
        <p>Saludos cordiales,</p>
        <p><strong>El equipo de Select Dance Studio</strong></p>
    `;

    const mailOptions = {
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER, // Enviar al admin
        subject: `[PARA: ${nombre}] ${asunto}`,
        html: emailTemplate(asunto, content)
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email personalizado enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando email personalizado:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Enviar email de recuperación de contraseña
 */
const enviarResetPassword = async (email, nombre, token) => {
    const transporter = createTransporter();

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    const content = `
        <h2>Recuperación de Contraseña 🔐</h2>
        <p>Hola${nombre ? ` ${nombre}` : ''},</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Select Dance Studio.</p>
        <p>Si realizaste esta solicitud, haz clic en el siguiente botón:</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" class="button" style="background: #DC2626; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Restablecer Contraseña
            </a>
        </div>
        <p style="color: #666; font-size: 14px;">O copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 5px; font-size: 12px;">
            ${resetLink}
        </p>
        <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107; color: #856404;">
            <strong>⚠️ Importante:</strong>
            <ul style="margin: 10px 0;">
                <li>Este enlace es válido por <strong>1 hora</strong></li>
                <li>Si no solicitaste este cambio, ignora este mensaje</li>
                <li>Tu contraseña actual seguirá funcionando normalmente</li>
            </ul>
        </div>
        <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de manera segura.</p>
    `;

    const mailOptions = {
        from: `"Select Dance Studio" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Recuperación de Contraseña - Select Dance Studio',
        html: emailTemplate('Recuperación de Contraseña', content)
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email de recuperación enviado:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando email de recuperación:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    enviarEmailBienvenida,
    enviarRecordatorioPago,
    enviarConfirmacionInscripcion,
    enviarNotificacionEvento,
    probarConfiguracion,
    enviarEmailPersonalizado,
    enviarResetPassword
};
