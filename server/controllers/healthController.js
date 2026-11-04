/**
 * LECASU GridOps - Controlador de Verificação de Saúde do Sistema (Health Check)
 */

const { checkConnection } = require('../config/db');

/**
 * Endpoint GET /api/health
 * Retorna o estado operacional do serviço Node.js e da ligação à base de dados PostgreSQL.
 */
async function getHealth(req, res) {
  const dbStatus = await checkConnection();
  const uptimeSeconds = Math.floor(process.uptime());

  const healthData = {
    service: 'LECASU GridOps API',
    status: dbStatus.ok ? 'healthy' : 'degraded',
    uptime: `${uptimeSeconds}s`,
    environment: process.env.NODE_ENV || 'development',
    serverTimestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.ok,
      ...(dbStatus.ok
        ? {
            name: dbStatus.database,
            dbTimestamp: dbStatus.timestamp,
            version: dbStatus.version
          }
        : {
            error: dbStatus.error
          })
    }
  };

  const httpStatus = dbStatus.ok ? 200 : 503;
  return res.status(httpStatus).json(healthData);
}

module.exports = {
  getHealth
};

