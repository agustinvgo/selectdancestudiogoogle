const db = require('./db');
const fs = require('fs');
const path = require('path');

const dbInit = {
    async initialize() {
        console.log('--- 🔍 Iniciando Verificación de Base de Datos ---');
        try {
            // 1. Verificar/Reparar tablas críticas (Idempotente)
            await this.repairClasesPrueba();
            await this.repairUsuarios();
            await this.repairCursos();
            await this.ensureCursoProfesores();
            await this.ensureAgendaConfirmaciones();
            await this.ensurePushNotifications();
            await this.repairPagos();
            await this.ensureTableDisponibles();
            await this.ensureTableEsperas();
            await this.ensureTablePasswordResets();

            console.log('--- ✅ Base de Datos Sincronizada y Lista ---');
        } catch (error) {
            console.error('❌ Error durante la inicialización de la DB:', error);
            // No detenemos el servidor, pero el log avisará del error
        }
    },

    /**
     * Asegura que clases_prueba tenga las columnas necesarias (V2)
     */
    async repairClasesPrueba() {
        const columns = await this.getTableColumns('clases_prueba');
        if (!columns) return; // Si no existe, se creará por schema.sql manual o no está instalada

        const required = [
            { name: 'token_cancelacion', type: 'VARCHAR(100) UNIQUE AFTER horario' },
            { name: 'nombre', type: 'VARCHAR(100) AFTER id' },
            { name: 'apellido', type: 'VARCHAR(100) AFTER nombre' },
            { name: 'interes', type: 'VARCHAR(100) AFTER telefono' },
            { name: 'horario', type: 'VARCHAR(100) AFTER interes' },
            { name: 'asistio', type: 'TINYINT(1) DEFAULT 0 AFTER token_cancelacion' },
            { name: 'asistencia_estado', type: "ENUM('presente', 'ausente') DEFAULT NULL AFTER asistio" },
            { name: 'disponibilidad_id', type: 'INT DEFAULT NULL AFTER asistencia_estado' }
        ];

        for (const col of required) {
            if (!columns.includes(col.name)) {
                console.log(`➕ Añadiendo columna [${col.name}] a clases_prueba...`);
                await db.query(`ALTER TABLE clases_prueba ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        const [availabilityIndexes] = await db.query(`
            SHOW INDEX FROM clases_prueba WHERE Column_name = 'disponibilidad_id'
        `);
        if (availabilityIndexes.length === 0) {
            await db.query('ALTER TABLE clases_prueba ADD INDEX idx_clases_prueba_disponibilidad (disponibilidad_id)');
        }
    },

    /**
     * Asegura que usuarios tenga soporte para Staff/Equipo
     */
    async repairUsuarios() {
        const columns = await this.getTableColumns('usuarios');
        if (!columns) return;

        const required = [
            { name: 'rol_display', type: 'VARCHAR(100) AFTER foto_perfil' },
            { name: 'descripcion', type: 'TEXT AFTER rol_display' },
            { name: 'orden', type: 'INT DEFAULT 0 AFTER descripcion' },
            { name: 'mostrar_en_web', type: 'TINYINT(1) DEFAULT 0 AFTER orden' },
            { name: 'foto_perfil', type: 'VARCHAR(255) AFTER telefono' },
            { name: 'foto_posicion', type: "VARCHAR(255) DEFAULT 'center' AFTER foto_perfil" },
            { name: 'primer_login', type: 'TINYINT(1) DEFAULT 1 AFTER activo' },
            { name: 'nombre', type: 'VARCHAR(100) AFTER primer_login' },
            { name: 'apellido', type: 'VARCHAR(100) AFTER nombre' },
            { name: 'telefono', type: 'VARCHAR(50) AFTER apellido' }
        ];

        for (const col of required) {
            if (!columns.includes(col.name)) {
                console.log(`➕ Añadiendo columna [${col.name}] a usuarios...`);
                await db.query(`ALTER TABLE usuarios ADD COLUMN ${col.name} ${col.type}`);
            }
        }

        // Asegurar que foto_posicion sea VARCHAR(255)
        try {
            await db.query("ALTER TABLE usuarios MODIFY COLUMN foto_posicion VARCHAR(255) DEFAULT 'center'");
        } catch (e) {
            // Ignorar si la tabla recién se creó o no aplica
        }
    },

    /**
     * Asegura que cursos tenga soporte para Categorías y Tipos (JSON)
     */
    async repairCursos() {
        const columns = await this.getTableColumns('cursos');
        if (!columns) return;

        const required = [
            { name: 'nivel', type: 'JSON AFTER profesor_id' },
            { name: 'categoria', type: 'JSON AFTER nivel' },
            { name: 'tipo', type: 'JSON AFTER categoria' },
            { name: 'hora_inicio', type: 'TIME AFTER tipo' },
            { name: 'hora_fin', type: 'TIME AFTER hora_inicio' },
            { name: 'url_clase_vivo', type: 'VARCHAR(255) AFTER cupo_maximo' },
            { name: 'es_publico', type: 'TINYINT(1) DEFAULT 1 AFTER activo' }
        ];

        for (const col of required) {
            if (!columns.includes(col.name)) {
                console.log(`➕ Añadiendo columna [${col.name}] a cursos...`);
                await db.query(`ALTER TABLE cursos ADD COLUMN ${col.name} ${col.type}`);
            }
        }
    },

    /**
     * Relación muchos-a-muchos entre cursos y profesores.
     * Conserva cursos.profesor_id como profesor principal por compatibilidad.
     */
    async ensureCursoProfesores() {
        await db.query(`
            CREATE TABLE IF NOT EXISTS curso_profesores (
                curso_id INT NOT NULL,
                profesor_id INT NOT NULL,
                orden INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (curso_id, profesor_id),
                KEY idx_curso_profesores_profesor (profesor_id),
                CONSTRAINT fk_curso_profesores_curso
                    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
                CONSTRAINT fk_curso_profesores_profesor
                    FOREIGN KEY (profesor_id) REFERENCES usuarios(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

        await db.query(`
            INSERT IGNORE INTO curso_profesores (curso_id, profesor_id, orden)
            SELECT id, profesor_id, 0
            FROM cursos
            WHERE profesor_id IS NOT NULL
        `);
    },

    /**
     * Guarda únicamente confirmaciones o avisos de ausencia para una clase semanal.
     * El estado programado se deriva de la inscripción y no necesita duplicarse.
     */
    async ensureAgendaConfirmaciones() {
        await db.query(`
            CREATE TABLE IF NOT EXISTS agenda_confirmaciones (
                alumno_id INT NOT NULL,
                curso_id INT NOT NULL,
                fecha DATE NOT NULL,
                estado ENUM('confirmado', 'no_asistira') NOT NULL,
                observaciones VARCHAR(500) DEFAULT NULL,
                updated_by INT DEFAULT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (alumno_id, curso_id, fecha),
                KEY idx_agenda_confirmaciones_fecha (fecha),
                KEY idx_agenda_confirmaciones_curso_fecha (curso_id, fecha),
                CONSTRAINT fk_agenda_confirmaciones_alumno
                    FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
                CONSTRAINT fk_agenda_confirmaciones_curso
                    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
                CONSTRAINT fk_agenda_confirmaciones_usuario
                    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
    },

    /**
     * Suscripciones Web Push, claves VAPID persistentes y control anti-duplicados.
     */
    async ensurePushNotifications() {
        await db.query(`
            CREATE TABLE IF NOT EXISTS push_config (
                id TINYINT NOT NULL DEFAULT 1,
                public_key VARCHAR(255) NOT NULL,
                private_key VARCHAR(255) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS push_subscriptions (
                id BIGINT NOT NULL AUTO_INCREMENT,
                usuario_id INT NOT NULL,
                endpoint_hash CHAR(64) NOT NULL,
                endpoint TEXT NOT NULL,
                p256dh VARCHAR(255) NOT NULL,
                auth VARCHAR(255) NOT NULL,
                user_agent VARCHAR(500) DEFAULT NULL,
                activo TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                UNIQUE KEY uq_push_endpoint_hash (endpoint_hash),
                KEY idx_push_usuario_activo (usuario_id, activo),
                CONSTRAINT fk_push_subscription_usuario
                    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);

        await db.query(`
            CREATE TABLE IF NOT EXISTS push_notification_log (
                event_key VARCHAR(191) NOT NULL,
                event_type ENUM('curso', 'clase_prueba') NOT NULL,
                event_id INT NOT NULL,
                scheduled_at DATETIME NOT NULL,
                recipients INT NOT NULL DEFAULT 0,
                success_count INT NOT NULL DEFAULT 0,
                failed_count INT NOT NULL DEFAULT 0,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (event_key),
                KEY idx_push_log_scheduled (scheduled_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `);
    },

    /**
     * Asegura que pagos tenga el esquema financiero extendido
     */
    async repairPagos() {
        const columns = await this.getTableColumns('pagos');
        if (!columns) return;

        const required = [
            { name: 'monto_original', type: 'DECIMAL(10, 2) AFTER monto' },
            { name: 'recargo_aplicado', type: 'DECIMAL(10, 2) DEFAULT 0 AFTER monto_original' },
            { name: 'descuento_aplicado', type: 'DECIMAL(10, 2) DEFAULT 0 AFTER recargo_aplicado' },
            { name: 'fecha_limite_sin_recargo', type: 'DATE AFTER fecha_vencimiento' },
            { name: 'es_mensual', type: 'TINYINT(1) DEFAULT 0 AFTER observaciones' },
            { name: 'codigo_unico', type: 'VARCHAR(100) UNIQUE AFTER es_mensual' }
        ];

        for (const col of required) {
            if (!columns.includes(col.name)) {
                console.log(`➕ Añadiendo columna [${col.name}] a pagos...`);
                await db.query(`ALTER TABLE pagos ADD COLUMN ${col.name} ${col.type}`);
            }
        }
    },

    /**
     * Asegura la existencia de la tabla de disponibilidades de clases de prueba
     */
    async ensureTableDisponibles() {
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS clases_prueba_disponibles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    curso_id INT,
                    titulo VARCHAR(200),
                    descripcion TEXT,
                    fecha DATE NOT NULL,
                    horario VARCHAR(100) NOT NULL,
                    cupos INT DEFAULT 10,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL
                ) ENGINE=InnoDB;
            `);
        } catch (error) {
            console.error('Error asegurando tabla disponibles:', error);
        }
    },

    /**
     * Asegura la existencia de la tabla de espera para clases de prueba
     */
    async ensureTableEsperas() {
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS clases_prueba_espera (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    disponibilidad_id INT NOT NULL,
                    nombre VARCHAR(100) NOT NULL,
                    email VARCHAR(255),
                    telefono VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (disponibilidad_id) REFERENCES clases_prueba_disponibles(id) ON DELETE CASCADE
                ) ENGINE=InnoDB;
            `);
        } catch (error) {
            console.error('Error asegurando tabla esperas:', error);
        }
    },

    /**
     * Asegura la existencia de la tabla para recuperacion de contraseña
     */
    async ensureTablePasswordResets() {
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS password_resets (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL,
                    token VARCHAR(64) NOT NULL,
                    used BOOLEAN DEFAULT FALSE,
                    expires_at DATETIME NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX(email),
                    INDEX(token)
                ) ENGINE=InnoDB;
            `);
        } catch (error) {
            console.error('Error asegurando tabla password_resets:', error);
        }
    },

    /**
     * Helper: Obtener lista de columnas de una tabla
     */
    async getTableColumns(tableName) {
        try {
            const [rows] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
            return rows.map(r => r.Field);
        } catch (error) {
            return null;
        }
    }
};

module.exports = dbInit;
