-- Optimización de Índices para Select Dance Studio

-- 1. Tabla de Pagos (Muy consultada por estado, fecha y alumno)
-- Permitir búsquedas rápidas de pagos de un alumno específico
CREATE INDEX idx_pagos_alumno ON pagos(alumno_id);
-- Permitir filtrado rápido por estado (pendiente/pagado)
CREATE INDEX idx_pagos_estado ON pagos(estado);
-- Permitir reportes por fecha de vencimiento y pago
CREATE INDEX idx_pagos_fecha_venc ON pagos(fecha_vencimiento);
CREATE INDEX idx_pagos_fecha_pago ON pagos(fecha_pago);

-- 2. Tabla de Asistencias (Consultada por fecha y curso)
CREATE INDEX idx_asistencias_alumno ON asistencias(alumno_id);
CREATE INDEX idx_asistencias_curso ON asistencias(curso_id);
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha);

-- 3. Tabla de Alumnos (Búsquedas por nombre, email o usuario)
CREATE INDEX idx_alumnos_usuario ON alumnos(usuario_id);
CREATE INDEX idx_alumnos_estado ON alumnos(estado);

-- 4. Tabla de Usuarios (Login rápido)
-- Email suele ser unique, por lo que ya tiene índice.
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- 5. Tabla de Cursos
CREATE INDEX idx_cursos_estado ON cursos(estado);
