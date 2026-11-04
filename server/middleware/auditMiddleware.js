/**
 * LECASU GridOps - Middleware de Auditoria para Rotas Sensíveis
 * 
 * Regista automaticamente no audit_logs a execução de rotas modificadoras (POST, PUT, PATCH, DELETE).
 */

const { logAudit } = require('../utils/auditLogger');

/**
 * Cria um middleware de auditoria para uma determinada tabela de negócio.
 * 
 * @param {string} tabelaAfetada - Nome da tabela (ex: 'users', 'mini_grids')
 * @returns {import('express').RequestHandler}
 */
function auditAction(tabelaAfetada) {
  return (req, res, next) => {
    // Interceta o envio da resposta com sucesso
    const originalJson = res.json.bind(res);

    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        let accao = 'UPDATE';
        if (req.method === 'POST') accao = 'INSERT';
        if (req.method === 'DELETE') accao = 'DELETE';

        const registoId = req.params.id || (body.data && body.data.id) || 'N/A';
        const userId = req.user ? req.user.id : null;

        logAudit({
          userId,
          tabelaAfetada,
          accao,
          registoId,
          dadosAntigos: req.auditOldData || null,
          dadosNovos: body.data || body
        });
      }

      return originalJson(body);
    };

    next();
  };
}

module.exports = {
  auditAction,
  logAudit
};

