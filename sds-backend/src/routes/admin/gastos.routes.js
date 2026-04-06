const express = require('express');
const router = express.Router();
const GastosController = require('../../controllers/admin/gastos.controller');
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');
const upload = require('../../middlewares/upload.middleware');

// Todas las rutas requieren ser admin
router.use(verifyToken, isAdmin);

router.get('/', GastosController.getAll);
router.post('/', upload.single('comprobante'), GastosController.create);
router.put('/:id', upload.single('comprobante'), GastosController.update);
router.delete('/:id', GastosController.delete);

// Ver archivo comprobante de un gasto
router.get('/:id/archivo-comprobante', GastosController.verComprobante);

module.exports = router;
