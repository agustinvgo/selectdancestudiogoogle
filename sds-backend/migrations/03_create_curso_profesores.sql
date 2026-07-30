CREATE TABLE IF NOT EXISTS curso_profesores (
    curso_id INT NOT NULL,
    profesor_id INT NOT NULL,
    orden INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (curso_id, profesor_id),
    KEY idx_curso_profesores_profesor (profesor_id),
    CONSTRAINT fk_curso_profesores_curso
        FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    CONSTRAINT fk_curso_profesores_profesor
        FOREIGN KEY (profesor_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO curso_profesores (curso_id, profesor_id, orden)
SELECT id, profesor_id, 0
FROM cursos
WHERE profesor_id IS NOT NULL;
