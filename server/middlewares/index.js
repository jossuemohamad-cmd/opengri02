/**
 * Re-exporta middlewares a partir de server/middleware/ para compatibilidade de convenção de nomes
 */
module.exports = {
  ...require('../middleware/authMiddleware'),
  ...require('../middleware/roleMiddleware'),
  ...require('../middleware/auditMiddleware'),
  ...require('../middleware/errorHandler')
};

