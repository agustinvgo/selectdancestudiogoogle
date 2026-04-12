const db = require('../config/db');

const AlumnosModel = {
    // Listar todos los alumnos (con paginación y filtros opcionales)
    // Bug #1 fix: acepta un único objeto params en vez de (page, limit, filters) separados
    async findAll(params = {}) {
        try {
            // Soporte para llamadas sin argumentos (cron, etc.) — devuelve todos
            const page    = params.page    || null;
            const limit   = params.limit   || null;
            const filters = {
                activo: params.activo,
                search: params.search || ''
            };

            let query = `
                SELECT a.*, u.email, u.activo as usuario_activo,
                       u.nombre, u.apellido, u.telefono, u.foto_perfil
                FROM alumnos a
                INNER JOIN usuarios u ON a.usuario_id = u.id
            `;

            const queryParams = [];
            const whereClauses = [];

            // Filtro por estado activo/inactivo (basado en usuarios.activo)
            if (filters.activo !== undefined && filters.activo !== 'todos' && filters.activo !== '') {
                if (filters.activo === 'activos' || filters.activo === true || filters.activo === 'true') {
                    whereClauses.push('u.activo = 1');
                } else if (filters.activo === 'inactivos' || filters.activo === false || filters.activo === 'false') {
                    whereClauses.push('u.activo = 0');
                }
            }

            // Búsqueda (nombre, apellido, dni, email)
            if (filters.search) {
                const term = `%${filters.search}%`;
                whereClauses.push('(u.nombre LIKE ? OR u.apellido LIKE ? OR a.dni LIKE ? OR u.email LIKE ?)');
                queryParams.push(term, term, term, term);
            }

            if (whereClauses.length > 0) {
                query += ' WHERE ' + whereClauses.join(' AND ');
            }

            query += ' ORDER BY u.apellido, u.nombre';

            // Paginación
            if (page && limit) {
                const offset = (parseInt(page) - 1) * parseInt(limit);
                query += ' LIMIT ? OFFSET ?';
                queryParams.push(parseInt(limit), parseInt(offset));

                const [rows] = await db.query(query, queryParams);

                // Count query con los mismos filtros (sin LIMIT/OFFSET)
                let countQuery = `SELECT COUNT(*) as total FROM alumnos a INNER JOIN usuarios u ON a.usuario_id = u.id`;
                const countParams = [];
                // Reconstruir params de filtros para el count
                if (filters.activo !== undefined && filters.activo !== 'todos' && filters.activo !== '') {
                    // ya incluido en whereClauses, sin params adicionales
                }
                if (filters.search) {
                    const term = `%${filters.search}%`;
                    countParams.push(term, term, term, term);
                }
                if (whereClauses.length > 0) countQuery += ' WHERE ' + whereClauses.join(' AND ');
                const [countResult] = await db.query(countQuery, countParams);

                return { data: rows, total: countResult[0].total };
            }

            const [rows] = await db.query(query, queryParams);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Buscar alumnos que cumplen años hoy
    async findCumpleanos(mes, dia) {
        try {
            const [rows] = await db.query(`
                SELECT a.*, u.email, u.nombre, u.apellido, u.telefono, u.foto_perfil
                FROM alumnos a
                INNER JOIN usuarios u ON a.usuario_id = u.id
                WHERE MONTH(a.fecha_nacimiento) = ? 
                AND DAY(a.fecha_nacimiento) = ?
                AND u.activo = 1
            `, [mes, dia]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Obtener alumno por ID
    async findById(id) {
        try {
            const [rows] = await db.query(`
        SELECT a.*, u.email, u.rol, u.nombre, u.apellido, u.telefono, u.foto_perfil
        FROM alumnos a
        LEFT JOIN usuarios u ON a.usuario_id = u.id
        WHERE a.id = ?
      `, [id]);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Buscar alumno por usuario_id
    async findByUsuarioId(usuarioId) {
        try {
            const [rows] = await db.query(
                `SELECT a.*, u.email, u.nombre, u.apellido, u.telefono, u.foto_perfil 
                 FROM alumnos a 
                 INNER JOIN usuarios u ON a.usuario_id = u.id 
                 WHERE a.usuario_id = ?`,
                [usuarioId]
            );
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    // Buscar alumnos de un profesor
    async findByProfesorId(profesorId) {
        try {
            const [rows] = await db.query(`
                SELECT DISTINCT a.*, u.email, u.activo as usuario_activo, u.nombre, u.apellido, u.telefono, u.foto_perfil
                FROM alumnos a
                INNER JOIN usuarios u ON a.usuario_id = u.id
                INNER JOIN inscripciones_curso ic ON a.id = ic.alumno_id
                INNER JOIN cursos c ON ic.curso_id = c.id
                WHERE c.profesor_id = ? AND ic.activo = 1
                ORDER BY u.apellido, u.nombre
            `, [profesorId]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Bug #4 fix: getStats ahora cuenta usuarios.activo (acceso real) en vez de alumnos.activo
    async getStats() {
        try {
            const [rows] = await db.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN u.activo = 1 THEN 1 ELSE 0 END) as activos,
                    SUM(CASE WHEN u.activo = 0 THEN 1 ELSE 0 END) as inactivos
                FROM alumnos
                INNER JOIN usuarios u ON alumnos.usuario_id = u.id
            `);
            return rows[0];
        } catch (error) {
            throw error;
        }
    },

    async create(alumnoData, connection = null) {
        try {
            const dbRef = connection || db;
            const {
                usuario_id,
                fecha_nacimiento,
                dni,
                nombre_padre,
                email_padre,
                direccion
            } = alumnoData;

            const [result] = await dbRef.query(`
        INSERT INTO alumnos (
          usuario_id, fecha_nacimiento, dni, nombre_padre, email_padre, direccion
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [usuario_id, fecha_nacimiento, dni, nombre_padre || null, email_padre, direccion]);

            return result.insertId;
        } catch (error) {
            throw error;
        }
    },

    // Actualizar alumno
    async update(id, alumnoData) {
        try {
            const fields = [];
            const values = [];

            const allowedFields = [
                'fecha_nacimiento', 'dni',
                'nombre_padre', 'email_padre', 'direccion'
            ];

            allowedFields.forEach(field => {
                if (alumnoData[field] !== undefined) {
                    fields.push(`${field} = ?`);
                    values.push(alumnoData[field]);
                }
            });

            if (fields.length === 0) return false;

            values.push(id);
            const [result] = await db.query(
                `UPDATE alumnos SET ${fields.join(', ')} WHERE id = ?`,
                values
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    },

    // Bug #2 fix: Eliminar alumno dentro de una transacción para evitar datos huérfanos
    async delete(id) {
        let connection;
        try {
            const alumno = await this.findById(id);
            if (!alumno) return false;

            connection = await db.getConnection();
            await connection.beginTransaction();

            // Eliminar registros relacionados primero (foreign key order)
            await connection.query('DELETE FROM asistencias WHERE alumno_id = ?', [id]);
            await connection.query('DELETE FROM inscripciones_curso WHERE alumno_id = ?', [id]);
            await connection.query('DELETE FROM inscripciones_evento WHERE alumno_id = ?', [id]);
            await connection.query('DELETE FROM pagos WHERE alumno_id = ?', [id]);

            const [resultAlumno] = await connection.query('DELETE FROM alumnos WHERE id = ?', [id]);
            await connection.query('DELETE FROM usuarios WHERE id = ?', [alumno.usuario_id]);

            await connection.commit();
            return resultAlumno.affectedRows > 0;
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('[AlumnosModel.delete] Error — rollback ejecutado:', error);
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    // Cambiar estado activo del alumno
    async setActivo(id, activo) {
        try {
            const alumno = await this.findById(id);
            if (!alumno) return false;

            const [result] = await db.query(
                'UPDATE usuarios SET activo = ? WHERE id = ? AND rol != "admin"',
                [activo ? 1 : 0, alumno.usuario_id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('[setActivo] Error:', error);
            throw error;
        }
    },

    // Buscar alumnos por email del padre (para descuentos familiares)
    async findByEmailPadre(emailPadre) {
        try {
            const [rows] = await db.query(`
                SELECT a.*, u.email, u.activo as usuario_activo, u.nombre, u.apellido, u.telefono, u.foto_perfil
                FROM alumnos a
                INNER JOIN usuarios u ON a.usuario_id = u.id
                WHERE a.email_padre = ?
                ORDER BY u.apellido, u.nombre
            `, [emailPadre]);
            return rows;
        } catch (error) {
            throw error;
        }
    },

    // Obtener ficha completa del alumno
    async getFichaCompleta(id) {
        try {
            // Datos del alumno
            const alumno = await this.findById(id);
            if (!alumno) return null;

            // Cursos inscritos
            const [cursos] = await db.query(`
        SELECT c.*, ic.fecha_inscripcion
        FROM cursos c
        INNER JOIN inscripciones_curso ic ON c.id = ic.curso_id
        WHERE ic.alumno_id = ? AND ic.activo = 1
      `, [id]);

            // Asistencias (últimos 3 meses)
            const [asistencias] = await db.query(`
        SELECT a.*, c.nombre as curso_nombre
        FROM asistencias a
        INNER JOIN cursos c ON a.curso_id = c.id
        WHERE a.alumno_id = ? 
        AND a.fecha >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
        ORDER BY a.fecha DESC
      `, [id]);

            // Pagos
            const [pagos] = await db.query(`
        SELECT * FROM pagos
        WHERE alumno_id = ?
        ORDER BY fecha_vencimiento DESC
      `, [id]);

            // Eventos inscritos
            const [eventos] = await db.query(`
        SELECT e.*, ie.fecha_inscripcion, ie.pago_realizado,
               ie.checklist_vestuario, ie.checklist_peinado, ie.checklist_maquillaje
        FROM eventos e
        INNER JOIN inscripciones_evento ie ON e.id = ie.evento_id
        WHERE ie.alumno_id = ?
        ORDER BY e.fecha DESC
      `, [id]);

            // Uniformes
            const [uniformes] = await db.query(`
        SELECT * FROM uniformes
        WHERE alumno_id = ?
        ORDER BY created_at DESC
      `, [id]);

            return {
                alumno,
                cursos,
                asistencias,
                pagos,
                eventos,
                uniformes
            };
        } catch (error) {
            throw error;
        }
    }
};

module.exports = AlumnosModel;
