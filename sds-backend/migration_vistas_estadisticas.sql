-- Vistas para optimizar las consultas financieras del Dashboard

-- 1. Normaliza los ingresos de tienda. Algunas instalaciones antiguas no
-- tienen el módulo de ventas, por lo que se crea una vista vacía compatible.
SET @ventas_existe = (
    SELECT COUNT(*)
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ventas'
);
SET @sql_ingresos_tienda = IF(
    @ventas_existe > 0,
    'CREATE OR REPLACE VIEW vw_ingresos_tienda AS SELECT MONTH(created_at) AS mes, YEAR(created_at) AS anio, SUM(total) AS total FROM ventas GROUP BY MONTH(created_at), YEAR(created_at)',
    'CREATE OR REPLACE VIEW vw_ingresos_tienda AS SELECT CAST(NULL AS UNSIGNED) AS mes, CAST(NULL AS UNSIGNED) AS anio, CAST(0 AS DECIMAL(10,2)) AS total WHERE 1 = 0'
);
PREPARE stmt_ingresos_tienda FROM @sql_ingresos_tienda;
EXECUTE stmt_ingresos_tienda;
DEALLOCATE PREPARE stmt_ingresos_tienda;

-- 2. Tabla virtual de todos los meses y años donde hubo movimiento
CREATE OR REPLACE VIEW vw_meses_actividad AS
SELECT DISTINCT MONTH(fecha_pago) as mes, YEAR(fecha_pago) as anio FROM pagos
WHERE estado = 'pagado' AND COALESCE(impacto_financiero, 'ingreso') = 'ingreso'
UNION SELECT mes, anio FROM vw_ingresos_tienda
UNION SELECT DISTINCT MONTH(fecha) as mes, YEAR(fecha) as anio FROM gastos;

-- 3. Vista Consolidada del Balance Financiero
CREATE OR REPLACE VIEW vw_balance_financiero AS
SELECT 
    m.mes,
    m.anio,
    COALESCE((SELECT SUM(monto) FROM pagos WHERE estado = 'pagado' AND COALESCE(impacto_financiero, 'ingreso') = 'ingreso' AND MONTH(fecha_pago) = m.mes AND YEAR(fecha_pago) = m.anio), 0) as ingresos_pagos,
    COALESCE((SELECT total FROM vw_ingresos_tienda WHERE mes = m.mes AND anio = m.anio), 0) as ingresos_tienda,
    COALESCE((SELECT SUM(monto) FROM gastos WHERE MONTH(fecha) = m.mes AND YEAR(fecha) = m.anio), 0) as total_gastos,
    (
        COALESCE((SELECT SUM(monto) FROM pagos WHERE estado = 'pagado' AND COALESCE(impacto_financiero, 'ingreso') = 'ingreso' AND MONTH(fecha_pago) = m.mes AND YEAR(fecha_pago) = m.anio), 0) +
        COALESCE((SELECT total FROM vw_ingresos_tienda WHERE mes = m.mes AND anio = m.anio), 0) -
        COALESCE((SELECT SUM(monto) FROM gastos WHERE MONTH(fecha) = m.mes AND YEAR(fecha) = m.anio), 0)
    ) as balance_neto
FROM vw_meses_actividad m;

-- 4. Vista de Retención de Alumnos
CREATE OR REPLACE VIEW vw_retencion_alumnos AS
SELECT 
    COUNT(*) as total_alumnos,
    SUM(CASE WHEN u.activo = 1 THEN 1 ELSE 0 END) as alumnos_activos,
    SUM(CASE WHEN u.activo = 0 THEN 1 ELSE 0 END) as alumnos_inactivos,
    ROUND((SUM(CASE WHEN u.activo = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as tasa_retencion
FROM alumnos a
JOIN usuarios u ON a.usuario_id = u.id;
