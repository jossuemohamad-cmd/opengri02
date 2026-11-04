/**
 * LECASU GridOps - Controlador de Faturação e Pagamentos
 * 
 * Implementa a gestão de cobranças, canais de pagamento móveis (M-Pesa, e-Mola, mKesh,
 * numerário e transferência), reconciliação financeira e saldo da conta do cliente.
 */

const { query, getClient } = require('../config/db');
const { success, error } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');

const VALID_CHANNELS = ['numerario', 'mpesa', 'emola', 'mkesh', 'transferencia'];
const VALID_STATUSES = ['pendente', 'confirmado', 'revertido'];

/**
 * Gera uma referência única de transação caso não seja fornecida externamente.
 * Ex: MPESA-2026-X89212 ou PAY-2026-0001
 */
function generateTransactionReference(canal) {
  const prefix = canal ? canal.toUpperCase().substring(0, 5) : 'PAY';
  const ano = new Date().getFullYear();
  const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${ano}-${randomHex}`;
}

/**
 * Listagem paginada e filtrada de pagamentos.
 * GET /api/payments
 */
async function listPayments(req, res) {
  try {
    const {
      client_id,
      canal,
      estado,
      reconciliado,
      data_inicio,
      data_fim,
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];
    let pIdx = 1;

    if (client_id) {
      conditions.push(`p.client_id = $${pIdx++}`);
      params.push(client_id);
    }

    if (canal) {
      conditions.push(`p.canal = $${pIdx++}`);
      params.push(canal.toLowerCase().trim());
    }

    if (estado) {
      conditions.push(`p.estado = $${pIdx++}`);
      params.push(estado.toLowerCase().trim());
    }

    if (reconciliado !== undefined) {
      conditions.push(`p.reconciliado = $${pIdx++}`);
      params.push(reconciliado === 'true');
    }

    if (data_inicio) {
      conditions.push(`p.data_pagamento >= $${pIdx++}`);
      params.push(new Date(data_inicio));
    }

    if (data_fim) {
      conditions.push(`p.data_pagamento <= $${pIdx++}`);
      params.push(new Date(data_fim));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM payments p ${whereClause};`;
    const countRes = await query(countSql, params);
    const totalRecords = parseInt(countRes.rows[0].total, 10);

    const selectParams = [...params, limitNum, offset];
    const sql = `
      SELECT 
        p.*,
        c.codigo AS client_codigo,
        c.nome_completo AS client_nome,
        c.contacto_principal AS client_contacto,
        mg.codigo AS mini_grid_codigo,
        mg.nome AS mini_grid_nome
      FROM payments p
      JOIN clients c ON p.client_id = c.id
      JOIN mini_grids mg ON c.mini_grid_id = mg.id
      ${whereClause}
      ORDER BY p.data_pagamento DESC
      LIMIT $${pIdx++} OFFSET $${pIdx++};
    `;

    const result = await query(sql, selectParams);

    return success(res, result.rows, {
      total: totalRecords,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalRecords / limitNum)
    });
  } catch (err) {
    return error(res, 'Erro ao listar pagamentos.', 500, err.message);
  }
}

/**
 * Consulta de detalhe de um pagamento específico.
 * GET /api/payments/:id
 */
