ALTER TABLE notificaciones
ADD COLUMN batch_id VARCHAR(36) NULL AFTER id;

CREATE INDEX idx_notificaciones_batch_id ON notificaciones(batch_id);
