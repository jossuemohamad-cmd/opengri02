/**
 * LECASU GridOps - Middlewares de Tratamento de Erros e Rotas Não Encontradas
 */

const { error } = require('../utils/response');

/**
 * Middleware para rotas da API não encontradas (404)
 */
function notFoundHandler(req, res, next) {
  if (req.originalUrl.startsWith('/api')) {
    return error(res, `Rota da API não encontrada: ${req.method} ${req.originalUrl}`, 404);
  }
  next();
}

/**
 * Middleware global para captura de exceções não tratadas (500)
 */
function globalErrorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('[ERRO NÃO TRATADO]:', err);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Ocorreu um erro interno no servidor.'
    : err.message || 'Erro interno no servidor.';

  const details = process.env.NODE_ENV === 'development' ? { stack: err.stack } : null;

  return error(res, message, statusCode, details);
}

module.exports = {
  notFoundHandler,
  globalErrorHandler
};

