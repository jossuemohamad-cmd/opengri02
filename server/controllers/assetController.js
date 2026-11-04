/**
 * LECASU GridOps - Controlador de Gestão de Activos Técnicos (Asset Controller)
 * 
 * Implementa a secção 4.5 (Gestão de activos) e secção 5 (Identificação e codificação).
 */

const { query } = require('../config/db');
const { success, error } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');
const { generateNextAssetCode } = require('../utils/codeGenerator');

// Classes técnicas autorizadas conforme o esquema relacional
const ASSET_CLASSES = [
  'central',
  'inversor',
  'bateria',
  'quadro',
  'transformador',
  'cabo',
  'poste',
  'proteccao'
];

const ASSET_STATES = ['operacional', 'degradado', 'inoperante'];

/**
 * GET /api/assets
 * Lista todos os activos com paginação e filtros (mini-rede, classe técnica, estado, busca).
 */
async function listAssets(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const offset = (page - 1) * limit;

    const { mini_grid_id, classe, estado, search } = req.query;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (mini_grid_id) {
      conditions.push(`a.mini_grid_id = $${paramIndex++}`);
      params.push(mini_grid_id);
    }

    if (classe && ASSET_CLASSES.includes(classe)) {
      conditions.push(`a.classe = $${paramIndex++}`);
      params.push(classe);
    }

    if (estado && ASSET_STATES.includes(estado)) {
      conditions.push(`a.estado = $${paramIndex++}`);
      params.push(estado);
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      conditions.push(`(
        a.codigo ILIKE $${paramIndex} OR 
        a.modelo ILIKE $${paramIndex} OR 
        a.fabricante ILIKE $${paramIndex} OR 
        a.numero_serie ILIKE $${paramIndex}
      )`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Contagem total
    const countSql = `SELECT COUNT(*) AS total FROM assets a ${whereClause};`;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0].total, 10);

    // Consulta de activos com junção à mini-rede
    const listSql = `
      SELECT 
        a.id,
        a.codigo,
        a.mini_grid_id,
        mg.codigo AS mini_grid_codigo,
        mg.nome AS mini_grid_nome,
        a.classe,
        a.modelo,
        a.fabricante,
        a.numero_serie,
        a.data_instalacao,
        a.garantia_ate,
        a.estado,
        a.criado_em
      FROM assets a
      JOIN mini_grids mg ON mg.id = a.mini_grid_id
      ${whereClause}
      ORDER BY a.criado_em DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    params.push(limit, offset);

    const listRes = await query(listSql, params);

    return success(
      res,
      listRes.rows,
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    );
  } catch (err) {
    console.error('[ASSETS LIST ERROR]:', err);
    return error(res, 'Erro ao listar activos técnicos.', 500);
  }
}

/**
 * GET /api/mini-grids/:miniGridId/assets
 * Retorna todos os activos pertencentes a uma mini-rede específica.
 */
async function listAssetsByMiniGrid(req, res) {
  try {
    const { miniGridId } = req.params;

    // Garante que a mini-rede existe
    const mgRes = await query('SELECT id, codigo, nome FROM mini_grids WHERE id = $1;', [miniGridId]);
    if (mgRes.rowCount === 0) {
      return error(res, 'Mini-rede não encontrada.', 404);
    }

    const sql = `
      SELECT 
        id, codigo, classe, modelo, fabricante, numero_serie,
        data_instalacao, garantia_ate, estado, criado_em
      FROM assets
      WHERE mini_grid_id = $1
      ORDER BY 
        CASE classe
          WHEN 'central' THEN 1
          WHEN 'inversor' THEN 2
          WHEN 'bateria' THEN 3
          WHEN 'transformador' THEN 4
          WHEN 'quadro' THEN 5
          WHEN 'proteccao' THEN 6
          WHEN 'cabo' THEN 7
          WHEN 'poste' THEN 8
          ELSE 9
        END ASC,
        codigo ASC;
    `;

    const result = await query(sql, [miniGridId]);

    return success(
      res,
      result.rows,
      {
        mini_grid: mgRes.rows[0],
        total: result.rowCount
      }
    );
  } catch (err) {
    console.error('[ASSETS BY_MINIGRID ERROR]:', err);
    return error(res, 'Erro ao obter activos da mini-rede.', 500);
  }
}

/**
 * GET /api/assets/:id
 * Consulta ficha completa de um activo e seu histórico de ordens de trabalho.
 */
async function getAssetById(req, res) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        a.id,
        a.codigo,
        a.mini_grid_id,
        mg.codigo AS mini_grid_codigo,
        mg.nome AS mini_grid_nome,
        mg.provincia AS mini_grid_provincia,
        mg.distrito AS mini_grid_distrito,
        a.classe,
        a.modelo,
        a.fabricante,
        a.numero_serie,
        a.data_instalacao,
        a.garantia_ate,
        a.estado,
        a.criado_em
      FROM assets a
      JOIN mini_grids mg ON mg.id = a.mini_grid_id
      WHERE a.id = $1;
    `;

    const resAsset = await query(sql, [id]);

    if (resAsset.rowCount === 0) {
      return error(res, 'Activo técnico não encontrado.', 404);
    }

    const asset = resAsset.rows[0];

    // Histórico de ordens de serviço / avarias ligadas ao activo
    const woSql = `
      SELECT 
        wo.id,
        wo.numero_ordem,
        wo.tipo,
        wo.prioridade,
        wo.descricao,
        wo.estado,
        wo.solucao,
        u.nome AS tecnico_nome,
        wo.criado_em,
        wo.encerrado_em
      FROM work_orders wo
      LEFT JOIN users u ON u.id = wo.tecnico_id
      WHERE wo.asset_id = $1
      ORDER BY wo.criado_em DESC;
    `;
    const woRes = await query(woSql, [id]);

    return success(
      res,
      {
        ...asset,
        historico_manutencoes: woRes.rows
      },
      'Ficha técnica do activo obtida com sucesso.'
    );
  } catch (err) {
    console.error('[ASSETS GET_BY_ID ERROR]:', err);
    return error(res, 'Erro ao obter detalhes do activo.', 500);
  }
}

