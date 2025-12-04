-- =====================================================
-- Select Dance Studio - Base de Datos
-- Script de creación completo
-- =====================================================

-- Crear base de datos
DROP DATABASE IF EXISTS select_dance_db;
CREATE DATABASE select_dance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE select_dance_db;

-- =====================================================
-- TABLA: usuarios
-- =====================================================
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'alumno') NOT NULL DEFAULT 'alumno',
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_rol (rol)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: alumnos
-- =====================================================
CREATE TABLE alumnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE,
  dni VARCHAR(20),
  telefono VARCHAR(20),
  email_padre VARCHAR(255),
  direccion TEXT,
  foto_perfil VARCHAR(255),
  monto_mensualidad DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario_id (usuario_id),
  INDEX idx_nombre_apellido (apellido, nombre)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: cursos
-- =====================================================
CREATE TABLE cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  profesor VARCHAR(100),
  dia_semana ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo') NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  cupo_maximo INT DEFAULT 20,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dia_hora (dia_semana, hora_inicio)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: inscripciones_curso
-- =====================================================
CREATE TABLE inscripciones_curso (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_id INT NOT NULL,
  curso_id INT NOT NULL,
  fecha_inscripcion DATE NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_inscripcion (alumno_id, curso_id, activo),
  INDEX idx_alumno (alumno_id),
  INDEX idx_curso (curso_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: asistencias
-- =====================================================
CREATE TABLE asistencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_id INT NOT NULL,
  curso_id INT NOT NULL,
  fecha DATE NOT NULL,
  presente TINYINT(1) NOT NULL DEFAULT 0,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_asistencia (alumno_id, curso_id, fecha),
  INDEX idx_fecha (fecha),
  INDEX idx_alumno_fecha (alumno_id, fecha)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: pagos
-- =====================================================
CREATE TABLE pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_id INT NOT NULL,
  concepto VARCHAR(255) NOT NULL,
  monto DECIMAL(10, 2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  fecha_pago DATE,
  estado ENUM('pendiente', 'pagado', 'parcial') DEFAULT 'pendiente',
  metodo_pago VARCHAR(50),
  comprobante_url VARCHAR(255),
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  INDEX idx_alumno (alumno_id),
  INDEX idx_estado (estado),
  INDEX idx_fecha_vencimiento (fecha_vencimiento)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: eventos
-- =====================================================
CREATE TABLE eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  lugar VARCHAR(255),
  costo_inscripcion DECIMAL(10, 2) DEFAULT 0,
  vestuario_requerido TEXT,
  peinado_instrucciones TEXT,
  maquillaje_instrucciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_fecha (fecha)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: inscripciones_evento
-- =====================================================
CREATE TABLE inscripciones_evento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_id INT NOT NULL,
  evento_id INT NOT NULL,
  fecha_inscripcion DATE NOT NULL,
  pago_realizado TINYINT(1) DEFAULT 0,
  checklist_vestuario TINYINT(1) DEFAULT 0,
  checklist_peinado TINYINT(1) DEFAULT 0,
  checklist_maquillaje TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  UNIQUE KEY unique_inscripcion_evento (alumno_id, evento_id),
  INDEX idx_alumno (alumno_id),
  INDEX idx_evento (evento_id)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: uniformes
-- =====================================================
CREATE TABLE uniformes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  alumno_id INT NOT NULL,
  tipo ENUM('remera', 'pantalon', 'conjunto', 'zapatillas', 'otro') NOT NULL,
  talle VARCHAR(10),
  estado ENUM('pendiente', 'entregado') DEFAULT 'pendiente',
  fecha_entrega DATE,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  INDEX idx_alumno (alumno_id),
  INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- =====================================================
-- TABLA: notificaciones
-- =====================================================
CREATE TABLE notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  tipo ENUM('general', 'pago', 'evento', 'asistencia') DEFAULT 'general',
  destinatario_id INT NULL COMMENT 'NULL para enviar a todos',
  leida TINYINT(1) DEFAULT 0,
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (destinatario_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  INDEX idx_destinatario (destinatario_id),
  INDEX idx_fecha (fecha_envio)
) ENGINE=InnoDB;

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================

-- Usuario Admin
-- Password: admin123
INSERT INTO usuarios (email, password_hash, rol, activo) VALUES


-- Usuarios Alumnos
-- Password para todos: alumno123
INSERT INTO usuarios (email, password_hash, rol, activo) VALUES


-- Datos de Alumnos
INSERT INTO alumnos (usuario_id, nombre, apellido, fecha_nacimiento, dni, telefono, email_padre, direccion) VALUES

-- Cursos
INSERT INTO cursos (nombre, descripcion, profesor, dia_semana, hora_inicio, hora_fin, cupo_maximo, activo) VALUES

-- Inscripciones a cursos
INSERT INTO inscripciones_curso (alumno_id, curso_id, fecha_inscripcion, activo) VALUES

-- Asistencias (últimas 4 semanas)
INSERT INTO asistencias (alumno_id, curso_id, fecha, presente, observaciones) VALUES


-- Pagos
INSERT INTO pagos (alumno_id, concepto, monto, fecha_vencimiento, fecha_pago, estado, metodo_pago, observaciones) VALUES


-- Eventos
INSERT INTO eventos (nombre, descripcion, fecha, lugar, costo_inscripcion, vestuario_requerido, peinado_instrucciones, maquillaje_instrucciones) VALUES

-- Inscripciones a eventos
INSERT INTO inscripciones_evento (alumno_id, evento_id, fecha_inscripcion, pago_realizado, checklist_vestuario, checklist_peinado, checklist_maquillaje) VALUES

-- Uniformes
INSERT INTO uniformes (alumno_id, tipo, talle, estado, fecha_entrega, observaciones) VALUES

-- Notificaciones
INSERT INTO notificaciones (titulo, mensaje, tipo, destinatario_id, leida) VALUES


-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Verificación de datos insertados
SELECT 'Usuarios creados:' as Info, COUNT(*) as Total FROM usuarios;
SELECT 'Alumnos creados:' as Info, COUNT(*) as Total FROM alumnos;
SELECT 'Cursos creados:' as Info, COUNT(*) as Total FROM cursos;
SELECT 'Inscripciones a cursos:' as Info, COUNT(*) as Total FROM inscripciones_curso;
SELECT 'Asistencias registradas:' as Info, COUNT(*) as Total FROM asistencias;
SELECT 'Pagos registrados:' as Info, COUNT(*) as Total FROM pagos;
SELECT 'Eventos creados:' as Info, COUNT(*) as Total FROM eventos;
SELECT 'Inscripciones a eventos:' as Info, COUNT(*) as Total FROM inscripciones_evento;
SELECT 'Uniformes registrados:' as Info, COUNT(*) as Total FROM uniformes;
SELECT 'Notificaciones creadas:' as Info, COUNT(*) as Total FROM notificaciones;
