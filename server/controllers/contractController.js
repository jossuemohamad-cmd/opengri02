/**
 * LECASU GridOps - Controlador de Contratos de Fornecimento de Energia
 * 
 * Implementa a emissão, gestão contratual, amarração de tarifas e potências contratadas.
 */

const { query, getClient } = require('../config/db');
const { success, error } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');
const { generateNextContractCode } = require('../utils/codeGenerator');

const VALID_TARIFF_TYPES = ['pre_pago', 'pos_pago', 'hibrido'];
const VALID_STATUSES = ['activo', 'suspenso', 'cancelado'];

/**
 * Listagem paginada e filtrada de contratos.
 * GET /api/contracts
 */
async function listContracts(req, res) {
  try {
    const {
      client_id,
      tipo_tarifa,
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

    if (client_id) {
      conditions.push(`ctr.client_id = $${pIdx++}`);
      params.push(client_id);
    }

    if (tipo_tarifa) {
      conditions.push(`ctr.tipo_tarifa = $${pIdx++}`);
      params.push(tipo_tarifa.toLowerCase());
    }

    if (estado) {
      conditions.push(`ctr.estado = $${pIdx++}`);
      params.push(estado.toLowerCase());
    }

    if (q && q.trim()) {
      const searchPattern = `%${q.trim()}%`;
      conditions.push(`(
        ctr.numero_contrato ILIKE $${pIdx} OR
        c.nome_completo ILIKE $${pIdx} OR
        c.codigo ILIKE $${pIdx}
      )`);
      params.push(searchPattern);
      pIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) AS total 
      FROM contracts ctr
      JOIN clients c ON ctr.client_id = c.id
      ${whereClause};
    `;
    const countRes = await query(countSql, params);
    const totalRecords = parseInt(countRes.rows[0].total, 10);

    const selectParams = [...params, limitNum, offset];
    const sql = `
      SELECT 
        ctr.*,
        c.codigo AS client_codigo,
        c.nome_completo AS client_nome,
        c.contacto_principal AS client_contacto,
        mg.codigo AS mini_grid_codigo,
        mg.nome AS mini_grid_nome
      FROM contracts ctr
      JOIN clients c ON ctr.client_id = c.id
      JOIN mini_grids mg ON c.mini_grid_id = mg.id
      ${whereClause}
      ORDER BY ctr.criado_em DESC
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
    return error(res, 'Erro ao listar contratos.', 500, err.message);
  }
}

/**
 * Consulta de detalhe de um contrato.
 * GET /api/contracts/:id
 */
async function getContractById(req, res) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        ctr.*,
        c.codigo AS client_codigo,
        c.nome_completo AS client_nome,
        c.documento_identificacao AS client_documento,
        c.contacto_principal AS client_contacto,
        c.categoria AS client_categoria,
        mg.id AS mini_grid_id,
        mg.codigo AS mini_grid_codigo,
        mg.nome AS mini_grid_nome
      FROM contracts ctr
      JOIN clients c ON ctr.client_id = c.id
      JOIN mini_grids mg ON c.mini_grid_id = mg.id
      WHERE ctr.id = $1;
    `;

    const result = await query(sql, [id]);
    if (result.rowCount === 0) {
      return error(res, 'Contrato não encontrado.', 404);
    }

    return success(res, result.rows[0]);
  } catch (err) {
    return error(res, 'Erro ao obter contrato.', 500, err.message);
  }
}

/**
 * Criação e emissão de um novo contrato.
 * POST /api/contracts
 */
async function createContract(req, res) {
  const dbClient = await getClient();

  try {
    const {
      client_id,
      tipo_tarifa = 'pre_pago',
      potencia_contratada_kva = 1.00,
      valor_caucao = 0.00,
      data_ativacao = new Date().toISOString().split('T')[0]
    } = req.body;

    if (!client_id) {
      return error(res, 'O campo client_id é obrigatório.', 400);
    }

    const cleanTariffType = tipo_tarifa.toLowerCase().trim();
    if (!VALID_TARIFF_TYPES.includes(cleanTariffType)) {
      return error(res, `Tipo de tarifa inválido. Aceites: ${VALID_TARIFF_TYPES.join(', ')}.`, 400);
    }

    await dbClient.query('BEGIN');

    // 1. Verifica se o cliente existe
    const clientCheck = await dbClient.query('SELECT id, nome_completo FROM clients WHERE id = $1;', [client_id]);
    if (clientCheck.rowCount === 0) {
      await dbClient.query('ROLLBACK');
      return error(res, 'Cliente especificado não existe.', 404);
    }

    // 2. Gera número sequencial de contrato (ex: CTR-2026-0001)
    const anoAtual = new Date().getFullYear();
    const numeroContrato = await generateNextContractCode(anoAtual, dbClient);

    // 3. Insere o contrato
    const insertSql = `
      INSERT INTO contracts (
        numero_contrato,
        client_id,
        tipo_tarifa,
        potencia_contratada_kva,
        valor_caucao,
        data_ativacao,
        estado
      ) VALUES ($1, $2, $3, $4, $5, $6, 'activo')
      RETURNING *;
    `;

    const insertParams = [
      numeroContrato,
      client_id,
      cleanTariffType,
      Number(potencia_contratada_kva) || 1.00,
      Number(valor_caucao) || 0.00,
      data_ativacao
    ];

    const result = await dbClient.query(insertSql, insertParams);
    const newContract = result.rows[0];

    // 4. Regista em audit_logs
    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'INSERT',
      entity: 'contracts',
      entityId: newContract.id,
      newValues: newContract,
      req
    });

    await dbClient.query('COMMIT');

    return success(res, newContract, 'Contrato emitido com sucesso.', 201);
  } catch (err) {
    await dbClient.query('ROLLBACK');
    return error(res, 'Erro ao criar contrato.', 500, err.message);
  } finally {
    dbClient.release();
  }
}

/**
 * Atualização dos termos de um contrato.
 * PUT /api/contracts/:id
 */
async function updateContract(req, res) {
  try {
    const { id } = req.params;
    const {
      tipo_tarifa,
      potencia_contratada_kva,
      valor_caucao,
      data_ativacao,
      estado
    } = req.body;

    const currentRes = await query('SELECT * FROM contracts WHERE id = $1;', [id]);
    if (currentRes.rowCount === 0) {
      return error(res, 'Contrato não encontrado.', 404);
    }
    const currentData = currentRes.rows[0];

    if (tipo_tarifa && !VALID_TARIFF_TYPES.includes(tipo_tarifa.toLowerCase().trim())) {
      return error(res, `Tipo de tarifa inválido. Aceites: ${VALID_TARIFF_TYPES.join(', ')}.`, 400);
    }

    if (estado && !VALID_STATUSES.includes(estado.toLowerCase().trim())) {
      return error(res, `Estado inválido. Aceites: ${VALID_STATUSES.join(', ')}.`, 400);
    }

    const updateSql = `
      UPDATE contracts
      SET
        tipo_tarifa = COALESCE($1, tipo_tarifa),
        potencia_contratada_kva = COALESCE($2, potencia_contratada_kva),
        valor_caucao = COALESCE($3, valor_caucao),
        data_ativacao = COALESCE($4, data_ativacao),
        estado = COALESCE($5, estado)
      WHERE id = $6
      RETURNING *;
    `;

    const updateParams = [
      tipo_tarifa ? tipo_tarifa.toLowerCase().trim() : null,
      potencia_contratada_kva !== undefined ? Number(potencia_contratada_kva) : null,
      valor_caucao !== undefined ? Number(valor_caucao) : null,
      data_ativacao || null,
      estado ? estado.toLowerCase().trim() : null,
      id
    ];

    const result = await query(updateSql, updateParams);
    const updatedContract = result.rows[0];

    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'UPDATE',
      entity: 'contracts',
      entityId: id,
      oldValues: currentData,
      newValues: updatedContract,
      req
    });

    return success(res, updatedContract, 'Contrato atualizado com sucesso.');
  } catch (err) {
    return error(res, 'Erro ao atualizar contrato.', 500, err.message);
  }
}

module.exports = {
  listContracts,
  getContractById,
  createContract,
  updateContract
};

