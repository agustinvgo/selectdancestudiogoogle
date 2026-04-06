/**
 * @file auth.routes.js
 * @description Define todas las rutas relacionadas con la autenticación de usuarios.
 * Intercepta peticiones HTTP y las despacha a los métodos del `auth.controller`.
 */
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Rutas públicas
router.post('/login', AuthController.login);
router.post('/register', verifyToken, AuthController.register); // Solo usuarios autenticados pueden registrar
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Rutas protegidas
router.get('/me', verifyToken, AuthController.me);

module.exports = router;
