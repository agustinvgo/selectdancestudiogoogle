-- Migration para tabla de conversaciones del chatbot WhatsApp
-- Fecha: 2026-02-09

CREATE TABLE IF NOT EXISTS conversaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    telefono VARCHAR(20) NOT NULL UNIQUE,
    alumno_id INT NULL,
    mensajes JSON NOT NULL DEFAULT '[]',
    requiere_atencion_humana BOOLEAN DEFAULT FALSE,
    metadata JSON NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE SET NULL,
    INDEX idx_telefono (telefono),
    INDEX idx_alumno (alumno_id),
    INDEX idx_requiere_atencion (requiere_atencion_humana)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
