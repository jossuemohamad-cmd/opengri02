/**
 * LECASU GridOps - Rotas de Clientes e Ligações
 */

const express = require('express');
const router = express.Router();

const clientController = require('../controllers/clientController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Todas as rotas de clientes requerem autenticação JWT
router.use(authenticateToken);

// Perfis de leitura
const READ_ROLES = [
  'administrador',
  'gestor_operacoes',
  'gestor_comercial',
  'tecnico_campo',
  'agente_comunitario',
  'financeiro',
  'parceiro_auditor'
];

// Perfis para criação (inclui agentes comunitários no terreno)
const CREATE_ROLES = [
  'administrador',
  'gestor_comercial',
  'agente_comunitario'
];

// Perfis para edição estrutural e suspensão/desligamento
const UPDATE_ROLES = [
  'administrador',
  'gestor_comercial'
];

// 1. Endpoint GIS de clientes
router.get('/gis', authorizeRoles(READ_ROLES), clientController.getClientsGIS);

// 2. Listagem geral com filtros e paginação
router.get('/', authorizeRoles(READ_ROLES), clientController.listClients);

// 3. Ficha individual de cliente
router.get('/:id', authorizeRoles(READ_ROLES), clientController.getClientById);

// 4. Criação de novo cliente
router.post('/', authorizeRoles(CREATE_ROLES), clientController.createClient);

// 5. Atualização cadastral
router.put('/:id', authorizeRoles(UPDATE_ROLES), clientController.updateClient);

// 6. Atualização de estado (activo/suspenso/desligado)
router.patch('/:id/status', authorizeRoles(UPDATE_ROLES), clientController.changeClientStatus);

module.exports = router;

