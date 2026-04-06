const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const EquipoController = require('../../controllers/admin/equipo.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');
const { cacheMiddleware, invalidateCache } = require('../../middlewares/cache.middleware');

// Configuración de Multer optimizada para Sharp (en memoria)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middleware de optimización específico para el equipo
const optimizeImage = require('../../middlewares/imageOptimization.middleware');
const compressEquipmentImage = optimizeImage('../../uploads/equipo', 'equipo', 800, 800);

// Rutas Públicas
router.get('/', cacheMiddleware('equipo-list', 300), EquipoController.getAll);

// Rutas Protegidas (Solo Admin)
router.post('/', verifyToken, isAdmin, upload.single('foto'), compressEquipmentImage, invalidateCache('equipo-list'), EquipoController.create);
router.put('/:id', verifyToken, isAdmin, upload.single('foto'), compressEquipmentImage, invalidateCache('equipo-list'), EquipoController.update);
router.delete('/:id', verifyToken, isAdmin, invalidateCache('equipo-list'), EquipoController.delete);

module.exports = router;
