/**
 * LECASU GridOps - Controlador de Trilha de Auditoria (Audit Logs)
 * Secção 11: Governação de Dados, Integridade e Rastreabilidade Regulatória
 */

const { query } = require('../config/db');
const { success, error } = require('../utils/response');

/**
 * GET /api/audit-logs
 * Lista eventos auditados de forma imutável com filtros e paginação.
 */
async function listAuditLogs(req, res) {
  try {
    const { tabela, accao, limit = 50, offset = 0 } = req.query;

    const conditions = [];
    const params = [];
    let idx = 1;

    if (tabela) {
      conditions.push(`al.tabela_afetada = $${idx++}`);
      params.push(tabela);
    }

    if (accao) {
      conditions.push(`al.accao = $${idx++}`);
      params.push(accao.toUpperCase());
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT count(*) FROM audit_logs al ${where};`;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0].count, 10);

    const lim = Math.min(Math.max(1, parseInt(limit, 10) || 50), 100);
    const off = Math.max(0, parseInt(offset, 10) || 0);

    const dataParams = [...params, lim, off];
    const dataSql = `
      SELECT 
        al.id,
        al.tabela_afetada,
        al.accao,
        al.registo_id,
        al.dados_antigos,
        al.dados_novos,
        al.criado_em,
        u.nome AS user_nome,
        u.email AS user_email,
        u.role AS user_role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${where}
      ORDER BY al.criado_em DESC
      LIMIT $${idx++} OFFSET $${idx++};
    `;

    const dataRes = await query(dataSql, dataParams);

    return success(
      res,
      dataRes.rows,
      'Registos de auditoria obtidos com sucesso.',
      200,
      { total, limit: lim, offset: off }
    );
  } catch (err) {
    console.error('[AUDIT_LOGS ERROR]:', err);
    return error(res, 'Erro ao consultar trilha de auditoria.', 500);
  }
}

module.exports = {
  listAuditLogs
};
