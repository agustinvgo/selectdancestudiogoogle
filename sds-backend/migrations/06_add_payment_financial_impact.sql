-- Clasifica movimientos de pago según su efecto en ingresos y deuda.
-- Los registros existentes conservan el comportamiento anterior.
ALTER TABLE pagos
    ADD COLUMN IF NOT EXISTS impacto_financiero VARCHAR(20) NOT NULL DEFAULT 'ingreso' AFTER codigo_unico,
    ADD COLUMN IF NOT EXISTS categoria_movimiento VARCHAR(50) NULL AFTER impacto_financiero;
