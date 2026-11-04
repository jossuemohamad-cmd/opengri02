/**
 * LECASU GridOps - Rotas de Mini-Redes (/api/mini-grids)
 * 
 * RBAC:
 * - Leitura (GET): administrador, gestor_operacoes, gestor_comercial, tecnico_campo, financeiro, parceiro_auditor
 * - Escrita (POST, PUT): administrador, gestor_operacoes
 */

const express = require('express');
const router = express.Router();
const miniGridController = require('../controllers/miniGridController');
const assetController = require('../controllers/assetController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Perfis autorizados
const READ_ROLES = [
  'administrador',
  'gestor_operacoes',
  'gestor_comercial',
  'tecnico_campo',
  'financeiro',
  'parceiro_auditor'
];

const WRITE_ROLES = ['administrador', 'gestor_operacoes'];

// Todas as rotas exigem token JWT ativo
router.use(authenticateToken);

// Rotas de leitura
router.get('/', authorizeRoles(READ_ROLES), miniGridController.listMiniGrids);
router.get('/gis', authorizeRoles(READ_ROLES), miniGridController.getMiniGridsGIS);
router.get('/:id', authorizeRoles(READ_ROLES), miniGridController.getMiniGridById);
router.get('/:miniGridId/assets', authorizeRoles(READ_ROLES), assetController.listAssetsByMiniGrid);

// Rotas de escrita (restritas a administrador e gestor_operacoes)
router.post('/', authorizeRoles(WRITE_ROLES), miniGridController.createMiniGrid);
router.put('/:id', authorizeRoles(WRITE_ROLES), miniGridController.updateMiniGrid);

module.exports = router;

