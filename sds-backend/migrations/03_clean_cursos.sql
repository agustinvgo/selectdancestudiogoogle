-- Eliminar campos legacy de texto libre en cursos
ALTER TABLE cursos
DROP COLUMN profesor;