async function getPaymentById(req, res) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        p.*,
        c.codigo AS client_codigo,
        c.nome_completo AS client_nome,
        c.documento_identificacao AS client_documento,
        c.contacto_principal AS client_contacto,
        mg.id AS mini_grid_id,
        mg.codigo AS mini_grid_codigo,
        mg.nome AS mini_grid_nome
      FROM payments p
      JOIN clients c ON p.client_id = c.id
      JOIN mini_grids mg ON c.mini_grid_id = mg.id
      WHERE p.id = $1;
    `;

    const result = await query(sql, [id]);
    if (result.rowCount === 0) {
      return error(res, 'Pagamento não encontrado.', 404);
    }

    return success(res, result.rows[0]);
  } catch (err) {
    return error(res, 'Erro ao consultar pagamento.', 500, err.message);
  }
}

/**
 * Registo de novo pagamento ou recarga pré-paga.
 * POST /api/payments
 */
async function createPayment(req, res) {
  const dbClient = await getClient();

  try {
    const {
      client_id,
      valor,
      canal = 'numerario',
      referencia_transacao,
      data_pagamento = new Date().toISOString(),
      comprovativo_url,
      auto_confirmar = false
    } = req.body;

    if (!client_id || valor === undefined || valor === null) {
      return error(res, 'Campos obrigatórios: client_id, valor.', 400);
    }

    const nValor = parseFloat(valor);
    if (isNaN(nValor) || nValor <= 0) {
      return error(res, 'O valor do pagamento deve ser superior a zero.', 400);
    }

    const cleanChannel = canal.toLowerCase().trim();
    if (!VALID_CHANNELS.includes(cleanChannel)) {
      return error(res, `Canal de pagamento inválido. Canais aceites: ${VALID_CHANNELS.join(', ')}.`, 400);
    }

    await dbClient.query('BEGIN');

    // 1. Verifica se o cliente existe
    const clientRes = await dbClient.query('SELECT id, nome_completo FROM clients WHERE id = $1;', [client_id]);
    if (clientRes.rowCount === 0) {
      await dbClient.query('ROLLBACK');
      return error(res, 'Cliente associado não existe.', 404);
    }

    // 2. Define referência da transação
    const finalReferencia = referencia_transacao && referencia_transacao.trim()
      ? referencia_transacao.trim()
      : generateTransactionReference(cleanChannel);

    // 3. Define estado inicial (auto_confirmar se dinheiro recebido na hora pelo agente)
    const estadoInicial = auto_confirmar ? 'confirmado' : 'pendente';
    const reconciliadoInicial = auto_confirmar;

    const insertSql = `
      INSERT INTO payments (
        referencia_transacao,
        client_id,
        valor,
        canal,
        estado,
        reconciliado,
        data_pagamento,
        comprovativo_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const insertParams = [
      finalReferencia,
      client_id,
      nValor,
      cleanChannel,
      estadoInicial,
      reconciliadoInicial,
      new Date(data_pagamento),
      comprovativo_url || null
    ];

    const result = await dbClient.query(insertSql, insertParams);
    const newPayment = result.rows[0];

    // 4. Registo de auditoria
    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'INSERT',
      entity: 'payments',
      entityId: newPayment.id,
      newValues: newPayment,
      req
    });

    await dbClient.query('COMMIT');

    return success(res, newPayment, 'Pagamento registado com sucesso.', 201);
  } catch (err) {
    await dbClient.query('ROLLBACK');
    if (err.code === '23505') {
      return error(res, 'Referência de transação já existente no sistema.', 409);
    }
    return error(res, 'Erro ao registar pagamento.', 500, err.message);
  } finally {
    dbClient.release();
  }
}

/**
 * Reconciliação formal de um pagamento (perfil financeiro ou comercial).
 * POST /api/payments/:id/reconcile
 */
async function reconcilePayment(req, res) {
  try {
    const { id } = req.params;

    const currentRes = await query('SELECT * FROM payments WHERE id = $1;', [id]);
    if (currentRes.rowCount === 0) {
      return error(res, 'Pagamento não encontrado.', 404);
    }
    const currentData = currentRes.rows[0];

    if (currentData.reconciliado) {
      return error(res, 'Este pagamento já foi reconciliado anteriormente.', 400);
    }

    const updateSql = `
      UPDATE payments
      SET
        reconciliado = TRUE,
        estado = 'confirmado'
      WHERE id = $1
      RETURNING *;
    `;

    const result = await query(updateSql, [id]);
    const updatedPayment = result.rows[0];

    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'RECONCILE',
      entity: 'payments',
      entityId: id,
      oldValues: { reconciliado: currentData.reconciliado, estado: currentData.estado },
      newValues: { reconciliado: updatedPayment.reconciliado, estado: updatedPayment.estado },
      req
    });

    return success(res, updatedPayment, 'Pagamento reconciliado e confirmado com sucesso.');
  } catch (err) {
    return error(res, 'Erro ao reconciliar pagamento.', 500, err.message);
  }
}

/**
 * Extrato financeiro e resumo de cobranças de um cliente.
 * GET /api/payments/client/:clientId/summary
 */
async function getClientFinancialSummary(req, res) {
  try {
    const { clientId } = req.params;

    // Total pago confirmado
    const paidRes = await query(`
      SELECT 
        COALESCE(SUM(valor), 0.00) AS total_pago_mzn,
        COUNT(*) AS total_transacoes
      FROM payments
      WHERE client_id = $1 AND estado = 'confirmado';
    `, [clientId]);

    // Total pendente
    const pendingRes = await query(`
      SELECT 
        COALESCE(SUM(valor), 0.00) AS total_pendente_mzn
      FROM payments
      WHERE client_id = $1 AND estado = 'pendente';
    `, [clientId]);

    // Histórico recente
    const recentPayments = await query(`
      SELECT *
      FROM payments
      WHERE client_id = $1
      ORDER BY data_pagamento DESC
      LIMIT 10;
    `, [clientId]);

    return success(res, {
      total_pago_mzn: parseFloat(paidRes.rows[0].total_pago_mzn),
      total_transacoes: parseInt(paidRes.rows[0].total_transacoes, 10),
      total_pendente_mzn: parseFloat(pendingRes.rows[0].total_pendente_mzn),
      recent_payments: recentPayments.rows
    });
  } catch (err) {
    return error(res, 'Erro ao obter resumo financeiro do cliente.', 500, err.message);
  }
}

module.exports = {
  listPayments,
  getPaymentById,
  createPayment,
  reconcilePayment,
  getClientFinancialSummary
};

