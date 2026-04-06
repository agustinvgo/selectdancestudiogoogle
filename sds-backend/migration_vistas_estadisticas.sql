-- Vistas para optimizar las consultas financieras del Dashboard

-- 1. Tabla virtual de todos los meses y años donde hubo movimiento
CREATE OR REPLACE VIEW vw_meses_actividad AS
SELECT DISTINCT MONTH(fecha_pago) as mes, YEAR(fecha_pago) as anio FROM pagos WHERE estado = 'pagado'
UNION SELECT DISTINCT MONTH(created_at) as mes, YEAR(created_at) as anio FROM ventas
UNION SELECT DISTINCT MONTH(fecha) as mes, YEAR(fecha) as anio FROM gastos;

-- 2. Vista Consolidada del Balance Financiero
CREATE OR REPLACE VIEW vw_balance_financiero AS
SELECT 
    m.mes,
    m.anio,
    COALESCE((SELECT SUM(monto) FROM pagos WHERE estado = 'pagado' AND MONTH(fecha_pago) = m.mes AND YEAR(fecha_pago) = m.anio), 0) as ingresos_pagos,
    COALESCE((SELECT SUM(total) FROM ventas WHERE MONTH(created_at) = m.mes AND YEAR(created_at) = m.anio), 0) as ingresos_tienda,
    COALESCE((SELECT SUM(monto) FROM gastos WHERE MONTH(fecha) = m.mes AND YEAR(fecha) = m.anio), 0) as total_gastos,
    (
        COALESCE((SELECT SUM(monto) FROM pagos WHERE estado = 'pagado' AND MONTH(fecha_pago) = m.mes AND YEAR(fecha_pago) = m.anio), 0) +
        COALESCE((SELECT SUM(total) FROM ventas WHERE MONTH(created_at) = m.mes AND YEAR(created_at) = m.anio), 0) -
        COALESCE((SELECT SUM(monto) FROM gastos WHERE MONTH(fecha) = m.mes AND YEAR(fecha) = m.anio), 0)
    ) as balance_neto
FROM vw_meses_actividad m;

-- 3. Vista de Retención de Alumnos
CREATE OR REPLACE VIEW vw_retencion_alumnos AS
SELECT 
    COUNT(*) as total_alumnos,
    SUM(CASE WHEN u.activo = 1 THEN 1 ELSE 0 END) as alumnos_activos,
    SUM(CASE WHEN u.activo = 0 THEN 1 ELSE 0 END) as alumnos_inactivos,
    ROUND((SUM(CASE WHEN u.activo = 1 THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as tasa_retencion
FROM alumnos a
JOIN usuarios u ON a.usuario_id = u.id;
