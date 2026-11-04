/**
 * LECASU GridOps - Controlador de Contadores (Meters)
 * 
 * Implementa o inventário, registo e alocação/instalação de medidores de energia STS e IoT.
 */

const { query, getClient } = require('../config/db');
const { success, error } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');
const { generateNextMeterCode } = require('../utils/codeGenerator');

const VALID_STATUSES = ['em_estoque', 'instalado', 'defeituoso', 'desativado'];

/**
 * Listagem paginada e filtrada de contadores.
 * GET /api/meters
 */
async function listMeters(req, res) {
  try {
    const {
      mini_grid_id,
      client_id,
      estado,
      tecnologia,
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

    if (mini_grid_id) {
      conditions.push(`m.mini_grid_id = $${pIdx++}`);
      params.push(mini_grid_id);
    }

    if (client_id) {
      conditions.push(`m.client_id = $${pIdx++}`);
      params.push(client_id);
    }

    if (estado) {
      conditions.push(`m.estado = $${pIdx++}`);
      params.push(estado.toLowerCase());
    }

    if (tecnologia) {
      conditions.push(`m.tecnologia ILIKE $${pIdx++}`);
      params.push(`%${tecnologia.trim()}%`);
    }

    if (q && q.trim()) {
      conditions.push(`m.numero_serie ILIKE $${pIdx++}`);
      params.push(`%${q.trim()}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM meters m ${whereClause};`;
    const countRes = await query(countSql, params);
    const totalRecords = parseInt(countRes.rows[0].total, 10);

    const selectParams = [...params, limitNum, offset];
    const sql = `
      SELECT 
        m.*,
        mg.codigo AS mini_grid_codigo,
        mg.nome AS mini_grid_nome,
        c.codigo AS client_codigo,
        c.nome_completo AS client_nome
      FROM meters m
      JOIN mini_grids mg ON m.mini_grid_id = mg.id
      LEFT JOIN clients c ON m.client_id = c.id
      ${whereClause}
      ORDER BY m.criado_em DESC
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
    return error(res, 'Erro ao listar contadores.', 500, err.message);
  }
}

/**
 * Consulta de detalhe de um contador com histórico de leituras.
 * GET /api/meters/:id
 */
async function getMeterById(req, res) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        m.*,
        mg.codigo AS mini_grid_codigo,
        mg.nome AS mini_grid_nome,
        c.codigo AS client_codigo,
        c.nome_completo AS client_nome,
        c.contacto_principal AS client_contacto
      FROM meters m
      JOIN mini_grids mg ON m.mini_grid_id = mg.id
      LEFT JOIN clients c ON m.client_id = c.id
      WHERE m.id = $1;
    `;

    const result = await query(sql, [id]);
    if (result.rowCount === 0) {
      return error(res, 'Contador não encontrado.', 404);
    }

    const meterData = result.rows[0];

    // Histórico recente de leituras
    const readingsRes = await query(`
      SELECT 
        r.*,
        u.nome AS registado_por_nome
      FROM readings r
      LEFT JOIN users u ON r.utilizador_id = u.id
      WHERE r.meter_id = $1
      ORDER BY r.data_leitura DESC
      LIMIT 15;
    `, [id]);

    return success(res, {
      ...meterData,
      recent_readings: readingsRes.rows
    });
  } catch (err) {
    return error(res, 'Erro ao consultar contador.', 500, err.message);
  }
}

/**
 * Cadastro de novo contador com geração de número de série padronizado (se omitido).
 * POST /api/meters
 */
async function createMeter(req, res) {
  const dbClient = await getClient();

  try {
    const {
      mini_grid_id,
      numero_serie,
      tecnologia = 'inteligente_prepago',
      client_id = null
    } = req.body;

    if (!mini_grid_id) {
      return error(res, 'O campo mini_grid_id é obrigatório.', 400);
    }

    await dbClient.query('BEGIN');

    // 1. Verifica se a mini-rede existe
    const mgCheck = await dbClient.query('SELECT id, codigo FROM mini_grids WHERE id = $1;', [mini_grid_id]);
    if (mgCheck.rowCount === 0) {
      await dbClient.query('ROLLBACK');
      return error(res, 'Mini-rede especificada não existe.', 404);
    }

    // 2. Se client_id for fornecido, verifica se o cliente existe
    if (client_id) {
      const clientCheck = await dbClient.query('SELECT id FROM clients WHERE id = $1;', [client_id]);
      if (clientCheck.rowCount === 0) {
        await dbClient.query('ROLLBACK');
        return error(res, 'Cliente associado não existe.', 404);
      }
    }

    // 3. Define número de série ou gera automaticamente no formato MTR-[MINI_REDE]-[SEQ4]
    const finalNumeroSerie = numero_serie && numero_serie.trim()
      ? numero_serie.trim()
      : await generateNextMeterCode(mini_grid_id, dbClient);

    // 4. Determina estado inicial
    const estadoInicial = client_id ? 'instalado' : 'em_estoque';
    const dataInstalacao = client_id ? new Date() : null;

    const insertSql = `
      INSERT INTO meters (
        numero_serie,
        mini_grid_id,
        client_id,
        tecnologia,
        estado,
        data_instalacao
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const insertParams = [
      finalNumeroSerie,
      mini_grid_id,
      client_id,
      tecnologia.trim(),
      estadoInicial,
      dataInstalacao
    ];

    const result = await dbClient.query(insertSql, insertParams);
    const newMeter = result.rows[0];

    // 5. Registo em audit_logs
    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'INSERT',
      entity: 'meters',
      entityId: newMeter.id,
      newValues: newMeter,
      req
    });

    await dbClient.query('COMMIT');

    return success(res, newMeter, 'Contador cadastrado com sucesso.', 201);
  } catch (err) {
    await dbClient.query('ROLLBACK');
    if (err.code === '23505') { // Restrição UNIQUE em numero_serie
      return error(res, 'Já existe um contador com este número de série.', 409);
    }
    return error(res, 'Erro ao cadastrar contador.', 500, err.message);
  } finally {
    dbClient.release();
  }
}

/**
 * Instalação / Atribuição física de um contador a um cliente.
 * POST /api/meters/:id/install
 */
async function installMeter(req, res) {
  try {
    const { id } = req.params;
    const { client_id } = req.body;

    if (!client_id) {
      return error(res, 'O client_id é obrigatório para instalar o contador.', 400);
    }

    // Verifica contador
    const meterRes = await query('SELECT * FROM meters WHERE id = $1;', [id]);
    if (meterRes.rowCount === 0) {
      return error(res, 'Contador não encontrado.', 404);
    }
    const currentMeter = meterRes.rows[0];

    // Verifica cliente
    const clientRes = await query('SELECT id, nome_completo FROM clients WHERE id = $1;', [client_id]);
    if (clientRes.rowCount === 0) {
      return error(res, 'Cliente não encontrado.', 404);
    }

    const updateSql = `
      UPDATE meters
      SET
        client_id = $1,
        estado = 'instalado',
        data_instalacao = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *;
    `;

    const result = await query(updateSql, [client_id, id]);
    const updatedMeter = result.rows[0];

    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'INSTALL_METER',
      entity: 'meters',
      entityId: id,
      oldValues: { client_id: currentMeter.client_id, estado: currentMeter.estado },
      newValues: { client_id: updatedMeter.client_id, estado: updatedMeter.estado },
      req
    });

    return success(res, updatedMeter, 'Contador instalado e associado ao cliente com sucesso.');
  } catch (err) {
    return error(res, 'Erro ao instalar contador.', 500, err.message);
  }
}

/**
 * Atualização dos dados do contador.
 * PUT /api/meters/:id
 */
async function updateMeter(req, res) {
  try {
    const { id } = req.params;
    const {
      tecnologia,
      estado,
      client_id
    } = req.body;

    const currentRes = await query('SELECT * FROM meters WHERE id = $1;', [id]);
    if (currentRes.rowCount === 0) {
      return error(res, 'Contador não encontrado.', 404);
    }
    const currentData = currentRes.rows[0];

    if (estado && !VALID_STATUSES.includes(estado.toLowerCase().trim())) {
      return error(res, `Estado inválido. Aceites: ${VALID_STATUSES.join(', ')}.`, 400);
    }

    const updateSql = `
      UPDATE meters
      SET
        tecnologia = COALESCE($1, tecnologia),
        estado = COALESCE($2, estado),
        client_id = COALESCE($3, client_id)
      WHERE id = $4
      RETURNING *;
    `;

    const updateParams = [
      tecnologia ? tecnologia.trim() : null,
      estado ? estado.toLowerCase().trim() : null,
      client_id !== undefined ? client_id : null,
      id
    ];

    const result = await query(updateSql, updateParams);
    const updatedMeter = result.rows[0];

    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'UPDATE',
      entity: 'meters',
      entityId: id,
      oldValues: currentData,
      newValues: updatedMeter,
      req
    });

    return success(res, updatedMeter, 'Contador atualizado com sucesso.');
  } catch (err) {
    return error(res, 'Erro ao atualizar contador.', 500, err.message);
  }
}

module.exports = {
  listMeters,
  getMeterById,
  createMeter,
  installMeter,
  updateMeter
};

