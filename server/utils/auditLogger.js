/**
 * LECASU GridOps - Utilitário de Auditoria e Rastreabilidade (Append-Only)
 * 
 * Regista eventos de modificação de dados na tabela audit_logs para conformidade,
 * governação e segurança (secção 11 da especificação LECASU).
 */

const { query } = require('../config/db');

/**
 * Regista um evento de auditoria na base de dados.
 * 
 * @param {Object} params
 * @param {string|null} params.userId - UUID do utilizador que realizou a ação
 * @param {string} params.tabelaAfetada - Nome da tabela alvo (ex: 'users', 'clients')
 * @param {'INSERT'|'UPDATE'|'DELETE'} params.accao - Tipo de ação realizada
 * @param {string|number} params.registoId - Identificador do registo afetado
 * @param {Object|null} [params.dadosAntigos] - Estado anterior do registo (em JSON)
 * @param {Object|null} [params.dadosNovos] - Novo estado do registo (em JSON)
 * @returns {Promise<number|null>} ID do registo na tabela audit_logs
 */
async function logAudit(params = {}) {
  const userId = params.userId || params.user_id || null;
  const tabelaAfetada = params.tabelaAfetada || params.tabela || params.entity || params.table || 'sistema';
  const accao = params.accao || params.action || 'EXECUTE';
  const registoId = params.registoId || params.registo_id || params.entityId || params.id || 'N/A';
  const dadosAntigos = params.dadosAntigos || params.dados_antigos || params.oldValues || null;
  const dadosNovos = params.dadosNovos || params.dados_novos || params.newValues || null;

  try {
    // Sanitização para nunca armazenar hashes ou senhas nos logs de auditoria
    const sanitize = (data) => {
      if (!data || typeof data !== 'object') return data;
      const copy = { ...data };
      if ('password' in copy) delete copy.password;
      if ('password_hash' in copy) delete copy.password_hash;
      return copy;
    };

    const sql = `
      INSERT INTO audit_logs (
        user_id,
        tabela_afetada,
        accao,
        registo_id,
        dados_antigos,
        dados_novos
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `;

    const values = [
      userId,
      String(tabelaAfetada),
      String(accao),
      String(registoId),
      dadosAntigos ? JSON.stringify(sanitize(dadosAntigos)) : null,
      dadosNovos ? JSON.stringify(sanitize(dadosNovos)) : null
    ];

    const res = await query(sql, values);
    return res.rows[0].id;
  } catch (err) {
    // Falhas de log de auditoria não devem deitar abaixo a operação de negócio principal,
    // mas são registadas no log de segurança do servidor.
    console.error(`[AUDIT WARNING] Falha ao registar log de auditoria para tabela '${tabelaAfetada}':`, err.message);
    return null;
  }
}

module.exports = {
  logAudit
};

