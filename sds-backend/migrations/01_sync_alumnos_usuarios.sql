-- Agregar campos expandidos a usuarios (para abarcar equipo y alumnos en un solo lugar central)
ALTER TABLE usuarios
ADD COLUMN telefono VARCHAR(20) NULL,
ADD COLUMN foto_perfil VARCHAR(255) NULL,
ADD COLUMN rol_display VARCHAR(100) NULL COMMENT 'Título para mostrar en página de equipo',
ADD COLUMN orden INT DEFAULT 0 COMMENT 'Orden jerárquico para página de equipo';

-- Sincronizar datos de alumnos hacia usuarios
UPDATE usuarios u
INNER JOIN alumnos a ON u.id = a.usuario_id
SET 
    u.nombre = a.nombre,
    u.apellido = a.apellido,
    u.telefono = a.telefono,
    u.foto_perfil = a.foto_perfil;

-- Ya respaldados en usuarios, borramos la redundancia en la tabla alumnos
ALTER TABLE alumnos
DROP COLUMN nombre,
DROP COLUMN apellido,
DROP COLUMN telefono,
DROP COLUMN foto_perfil;
