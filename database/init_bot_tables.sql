-- Tablas del Sistema Bot (WhatsApp)
CREATE TABLE IF NOT EXISTS bot_config (
  clave VARCHAR(100) PRIMARY KEY,
  valor TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bot_knowledge (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tema VARCHAR(255) NOT NULL,
  contenido TEXT NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Prompt de sistema por defecto para el Bot
INSERT IGNORE INTO bot_config (clave, valor) VALUES 
('system_prompt', 'Eres el asistente virtual de Select Dance Studio. Tu rol es ayudar a alumnos y padres con sus consultas de manera cordial, profesional y clara.');
