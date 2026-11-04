/**
 * LECASU GridOps - Utilitário de Respostas Padronizadas da API REST
 */

/**
 * Envia uma resposta HTTP de sucesso padronizada.
 * 
 * @param {import('express').Response} res
 * @param {*} data - Dados de retorno
 * @param {string} [message='Operação realizada com sucesso']
 * @param {number} [statusCode=200]
 */
function success(res, data = null, message = 'Operação realizada com sucesso', statusCode = 200) {
  const isMeta = typeof message === 'object' && message !== null;
  const payload = {
    status: 'success',
    message: isMeta ? 'Operação realizada com sucesso' : message,
    data,
    timestamp: new Date().toISOString()
  };

  if (isMeta) {
    payload.meta = message;
  }

  return res.status(statusCode).json(payload);
}

/**
 * Envia uma resposta HTTP de erro padronizada.
 * 
 * @param {import('express').Response} res
 * @param {string} message - Mensagem descritiva do erro
 * @param {number} [statusCode=500]
 * @param {*} [errors=null] - Detalhes adicionais do erro (ex: validações)
 */
function error(res, message = 'Ocorreu um erro interno no servidor', statusCode = 500, errors = null) {
  const payload = {
    error: message,
    message,
    status: 'error',
    timestamp: new Date().toISOString()
  };

  if (errors) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
}

module.exports = {
  success,
  error
};

