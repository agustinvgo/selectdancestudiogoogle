USE select_dance_db;

ALTER TABLE clases_prueba_disponibles
MODIFY COLUMN curso_id INT NULL;

ALTER TABLE clases_prueba_disponibles
ADD COLUMN titulo VARCHAR(255) NULL AFTER curso_id;
