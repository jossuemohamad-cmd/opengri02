/**
 * LECASU GridOps - Rotas de Operações de Sistema (/api/system)
 */

const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

// POST /api/system/reset-demo
router.post('/reset-demo', systemController.resetDemoData);

module.exports = router;

