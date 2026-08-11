const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const UsuariosModel = require('../../models/usuarios.model');
const AlumnosModel = require('../../models/alumnos.model');
const ResponsablesAlumnosModel = require('../../models/responsables-alumnos.model');
const { normalizeEmailAddress } = require('../../middlewares/validate.middleware');

const passwordIsValid = (password) => /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{9,}$/.test(password || '');

const ResponsablesAlumnosController = {
    async getAll(req, res) {
        try {
            const alumno = await AlumnosModel.findById(req.params.id);
            if (!alumno) return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
            const responsables = await ResponsablesAlumnosModel.findResponsablesByAlumnoId(req.params.id);
            res.json({ success: true, data: responsables });
        } catch (error) {
            console.error('[ResponsablesAlumnosController.getAll]', error);
            res.status(500).json({ success: false, message: 'No se pudieron cargar los responsables' });
        }
    },

    async createOrLink(req, res) {
        let connection;
        try {
            const alumnoId = Number(req.params.id);
            const alumno = await AlumnosModel.findById(alumnoId);
            if (!alumno) return res.status(404).json({ success: false, message: 'Alumno no encontrado' });

            const data = req.body || {};
            let usuario = null;
            if (data.usuario_id) usuario = await UsuariosModel.findById(Number(data.usuario_id));
            if (!usuario && data.email) usuario = await UsuariosModel.findByEmailIncludeInactive(normalizeEmailAddress(data.email));

            connection = await db.getConnection();
            await connection.beginTransaction();

            let creado = false;
            if (!usuario) {
                const email = normalizeEmailAddress(data.email);
                if (!email || !data.nombre || !data.apellido || !data.password) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'Para crear una cuenta se requiere nombre, apellido, email y contraseña'
                    });
                }
                if (!passwordIsValid(data.password)) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        message: 'La contraseña debe tener 9 caracteres, una mayúscula, un número y un símbolo.'
                    });
                }

                usuario = {
                    id: await UsuariosModel.create({
                        email,
                        password_hash: await bcrypt.hash(data.password, 10),
                        rol: 'alumno',
                        nombre: data.nombre.trim(),
                        apellido: data.apellido.trim(),
                        telefono: data.telefono || null
                    }, connection),
                    email,
                    nombre: data.nombre.trim(),
                    apellido: data.apellido.trim()
                };
                creado = true;
            } else if (usuario.rol !== 'alumno') {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'Solo se pueden asociar cuentas de familias/alumnos' });
            } else if (!usuario.activo) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'La cuenta seleccionada está inactiva' });
            }

            await ResponsablesAlumnosModel.link({
                alumno_id: alumnoId,
                usuario_id: usuario.id,
                parentesco: data.parentesco,
                es_principal: data.es_principal === true || data.es_principal === 'true',
                recibe_notificaciones: data.recibe_notificaciones !== false && data.recibe_notificaciones !== 'false',
                puede_ver_pagos: data.puede_ver_pagos !== false && data.puede_ver_pagos !== 'false',
                puede_confirmar_asistencia: data.puede_confirmar_asistencia !== false && data.puede_confirmar_asistencia !== 'false'
            }, connection);

            await connection.commit();
            res.status(creado ? 201 : 200).json({
                success: true,
                message: creado ? 'Cuenta de responsable creada y vinculada' : 'Cuenta vinculada al alumno',
                data: { usuario_id: usuario.id, creado }
            });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('[ResponsablesAlumnosController.createOrLink]', error);
            res.status(500).json({ success: false, message: 'No se pudo vincular la cuenta' });
        } finally {
            if (connection) connection.release();
        }
    },

    async update(req, res) {
        try {
            const updated = await ResponsablesAlumnosModel.updateLink(
                Number(req.params.id),
                Number(req.params.usuarioId),
                req.body || {}
            );
            if (!updated) return res.status(404).json({ success: false, message: 'Vínculo no encontrado o sin cambios' });
            res.json({ success: true, message: 'Permisos del responsable actualizados' });
        } catch (error) {
            console.error('[ResponsablesAlumnosController.update]', error);
            res.status(500).json({ success: false, message: 'No se pudieron actualizar los permisos' });
        }
    },

    async remove(req, res) {
        try {
            const alumnoId = Number(req.params.id);
            const responsables = await ResponsablesAlumnosModel.findResponsablesByAlumnoId(alumnoId);
            if (responsables.length <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'El alumno debe conservar al menos una cuenta con acceso'
                });
            }
            const removed = await ResponsablesAlumnosModel.unlink(alumnoId, Number(req.params.usuarioId));
            if (!removed) return res.status(404).json({ success: false, message: 'Vínculo no encontrado' });
            res.json({ success: true, message: 'Acceso del responsable eliminado. La cuenta no fue borrada.' });
        } catch (error) {
            console.error('[ResponsablesAlumnosController.remove]', error);
            res.status(500).json({ success: false, message: 'No se pudo eliminar el acceso' });
        }
    }
};

module.exports = ResponsablesAlumnosController;
