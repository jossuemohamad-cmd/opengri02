/**
 * LECASU GridOps - Rotas de Contratos
 */

const express = require('express');
const router = express.Router();

const contractController = require('../controllers/contractController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Autenticação obrigatória
router.use(authenticateToken);

const READ_ROLES = [
  'administrador',
  'gestor_operacoes',
  'gestor_comercial',
  'financeiro',
  'parceiro_auditor'
];

const WRITE_ROLES = [
  'administrador',
  'gestor_comercial'
];

router.get('/', authorizeRoles(READ_ROLES), contractController.listContracts);
router.get('/:id', authorizeRoles(READ_ROLES), contractController.getContractById);
router.post('/', authorizeRoles(WRITE_ROLES), contractController.createContract);
router.put('/:id', authorizeRoles(WRITE_ROLES), contractController.updateContract);

module.exports = router;

