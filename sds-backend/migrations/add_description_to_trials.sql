USE select_dance_db;

-- Check if column exists, if not add it. 
-- Since MySQL doesn't have IF NOT EXISTS for columns in ALTER TABLE easily in all versions without a procedure,
-- we'll just try to add it. If it fails, it might already exist.
-- Ideally we would use a procedure but keeping it simple for this environment.

ALTER TABLE clases_prueba_disponibles
ADD COLUMN descripcion TEXT NULL AFTER cupos;
