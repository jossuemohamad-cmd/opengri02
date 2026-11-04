/**
 * LECASU GridOps - Rotas de Autenticação (/api/auth)
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Rota pública de login
router.post('/login', authController.login);

// Rotas protegidas por token JWT
router.get('/me', authenticateToken, authController.me);
router.post('/refresh', authenticateToken, authController.refresh);

module.exports = router;

