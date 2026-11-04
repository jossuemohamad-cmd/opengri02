/**
 * LECASU GridOps - Rotas de Faturação e Pagamentos
 */

const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

const READ_ROLES = [
  'administrador',
  'gestor_operacoes',
  'gestor_comercial',
  'financeiro',
  'parceiro_auditor',
  'agente_comunitario'
];

const WRITE_ROLES = [
  'administrador',
  'gestor_comercial',
  'financeiro',
  'agente_comunitario'
];

const RECONCILE_ROLES = [
  'administrador',
  'financeiro',
  'gestor_comercial'
];

router.get('/', authorizeRoles(READ_ROLES), paymentController.listPayments);
router.get('/:id', authorizeRoles(READ_ROLES), paymentController.getPaymentById);
router.get('/client/:clientId/summary', authorizeRoles(READ_ROLES), paymentController.getClientFinancialSummary);
router.post('/', authorizeRoles(WRITE_ROLES), paymentController.createPayment);
router.post('/:id/reconcile', authorizeRoles(RECONCILE_ROLES), paymentController.reconcilePayment);

module.exports = router;

