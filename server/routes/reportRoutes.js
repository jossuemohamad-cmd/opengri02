/**
 * LECASU GridOps - Rotas de Relatórios, Indicadores e Exportações
 */

const express = require('express');
const router = express.Router();

const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// Perfis autorizados a visualizar relatórios e indicadores consolidados
const REPORT_ROLES = [
  'administrador',
  'gestor_operacoes',
  'gestor_comercial',
  'financeiro',
  'parceiro_auditor'
];

router.get('/dashboard', authorizeRoles(REPORT_ROLES), reportController.getDashboardMetrics);
router.get('/executive', authorizeRoles(REPORT_ROLES), reportController.getExecutiveReport);
router.get('/export/csv', authorizeRoles(REPORT_ROLES), reportController.exportCSV);

module.exports = router;

