const bcrypt = require('bcryptjs');
const db = require('../../config/db');
const UsuariosModel = require('../../models/usuarios.model');
const AlumnosModel = require('../../models/alumnos.model');
const ResponsablesAlumnosModel = require('../../models/responsables-alumnos.model');
const { normalizeEmailAddress } = require('../../middlewares/validate.middleware');

const passwordIsValid = (password) => /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{9,}$/.test(password || '');

const syncPrimaryContact = async (connection, alumnoId, usuario) => {
    const nombreCompleto = [usuario.nombre, usuario.apellido].filter(Boolean).join(' ').trim() || null;
    await connection.query(
        'UPDATE alumnos SET nombre_padre = ?, email_padre = ? WHERE id = ?',
        [nombreCompleto, usuario.email || null, alumnoId]
    );
};

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

    async getCandidates(req, res) {
        try {
            const alumnoId = Number(req.params.id);
            const alumno = await AlumnosModel.findById(alumnoId);
            if (!alumno) return res.status(404).json({ success: false, message: 'Alumno no encontrado' });

            const accounts = await ResponsablesAlumnosModel.findAvailableFamilyAccounts(alumnoId);
            res.json({ success: true, data: accounts });
        } catch (error) {
            console.error('[ResponsablesAlumnosController.getCandidates]', error);
            res.status(500).json({ success: false, message: 'No se pudieron cargar las cuentas familiares' });
        }
    },

    async mergeAccounts(req, res) {
        let connection;
        try {
            const alumnoId = Number(req.params.id);
            const targetUserId = Number(req.body?.usuario_id);
            const alumno = await AlumnosModel.findById(alumnoId);
            if (!alumno) return res.status(404).json({ success: false, message: 'Alumno no encontrado' });
            if (!targetUserId) {
                return res.status(400).json({ success: false, message: 'Selecciona la cuenta que se conservara' });
            }

            const sourceUserId = Number(alumno.usuario_id);
            if (sourceUserId === targetUserId) {
                return res.status(400).json({ success: false, message: 'Esa ya es la cuenta propia de esta alumna' });
            }

            const targetUser = await UsuariosModel.findById(targetUserId);
            if (!targetUser || targetUser.rol !== 'alumno' || !targetUser.activo || !targetUser.permite_login) {
                return res.status(400).json({ success: false, message: 'La cuenta que deseas conservar no esta disponible' });
            }

            connection = await db.getConnection();
            await connection.beginTransaction();
            const transferredStudentIds = await ResponsablesAlumnosModel.mergePortalAccounts(
                sourceUserId,
                targetUserId,
                connection
            );
            if (!transferredStudentIds.includes(alumnoId)) {
                await connection.rollback();
                return res.status(409).json({ success: false, message: 'La cuenta de origen no tiene acceso a esta alumna' });
            }

            for (const transferredId of transferredStudentIds) {
                await syncPrimaryContact(connection, transferredId, targetUser);
            }

            await connection.commit();
            res.json({
                success: true,
                message: `Perfiles unificados. Desde ahora se ingresa solamente con ${targetUser.email}`,
                data: {
                    cuenta_conservada: targetUserId,
                    cuenta_deshabilitada: sourceUserId,
                    alumnos_transferidos: transferredStudentIds.length
                }
            });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('[ResponsablesAlumnosController.mergeAccounts]', error);
            res.status(500).json({ success: false, message: 'No se pudieron unificar los perfiles' });
        } finally {
            if (connection) connection.release();
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
            } else if (!usuario.activo || Number(usuario.permite_login) === 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: 'La cuenta seleccionada no puede iniciar sesion' });
            }

            const esPrincipal = data.es_principal === true || data.es_principal === 'true';
            await ResponsablesAlumnosModel.link({
                alumno_id: alumnoId,
                usuario_id: usuario.id,
                parentesco: data.parentesco,
                es_principal: esPrincipal,
                recibe_notificaciones: data.recibe_notificaciones !== false && data.recibe_notificaciones !== 'false',
                puede_ver_pagos: data.puede_ver_pagos !== false && data.puede_ver_pagos !== 'false',
                puede_confirmar_asistencia: data.puede_confirmar_asistencia !== false && data.puede_confirmar_asistencia !== 'false'
            }, connection);

            // Algunos flujos historicos todavia consultan estos campos directamente.
            if (esPrincipal) await syncPrimaryContact(connection, alumnoId, usuario);

            await connection.commit();
            res.status(creado ? 201 : 200).json({
                success: true,
                message: creado
                    ? 'Cuenta de responsable creada y vinculada'
                    : `Cuenta de ${usuario.nombre || usuario.email} vinculada correctamente`,
                data: { usuario_id: usuario.id, creado }
            });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('[ResponsablesAlumnosController.createOrLink]', error);
            const message = error.code === 'ER_NO_SUCH_TABLE'
                ? 'El módulo familiar todavía no está habilitado en la base de datos'
                : 'No se pudo vincular la cuenta';
            res.status(500).json({ success: false, message });
        } finally {
            if (connection) connection.release();
        }
    },

    async update(req, res) {
        let connection;
        try {
            const alumnoId = Number(req.params.id);
            const usuarioId = Number(req.params.usuarioId);
            const data = req.body || {};
            connection = await db.getConnection();
            await connection.beginTransaction();

            const updated = await ResponsablesAlumnosModel.updateLink(
                alumnoId,
                usuarioId,
                data,
                connection
            );
            if (!updated) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'Vinculo no encontrado o sin cambios' });
            }

            if (data.es_principal === true || data.es_principal === 'true') {
                const usuario = await UsuariosModel.findById(usuarioId);
                if (usuario) await syncPrimaryContact(connection, alumnoId, usuario);
            }

            await connection.commit();
            res.json({ success: true, message: 'Permisos del responsable actualizados' });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('[ResponsablesAlumnosController.update]', error);
            res.status(500).json({ success: false, message: 'No se pudieron actualizar los permisos' });
        } finally {
            if (connection) connection.release();
        }
    },

    async remove(req, res) {
        let connection;
        try {
            const alumnoId = Number(req.params.id);
            const usuarioId = Number(req.params.usuarioId);
            const responsables = await ResponsablesAlumnosModel.findResponsablesByAlumnoId(alumnoId);
            if (responsables.length <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'El alumno debe conservar al menos una cuenta con acceso'
                });
            }
            const responsableRemovido = responsables.find((item) => Number(item.usuario_id) === usuarioId);
            connection = await db.getConnection();
            await connection.beginTransaction();
            const removed = await ResponsablesAlumnosModel.unlink(alumnoId, usuarioId, connection);
            if (!removed) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: 'Vínculo no encontrado' });
            }

            if (Number(responsableRemovido?.es_principal) === 1) {
                const siguientePrincipal = responsables.find((item) => Number(item.usuario_id) !== usuarioId);
                await connection.query(
                    'UPDATE responsables_alumnos SET es_principal = 1 WHERE alumno_id = ? AND usuario_id = ?',
                    [alumnoId, siguientePrincipal.usuario_id]
                );
                await syncPrimaryContact(connection, alumnoId, siguientePrincipal);
            }

            await connection.commit();
            res.json({ success: true, message: 'Acceso del responsable eliminado. La cuenta no fue borrada.' });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('[ResponsablesAlumnosController.remove]', error);
            res.status(500).json({ success: false, message: 'No se pudo eliminar el acceso' });
        } finally {
            if (connection) connection.release();
        }
    }
};

module.exports = ResponsablesAlumnosController;