/**
 * POST /api/assets
 * Regista um novo activo técnico com associação a uma mini-rede.
 */
async function createAsset(req, res) {
  try {
    let {
      codigo,
      mini_grid_id,
      classe,
      modelo,
      fabricante,
      numero_serie,
      data_instalacao,
      garantia_ate,
      estado
    } = req.body;

    // 1. Validação de campos obrigatórios
    if (!mini_grid_id || !classe) {
      return error(res, 'Os campos mini_grid_id e classe são obrigatórios.', 400);
    }

    if (!ASSET_CLASSES.includes(classe)) {
      return error(
        res,
        `Classe de activo inválida. Classes autorizadas: ${ASSET_CLASSES.join(', ')}`,
        400
      );
    }

    // 2. Validação da mini-rede
    const mgRes = await query('SELECT id, codigo FROM mini_grids WHERE id = $1;', [mini_grid_id]);
    if (mgRes.rowCount === 0) {
      return error(res, 'A mini-rede especificada não existe.', 404);
    }

    // 3. Validação do estado do activo
    const estadoFinal = estado || 'operacional';
    if (!ASSET_STATES.includes(estadoFinal)) {
      return error(res, `Estado inválido. Estados aceites: ${ASSET_STATES.join(', ')}`, 400);
    }

    // 4. Validação ou geração automática do código
    if (!codigo || typeof codigo !== 'string' || codigo.trim().length === 0) {
      codigo = await generateNextAssetCode(mini_grid_id, classe);
    } else {
      codigo = codigo.trim().toUpperCase();
      const existingRes = await query('SELECT id FROM assets WHERE UPPER(codigo) = $1;', [codigo]);
      if (existingRes.rowCount > 0) {
        return error(res, `Já existe um activo com o código '${codigo}'.`, 409);
      }
    }

    // 5. Inserção na base de dados
    const insertSql = `
      INSERT INTO assets (
        codigo,
        mini_grid_id,
        classe,
        modelo,
        fabricante,
        numero_serie,
        data_instalacao,
        garantia_ate,
        estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const values = [
      codigo,
      mini_grid_id,
      classe,
      modelo ? modelo.trim() : null,
      fabricante ? fabricante.trim() : null,
      numero_serie ? numero_serie.trim() : null,
      data_instalacao || null,
      garantia_ate || null,
      estadoFinal
    ];

    const insertRes = await query(insertSql, values);
    const newAsset = insertRes.rows[0];

    // 6. Registo na trilha de auditoria
    await logAudit({
      userId: req.user.id,
      tabelaAfetada: 'assets',
      accao: 'INSERT',
      registoId: newAsset.id,
      dadosAntigos: null,
      dadosNovos: newAsset
    });

    return success(res, newAsset, 'Activo técnico registado com sucesso.', 201);
  } catch (err) {
    console.error('[ASSETS CREATE ERROR]:', err);
    return error(res, 'Erro ao criar activo técnico.', 500);
  }
}

/**
 * PUT /api/assets/:id
 * Atualiza dados cadastrais, estado operacional ou garantia de um activo.
 */
async function updateAsset(req, res) {
  try {
    const { id } = req.params;
    const {
      modelo,
      fabricante,
      numero_serie,
      data_instalacao,
      garantia_ate,
      estado
    } = req.body;

    // 1. Obtém registo anterior para validação e auditoria
    const existingRes = await query('SELECT * FROM assets WHERE id = $1;', [id]);
    if (existingRes.rowCount === 0) {
      return error(res, 'Activo técnico não encontrado.', 404);
    }
    const oldAsset = existingRes.rows[0];

    // 2. Validações
    if (estado !== undefined && !ASSET_STATES.includes(estado)) {
      return error(res, `Estado inválido. Estados aceites: ${ASSET_STATES.join(', ')}`, 400);
    }

    // 3. Montagem dinâmica dos campos para atualização
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (modelo !== undefined) {
      updates.push(`modelo = $${paramIndex++}`);
      values.push(modelo ? modelo.trim() : null);
    }
    if (fabricante !== undefined) {
      updates.push(`fabricante = $${paramIndex++}`);
      values.push(fabricante ? fabricante.trim() : null);
    }
    if (numero_serie !== undefined) {
      updates.push(`numero_serie = $${paramIndex++}`);
      values.push(numero_serie ? numero_serie.trim() : null);
    }
    if (data_instalacao !== undefined) {
      updates.push(`data_instalacao = $${paramIndex++}`);
      values.push(data_instalacao || null);
    }
    if (garantia_ate !== undefined) {
      updates.push(`garantia_ate = $${paramIndex++}`);
      values.push(garantia_ate || null);
    }
    if (estado !== undefined) {
      updates.push(`estado = $${paramIndex++}`);
      values.push(estado);
    }

    if (updates.length === 0) {
      return error(res, 'Nenhum campo fornecido para atualização.', 400);
    }

    values.push(id);
    const updateSql = `
      UPDATE assets
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const updateRes = await query(updateSql, values);
    const updatedAsset = updateRes.rows[0];

    // 4. Registo de auditoria
    await logAudit({
      userId: req.user.id,
      tabelaAfetada: 'assets',
      accao: 'UPDATE',
      registoId: updatedAsset.id,
      dadosAntigos: oldAsset,
      dadosNovos: updatedAsset
    });

    return success(res, updatedAsset, 'Activo técnico atualizado com sucesso.');
  } catch (err) {
    console.error('[ASSETS UPDATE ERROR]:', err);
    return error(res, 'Erro ao atualizar activo técnico.', 500);
  }
}

module.exports = {
  listAssets,
  listAssetsByMiniGrid,
  getAssetById,
  createAsset,
  updateAsset,
  ASSET_CLASSES,
  ASSET_STATES
};

