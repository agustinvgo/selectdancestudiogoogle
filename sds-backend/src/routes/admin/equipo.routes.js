const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const EquipoController = require('../../controllers/admin/equipo.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');
const { cacheMiddleware, invalidateCache } = require('../../middlewares/cache.middleware');

// Crear directorio si no existe
// Esta ruta parte desde src/routes/admin. Los uploads persistentes y públicos
// están en la raíz del backend, no dentro de src/.
const uploadDir = path.join(__dirname, '../../../uploads/equipo');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer: guardar directamente en disco en uploads/equipo/
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, `equipo-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// Rutas Públicas
router.get('/', cacheMiddleware('equipo-list', 300), EquipoController.getAll);

// Rutas Protegidas (Solo Admin)
router.post('/', verifyToken, isAdmin, upload.single('foto'), invalidateCache('equipo-list'), EquipoController.create);
router.put('/:id', verifyToken, isAdmin, upload.single('foto'), invalidateCache('equipo-list'), EquipoController.update);
router.delete('/:id', verifyToken, isAdmin, invalidateCache('equipo-list'), EquipoController.delete);

module.exports = router;
