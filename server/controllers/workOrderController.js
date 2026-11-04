/**
 * LECASU GridOps - Controlador de Ordens de Trabalho (O&M)
 * 
 * Implementa o ciclo de vida operacional de avarias, manutenção preventiva, novas ligações,
 * atribuição a técnicos de campo, registo de fotos de antes/depois e encerramento com assinatura.
 */

const { query, getClient } = require('../config/db');
const { success, error } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');
const { generateNextWorkOrderCode } = require('../utils/codeGenerator');

const VALID_TYPES = ['avaria', 'preventiva', 'nova_ligacao', 'desinstalacao'];
const VALID_PRIORITIES = ['baixa', 'media', 'alta', 'urgente'];
const VALID_STATUSES = ['aberta', 'atribuida', 'em_execucao', 'resolvida', 'cancelada'];

/**
 * Listagem paginada e filtrada de ordens de trabalho.
 * GET /api/work-orders
 */
async function listWorkOrders(req, res) {
  try {
    const {
      mini_grid_id,
      tecnico_id,
      client_id,
      asset_id,
      tipo,
      prioridade,
      estado,
      q,
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];
    let pIdx = 1;

    // Se o utilizador for técnico de campo, restringe por defeito às suas OTs atribuídas
    if (req.user && req.user.role === 'tecnico_campo' && !tecnico_id) {
      conditions.push(`wo.tecnico_id = $${pIdx++}`);
      params.push(req.user.id);
    } else if (tecnico_id) {
      conditions.push(`wo.tecnico_id = $${pIdx++}`);
      params.push(tecnico_id);
    }

    if (mini_grid_id) {
      conditions.push(`wo.mini_grid_id = $${pIdx++}`);
      params.push(mini_grid_id);
    }

    if (client_id) {
      conditions.push(`wo.client_id = $${pIdx++}`);
      params.push(client_id);
    }

    if (asset_id) {
      conditions.push(`wo.asset_id = $${pIdx++}`);
      params.push(asset_id);
    }

    if (tipo) {
      conditions.push(`wo.tipo = $${pIdx++}`);
      params.push(tipo.toLowerCase().trim());
    }

    if (prioridade) {
      conditions.push(`wo.prioridade = $${pIdx++}`);
      params.push(prioridade.toLowerCase().trim());
    }

    if (estado) {
      conditions.push(`wo.estado = $${pIdx++}`);
      params.push(estado.toLowerCase().trim());
    }

    if (q && q.trim()) {
      const searchPattern = `%${q.trim()}%`;
      conditions.push(`(
        wo.numero_ordem ILIKE $${pIdx} OR
        wo.descricao ILIKE $${pIdx} OR
        wo.solucao ILIKE $${pIdx}
      )`);
      params.push(searchPattern);
      pIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM work_orders wo ${whereClause};`;
    const countRes = await query(countSql, params);
    const totalRecords = parseInt(countRes.rows[0].total, 10);

    const selectParams = [...params, limitNum, offset];
    const sql = `
      SELECT 
        wo.*,
        mg.codigo AS mini_grid_codigo,
        mg.nome AS mini_grid_nome,
        u.nome AS tecnico_nome,
        u.telefone AS tecnico_telefone,
        c.codigo AS client_codigo,
        c.nome_completo AS client_nome,
        ast.codigo AS asset_codigo,
        ast.classe AS asset_classe
      FROM work_orders wo
      JOIN mini_grids mg ON wo.mini_grid_id = mg.id
      LEFT JOIN users u ON wo.tecnico_id = u.id
      LEFT JOIN clients c ON wo.client_id = c.id
      LEFT JOIN assets ast ON wo.asset_id = ast.id
      ${whereClause}
      ORDER BY 
        CASE wo.prioridade
          WHEN 'urgente' THEN 1
          WHEN 'alta' THEN 2
          WHEN 'media' THEN 3
          WHEN 'baixa' THEN 4
        END ASC,
        wo.criado_em DESC
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
    return error(res, 'Erro ao listar ordens de trabalho.', 500, err.message);
  }
}

/**
 * Consulta de detalhe de uma ordem de trabalho.
 * GET /api/work-orders/:id
 */
async function getWorkOrderById(req, res) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        wo.*,
        mg.codigo AS mini_grid_codigo,
        mg.nome AS mini_grid_nome,
        mg.provincia AS mini_grid_provincia,
        mg.distrito AS mini_grid_distrito,
        u.nome AS tecnico_nome,
        u.email AS tecnico_email,
        u.telefone AS tecnico_telefone,
        c.codigo AS client_codigo,
        c.nome_completo AS client_nome,
        c.contacto_principal AS client_contacto,
        c.latitude AS client_latitude,
        c.longitude AS client_longitude,
        ast.codigo AS asset_codigo,
        ast.classe AS asset_classe,
        ast.modelo AS asset_modelo
      FROM work_orders wo
      JOIN mini_grids mg ON wo.mini_grid_id = mg.id
      LEFT JOIN users u ON wo.tecnico_id = u.id
      LEFT JOIN clients c ON wo.client_id = c.id
      LEFT JOIN assets ast ON wo.asset_id = ast.id
      WHERE wo.id = $1;
    `;

    const result = await query(sql, [id]);
    if (result.rowCount === 0) {
      return error(res, 'Ordem de trabalho não encontrada.', 404);
    }

    return success(res, result.rows[0]);
  } catch (err) {
    return error(res, 'Erro ao consultar ordem de trabalho.', 500, err.message);
  }
}

/**
 * Abertura de nova ordem de trabalho com geração sequencial de código OT.
 * POST /api/work-orders
 */
async function createWorkOrder(req, res) {
  const dbClient = await getClient();

  try {
    const {
      mini_grid_id,
      asset_id,
      client_id,
      tipo = 'avaria',
      prioridade = 'media',
      descricao,
      tecnico_id
    } = req.body;

    if (!mini_grid_id || !descricao || !descricao.trim()) {
      return error(res, 'Campos obrigatórios: mini_grid_id, descricao.', 400);
    }

    const cleanTipo = tipo.toLowerCase().trim();
    if (!VALID_TYPES.includes(cleanTipo)) {
      return error(res, `Tipo inválido. Aceites: ${VALID_TYPES.join(', ')}.`, 400);
    }

    const cleanPrioridade = prioridade.toLowerCase().trim();
    if (!VALID_PRIORITIES.includes(cleanPrioridade)) {
      return error(res, `Prioridade inválida. Aceites: ${VALID_PRIORITIES.join(', ')}.`, 400);
    }

    await dbClient.query('BEGIN');

    // 1. Verifica mini-rede
    const mgCheck = await dbClient.query('SELECT id FROM mini_grids WHERE id = $1;', [mini_grid_id]);
    if (mgCheck.rowCount === 0) {
      await dbClient.query('ROLLBACK');
      return error(res, 'Mini-rede especificada não existe.', 404);
    }

    // 2. Se tecnico_id fornecido, verifica utilizador
    if (tecnico_id) {
      const techCheck = await dbClient.query('SELECT id, role FROM users WHERE id = $1;', [tecnico_id]);
      if (techCheck.rowCount === 0) {
        await dbClient.query('ROLLBACK');
        return error(res, 'Técnico especificado não existe.', 404);
      }
    }

    // 3. Gera código sequencial da OT (ex: OT-2026-000145)
    const anoAtual = new Date().getFullYear();
    const numeroOrdem = await generateNextWorkOrderCode(anoAtual, dbClient);
    const estadoInicial = tecnico_id ? 'atribuida' : 'aberta';

    const insertSql = `
      INSERT INTO work_orders (
        numero_ordem,
        mini_grid_id,
        asset_id,
        client_id,
        tipo,
        prioridade,
        descricao,
        tecnico_id,
        estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const insertParams = [
      numeroOrdem,
      mini_grid_id,
      asset_id || null,
      client_id || null,
      cleanTipo,
      cleanPrioridade,
      descricao.trim(),
      tecnico_id || null,
      estadoInicial
    ];

    const result = await dbClient.query(insertSql, insertParams);
    const newWorkOrder = result.rows[0];

    // 4. Registo de auditoria
    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'INSERT',
      entity: 'work_orders',
      entityId: newWorkOrder.id,
      newValues: newWorkOrder,
      req
    });

    await dbClient.query('COMMIT');

    return success(res, newWorkOrder, 'Ordem de trabalho criada com sucesso.', 201);
  } catch (err) {
    await dbClient.query('ROLLBACK');
    return error(res, 'Erro ao criar ordem de trabalho.', 500, err.message);
  } finally {
    dbClient.release();
  }
}

