/**
 * LECASU GridOps - Rotas de Auditoria (/api/audit-logs)
 */

const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Acesso permitido a Administrador, Gestor de Operações e Parceiro Auditor
router.get(
  '/',
  authenticateToken,
  authorizeRoles(['administrador', 'gestor_operacoes', 'parceiro_auditor']),
  auditController.listAuditLogs
);

module.exports = router;

