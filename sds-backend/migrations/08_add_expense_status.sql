-- Permite distinguir compromisos pendientes de egresos efectivamente pagados.
-- Los gastos históricos se consideran pagados para conservar los balances anteriores.
SET @estado_gasto_existe = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'gastos'
      AND COLUMN_NAME = 'estado'
);
SET @agregar_estado_gasto = IF(
    @estado_gasto_existe = 0,
    "ALTER TABLE gastos ADD COLUMN estado ENUM('pendiente', 'pagado') NOT NULL DEFAULT 'pagado' AFTER fecha",
    'SELECT 1'
);
PREPARE agregar_estado_gasto_stmt FROM @agregar_estado_gasto;
EXECUTE agregar_estado_gasto_stmt;
DEALLOCATE PREPARE agregar_estado_gasto_stmt;

DROP VIEW IF EXISTS vw_balance_financiero;
CREATE VIEW vw_balance_financiero AS
SELECT
    m.mes,
    m.anio,
    COALESCE(p.ingresos_pagos, 0) AS ingresos_pagos,
    0 AS ingresos_tienda,
    COALESCE(g.total_gastos, 0) AS total_gastos,
    COALESCE(p.ingresos_pagos, 0) - COALESCE(g.total_gastos, 0) AS balance_neto
FROM (
    SELECT DISTINCT MONTH(fecha_pago) AS mes, YEAR(fecha_pago) AS anio
    FROM pagos
    WHERE estado = 'pagado'
    UNION
    SELECT DISTINCT MONTH(fecha) AS mes, YEAR(fecha) AS anio
    FROM gastos
    WHERE estado = 'pagado'
) m
LEFT JOIN (
    SELECT MONTH(fecha_pago) AS mes, YEAR(fecha_pago) AS anio, SUM(monto) AS ingresos_pagos
    FROM pagos
    WHERE estado = 'pagado'
      AND COALESCE(impacto_financiero, 'ingreso') = 'ingreso'
    GROUP BY YEAR(fecha_pago), MONTH(fecha_pago)
) p ON m.mes = p.mes AND m.anio = p.anio
LEFT JOIN (
    SELECT MONTH(fecha) AS mes, YEAR(fecha) AS anio, SUM(monto) AS total_gastos
    FROM gastos
    WHERE estado = 'pagado'
    GROUP BY YEAR(fecha), MONTH(fecha)
) g ON m.mes = g.mes AND m.anio = g.anio;