/**
 * Atribuição de técnico a uma ordem de trabalho.
 * PATCH /api/work-orders/:id/assign
 */
async function assignWorkOrder(req, res) {
  try {
    const { id } = req.params;
    const { tecnico_id } = req.body;

    if (!tecnico_id) {
      return error(res, 'O campo tecnico_id é obrigatório para atribuição.', 400);
    }

    // Verifica técnico
    const techRes = await query('SELECT id, nome, role FROM users WHERE id = $1;', [tecnico_id]);
    if (techRes.rowCount === 0) {
      return error(res, 'Técnico de campo não encontrado.', 404);
    }

    const currentRes = await query('SELECT * FROM work_orders WHERE id = $1;', [id]);
    if (currentRes.rowCount === 0) {
      return error(res, 'Ordem de trabalho não encontrada.', 404);
    }
    const currentData = currentRes.rows[0];

    const updateSql = `
      UPDATE work_orders
      SET
        tecnico_id = $1,
        estado = 'atribuida'
      WHERE id = $2
      RETURNING *;
    `;

    const result = await query(updateSql, [tecnico_id, id]);
    const updated = result.rows[0];

    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'ASSIGN',
      entity: 'work_orders',
      entityId: id,
      oldValues: { tecnico_id: currentData.tecnico_id, estado: currentData.estado },
      newValues: { tecnico_id: updated.tecnico_id, estado: updated.estado },
      req
    });

    return success(res, updated, 'Ordem de trabalho atribuída ao técnico com sucesso.');
  } catch (err) {
    return error(res, 'Erro ao atribuir ordem de trabalho.', 500, err.message);
  }
}

