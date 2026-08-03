ALTER TABLE eventos
    ADD COLUMN IF NOT EXISTS modalidad_pago VARCHAR(20) NOT NULL DEFAULT 'unico' AFTER costo_inscripcion,
    ADD COLUMN IF NOT EXISTS cantidad_cuotas INT NOT NULL DEFAULT 1 AFTER modalidad_pago,
    ADD COLUMN IF NOT EXISTS fecha_primera_cuota DATE NULL AFTER cantidad_cuotas;
