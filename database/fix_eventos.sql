ALTER TABLE eventos
ADD COLUMN ubicacion VARCHAR(255) AFTER lugar,
ADD COLUMN tipo ENUM('Presentación', 'Competencia', 'Clase Especial', 'Otro') DEFAULT 'Presentación' AFTER ubicacion,
ADD COLUMN cupo_maximo INT AFTER tipo,
ADD COLUMN costo_vestuario DECIMAL(10, 2) DEFAULT 0 AFTER maquillaje_instrucciones,
ADD COLUMN costo_maquillaje DECIMAL(10, 2) DEFAULT 0 AFTER costo_vestuario,
ADD COLUMN costo_peinado DECIMAL(10, 2) DEFAULT 0 AFTER costo_maquillaje,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at;
