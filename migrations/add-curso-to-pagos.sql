-- =====================================================
-- Migration: Add curso_id and fecha_limite_sin_recargo to pagos
-- =====================================================

USE select_dance_db;

-- Add curso_id column (nullable, as not all payments are course-related)
ALTER TABLE pagos 
ADD COLUMN curso_id INT NULL AFTER alumno_id,
ADD FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL;

-- Add fecha_limite_sin_recargo column
ALTER TABLE pagos 
ADD COLUMN fecha_limite_sin_recargo DATE NULL AFTER fecha_vencimiento;

-- Add index for curso_id
ALTER TABLE pagos 
ADD INDEX idx_curso (curso_id);

-- Update existing records to set fecha_limite_sin_recargo 
-- (defaulting to 2 days before fecha_vencimiento)
UPDATE pagos 
SET fecha_limite_sin_recargo = DATE_SUB(fecha_vencimiento, INTERVAL 2 DAY)
WHERE fecha_limite_sin_recargo IS NULL;

SELECT 'Migration completed successfully' as Status;
