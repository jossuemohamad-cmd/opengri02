/**
 * LECASU GridOps - Router Principal da API REST (/api)
 */

const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const miniGridRoutes = require('./miniGridRoutes');
const assetRoutes = require('./assetRoutes');
const clientRoutes = require('./clientRoutes');
const contractRoutes = require('./contractRoutes');
const meterRoutes = require('./meterRoutes');
const readingRoutes = require('./readingRoutes');
const tariffRoutes = require('./tariffRoutes');
const paymentRoutes = require('./paymentRoutes');
const workOrderRoutes = require('./workOrderRoutes');
const reportRoutes = require('./reportRoutes');
const auditRoutes = require('./auditRoutes');
const systemRoutes = require('./systemRoutes');
const telemetryRoutes = require('./telemetryRoutes');

// Módulos da API REST
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/system', systemRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/mini-grids', miniGridRoutes);
router.use('/assets', assetRoutes);
router.use('/clients', clientRoutes);
router.use('/contracts', contractRoutes);
router.use('/meters', meterRoutes);
router.use('/readings', readingRoutes);
router.use('/tariffs', tariffRoutes);
router.use('/payments', paymentRoutes);
router.use('/work-orders', workOrderRoutes);
router.use('/reports', reportRoutes);
router.use('/audit-logs', auditRoutes);

// Verificação de saúde e conectividade da base de dados
router.get('/health', healthController.getHealth);

// Informações básicas e catálogo de endpoints da API
router.get('/', (req, res) => {
  res.json({
    name: 'LECASU GridOps API',
    version: '1.0.0',
    description: 'Plataforma de Gestão de Mini-Redes de Eletrificação Rural em Moçambique',
    endpoints: {
      health: '/api/health',
      auth: {
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        refresh: 'POST /api/auth/refresh'
      },
      users: {
        list: 'GET /api/users',
        create: 'POST /api/users',
        get: 'GET /api/users/:id',
        update: 'PUT /api/users/:id',
        status: 'PATCH /api/users/:id/status'
      },
      mini_grids: {
        list: 'GET /api/mini-grids',
        gis: 'GET /api/mini-grids/gis',
        get: 'GET /api/mini-grids/:id',
        assets: 'GET /api/mini-grids/:miniGridId/assets',
        create: 'POST /api/mini-grids',
        update: 'PUT /api/mini-grids/:id'
      },
      assets: {
        list: 'GET /api/assets',
        get: 'GET /api/assets/:id',
        create: 'POST /api/assets',
        update: 'PUT /api/assets/:id'
      },
      clients: {
        list: 'GET /api/clients',
        gis: 'GET /api/clients/gis',
        get: 'GET /api/clients/:id',
        create: 'POST /api/clients',
        update: 'PUT /api/clients/:id',
        status: 'PATCH /api/clients/:id/status'
      },
      contracts: {
        list: 'GET /api/contracts',
        get: 'GET /api/contracts/:id',
        create: 'POST /api/contracts',
        update: 'PUT /api/contracts/:id'
      },
      meters: {
        list: 'GET /api/meters',
        get: 'GET /api/meters/:id',
        create: 'POST /api/meters',
        install: 'POST /api/meters/:id/install',
        update: 'PUT /api/meters/:id'
      },
      readings: {
        list: 'GET /api/readings',
        get: 'GET /api/readings/:id',
        create: 'POST /api/readings',
        import_csv: 'POST /api/readings/import-csv'
      },
      tariffs: {
        list: 'GET /api/tariffs',
        get: 'GET /api/tariffs/:id',
        create: 'POST /api/tariffs',
        update: 'PUT /api/tariffs/:id'
      },
      payments: {
        list: 'GET /api/payments',
        get: 'GET /api/payments/:id',
        create: 'POST /api/payments',
        reconcile: 'POST /api/payments/:id/reconcile',
        client_summary: 'GET /api/payments/client/:clientId/summary'
      },
      work_orders: {
        list: 'GET /api/work-orders',
        get: 'GET /api/work-orders/:id',
        create: 'POST /api/work-orders',
        assign: 'PATCH /api/work-orders/:id/assign',
        close: 'PATCH /api/work-orders/:id/close'
      },
      reports: {
        dashboard: 'GET /api/reports/dashboard',
        executive: 'GET /api/reports/executive',
        export_csv: 'GET /api/reports/export/csv'
      },
      telemetry: {
        config: 'GET / PUT /api/telemetry/config',
        devices: 'GET / POST /api/telemetry/devices',
        ingest: 'POST /api/telemetry/ingest',
        solarman_sync: 'POST /api/telemetry/solarman/sync'
      }
    }
  });
});

module.exports = router;
