-- =============================================================
-- ÍNDICES DE RENDIMIENTO - Select Dance Studio
-- Compatible con MySQL 5.7+ y MariaDB
-- Ejecutar en PHPMyAdmin o vía mysql CLI
-- =============================================================

-- Pagos
CREATE INDEX idx_pagos_alumno_estado ON pagos(alumno_id, estado);
CREATE INDEX idx_pagos_fecha_vencimiento ON pagos(fecha_vencimiento);
CREATE INDEX idx_pagos_mes_anio ON pagos(mes, anio);

-- Asistencias
CREATE INDEX idx_asistencias_alumno ON asistencias(alumno_id);
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha);
CREATE INDEX idx_asistencias_curso_fecha ON asistencias(curso_id, fecha);

-- Inscripciones
CREATE INDEX idx_inscripciones_curso_activo ON inscripciones_curso(curso_id, activo);
CREATE INDEX idx_inscripciones_alumno ON inscripciones_curso(alumno_id);

-- Alumnos
CREATE INDEX idx_alumnos_telefono ON alumnos(telefono);
CREATE INDEX idx_alumnos_usuario ON alumnos(usuario_id);

-- Conversaciones
CREATE INDEX idx_conversaciones_telefono ON conversaciones(telefono);

-- Gastos
CREATE INDEX idx_gastos_fecha ON gastos(fecha);
