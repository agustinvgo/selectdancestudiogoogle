const express = require('express');
const multer = require('multer');
const EquipoController = require('../../controllers/admin/equipo.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');
const { cacheMiddleware, invalidateCache } = require('../../middlewares/cache.middleware');
const optimizeImage = require('../../middlewares/imageOptimization.middleware');

const router = express.Router();
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) return cb(null, true);
        cb(new Error('Solo se permiten imágenes JPG, PNG o WebP.'));
    },
    limits: { fileSize: 10 * 1024 * 1024 },
});

const optimizeTeamImage = optimizeImage('../../uploads/equipo', 'equipo', 1600);

const uploadTeamPhoto = (req, res, next) => {
    upload.single('foto')(req, res, (error) => {
        if (error) {
            const message = error.code === 'LIMIT_FILE_SIZE'
                ? 'La imagen supera el máximo permitido de 10 MB.'
                : error.message;
            return res.status(400).json({ success: false, message });
        }
        return optimizeTeamImage(req, res, next);
    });
};

// Ruta pública: equipo visible en el sitio web.
router.get('/', cacheMiddleware('equipo-list', 300), EquipoController.getAll);

// Rutas protegidas: solo administradores.
router.post('/', verifyToken, isAdmin, uploadTeamPhoto, invalidateCache('equipo-list'), EquipoController.create);
router.put('/:id', verifyToken, isAdmin, uploadTeamPhoto, invalidateCache('equipo-list'), EquipoController.update);
router.delete('/:id', verifyToken, isAdmin, invalidateCache('equipo-list'), EquipoController.delete);

module.exports = router;
