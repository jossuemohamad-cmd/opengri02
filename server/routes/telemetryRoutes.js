/**
 * LECASU GridOps - Rotas de Telemetria de Inversores & SolarMAN Pro (/api/telemetry)
 */

const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { error } = require('../utils/response');

const READ_ROLES = [
  'administrador',
  'gestor_operacoes',
  'gestor_comercial',
  'tecnico_campo',
  'financeiro',
  'parceiro_auditor'
];

const WRITE_ROLES = ['administrador', 'gestor_operacoes', 'tecnico_campo'];
const ADMIN_OPS_ROLES = ['administrador', 'gestor_operacoes'];

/**
 * Permite autenticação via Bearer JWT (utilizadores internos) OU chave Webhook IoT
 * configurada em system_settings (x-webhook-key / webhook_key) para gateways de campo.
 */
async function authenticateJwtOrWebhook(req, res, next) {
  const webhookKey = req.headers['x-webhook-key'] || req.body?.webhook_key;
  if (webhookKey) {
    try {
      await telemetryController.ensureTelemetryInitialized();
      const cfg = await telemetryController.readSolarmanConfig();
      if (cfg.webhookKey && String(webhookKey).trim() === String(cfg.webhookKey).trim()) {
        req.isWebhookAuth = true;
        return next();
      }
      return error(res, 'Chave Webhook IoT inválida.', 401);
    } catch (err) {
      return error(res, 'Erro ao validar chave Webhook IoT.', 500);
    }
  }

  return authenticateToken(req, res, (authErr) => {
    if (authErr) return next(authErr);
    return authorizeRoles(WRITE_ROLES)(req, res, next);
  });
}

// Webhook IoT (JWT de operador/técnico ou x-webhook-key)
router.post('/ingest', authenticateJwtOrWebhook, telemetryController.ingestTelemetryWebhook);

// Rotas autenticadas via JWT
router.use(authenticateToken);

router.get('/config', authorizeRoles(['administrador', 'gestor_operacoes', 'parceiro_auditor']), telemetryController.getTelemetryConfig);
router.put('/config', authorizeRoles(ADMIN_OPS_ROLES), telemetryController.updateTelemetryConfig);

router.get('/devices', authorizeRoles(READ_ROLES), telemetryController.listTelemetryDevices);
router.post('/devices', authorizeRoles(WRITE_ROLES), telemetryController.registerTelemetryDevice);

router.post('/solarman/sync', authorizeRoles(ADMIN_OPS_ROLES), telemetryController.syncSolarmanCloud);

module.exports = router;
