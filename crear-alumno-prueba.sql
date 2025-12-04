-- 1. Verificar usuarios existentes
SELECT 
    u.id,
    u.email,
    u.rol,
    u.password_hash,
    a.id as alumno_id,
    a.nombre,
    a.apellido
FROM usuarios u
LEFT JOIN alumnos a ON u.id = a.usuario_id
ORDER BY u.rol, u.email;

-- 2. Si necesitas crear un usuario alumno de prueba, descomentar y ejecutar:
/*
-- Primero insertar el usuario
INSERT INTO usuarios (email, password_hash, rol, activo, fecha_registro) 
VALUES ('alumno1@sds.com', 'alumno123', 'alumno', 1, NOW());

-- Obtener el ID del usuario recién creado y crear el alumno
INSERT INTO alumnos (usuario_id, nombre, apellido, fecha_nacimiento, dni, telefono, email_padre, direccion, activo) 
VALUES (
    LAST_INSERT_ID(),
    'Juan',
    'Pérez',
    '2010-05-15',
    '12345678',
    '1234567890',
    'padre.juan@sds.com',
    'Calle Principal 123',
    1
);
*/

-- 3. Verificar cursos disponibles
SELECT * FROM cursos;

-- 4. Si no hay cursos, crear algunos de ejemplo:
/*
INSERT INTO cursos (nombre, descripcion, nivel, horario_dia, horario_hora, duracion_minutos, cupo_maximo, activo) 
VALUES 
    ('Ballet Clásico', 'Clase de ballet para principiantes', 'Principiante', 'Lunes', '18:00:00', 90, 15, 1),
    ('Jazz Intermedio', 'Técnica de jazz para nivel intermedio', 'Intermedio', 'Miércoles', '19:00:00', 60, 12, 1),
    ('Hip Hop', 'Clase dinámica de hip hop', 'Principiante', 'Viernes', '17:00:00', 60, 20, 1);
*/
