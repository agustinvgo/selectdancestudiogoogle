-- ====================================================================
-- SCRIPT DE OPTIMIZACIÓN: 04_add_performance_indexes.sql
-- Propósito: Añadir Índices (Indexes) a las tablas más consultadas
-- para erradicar los "Full Table Scans" y acelerar las Queries.
-- ====================================================================

-- 1. TABLA PAGOS
-- Indexar por fecha de pago y vencimiento (Crítico para el Dashboard y Reportes)
CREATE INDEX idx_pagos_fecha_pago ON pagos(fecha_pago);
CREATE INDEX idx_pagos_fecha_vencimiento ON pagos(fecha_vencimiento);
-- Indexar por alumno_id (Para el historial del alumno)
CREATE INDEX idx_pagos_alumno_id ON pagos(alumno_id);
-- Múltiple: alumno_id + estado (Para deudores rápidos)
CREATE INDEX idx_pagos_alumno_estado ON pagos(alumno_id, estado);

-- 2. TABLA GASTOS
-- Indexar por fecha (Crítico para Balance Financiero)
CREATE INDEX idx_gastos_fecha ON gastos(fecha);
-- Indexar por categoría (Filtro común)
CREATE INDEX idx_gastos_categoria ON gastos(categoria);

-- 3. TABLA ASISTENCIAS
-- Indexar por fecha (Para gráficos de asistencia)
CREATE INDEX idx_asistencias_fecha ON asistencias(fecha);
-- Multi-índice: curso + fecha (Buscar asistencia de un curso en un día)
CREATE INDEX idx_asistencias_curso_fecha ON asistencias(curso_id, fecha);

-- 4. TABLA USUARIOS
-- Búsquedas textuales de Admin (LIKE %nombre%)
-- Nota: Para MySQL, un index normal ayuda con prefijos pero no '%like%' exacto,
-- sin embargo agiliza ORDER BY y JOINs enormemente.
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_usuarios_nombre_apellido ON usuarios(nombre, apellido);

-- 5. TABLA EVENTOS_INSCRIPCIONES
CREATE INDEX idx_ev_inscripciones_evento ON eventos_inscripciones(evento_id);

SELECT 'Índices de Rendimiento agregados correctamente' AS 'Resultado';
