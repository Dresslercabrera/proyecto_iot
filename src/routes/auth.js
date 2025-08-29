const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Ruta para registrar usuario
router.post('/register', authController.register);

// Ruta para iniciar sesión
router.post('/login', authController.login);

// Ruta para obtener perfil (requiere autenticación)
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;

