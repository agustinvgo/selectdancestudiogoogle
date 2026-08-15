const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const UsuariosModel = require('../../models/usuarios.model');
const { normalizeEmailAddress } = require('../../middlewares/validate.middleware');

const hasPlaceholderPassword = (passwordHash) => (
    !passwordHash
    || passwordHash === 'dummy_hash'
    || passwordHash === '$2b$10$X7.X.X.X.X.X.X.X.X.X.X'
);

const UsuariosController = {
    // Obtener todos los profesores
    async getProfesores(req, res) {
        try {
            const [rows] = await db.query(`
                SELECT id, email, nombre, apellido, activo,
                    CASE
                        WHEN password_hash IS NULL
                          OR password_hash = 'dummy_hash'
                          OR password_hash = '$2b$10$X7.X.X.X.X.X.X.X.X.X.X'
                        THEN 1 ELSE 0
                    END AS requiere_configurar_acceso
                FROM usuarios
                WHERE rol = 'profesor'
                  AND activo = 1
                  AND COALESCE(permite_login, 1) = 1
            `);
            res.json({
                success: true,
                data: rows,
                message: 'Profesores obtenidos correctamente'
            });
        } catch (error) {
            console.error('Error en getProfesores:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener profesores',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Crear profesor
    async createProfesor(req, res) {
        try {
            const { nombre, apellido, password } = req.body;
            const nombreNormalizado = typeof nombre === 'string' ? nombre.trim() : '';
            const apellidoNormalizado = typeof apellido === 'string' ? apellido.trim() : '';
            const email = normalizeEmailAddress(req.body.email);

            if (!email || !password || !nombreNormalizado) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos'
                });
            }

            // Verificar si el email ya existe (activo o inactivo)
            const existingUser = await UsuariosModel.findByEmailIncludeInactive(email);

            if (existingUser) {
                if (existingUser.activo === 1) {
                    return res.status(400).json({
                        success: false,
                        message: 'El email ya está registrado'
                    });
                } else {
                    // Si existe pero está inactivo, lo reactivamos
                    const password_hash = await bcrypt.hash(password, 10);
                    await db.query(
                        'UPDATE usuarios SET password_hash = ?, nombre = ?, apellido = ?, rol = ?, activo = 1, permite_login = 1 WHERE id = ?',
                        [password_hash, nombreNormalizado, apellidoNormalizado, 'profesor', existingUser.id]
                    );

                    return res.status(201).json({
                        success: true,
                        message: 'Profesor reactivado exitosamente',
                        data: { id: existingUser.id }
                    });
                }
            }

            const password_hash = await bcrypt.hash(password, 10);

            // Insertar usuario
            const [result] = await db.query(
                'INSERT INTO usuarios (email, password_hash, nombre, apellido, rol, activo, primer_login) VALUES (?, ?, ?, ?, ?, 1, 1)',
                [email, password_hash, nombreNormalizado, apellidoNormalizado, 'profesor']
            );

            res.status(201).json({
                success: true,
                message: 'Profesor creado exitosamente',
                data: { id: result.insertId }
            });
        } catch (error) {
            console.error('Error en createProfesor:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear profesor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Actualizar profesor
    async updateProfesor(req, res) {
        try {
            const { id } = req.params;
            const { nombre, apellido, email, password } = req.body;
            const profesorId = Number.parseInt(id, 10);
            const nombreNormalizado = typeof nombre === 'string' ? nombre.trim() : '';
            const apellidoNormalizado = typeof apellido === 'string' ? apellido.trim() : '';
            const emailNormalizado = normalizeEmailAddress(email) || '';

            // Fix #9: validar inputs antes de actualizar
            if (!Number.isInteger(profesorId) || profesorId <= 0) {
                return res.status(400).json({ success: false, message: 'Profesor inválido' });
            }
            if (!nombreNormalizado) {
                return res.status(400).json({ success: false, message: 'El nombre es requerido' });
            }
            if (!emailNormalizado || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
                return res.status(400).json({ success: false, message: 'Email inválido' });
            }

            const [profesores] = await db.query(
                'SELECT password_hash FROM usuarios WHERE id = ? AND rol = "profesor" LIMIT 1',
                [profesorId]
            );
            if (profesores.length === 0) {
                return res.status(404).json({ success: false, message: 'Profesor no encontrado' });
            }
            if (hasPlaceholderPassword(profesores[0].password_hash) && !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Esta cuenta aún no tiene acceso. Debes definir una contraseña.'
                });
            }

            const [emailExistente] = await db.query(
                'SELECT id FROM usuarios WHERE email = ? AND id <> ? LIMIT 1',
                [emailNormalizado, profesorId]
            );
            if (emailExistente.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'El email ya está registrado por otro usuario'
                });
            }

            let query = 'UPDATE usuarios SET nombre = ?, apellido = ?, email = ?';
            let params = [nombreNormalizado, apellidoNormalizado, emailNormalizado];

            if (password) {
                const password_hash = await bcrypt.hash(password, 10);
                query += ', password_hash = ?';
                params.push(password_hash);
            }

            query += ' WHERE id = ? AND rol = "profesor"';
            params.push(profesorId);

            // Fix #4: verificar si se actualizó algo
            const [result] = await db.query(query, params);
            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Profesor no encontrado' });
            }

            res.json({
                success: true,
                message: 'Profesor actualizado correctamente'
            });
        } catch (error) {
            console.error('Error en updateProfesor:', error);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    message: 'El email ya está registrado por otro usuario'
                });
            }
            res.status(500).json({
                success: false,
                message: 'Error al actualizar profesor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    // Eliminar (desactivar) profesor
    async deleteProfesor(req, res) {
        try {
            const { id } = req.params;
            const [result] = await db.query('UPDATE usuarios SET activo = 0 WHERE id = ? AND rol != "admin"', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Profesor no encontrado' });
            }

            res.json({
                success: true,
                message: 'Profesor eliminado correctamente'
            });
        } catch (error) {
            console.error('Error en deleteProfesor:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar profesor',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = UsuariosController;
