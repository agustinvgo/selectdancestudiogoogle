# Nota para el Usuario: Migración de Base de Datos Pendiente  

Para completar la implementación del sistema de recuperación de contraseña, es necesario ejecutar el script de migración de la base de datos.

## Script de Migración

El archivo `c:\xampp\htdocs\selectdancestudiogoogle\sds-backend\migrations\add_security_features.sql` contiene:

1. Creación de tabla `password_resets` para tokens de recuperación
2. Campos en tabla `usuarios` para 2FA y tracking de sesión

## Cómo ejecutar la migración

**Opción 1: Desde phpMyAdmin**
1. Abre http://localhost/phpmyadmin
2. Selecciona la base de datos de SDS (posiblemente `sds` o `select_dance_studio`)
3. Ve a la pestaña "SQL"
4. Copia y pega el contenido del archivo `add_security_features.sql`
5. Click en "Continuar"

**Opción 2: Desde línea de comandos (si MySQL está en PATH)**
```bash
mysql -u root -p nombre_base_datos < c:\xampp\htdocs\selectdancestudiogoogle\sds-backend\migrations\add_security_features.sql
```

## Verificación

Después de ejecutar la migración, deberías ver:
-  Una nueva tabla `password_resets`
- Nuevas columnas en `usuarios`: `two_factor_secret`, `two_factor_enabled`, `two_factor_backup_codes`, `last_activity`

## Qué ya está funcionando SIN la migración

- Todo el código está implementado
- Las páginas de recuperación de contraseña funcionan
- Los endpoints del backend están listos

## Qué necesita la migración para funcionar

- La creación de tokens de reset
- El almacenamiento de tokens en la base de datos

**NOTA:** Si tienes problemas ejecutando la migración, avísame y te ayudaré a resolverlos.
