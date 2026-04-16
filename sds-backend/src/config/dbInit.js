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
            { name: 'horario', type: 'VARCHAR(100) AFTER interes' }
        ];

        for (const col of required) {
            if (!columns.includes(col.name)) {
                console.log(`➕ Añadiendo columna [${col.name}] a clases_prueba...`);
                await db.query(`ALTER TABLE clases_prueba ADD COLUMN ${col.name} ${col.type}`);
            }
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
