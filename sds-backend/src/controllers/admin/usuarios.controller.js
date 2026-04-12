const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const UsuariosModel = require('../../models/usuarios.model');

const UsuariosController = {
    // Obtener todos los profesores
    async getProfesores(req, res) {
        try {
            const [rows] = await db.query("SELECT id, email, nombre, apellido, activo FROM usuarios WHERE rol = 'profesor' AND activo = 1");
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
            const { nombre, apellido, email, password } = req.body;

            if (!email || !password || !nombre) {
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
                        'UPDATE usuarios SET password_hash = ?, nombre = ?, apellido = ?, rol = ?, activo = 1 WHERE id = ?',
                        [password_hash, nombre, apellido, 'profesor', existingUser.id]
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
                'INSERT INTO usuarios (email, password_hash, nombre, apellido, rol, activo) VALUES (?, ?, ?, ?, ?, 1)',
                [email, password_hash, nombre, apellido, 'profesor']
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

            let query = 'UPDATE usuarios SET nombre = ?, apellido = ?, email = ?';
            let params = [nombre, apellido, email];

            if (password) {
                const password_hash = await bcrypt.hash(password, 10);
                query += ', password_hash = ?';
                params.push(password_hash);
            }

            query += ' WHERE id = ? AND rol = "profesor"';
            params.push(id);

            await db.query(query, params);

            res.json({
                success: true,
                message: 'Profesor actualizado correctamente'
            });
        } catch (error) {
            console.error('Error en updateProfesor:', error);
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
            await db.query('UPDATE usuarios SET activo = 0 WHERE id = ? AND rol != "admin"', [id]);

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
