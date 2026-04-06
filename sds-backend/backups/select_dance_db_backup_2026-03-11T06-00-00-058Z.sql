-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: select_dance_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `select_dance_db`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `select_dance_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `select_dance_db`;

--
-- Table structure for table `alumnos`
--

DROP TABLE IF EXISTS `alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumnos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `dni` varchar(20) DEFAULT NULL,
  `nombre_padre` varchar(255) DEFAULT NULL,
  `email_padre` varchar(255) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_usuario_id` (`usuario_id`),
  CONSTRAINT `alumnos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumnos`
--

LOCK TABLES `alumnos` WRITE;
/*!40000 ALTER TABLE `alumnos` DISABLE KEYS */;
INSERT INTO `alumnos` VALUES (2,4,'2000-01-01','12345678',NULL,'testalumno@example.com',NULL,'2026-03-10 21:05:02','2026-03-10 21:05:02'),(7,9,'2000-01-01','99992',NULL,NULL,NULL,'2026-03-10 22:04:37','2026-03-10 22:04:37'),(8,10,'2000-01-01','997142',NULL,NULL,NULL,'2026-03-10 23:19:57','2026-03-10 23:19:57'),(9,11,'2000-01-01','994677',NULL,NULL,NULL,'2026-03-10 23:20:34','2026-03-10 23:20:34'),(10,12,'2000-01-01','991710',NULL,NULL,NULL,'2026-03-10 23:24:31','2026-03-10 23:24:31'),(12,16,'2010-01-01','11111111','Padre Test','browser@test.com','Test St 123','2026-03-11 00:50:43','2026-03-11 00:50:43');
/*!40000 ALTER TABLE `alumnos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencias`
--

DROP TABLE IF EXISTS `asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asistencias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alumno_id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `presente` tinyint(1) NOT NULL DEFAULT 0,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_asistencia` (`alumno_id`,`curso_id`,`fecha`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_alumno_fecha` (`alumno_id`,`fecha`),
  KEY `idx_asistencias_curso` (`curso_id`),
  KEY `idx_asistencias_fecha` (`fecha`),
  CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asistencias_ibfk_2` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias`
--

