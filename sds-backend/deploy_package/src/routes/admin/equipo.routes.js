const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const EquipoController = require('../../controllers/admin/equipo.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');
const { cacheMiddleware, invalidateCache } = require('../../middlewares/cache.middleware');

// Configuración de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // Asegúrate de que esta carpeta exista
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // Nombre único
    }
});

const upload = multer({ storage: storage });

// Rutas Públicas
router.get('/', cacheMiddleware('equipo-list', 300), EquipoController.getAll);

// Rutas Protegidas (Solo Admin)
router.post('/', verifyToken, isAdmin, upload.single('foto'), invalidateCache('equipo-list'), EquipoController.create);
router.put('/:id', verifyToken, isAdmin, upload.single('foto'), invalidateCache('equipo-list'), EquipoController.update);
router.delete('/:id', verifyToken, isAdmin, invalidateCache('equipo-list'), EquipoController.delete);

module.exports = router;
