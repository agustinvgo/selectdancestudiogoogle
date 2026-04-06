const express = require('express');
const router = express.Router();
const StoreController = require('../../controllers/public/store.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');
const productUpload = require('../../middlewares/productUpload.middleware');

// All routes require authentication
router.use(verifyToken);

// Read: any authenticated user can view products
router.get('/productos', StoreController.getProductos);

// Mutations: admin only
router.post('/productos', isAdmin, productUpload.single('imagen'), StoreController.createProducto);
router.put('/productos/:id', isAdmin, productUpload.single('imagen'), StoreController.updateProducto);
router.delete('/productos/:id', isAdmin, StoreController.deleteProducto);

// Ventas: admin only
router.post('/venta-rapida', isAdmin, StoreController.registrarVentaRapida);

module.exports = router;