LOCK TABLES `asistencias` WRITE;
/*!40000 ALTER TABLE `asistencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `asistencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bot_config`
--

DROP TABLE IF EXISTS `bot_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bot_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clave` varchar(50) NOT NULL,
  `valor` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bot_config`
--

LOCK TABLES `bot_config` WRITE;
/*!40000 ALTER TABLE `bot_config` DISABLE KEYS */;
/*!40000 ALTER TABLE `bot_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bot_knowledge`
--

DROP TABLE IF EXISTS `bot_knowledge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bot_knowledge` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tema` varchar(100) NOT NULL,
  `contenido` text NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bot_knowledge`
--

LOCK TABLES `bot_knowledge` WRITE;
/*!40000 ALTER TABLE `bot_knowledge` DISABLE KEYS */;
/*!40000 ALTER TABLE `bot_knowledge` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clases_prueba`
--

DROP TABLE IF EXISTS `clases_prueba`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clases_prueba` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telefono` varchar(255) NOT NULL,
  `interes` varchar(255) DEFAULT NULL,
  `horario` varchar(255) DEFAULT NULL,
  `estado` enum('pendiente','contactado','agendado','completado','cancelado') DEFAULT 'pendiente',
  `token_cancelacion` varchar(64) DEFAULT NULL,
  `codigo_reserva` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_codigo_reserva` (`codigo_reserva`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clases_prueba`
--

LOCK TABLES `clases_prueba` WRITE;
/*!40000 ALTER TABLE `clases_prueba` DISABLE KEYS */;
/*!40000 ALTER TABLE `clases_prueba` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clases_prueba_disponibles`
--

DROP TABLE IF EXISTS `clases_prueba_disponibles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clases_prueba_disponibles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `curso_id` int(11) DEFAULT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `fecha` date NOT NULL,
  `horario` varchar(20) NOT NULL,
  `cupos` int(11) DEFAULT 10,
  `descripcion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `curso_id` (`curso_id`),
  CONSTRAINT `clases_prueba_disponibles_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clases_prueba_disponibles`
--

LOCK TABLES `clases_prueba_disponibles` WRITE;
/*!40000 ALTER TABLE `clases_prueba_disponibles` DISABLE KEYS */;
/*!40000 ALTER TABLE `clases_prueba_disponibles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clases_prueba_espera`
--

DROP TABLE IF EXISTS `clases_prueba_espera`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clases_prueba_espera` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `disponibilidad_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `disponibilidad_id` (`disponibilidad_id`),
  CONSTRAINT `clases_prueba_espera_ibfk_1` FOREIGN KEY (`disponibilidad_id`) REFERENCES `clases_prueba_disponibles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clases_prueba_espera`
--

LOCK TABLES `clases_prueba_espera` WRITE;
/*!40000 ALTER TABLE `clases_prueba_espera` DISABLE KEYS */;
/*!40000 ALTER TABLE `clases_prueba_espera` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `consultas`
--

DROP TABLE IF EXISTS `consultas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consultas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `mensaje` text NOT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `estado` enum('pendiente','leido') DEFAULT 'pendiente',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `consultas`
--

LOCK TABLES `consultas` WRITE;
/*!40000 ALTER TABLE `consultas` DISABLE KEYS */;
/*!40000 ALTER TABLE `consultas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversaciones`
--

DROP TABLE IF EXISTS `conversaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `conversaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `telefono` varchar(20) NOT NULL,
  `alumno_id` int(11) DEFAULT NULL,
  `mensajes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL DEFAULT '[]' CHECK (json_valid(`mensajes`)),
  `requiere_atencion_humana` tinyint(1) DEFAULT 0,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `telefono` (`telefono`),
  KEY `idx_telefono` (`telefono`),
  KEY `idx_alumno` (`alumno_id`),
  KEY `idx_requiere_atencion` (`requiere_atencion_humana`),
  CONSTRAINT `conversaciones_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversaciones`
--

LOCK TABLES `conversaciones` WRITE;
/*!40000 ALTER TABLE `conversaciones` DISABLE KEYS */;
INSERT INTO `conversaciones` VALUES (1,'0',NULL,'[]',0,'{}','2026-02-18 23:53:26','2026-02-18 23:53:26'),(2,'95756916654115@lid',NULL,'[{\"role\":\"user\",\"content\":\"\",\"timestamp\":\"2026-02-22T21:28:21.845Z\"},{\"role\":\"assistant\",\"content\":\"¡Hola! Bienvenido a Select Dance Studio. ¿En qué puedo ayudarte hoy?\",\"timestamp\":\"2026-02-22T21:28:21.845Z\"},{\"role\":\"user\",\"content\":\"Indícanos el servicio que quieres consultar👇\",\"timestamp\":\"2026-02-22T21:28:29.307Z\"},{\"role\":\"assistant\",\"content\":\"¡Claro! ¿Te gustaría obtener información sobre nuestros servicios de formación en danza y gimnasia, nuestros horarios de clases, las formas de pago o algún otro tema en particular? ¡Estoy aquí para ayudarte!\",\"timestamp\":\"2026-02-22T21:28:29.307Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:28:39.057Z\"},{\"role\":\"assistant\",\"content\":\"¿Hay algo más en lo que pueda ayudarte hoy? Estoy aquí para responder cualquier pregunta que tengas sobre Select Dance Studio. ¡No dudes en consultarme!\",\"timestamp\":\"2026-02-22T21:28:39.057Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:28:39.849Z\"},{\"role\":\"assistant\",\"content\":\"Si en algún momento tienes alguna pregunta o necesitas información, ¡aquí estoy para ayudarte! ¡Que tengas un excelente día!\",\"timestamp\":\"2026-02-22T21:28:39.849Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:28:41.921Z\"},{\"role\":\"assistant\",\"content\":\"¿Hay algo más en lo que pueda asistirte hoy? ¡Estoy aquí para ayudarte en lo que necesites! ¡Que tengas un buen día!\",\"timestamp\":\"2026-02-22T21:28:41.921Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:28:42.731Z\"},{\"role\":\"assistant\",\"content\":\"Si en algún momento necesitas ayuda o tienes alguna consulta, no dudes en escribirme. ¡Que tengas un excelente día! ¡Hasta luego!\",\"timestamp\":\"2026-02-22T21:28:42.731Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:28:44.572Z\"},{\"role\":\"assistant\",\"content\":\"¡Entendido! Estoy aquí si en algún momento necesitas ayuda o información. ¡Que tengas un buen día! ¡Hasta pronto!\",\"timestamp\":\"2026-02-22T21:28:44.572Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:28:46.814Z\"},{\"role\":\"assistant\",\"content\":\"¿Hay algo en lo que pueda ayudarte hoy? Estoy aquí para responder tus preguntas sobre Select Dance Studio. ¡No dudes en consultarme si necesitas información adicional! ¡Que tengas un buen día!\",\"timestamp\":\"2026-02-22T21:28:46.814Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:28:48.055Z\"},{\"role\":\"assistant\",\"content\":\"Si en algún momento tienes alguna pregunta o necesitas información, ¡aquí estoy para ayudarte! ¡Que tengas un excelente día!\",\"timestamp\":\"2026-02-22T21:28:48.055Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:28:49.239Z\"},{\"role\":\"assistant\",\"content\":\"Si en algún momento necesitas ayuda o información sobre Select Dance Studio, no dudes en escribirme. ¡Que tengas un buen día! ¡Hasta luego!\",\"timestamp\":\"2026-02-22T21:28:49.239Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:28:51.333Z\"},{\"role\":\"assistant\",\"content\":\"¡Entendido! Estoy aquí si en algún momento necesitas ayuda o información. ¡Que tengas un buen día! ¡Hasta pronto!\",\"timestamp\":\"2026-02-22T21:28:51.333Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:28:52.485Z\"},{\"role\":\"assistant\",\"content\":\"¿Hay algo en lo que pueda ayudarte hoy? Estoy aquí para responder tus preguntas sobre Select Dance Studio. ¡No dudes en consultarme si necesitas información adicional! ¡Que tengas un buen día!\",\"timestamp\":\"2026-02-22T21:28:52.485Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:28:54.250Z\"},{\"role\":\"assistant\",\"content\":\"Si en algún momento tienes alguna pregunta o necesitas información, ¡aquí estoy para ayudarte! ¡Que tengas un excelente día!\",\"timestamp\":\"2026-02-22T21:28:54.250Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:28:56.468Z\"},{\"role\":\"assistant\",\"content\":\"Si en algún momento necesitas ayuda o información sobre Select Dance Studio, no dudes en escribirme. ¡Que tengas un buen día! ¡Hasta luego!\",\"timestamp\":\"2026-02-22T21:28:56.468Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:28:57.672Z\"},{\"role\":\"assistant\",\"content\":\"¡Entendido! Estoy aquí si en algún momento necesitas ayuda o información. ¡Que tengas un buen día! ¡Hasta pronto!\",\"timestamp\":\"2026-02-22T21:28:57.672Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:28:59.306Z\"},{\"role\":\"assistant\",\"content\":\"¿Hay algo en lo que pueda ayudarte hoy? Estoy aquí para responder tus preguntas sobre Select Dance Studio. ¡No dudes en consultarme si necesitas información adicional! ¡Que tengas un buen día!\",\"timestamp\":\"2026-02-22T21:28:59.306Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:29:00.552Z\"},{\"role\":\"assistant\",\"content\":\"Si en algún momento tienes alguna pregunta o necesitas información, ¡aquí estoy para ayudarte! ¡Que tengas un excelente día!\",\"timestamp\":\"2026-02-22T21:29:00.552Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:29:01.985Z\"},{\"role\":\"assistant\",\"content\":\"Si en algún momento necesitas ayuda o información sobre Select Dance Studio, no dudes en escribirme. ¡Que tengas un buen día! ¡Hasta luego!\",\"timestamp\":\"2026-02-22T21:29:01.985Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:29:10.077Z\"},{\"role\":\"assistant\",\"content\":\"¡Entendido! Estoy aquí si en algún momento necesitas ayuda o información. ¡Que tengas un buen día! ¡Hasta pronto!\",\"timestamp\":\"2026-02-22T21:29:10.077Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:29:17.107Z\"},{\"role\":\"assistant\",\"content\":\"¿Hay algo en lo que pueda ayudarte hoy? Estoy aquí para responder tus preguntas sobre Select Dance Studio. ¡No dudes en consultarme si necesitas información adicional! ¡Que tengas un buen día!\",\"timestamp\":\"2026-02-22T21:29:17.107Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:29:22.875Z\"},{\"role\":\"assistant\",\"content\":\"Si en algún momento tienes alguna pregunta o necesitas información, ¡aquí estoy para ayudarte! ¡Que tengas un excelente día!\",\"timestamp\":\"2026-02-22T21:29:22.875Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:29:27.978Z\"},{\"role\":\"assistant\",\"content\":\"Si en algún momento necesitas ayuda o información sobre Select Dance Studio, no dudes en escribirme. ¡Que tengas un buen día! ¡Hasta luego!\",\"timestamp\":\"2026-02-22T21:29:27.978Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:29:35.189Z\"},{\"role\":\"assistant\",\"content\":\"¡Entendido! Estoy aquí si en algún momento necesitas ayuda o información. ¡Que tengas un buen día! ¡Hasta pronto!\",\"timestamp\":\"2026-02-22T21:29:35.189Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:29:40.472Z\"},{\"role\":\"assistant\",\"content\":\"¿Hay algo en lo que pueda ayudarte hoy? Estoy aquí para responder tus preguntas sobre Select Dance Studio. ¡No dudes en consultarme si necesitas información adicional! ¡Que tengas un buen día!\",\"timestamp\":\"2026-02-22T21:29:40.472Z\"},{\"role\":\"user\",\"content\":\"None\",\"timestamp\":\"2026-02-22T21:29:45.800Z\"},{\"role\":\"assistant\",\"content\":\"Si en algún momento tienes alguna pregunta o necesitas información, ¡aquí estoy para ayudarte! ¡Que tengas un excelente día!\",\"timestamp\":\"2026-02-22T21:29:45.800Z\"}]',0,'{}','2026-02-22 21:28:20','2026-02-22 21:29:45'),(4,'48571835523166@lid',NULL,'[]',0,'{}','2026-03-02 20:03:15','2026-03-02 20:03:15'),(5,'161104340750517@lid',NULL,'[]',0,'{}','2026-03-02 20:56:57','2026-03-02 20:56:57');
/*!40000 ALTER TABLE `conversaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cursos`
--

DROP TABLE IF EXISTS `cursos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cursos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `nivel` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`nivel`)),
  `categoria` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`categoria`)),
  `tipo` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tipo`)),
  `profesor_id` int(11) DEFAULT NULL,
  `dia_semana` enum('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `cupo_maximo` int(11) DEFAULT 20,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_dia_hora` (`dia_semana`,`hora_inicio`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cursos`
--

LOCK TABLES `cursos` WRITE;
/*!40000 ALTER TABLE `cursos` DISABLE KEYS */;
INSERT INTO `cursos` VALUES (1,'Technique Foundations','Agregado desde cronograma oficial.','[]','[]','[\"Pre Competitive\"]',NULL,'Lunes','16:30:00','17:30:00',20,1,'2026-02-22 21:46:18','2026-02-26 00:25:30'),(2,'Soloist Coaching','Agregado desde cronograma oficial.','[]','[]','[\"Competitive\"]',NULL,'Lunes','17:30:00','18:30:00',20,1,'2026-02-22 21:46:18','2026-02-22 22:16:21'),(3,'Stage Development','Agregado desde cronograma oficial.','[]','[]','[\"Pre Competitive\",\"Recreative\"]',NULL,'Martes','17:30:00','18:30:00',20,1,'2026-02-22 21:46:18','2026-02-26 00:29:22'),(4,'Technique Foundation','Agregado desde cronograma oficial.','[]','[]','[\"Pre Competitive\"]',NULL,'Miércoles','16:30:00','17:30:00',20,1,'2026-02-22 21:46:18','2026-02-26 00:25:24'),(5,'Acro Technique','Agregado desde cronograma oficial.','[]','[]','[\"Competitive\"]',NULL,'Miércoles','17:30:00','18:30:00',20,1,'2026-02-22 21:46:18','2026-02-22 22:17:05'),(6,'Femme','Agregado desde cronograma oficial.','[]','[]','[\"Recreative\"]',NULL,'Miércoles','19:00:00','20:00:00',20,1,'2026-02-22 21:46:18','2026-02-22 22:15:22'),(7,'Flamenco','Agregado desde cronograma oficial.','[]','[]','[\"Recreative\"]',NULL,'Miércoles','20:00:00','21:00:00',20,1,'2026-02-22 21:46:18','2026-02-22 22:15:51'),(8,'Conditioning for Dancers','Agregado desde cronograma oficial.','[]','[]','[\"Pre Competitive\"]',NULL,'Jueves','17:00:00','19:00:00',20,1,'2026-02-22 21:46:18','2026-02-26 00:25:42'),(9,'Heels','Agregado desde cronograma oficial.','[]','[]','[\"Recreative\"]',NULL,'Jueves','20:00:00','21:00:00',20,1,'2026-02-22 21:46:18','2026-02-22 22:15:34'),(10,'Soloist Coaching','Agregado desde cronograma oficial.','[]','[]','[\"Competitive\"]',NULL,'Viernes','16:30:00','17:30:00',20,1,'2026-02-22 21:46:18','2026-02-22 22:16:25'),(11,'Conditioning for Dancers','Agregado desde cronograma oficial.','[]','[]','[\"Competitive\"]',NULL,'Viernes','17:00:00','19:00:00',20,0,'2026-02-22 21:46:18','2026-02-26 00:21:10'),(12,'Teen Training','Agregado desde cronograma oficial.','[]','[]','[\"Pre Competitive\"]',NULL,'Viernes','18:30:00','20:00:00',20,1,'2026-02-22 21:46:18','2026-02-26 00:25:51'),(13,'Acro Technique','Agregado desde cronograma oficial.','[]','[]','[\"Competitive\"]',NULL,'Sábado','10:00:00','11:00:00',20,1,'2026-02-22 21:46:18','2026-02-22 22:17:09'),(14,'Technique Foundations','Agregado desde cronograma oficial.','[]','[]','[\"Competitive\"]',NULL,'Sábado','11:00:00','12:00:00',20,1,'2026-02-22 21:46:18','2026-02-22 22:16:40'),(15,'Select Teen Company','Agregado desde cronograma oficial.','[]','[]','[\"Competitive\"]',NULL,'Sábado','15:30:00','17:00:00',20,1,'2026-02-22 21:46:18','2026-02-26 00:23:06'),(16,'QA Test Dance',NULL,'[\"All Levels\"]','[]','[]',NULL,'Lunes','18:00:00','19:00:00',20,0,'2026-03-10 20:58:03','2026-03-10 21:01:23'),(17,'QA Cupo Test',NULL,'[\"All\"]','[\"Baby\"]','[\"Taller\"]',NULL,'Lunes','10:00:00','11:00:00',1,0,'2026-03-10 21:56:52','2026-03-10 21:56:52');
/*!40000 ALTER TABLE `cursos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_ventas`
--

DROP TABLE IF EXISTS `detalle_ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalle_ventas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `venta_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `venta_id` (`venta_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_ventas_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_ventas`
--

LOCK TABLES `detalle_ventas` WRITE;
/*!40000 ALTER TABLE `detalle_ventas` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalle_ventas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `eventos`
--

DROP TABLE IF EXISTS `eventos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `eventos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `tipo` varchar(50) DEFAULT 'Presentaci¾n',
  `fecha` date NOT NULL,
  `hora` varchar(10) DEFAULT NULL,
  `lugar` varchar(255) DEFAULT NULL,
  `ubicacion` varchar(255) DEFAULT NULL,
  `cupo_maximo` int(11) DEFAULT NULL,
  `costo_inscripcion` decimal(10,2) DEFAULT 0.00,
  `costo_vestuario` decimal(10,2) DEFAULT 0.00,
  `costo_maquillaje` decimal(10,2) DEFAULT 0.00,
  `costo_peinado` decimal(10,2) DEFAULT 0.00,
  `vestuario_requerido` text DEFAULT NULL,
  `peinado_instrucciones` text DEFAULT NULL,
  `maquillaje_instrucciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_fecha` (`fecha`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `eventos`
--

LOCK TABLES `eventos` WRITE;
/*!40000 ALTER TABLE `eventos` DISABLE KEYS */;
/*!40000 ALTER TABLE `eventos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `gastos`
--

DROP TABLE IF EXISTS `gastos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `gastos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` date NOT NULL DEFAULT curdate(),
  `monto` decimal(10,2) NOT NULL,
  `categoria` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `comprobante_url` varchar(255) DEFAULT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `gastos`
--

LOCK TABLES `gastos` WRITE;
/*!40000 ALTER TABLE `gastos` DISABLE KEYS */;
/*!40000 ALTER TABLE `gastos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inscripciones_curso`
--

DROP TABLE IF EXISTS `inscripciones_curso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inscripciones_curso` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alumno_id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `fecha_inscripcion` date NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_inscripcion` (`alumno_id`,`curso_id`,`activo`),
  KEY `idx_alumno` (`alumno_id`),
  KEY `idx_curso` (`curso_id`),
  CONSTRAINT `inscripciones_curso_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inscripciones_curso_ibfk_2` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inscripciones_curso`
--

LOCK TABLES `inscripciones_curso` WRITE;
/*!40000 ALTER TABLE `inscripciones_curso` DISABLE KEYS */;
/*!40000 ALTER TABLE `inscripciones_curso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inscripciones_evento`
--

DROP TABLE IF EXISTS `inscripciones_evento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inscripciones_evento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alumno_id` int(11) NOT NULL,
  `evento_id` int(11) NOT NULL,
  `fecha_inscripcion` date NOT NULL,
  `pago_realizado` tinyint(1) DEFAULT 0,
  `checklist_vestuario` tinyint(1) DEFAULT 0,
  `checklist_peinado` tinyint(1) DEFAULT 0,
  `checklist_maquillaje` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_inscripcion_evento` (`alumno_id`,`evento_id`),
  KEY `idx_alumno` (`alumno_id`),
  KEY `idx_evento` (`evento_id`),
  CONSTRAINT `inscripciones_evento_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`usuario_id`) ON DELETE CASCADE,
  CONSTRAINT `inscripciones_evento_ibfk_2` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inscripciones_evento`
--

LOCK TABLES `inscripciones_evento` WRITE;
/*!40000 ALTER TABLE `inscripciones_evento` DISABLE KEYS */;
/*!40000 ALTER TABLE `inscripciones_evento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notificaciones`
--

DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `batch_id` varchar(36) DEFAULT NULL,
  `usuario_id` int(11) NOT NULL,
  `remitente` varchar(100) DEFAULT 'Select Dance Studio',
  `titulo` varchar(255) NOT NULL,
  `mensaje` text NOT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `tipo` enum('info','aviso','importante','cumpleanos') DEFAULT 'info',
  `leido` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_notificaciones_batch_id` (`batch_id`),
  CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notificaciones`
--

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pagos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alumno_id` int(11) NOT NULL,
  `curso_id` int(11) DEFAULT NULL,
  `concepto` varchar(255) NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `fecha_limite_sin_recargo` date DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL,
  `estado` enum('pendiente','pagado','vencido','parcial','revision') DEFAULT 'pendiente',
  `metodo_pago` varchar(50) DEFAULT NULL,
  `comprobante_url` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `metodo_pago_realizado` enum('efectivo','transferencia','tarjeta','mercadopago') DEFAULT NULL COMMENT 'Método de pago utilizado cuando se marca como pagado',
  `recargo_aplicado` decimal(10,2) DEFAULT 0.00 COMMENT 'Monto de recargo por mora agregado al pago',
  `descuento_aplicado` decimal(10,2) DEFAULT 0.00 COMMENT 'Monto de descuento aplicado (familiar, promoción, etc.)',
  `monto_original` decimal(10,2) DEFAULT NULL COMMENT 'Monto original antes de recargos/descuentos',
  `comprobante_numero` varchar(50) DEFAULT NULL COMMENT 'Número único de comprobante de pago',
  `plan_cuotas` tinyint(4) DEFAULT NULL COMMENT 'Total de cuotas si forma parte de un plan de pagos',
  `cuota_numero` tinyint(4) DEFAULT NULL COMMENT 'Número de cuota actual (ej: 1, 2, 3)',
  `plan_pago_id` varchar(50) DEFAULT NULL COMMENT 'ID del plan de pago al que pertenece (agrupa cuotas relacionadas)',
  `referencia_externa` varchar(100) DEFAULT NULL COMMENT 'ID de transacción de MercadoPago, número de transferencia, etc.',
  `tipo_descuento` varchar(50) DEFAULT NULL COMMENT 'Tipo de descuento: familiar, promocion, becado, etc.',
  `notas_pago` text DEFAULT NULL COMMENT 'Notas adicionales sobre el pago realizado',
  `mp_preference_id` varchar(255) DEFAULT NULL,
  `mp_payment_id` varchar(255) DEFAULT NULL,
  `mp_status` varchar(50) DEFAULT NULL,
  `mp_status_detail` varchar(255) DEFAULT NULL,
  `mp_payment_method` varchar(100) DEFAULT NULL,
  `es_mensual` tinyint(1) DEFAULT 0,
  `analisis_comprobante` text DEFAULT NULL,
  `codigo_unico` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `comprobante_numero` (`comprobante_numero`),
  UNIQUE KEY `idx_codigo_unico` (`codigo_unico`),
  KEY `idx_alumno` (`alumno_id`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha_vencimiento` (`fecha_vencimiento`),
  KEY `idx_curso` (`curso_id`),
  KEY `idx_metodo_pago` (`metodo_pago_realizado`),
  KEY `idx_plan_pago` (`plan_pago_id`),
  KEY `idx_comprobante` (`comprobante_numero`),
  KEY `idx_fecha_pago` (`fecha_pago`),
  KEY `idx_mp_preference` (`mp_preference_id`),
  KEY `idx_mp_payment` (`mp_payment_id`),
  KEY `idx_pagos_fecha_pago` (`fecha_pago`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pagos_ibfk_2` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
INSERT INTO `pagos` VALUES (1,2,NULL,'Mensualidad',5000.00,'2026-03-10','2026-03-08','2026-03-10','pagado','',NULL,'','2026-03-10 21:06:21','2026-03-10 21:07:27','efectivo',0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(2,2,NULL,'Mensualidad',1000.00,'2026-03-15','2026-03-13',NULL,'pendiente','',NULL,'','2026-03-10 21:08:42','2026-03-10 21:08:42',NULL,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(3,8,NULL,'Matrícula',50000.00,'2026-03-10','2026-03-08',NULL,'pagado','efectivo',NULL,NULL,'2026-03-10 23:19:57','2026-03-10 23:19:57',NULL,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(4,9,NULL,'Matrícula',50000.00,'2026-03-10','2026-03-08',NULL,'pagado','efectivo',NULL,NULL,'2026-03-10 23:20:34','2026-03-10 23:20:34',NULL,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL),(5,10,NULL,'Matrícula',50000.00,'2026-03-10','2026-03-08',NULL,'pagado','efectivo',NULL,NULL,'2026-03-10 23:24:31','2026-03-10 23:24:31',NULL,0.00,0.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL);
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_token` (`token`),
  KEY `idx_email` (`email`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
INSERT INTO `password_resets` VALUES (1,'admin@selectdance.com','14b76d8a4a60649e6b2f313a988be0d4863e4f1a829694c4ccc3c9b92518dbfc','2026-03-10 19:20:07',1,'2026-03-10 21:20:07'),(2,'admin@selectdance.com','0c7c03b456fe133550aa899d387f3049e4f06351b9dcd04e23527b556d482274','2026-03-10 19:21:07',0,'2026-03-10 21:21:07');
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio_costo` decimal(10,2) NOT NULL DEFAULT 0.00,
  `precio_venta` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock_actual` int(11) NOT NULL DEFAULT 0,
  `stock_minimo` int(11) NOT NULL DEFAULT 5,
  `categoria` varchar(50) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uniformes`
--

DROP TABLE IF EXISTS `uniformes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `uniformes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alumno_id` int(11) NOT NULL,
  `tipo` enum('remera','pantalon','conjunto','zapatillas','otro') NOT NULL,
  `talle` varchar(10) DEFAULT NULL,
  `estado` enum('pendiente','entregado') DEFAULT 'pendiente',
  `fecha_entrega` date DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_alumno` (`alumno_id`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `uniformes_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uniformes`
--

LOCK TABLES `uniformes` WRITE;
/*!40000 ALTER TABLE `uniformes` DISABLE KEYS */;
/*!40000 ALTER TABLE `uniformes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `primer_login` tinyint(1) DEFAULT 1,
  `rol` enum('admin','alumno','profesor') NOT NULL DEFAULT 'alumno',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT 0,
  `two_factor_backup_codes` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`two_factor_backup_codes`)),
  `last_activity` datetime DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `rol_display` varchar(100) DEFAULT NULL COMMENT 'T├¡tulo para mostrar en p├ígina de equipo',
  `orden` int(11) DEFAULT 0 COMMENT 'Orden jer├írquico para p├ígina de equipo',
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_rol` (`rol`),
  KEY `idx_last_activity` (`last_activity`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'admin@selectdance.com','$2b$10$qYdoWEtNqfzvpu5WlzAGfuf5wVyZaJfIMUcJP4iq64ZUK8G0lP25i',NULL,NULL,0,'admin',1,'2026-02-18 22:31:20','2026-03-09 21:13:52',NULL,0,NULL,NULL,NULL,NULL,NULL,0,NULL),(2,'alumno1@sds.com','$2b$10$QGqVyq3DQp.NXU5OIX2A0OjfVrlXEpTWBDPbCaCOmhCQ5iL7bS6Be','paz','olejnik',0,'profesor',1,'2026-02-18 22:51:30','2026-02-18 22:52:21',NULL,0,NULL,NULL,NULL,NULL,NULL,0,NULL),(4,'testalumno@example.com','$2b$10$.osuurQ3tzXLWXJHGjZVHuIAezRsJZp7YyaSfWXfC.aQF9qd03KsW','Test','Alumno',1,'alumno',1,'2026-03-10 21:05:02','2026-03-11 00:32:25',NULL,0,NULL,NULL,NULL,NULL,NULL,0,NULL),(9,'f2@test.com','$2b$10$5fgnHzOWGglvQsJ/U425rOV25KTJ7UuGLEcBWTquhOEwSvv74KkPi','Finanzas','Test',1,'alumno',1,'2026-03-10 22:04:37','2026-03-11 00:32:25',NULL,0,NULL,NULL,NULL,NULL,NULL,0,NULL),(10,'finanzas1773184797142@test.com','$2b$10$FxGE3HlTcA5HERByX8I5H.65K.UzwkN/dpRZ.QHv1ZSMvTvS/ATnq','Finanzas','Test',1,'alumno',1,'2026-03-10 23:19:57','2026-03-11 00:32:25',NULL,0,NULL,NULL,NULL,NULL,NULL,0,NULL),(11,'finanzas1773184834677@test.com','$2b$10$aso02utsx2zCYLzCX.z2hOpJr7kFETIpPUWmpLJx2o5C5DmncIfbC','Finanzas','Test',1,'alumno',1,'2026-03-10 23:20:34','2026-03-11 00:32:25',NULL,0,NULL,NULL,NULL,NULL,NULL,0,NULL),(12,'finanzas1773185071710@test.com','$2b$10$56iu8RWeEuYhNuboDXP9xOG9TzbV4nTQd7BgoglO8fDijXk89rQWy','Finanzas','Test',1,'alumno',1,'2026-03-10 23:24:31','2026-03-11 00:32:25',NULL,0,NULL,NULL,NULL,NULL,NULL,0,NULL),(13,'staff_33b7f075-1ce3-11f1-ab17-10a51d33af9e@selectdance.com','dummy_hash','Profe Modificado',NULL,1,'profesor',0,'2026-03-11 00:42:15','2026-03-11 00:42:15',NULL,0,NULL,NULL,NULL,NULL,'Coreógrafo',0,'Test normalization'),(14,'staff_54f7cee8-1ce3-11f1-ab17-10a51d33af9e@selectdance.com','dummy_hash','Profe Modificado',NULL,1,'profesor',0,'2026-03-11 00:43:11','2026-03-11 00:43:11',NULL,0,NULL,NULL,NULL,NULL,'Coreógrafo',0,'Test normalization'),(16,'browser@test.com','$2b$10$kZFOiw4GienlNq4dl9gRc.TuJaQY8CpOU461pZu/ex/.945RYkEYm','Browser','Test',1,'alumno',1,'2026-03-11 00:50:43','2026-03-11 00:50:43',NULL,0,NULL,NULL,'123123123',NULL,NULL,0,NULL),(17,'staff_08f7c6bf-1ce5-11f1-ab17-10a51d33af9e@selectdance.com','dummy_hash','Profesor Prueba 2',NULL,1,'profesor',1,'2026-03-11 00:55:22','2026-03-11 00:55:22',NULL,0,NULL,NULL,NULL,NULL,'Test Fix',0,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ventas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fecha` datetime DEFAULT current_timestamp(),
  `usuario_id` int(11) DEFAULT NULL,
  `cliente_nombre` varchar(100) DEFAULT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-11  3:00:00
