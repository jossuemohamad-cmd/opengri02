/**
 * LECASU GridOps - Rotas de Tarifas
 */

const express = require('express');
const router = express.Router();

const tariffController = require('../controllers/tariffController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

const READ_ROLES = [
  'administrador',
  'gestor_operacoes',
  'gestor_comercial',
  'financeiro',
  'parceiro_auditor',
  'tecnico_campo',
  'agente_comunitario'
];

const WRITE_ROLES = [
  'administrador',
  'gestor_comercial'
];

router.get('/', authorizeRoles(READ_ROLES), tariffController.listTariffs);
router.get('/:id', authorizeRoles(READ_ROLES), tariffController.getTariffById);
router.post('/', authorizeRoles(WRITE_ROLES), tariffController.createTariff);
router.put('/:id', authorizeRoles(WRITE_ROLES), tariffController.updateTariff);

module.exports = router;

