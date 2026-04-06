const express = require('express');
const router = express.Router();
const db = require('../../config/db');

// GET /api/public/cursos — Lista cursos activos sin autenticación
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.*,
            c.dia_semana as horario_dia,
            c.hora_inicio as horario_hora,
            TIMESTAMPDIFF(MINUTE, c.hora_inicio, c.hora_fin) as duracion_minutos,
            (SELECT COUNT(*) FROM inscripciones_curso ic
             WHERE ic.curso_id = c.id AND ic.activo = 1) as alumnos_inscritos,
            u.nombre as nombre_profesor,
            u.apellido as apellido_profesor
            FROM cursos c
            LEFT JOIN usuarios u ON c.profesor_id = u.id
            WHERE c.activo = 1
            ORDER BY c.nombre
        `);
        res.json({ success: true, data: rows });
    } catch (error) {
        console.error('Error en cursos públicos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener cursos' });
    }
});

module.exports = router;
