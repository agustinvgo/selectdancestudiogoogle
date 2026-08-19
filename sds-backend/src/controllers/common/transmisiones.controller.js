const db = require('../../config/db');
const jwt = require('jsonwebtoken');
const svc = require('../../services/transmision.service');
const cameraConnectionService = require('../../services/camera-connection.service');
const ResponsablesAlumnosModel = require('../../models/responsables-alumnos.model');

// GET /api/transmisiones/authorize — usado por nginx (auth_request) antes de servir el video.
// Devuelve 200 si quien pide es admin, o un alumno con una clase suya programada ahora.
// 401/403 en cualquier otro caso. NO devuelve cuerpo (nginx solo mira el status).
exports.authorizeRead = async (req, res) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).end();

        let user;
        try { user = jwt.verify(token, process.env.JWT_SECRET); } catch { return res.status(401).end(); }

        if (user.rol === 'admin') return res.status(200).end();
        if (user.rol !== 'alumno') return res.status(403).end();

        // ¿El alumno tiene algún curso programado ahora (horario o manual)?
        const [cursos] = await db.query(
            `SELECT DISTINCT c.* FROM cursos c
             JOIN inscripciones_curso ic ON ic.curso_id = c.id
             JOIN alumnos a ON a.id = ic.alumno_id
             LEFT JOIN responsables_alumnos ra ON ra.alumno_id = a.id
             WHERE (a.usuario_id = ? OR ra.usuario_id = ?) AND ic.activo = 1 AND c.activo = 1`,
            [user.id, user.id]
        );
        for (const c of cursos) {
            if (svc.dentroDeHorario(c) || await svc.getManual(c.id)) {
                return res.status(200).end();
            }
        }
        return res.status(403).end();
    } catch (error) {
        console.error('[authorizeRead]', error);
        return res.status(403).end();
    }
};

// GET /api/transmisiones/en-vivo — para el alumno logueado (padre)
// Devuelve la clase en vivo de su hijo, si la hay.
exports.enVivoAlumno = async (req, res) => {
    try {
        const alumnoId = Number(req.query.alumno_id);
        if (alumnoId && !(await ResponsablesAlumnosModel.canAccessAlumno(req.user.id, alumnoId))) {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }
        const [cursos] = await db.query(
            `SELECT DISTINCT c.* FROM cursos c
             JOIN inscripciones_curso ic ON ic.curso_id = c.id
             JOIN alumnos a ON a.id = ic.alumno_id
             LEFT JOIN responsables_alumnos ra ON ra.alumno_id = a.id
             WHERE ${alumnoId ? 'a.id = ?' : '(a.usuario_id = ? OR ra.usuario_id = ?)'}
               AND ic.activo = 1 AND c.activo = 1`,
            alumnoId ? [alumnoId] : [req.user.id, req.user.id]
        );

        let esperando = null;
        for (const c of cursos) {
            const st = await svc.estadoCurso(c);
            if (st.estado === 'en_vivo') {
                return res.json({
                    success: true,
                    estado: 'en_vivo',
                    curso: { id: c.id, nombre: c.nombre },
                    hlsUrl: st.hlsUrl,
                });
            }
            if (st.estado === 'esperando' && !esperando) {
                esperando = { id: c.id, nombre: c.nombre };
            }
        }
        if (esperando) {
            return res.json({ success: true, estado: 'esperando', curso: esperando });
        }
        return res.json({ success: true, estado: 'offline' });
    } catch (error) {
        console.error('[enVivoAlumno]', error);
        res.status(500).json({ success: false, message: 'Error al consultar transmisión' });
    }
};

// GET /api/transmisiones — panel admin: todos los cursos con su estado
exports.listAdmin = async (req, res) => {
    try {
        const [cursos] = await db.query(
            'SELECT id, nombre, dia_semana, hora_inicio, hora_fin FROM cursos WHERE activo = 1 ORDER BY nombre'
        );
        const data = [];
        for (const c of cursos) {
            const st = await svc.estadoCurso(c);
            data.push({
                id: c.id,
                nombre: c.nombre,
                dia_semana: c.dia_semana,
                hora_inicio: c.hora_inicio,
                hora_fin: c.hora_fin,
                estado: st.estado,
                manual: st.manual,
                streamKey: st.streamKey,
                rtmpUrl: st.rtmpUrl,
                hlsUrl: st.hlsUrl,
                playerUrl: st.playerUrl,
            });
        }
        res.json({ success: true, data });
    } catch (error) {
        console.error('[listAdmin transmisiones]', error);
        res.status(500).json({ success: false, message: 'Error al listar transmisiones' });
    }
};

// POST /api/transmisiones/:cursoId/iniciar — override manual (admin)
exports.iniciar = async (req, res) => {
    try {
        await svc.setManual(parseInt(req.params.cursoId), true);
        res.json({ success: true, message: 'Transmisión marcada como EN VIVO' });
    } catch (error) {
        console.error('[iniciar transmision]', error);
        res.status(500).json({ success: false, message: 'Error al iniciar transmisión' });
    }
};

// POST /api/transmisiones/:cursoId/detener — quitar override manual (admin)
exports.detener = async (req, res) => {
    try {
        await svc.setManual(parseInt(req.params.cursoId), false);
        res.json({ success: true, message: 'Transmisión detenida' });
    } catch (error) {
        console.error('[detener transmision]', error);
        res.status(500).json({ success: false, message: 'Error al detener transmisión' });
    }
};

// GET /api/transmisiones/camara — estado de la conexión desde donde se abrió
// el panel. Nunca devuelve la URL RTSP ni las credenciales de la cámara.
exports.estadoCamara = async (req, res) => {
    try {
        const data = await cameraConnectionService.getStatus(req.ip);
        res.json({ success: true, data });
    } catch (error) {
        console.error('[estado camara]', error);
        res.status(error.statusCode || 500).json({
            success: false,
            message: 'No se pudo consultar la conexión de la cámara',
        });
    }
};

// POST /api/transmisiones/camara/reconectar — toma exclusivamente la IP
// pública de esta petición. No acepta una IP elegida por el usuario para evitar
// que el endpoint pueda usarse para consultar otros servidores.
exports.reconectarCamara = async (req, res) => {
    try {
        const data = await cameraConnectionService.reconnectFromClientIp(req.ip, req.user.id);
        res.json({
            success: true,
            message: 'Cámaras conectadas correctamente desde este Wi-Fi',
            data,
        });
    } catch (error) {
        console.error(`[reconectar camara] ${error.code || 'ERROR'}: ${error.message}`);
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'No se pudieron reconectar las cámaras',
            code: error.code || 'CAMERA_ERROR',
        });
    }
};
