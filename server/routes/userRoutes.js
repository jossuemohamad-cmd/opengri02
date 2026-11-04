/**
 * LECASU GridOps - Rotas de Gestão de Utilizadores (/api/users)
 * 
 * Acesso estritamente restrito a utilizadores com perfil 'administrador'.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Todas as rotas de utilizadores exigem autenticação prévia e perfil de administrador
router.use(authenticateToken);
router.use(authorizeRoles('administrador'));

// Operações CRUD de utilizadores
router.get('/', userController.listUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.patch('/:id/status', userController.updateUserStatus);

module.exports = router;

