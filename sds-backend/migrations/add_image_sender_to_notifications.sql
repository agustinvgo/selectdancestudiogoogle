ALTER TABLE notificaciones
ADD COLUMN imagen_url VARCHAR(255) NULL AFTER mensaje,
ADD COLUMN remitente VARCHAR(100) DEFAULT 'Select Dance Studio' AFTER usuario_id;