/**
 * Encerramento de ordem de trabalho com registo de solução, evidências fotográficas e assinatura.
 * PATCH /api/work-orders/:id/close
 */
async function closeWorkOrder(req, res) {
  try {
    const { id } = req.params;
    const {
      solucao,
      fotos_evidencia = [],
      assinatura_tecnico
    } = req.body;

    if (!solucao || !solucao.trim()) {
      return error(res, 'O resumo da solução é obrigatório para o encerramento da ordem de trabalho.', 400);
    }

    const currentRes = await query('SELECT * FROM work_orders WHERE id = $1;', [id]);
    if (currentRes.rowCount === 0) {
      return error(res, 'Ordem de trabalho não encontrada.', 404);
    }
    const currentData = currentRes.rows[0];

    if (currentData.estado === 'resolvida' || currentData.estado === 'cancelada') {
      return error(res, `Esta ordem de trabalho já se encontra no estado '${currentData.estado}'.`, 400);
    }

    const safeFotos = Array.isArray(fotos_evidencia) ? JSON.stringify(fotos_evidencia) : JSON.stringify([]);

    const updateSql = `
      UPDATE work_orders
      SET
        solucao = $1,
        fotos_evidencia = $2::jsonb,
        assinatura_tecnico = COALESCE($3, assinatura_tecnico),
        estado = 'resolvida',
        encerrado_em = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *;
    `;

    const result = await query(updateSql, [
      solucao.trim(),
      safeFotos,
      assinatura_tecnico || null,
      id
    ]);

    const closed = result.rows[0];

    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'CLOSE',
      entity: 'work_orders',
      entityId: id,
      oldValues: currentData,
      newValues: closed,
      req
    });

    return success(res, closed, 'Ordem de trabalho encerrada com sucesso e evidências arquivadas.');
  } catch (err) {
    return error(res, 'Erro ao encerrar ordem de trabalho.', 500, err.message);
  }
}

module.exports = {
  listWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  assignWorkOrder,
  closeWorkOrder
};

