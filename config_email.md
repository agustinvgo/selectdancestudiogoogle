# 📧 Configuración de Email - Select Dance Studio

Para habilitar el envío de emails automáticos, necesitas configurar las variables SMTP en tu archivo `.env` del backend.

## Opción 1: Gmail (Recomendado para desarrollo)

1. **Crear contraseña de aplicación:**
   - Ve a tu cuenta de Google
   - Seguridad → Verificación en 2 pasos (actívala si no está)  
   - Contraseñas de aplicaciones
   - Genera una contraseña para "Correo"
   - Copia la contraseña de 16 caracteres

2. **Configurar `.env`:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
```

## Opción 2: Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu_email@outlook.com
SMTP_PASS=tu_contraseña
```

## Opción 3: Otros proveedores

- **SendGrid, Mailgun, Amazon SES**: Consultar documentación del proveedor

## Probar la Configuración

Una vez configurado, puedes probar enviando una solicitud POST:

```bash
POST http://localhost:5000/api/emails/test
Content-Type: application/json

{
  "email": "tu_email_destino@ejemplo.com"
}
```

Si todo funciona correctamente, recibirás un email de prueba.

---

**Nota:** Sin configurar SMTP, la aplicación funcionará normalmente pero no enviará emails. Los logs mostrarán errores de email que puedes ignorar.
