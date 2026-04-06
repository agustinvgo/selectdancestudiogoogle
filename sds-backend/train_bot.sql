-- Entrenamiento Inicial del Bot de WhatsApp (Select Dance Studio)

-- 1. Actualización del System Prompt para una personalidad específica
INSERT INTO bot_config (clave, valor) VALUES (
    'system_prompt', 
    'Eres el asistente virtual oficial de Select Dance Studio, una academia de danza moderna de alto rendimiento. Tu rol es responder consultas de alumnos y padres con tono profesional, amable y entusiasta. Usa emojis ocasionalmente 💃🕺. Basa TODAS tus respuestas estrictamente en la base de conocimiento provista. Si te preguntan algo fuera de tu conocimiento, ofrece transferir la consulta a la administración o pide que dejen el mensaje.'
) ON DUPLICATE KEY UPDATE valor = VALUES(valor);

-- 2. Limpieza de conocimiento previo (si aplica) para evitar duplicados
TRUNCATE TABLE bot_knowledge;

-- 3. Inserción de la Base de Conocimiento
INSERT INTO bot_knowledge (tema, contenido, activo) VALUES

-- Horarios Generales Módulo 1 (Lunes y Martes)
('Horarios de Lunes y Martes', 'Los días Lunes dictamos "Technique Foundations" de 16:30 a 17:30 (Foco: Pre-Competitive) y "Soloist Coaching" de 17:30 a 18:30 (Foco: Competitive). Los días Martes tenemos "Stage Development" de 17:30 a 18:30 (Recreativo/Pre-Competitivo).', 1),

-- Horarios Generales Módulo 2 (Miércoles)
('Horarios de Miércoles', 'Los días Miércoles las clases son: "Technique Foundation" (16:30-17:30), "Acro Technique" (17:30-18:30) para nivel competitivo, "Femme" (19:00-20:00) y "Flamenco" (20:00-21:00) de nivel recreativo.', 1),

-- Horarios Generales Módulo 3 (Jueves y Viernes)
('Horarios de Jueves y Viernes', 'Los días Jueves contamos con "Conditioning for Dancers" (17:00-19:00) y "Heels" (20:00-21:00). Los Viernes dictamos "Soloist Coaching" (16:30-17:30) y "Teen Training" excluyente para grupo TEEN (18:30-20:00).', 1),

-- Horarios Generales Módulo 4 (Sábados)
('Horarios de Sábados', 'Los Sábados son de mucha actividad competitiva: "Acro Technique" (10:00-11:00), "Technique Foundations" (11:00-12:00) y ensayo oficial del "Select Teen Company" de 15:30 a 17:00.', 1),

-- Tipos de Enfoque y Programas
('Niveles y Programas de Danza', 'En Select Dance Studio dividimos las clases en tres enfoques: 1) Recreative (Recreativo): Para disfrutar y aprender sin presión (ej. Heels, Femme, Flamenco). 2) Pre-Competitive: Preparación intensiva para futuras competencias. 3) Competitive: Alto rendimiento y exigencia para bailarines de elite (ej. Soloist Coaching, Acro Technique, Teen Company).', 1),

-- Pagos y Cuotas
('Pagos, Mensualidades y Matrícula', 'Para ser alumno regular, se abona una matrícula anual inicial. Las mensualidades o cuotas deben abonarse del 1 al 10 de cada mes. Los medios de pago aceptados los coordina la administración central. Las cuotas vencidas tienen un recargo automático. Contamos con descuentos por planes semestrales o grupos familiares.', 1),

-- Vestuario y Normativa Competitiva
('Normativa de Vestuario y Uniforme', 'Todos los alumnos de grupos "Pre-Competitive" y "Competitive" deben asistir obligatoriamente a los ensayos y clases de técnica con el uniforme oficial del estudio, pelo recogido, sin accesorios colgantes y calzado/maquillaje indicado para su disciplina.', 1),

-- Clases de Prueba
('Información de Clases de Prueba', '¡Siempre recibimos a nuevos talentos! Las clases de prueba tienen un costo de $30.000. Ese monto se abonará por adelantado, pero si el alumno decide inscribirse oficialmente en la escuela dentro de ese mismo mes, los $30.000 se descuentan del valor total de la matrícula inicial. Se deben agendar con anticipación indicando nombre, edad y disciplina.', 1),

-- Eventos y Presentaciones
('Eventos y Presentaciones', 'A lo largo del año participamos en competencias regionales y cerramos con una Gala Final. Los eventos requieren inscripción temprana y abono extra para derecho a escenario, trajes coreográficos y traslados. La asistencia a ensayos previos es 100% obligatoria para poder subir al escenario.', 1);
