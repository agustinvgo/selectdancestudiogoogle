CREATE TABLE IF NOT EXISTS agenda_confirmaciones (
    alumno_id INT NOT NULL,
    curso_id INT NOT NULL,
    fecha DATE NOT NULL,
    estado ENUM('confirmado', 'no_asistira') NOT NULL,
    observaciones VARCHAR(500) DEFAULT NULL,
    updated_by INT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (alumno_id, curso_id, fecha),
    KEY idx_agenda_confirmaciones_fecha (fecha),
    KEY idx_agenda_confirmaciones_curso_fecha (curso_id, fecha),
    CONSTRAINT fk_agenda_confirmaciones_alumno
        FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    CONSTRAINT fk_agenda_confirmaciones_curso
        FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    CONSTRAINT fk_agenda_confirmaciones_usuario
        FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
