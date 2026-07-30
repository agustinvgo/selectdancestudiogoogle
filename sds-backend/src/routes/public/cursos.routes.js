const express = require('express');
const router = express.Router();
const CursosModel = require('../../models/cursos.model');

// GET /api/public/cursos — Lista cursos activos sin autenticación
router.get('/', async (req, res) => {
    try {
        const cursos = await CursosModel.findPublic();
        res.json({ success: true, data: cursos });
    } catch (error) {
        console.error('Error en cursos públicos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener cursos' });
    }
});

module.exports = router;
