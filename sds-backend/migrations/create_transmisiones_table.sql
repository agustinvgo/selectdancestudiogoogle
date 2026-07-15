-- Tabla de transmisiones en vivo por curso
-- Guarda el override manual del admin y la clave de stream (path en MediaMTX).
-- El estado "en vivo" real se calcula combinando: override manual OR ventana horaria del curso,
-- confirmado con la API de MediaMTX (que haya video publicándose).

CREATE TABLE IF NOT EXISTS transmisiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT NOT NULL,
    stream_key VARCHAR(150) NOT NULL,
    manual_activo TINYINT(1) NOT NULL DEFAULT 0,
    inicio_at DATETIME NULL,
    fin_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_trans_curso (curso_id),
    CONSTRAINT fk_trans_curso FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
