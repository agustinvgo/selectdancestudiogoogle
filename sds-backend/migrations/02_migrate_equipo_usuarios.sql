-- Insertar staff de la tabla `equipo` a la tabla principal `usuarios`.
-- La tabla equipo real NO tiene email, apellido ni telefono. Usamos fallbacks vacíos.
INSERT IGNORE INTO usuarios (nombre, apellido, email, password_hash, rol, telefono, foto_perfil, orden, rol_display, activo, created_at, updated_at)
SELECT 
    nombre, 
    '', 
    CONCAT('staff_', id, '@selectdance.com'), 
    '$2b$10$X7.X.X.X.X.X.X.X.X.X.X', -- Password dummy 'admin123'
    'profesor', 
    '', 
    foto_url, 
    orden, 
    cargo, 
    activo, 
    created_at, 
    updated_at
FROM equipo;

-- Eliminar la tabla redudante equipo
DROP TABLE equipo;
