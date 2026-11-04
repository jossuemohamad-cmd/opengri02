/**
 * LECASU GridOps - Rotas de Ordens de Trabalho (O&M)
 */

const express = require('express');
const router = express.Router();

const workOrderController = require('../controllers/workOrderController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

const READ_ROLES = [
  'administrador',
  'gestor_operacoes',
  'gestor_comercial',
  'tecnico_campo',
  'agente_comunitario',
  'financeiro',
  'parceiro_auditor'
];

const CREATE_ROLES = [
  'administrador',
  'gestor_operacoes',
  'gestor_comercial',
  'tecnico_campo',
  'agente_comunitario'
];

const ASSIGN_ROLES = [
  'administrador',
  'gestor_operacoes'
];

const CLOSE_ROLES = [
  'administrador',
  'gestor_operacoes',
  'tecnico_campo'
];

router.get('/', authorizeRoles(READ_ROLES), workOrderController.listWorkOrders);
router.get('/:id', authorizeRoles(READ_ROLES), workOrderController.getWorkOrderById);
router.post('/', authorizeRoles(CREATE_ROLES), workOrderController.createWorkOrder);
router.patch('/:id/assign', authorizeRoles(ASSIGN_ROLES), workOrderController.assignWorkOrder);
router.patch('/:id/close', authorizeRoles(CLOSE_ROLES), workOrderController.closeWorkOrder);

module.exports = router;

