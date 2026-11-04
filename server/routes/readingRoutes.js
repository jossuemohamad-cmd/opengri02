/**
 * LECASU GridOps - Rotas de Leituras e Consumos
 */

const express = require('express');
const router = express.Router();

const readingController = require('../controllers/readingController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Autenticação JWT obrigatória em todas as rotas
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

const WRITE_ROLES = [
  'administrador',
  'gestor_operacoes',
  'gestor_comercial',
  'tecnico_campo',
  'agente_comunitario'
];

router.get('/', authorizeRoles(READ_ROLES), readingController.listReadings);
router.get('/:id', authorizeRoles(READ_ROLES), readingController.getReadingById);
router.post('/', authorizeRoles(WRITE_ROLES), readingController.createReading);
router.post('/import-csv', authorizeRoles(WRITE_ROLES), readingController.importReadingsCSV);

module.exports = router;

