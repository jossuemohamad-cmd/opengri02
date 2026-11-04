/**
 * LECASU GridOps - Rotas de Contadores (Meters)
 */

const express = require('express');
const router = express.Router();

const meterController = require('../controllers/meterController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Autenticação obrigatória
router.use(authenticateToken);

const READ_ROLES = [
  'administrador',
  'gestor_operacoes',
  'gestor_comercial',
  'tecnico_campo',
  'financeiro',
  'parceiro_auditor'
];

const WRITE_ROLES = [
  'administrador',
  'gestor_operacoes',
  'gestor_comercial',
  'tecnico_campo'
];

router.get('/', authorizeRoles(READ_ROLES), meterController.listMeters);
router.get('/:id', authorizeRoles(READ_ROLES), meterController.getMeterById);
router.post('/', authorizeRoles(WRITE_ROLES), meterController.createMeter);
router.post('/:id/install', authorizeRoles(WRITE_ROLES), meterController.installMeter);
router.put('/:id', authorizeRoles(WRITE_ROLES), meterController.updateMeter);

module.exports = router;

