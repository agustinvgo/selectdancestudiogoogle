-- Crear tabla para gestionar tokens de recuperación de contraseña
CREATE TABLE IF NOT EXISTS password_resets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_token (token),
  INDEX idx_email (email),
  INDEX idx_expires (expires_at)
);

-- Agregar columnas para 2FA y tracking de sesión a tabla usuarios
ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_backup_codes JSON DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_activity DATETIME DEFAULT NULL;

-- Crear índice para mejorar performance en consultas de actividad
CREATE INDEX IF NOT EXISTS idx_last_activity ON usuarios(last_activity);
