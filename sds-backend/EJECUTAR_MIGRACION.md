# Ejecutar Migración de Base de Datos

## Opción 1: Usando phpMyAdmin
1. Abre phpMyAdmin en tu navegador: http://localhost/phpmyadmin
2. Selecciona la base de datos `sds_db`
3. Ve a la pestaña "SQL"
4. Copia y pega el contenido del archivo `migrations/001_add_payment_fields.sql`
5. Haz clic en "Continuar" para ejecutar

## Opción 2: Usando MySQL Workbench
1. Abre MySQL Workbench
2. Conecta a tu servidor local
3. Selecciona `sds_db`
4. Abre el archivo `migrations/001_add_payment_fields.sql`
5. Ejecuta el script

## Opción 3: Desde la línea de comandos de XAMPP
```bash
c:\xampp\mysql\bin\mysql -u root sds_db < migrations/001_add_payment_fields.sql
```

## Verificar que se aplicó correctamente
Ejecuta esta consulta SQL para verificar:
```sql
DESCRIBE pagos;
```

Deberías ver las nuevas columnas:
- `metodo_pago_realizado`
- `recargo_aplicado`
- `descuento_aplicado`
- `monto_original`
- `comprobante_numero`
- `plan_cuotas`
- `cuota_numero`
- `plan_pago_id`
- `referencia_externa`
- `tipo_descuento`
- `notas_pago`
