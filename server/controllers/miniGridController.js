/**
 * LECASU GridOps - Controlador de Mini-Redes (MiniGrid Controller)
 * 
 * Implementa a secção 4.1 (Cadastro de mini-redes e GIS) da especificação funcional.
 */

const { query } = require('../config/db');
const { success, error } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');
const { generateNextMiniGridCode } = require('../utils/codeGenerator');

// Estados operacionais válidos
const ESTADOS_OPERACIONAIS = ['planeada', 'instalacao', 'activa', 'indisponivel', 'suspensa'];

/**
 * Validação e normalização de coordenadas geográficas no território de Moçambique.
 * Moçambique localiza-se no Hemisfério Sul (Latitude entre -27.5 e -10.0) e Hemisfério Oriental (Longitude entre 30.0 e 41.5).
 * Esta função corrige automaticamente coordenadas invertidas [lat, lon] vs [lon, lat] ou latitudes sem sinal negativo.
 */
function normalizeMozambiqueCoordinates(c1, c2) {
  if (c1 === null || c1 === undefined || c1 === '' || c2 === null || c2 === undefined || c2 === '') {
    return { lat: null, lon: null, valid: true };
  }
  const n1 = Number(c1);
  const n2 = Number(c2);
  if (isNaN(n1) || isNaN(n2)) return { lat: null, lon: null, valid: false };

  const abs1 = Math.abs(n1);
  const abs2 = Math.abs(n2);

  let lat, lon;
  if (abs1 >= 10.0 && abs1 <= 27.5 && abs2 >= 30.0 && abs2 <= 42.0) {
    lat = -abs1;
    lon = abs2;
  } else if (abs2 >= 10.0 && abs2 <= 27.5 && abs1 >= 30.0 && abs1 <= 42.0) {
    lat = -abs2;
    lon = abs1;
  } else {
    return { lat: n1, lon: n2, valid: false };
  }

  return { lat, lon, valid: true };
}

function isValidMozambiqueCoordinates(lat, lon) {
  if (lat === null || lat === undefined || lat === '' || lon === null || lon === undefined || lon === '') {
    return true; // Coordenadas são opcionais na fase de planeamento
  }
  const norm = normalizeMozambiqueCoordinates(lat, lon);
  return norm.valid;
}

/**
 * GET /api/mini-grids
 * Lista mini-redes com paginação, filtros e agregados rápidos (clientes e ativos).
 */
async function listMiniGrids(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const offset = (page - 1) * limit;

    const { provincia, estado_operacional, search } = req.query;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (provincia && typeof provincia === 'string' && provincia.trim().length > 0) {
      conditions.push(`LOWER(mg.provincia) = LOWER($${paramIndex++})`);
      params.push(provincia.trim());
    }

    if (estado_operacional && ESTADOS_OPERACIONAIS.includes(estado_operacional)) {
      conditions.push(`mg.estado_operacional = $${paramIndex++}`);
      params.push(estado_operacional);
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      conditions.push(`(mg.nome ILIKE $${paramIndex} OR mg.codigo ILIKE $${paramIndex} OR mg.distrito ILIKE $${paramIndex})`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Contagem total
    const countSql = `SELECT COUNT(*) AS total FROM mini_grids mg ${whereClause};`;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0].total, 10);

    // Consulta com contagem de clientes e activos vinculados
    const listSql = `
      SELECT 
        mg.id,
        mg.codigo,
        mg.nome,
        mg.provincia,
        mg.distrito,
        mg.localidade,
        mg.latitude,
        mg.longitude,
        mg.capacidade_kwp,
        mg.capacidade_bateria_kwh,
        mg.estado_operacional,
        mg.data_comissionamento,
        mg.criado_em,
        mg.atualizado_em,
        COUNT(DISTINCT c.id) AS total_clientes,
        COUNT(DISTINCT a.id) AS total_activos
      FROM mini_grids mg
      LEFT JOIN clients c ON c.mini_grid_id = mg.id
      LEFT JOIN assets a ON a.mini_grid_id = mg.id
      ${whereClause}
      GROUP BY mg.id
      ORDER BY mg.criado_em DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    params.push(limit, offset);

    const listRes = await query(listSql, params);

    const miniGrids = listRes.rows.map((row) => ({
      ...row,
      capacidade_kwp: Number(row.capacidade_kwp),
      capacidade_bateria_kwh: Number(row.capacidade_bateria_kwh),
      latitude: row.latitude ? Number(row.latitude) : null,
      longitude: row.longitude ? Number(row.longitude) : null,
      total_clientes: parseInt(row.total_clientes, 10),
      total_activos: parseInt(row.total_activos, 10)
    }));

    return success(
      res,
      miniGrids,
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    );
  } catch (err) {
    console.error('[MINI_GRIDS LIST ERROR]:', err);
    return error(res, 'Erro ao listar mini-redes.', 500);
  }
}

/**
 * GET /api/mini-grids/gis
 * Retorna dados geoespaciais optimizados para mapas em formato GeoJSON FeatureCollection.
 */
async function getMiniGridsGIS(req, res) {
  try {
    const sql = `
      SELECT 
        mg.id,
        mg.codigo,
        mg.nome,
        mg.provincia,
        mg.distrito,
        mg.localidade,
        mg.latitude,
        mg.longitude,
        mg.capacidade_kwp,
        mg.capacidade_bateria_kwh,
        mg.estado_operacional,
        COUNT(DISTINCT c.id) AS total_clientes,
        COUNT(DISTINCT a.id) AS total_activos
      FROM mini_grids mg
      LEFT JOIN clients c ON c.mini_grid_id = mg.id
      LEFT JOIN assets a ON a.mini_grid_id = mg.id
      WHERE mg.latitude IS NOT NULL AND mg.longitude IS NOT NULL
      GROUP BY mg.id
      ORDER BY mg.nome ASC;
    `;

    const result = await query(sql);

    // Formatação em GeoJSON RFC 7946
    const geoJson = {
      type: 'FeatureCollection',
      features: result.rows.map((row) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [Number(row.longitude), Number(row.latitude)]
        },
        properties: {
          id: row.id,
          codigo: row.codigo,
          nome: row.nome,
          provincia: row.provincia,
          distrito: row.distrito,
          localidade: row.localidade,
          capacidade_kwp: Number(row.capacidade_kwp),
          capacidade_bateria_kwh: Number(row.capacidade_bateria_kwh),
          estado_operacional: row.estado_operacional,
          total_clientes: parseInt(row.total_clientes, 10),
          total_activos: parseInt(row.total_activos, 10)
        }
      }))
    };

    return success(res, geoJson, 'Camada GIS de mini-redes carregada com sucesso.');
  } catch (err) {
    console.error('[MINI_GRIDS GIS ERROR]:', err);
    return error(res, 'Erro ao carregar dados geoespaciais das mini-redes.', 500);
  }
}

/**
 * GET /api/mini-grids/:id
 * Consulta detalhada da mini-rede, incluindo inventário de activos e estatísticas de consumidores.
 */
async function getMiniGridById(req, res) {
  try {
    const { id } = req.params;

    // 1. Dados cadastrais da mini-rede
    const mgSql = `
      SELECT 
        id, codigo, nome, provincia, distrito, localidade,
        latitude, longitude, capacidade_kwp, capacidade_bateria_kwh,
        estado_operacional, data_comissionamento, criado_em, atualizado_em
      FROM mini_grids
      WHERE id = $1;
    `;
    const mgRes = await query(mgSql, [id]);

    if (mgRes.rowCount === 0) {
      return error(res, 'Mini-rede não encontrada.', 404);
    }

    const miniGrid = mgRes.rows[0];

    // 2. Activos técnicos vinculados
    const assetsSql = `
      SELECT id, codigo, classe, modelo, fabricante, numero_serie, data_instalacao, garantia_ate, estado
      FROM assets
      WHERE mini_grid_id = $1
      ORDER BY classe ASC, codigo ASC;
    `;
    const assetsRes = await query(assetsSql, [id]);

    // 3. Estatísticas de clientes por categoria
    const clientStatsSql = `
      SELECT 
        categoria,
        COUNT(*) AS total,
        COUNT(CASE WHEN estado = 'activo' THEN 1 END) AS activos
      FROM clients
      WHERE mini_grid_id = $1
      GROUP BY categoria;
    `;
    const clientStatsRes = await query(clientStatsSql, [id]);

    // 4. Estatísticas de contadores
    const meterStatsSql = `
      SELECT 
        estado,
        COUNT(*) AS total
      FROM meters
      WHERE mini_grid_id = $1
      GROUP BY estado;
    `;
    const meterStatsRes = await query(meterStatsSql, [id]);

    const fullDetails = {
      ...miniGrid,
      capacidade_kwp: Number(miniGrid.capacidade_kwp),
      capacidade_bateria_kwh: Number(miniGrid.capacidade_bateria_kwh),
      latitude: miniGrid.latitude ? Number(miniGrid.latitude) : null,
      longitude: miniGrid.longitude ? Number(miniGrid.longitude) : null,
      activos: assetsRes.rows,
      estatisticas_clientes: clientStatsRes.rows.map((r) => ({
        categoria: r.categoria,
        total: parseInt(r.total, 10),
        activos: parseInt(r.activos, 10)
      })),
      estatisticas_contadores: meterStatsRes.rows.map((r) => ({
        estado: r.estado,
        total: parseInt(r.total, 10)
      }))
    };

    return success(res, fullDetails, 'Detalhes da mini-rede obtidos com sucesso.');
  } catch (err) {
    console.error('[MINI_GRIDS GET_BY_ID ERROR]:', err);
    return error(res, 'Erro ao obter detalhes da mini-rede.', 500);
  }
}

/**
 * POST /api/mini-grids
 * Regista uma nova mini-rede no sistema.
 */
async function createMiniGrid(req, res) {
  try {
    let {
      codigo,
      nome,
      provincia,
      distrito,
      localidade,
      latitude,
      longitude,
      capacidade_kwp,
      capacidade_bateria_kwh,
      estado_operacional,
      data_comissionamento
    } = req.body;

    // 1. Validações de campos obrigatórios
    if (!nome || !provincia || !distrito) {
      return error(res, 'Os campos nome, província e distrito são de preenchimento obrigatório.', 400);
    }

    if (typeof nome !== 'string' || nome.trim().length < 3) {
      return error(res, 'O nome da mini-rede deve conter pelo menos 3 caracteres.', 400);
    }

    // 2. Validação ou geração automática do código
    if (!codigo || typeof codigo !== 'string' || codigo.trim().length === 0) {
      codigo = await generateNextMiniGridCode(provincia);
    } else {
      codigo = codigo.trim().toUpperCase();
      const existingCode = await query('SELECT id FROM mini_grids WHERE UPPER(codigo) = $1;', [codigo]);
      if (existingCode.rowCount > 0) {
        return error(res, `Já existe uma mini-rede com o código '${codigo}'.`, 409);
      }
    }

    // 3. Validação e normalização de coordenadas em Moçambique
    if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null && latitude !== '' && longitude !== '') {
      const norm = normalizeMozambiqueCoordinates(latitude, longitude);
      if (!norm.valid) {
        return error(
          res,
          'As coordenadas geográficas fornecidas estão fora dos limites territoriais de Moçambique (Latitude: -27 a -10, Longitude: 30 a 41).',
          400
        );
      }
      latitude = norm.lat;
      longitude = norm.lon;
    }

    // 4. Validação do estado operacional
    const estado = estado_operacional || 'planeada';
    if (!ESTADOS_OPERACIONAIS.includes(estado)) {
      return error(res, `Estado operacional inválido. Valores aceites: ${ESTADOS_OPERACIONAIS.join(', ')}`, 400);
    }

    const nKwp = Math.max(0, Number(capacidade_kwp || 0));
    const nKwh = Math.max(0, Number(capacidade_bateria_kwh || 0));

    // 5. Inserção na base de dados
    const insertSql = `
      INSERT INTO mini_grids (
        codigo,
        nome,
        provincia,
        distrito,
        localidade,
        latitude,
        longitude,
        capacidade_kwp,
        capacidade_bateria_kwh,
        estado_operacional,
        data_comissionamento
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;

    const values = [
      codigo,
      nome.trim(),
      provincia.trim(),
      distrito.trim(),
      localidade ? localidade.trim() : null,
      latitude !== undefined ? Number(latitude) : null,
      longitude !== undefined ? Number(longitude) : null,
      nKwp,
      nKwh,
      estado,
      data_comissionamento || null
    ];

    const insertRes = await query(insertSql, values);
    const newMiniGrid = insertRes.rows[0];

    // 6. Registo em audit_logs
    await logAudit({
      userId: req.user.id,
      tabelaAfetada: 'mini_grids',
      accao: 'INSERT',
      registoId: newMiniGrid.id,
      dadosAntigos: null,
      dadosNovos: newMiniGrid
    });

    return success(res, newMiniGrid, 'Mini-rede registada com sucesso.', 201);
  } catch (err) {
    console.error('[MINI_GRIDS CREATE ERROR]:', err);
    return error(res, 'Erro ao criar mini-rede.', 500);
  }
}

/**
 * PUT /api/mini-grids/:id
 * Atualiza os metadados, parâmetros de capacidade e estado de uma mini-rede.
 */
async function updateMiniGrid(req, res) {
  try {
    const { id } = req.params;
    const {
      nome,
      provincia,
      distrito,
      localidade,
      latitude,
      longitude,
      capacidade_kwp,
      capacidade_bateria_kwh,
      estado_operacional,
      data_comissionamento
    } = req.body;

    // 1. Obtém registo anterior para validação e auditoria
    const existingRes = await query('SELECT * FROM mini_grids WHERE id = $1;', [id]);
    if (existingRes.rowCount === 0) {
      return error(res, 'Mini-rede não encontrada.', 404);
    }
    const oldMiniGrid = existingRes.rows[0];

    // 2. Validações
    if (nome !== undefined && (typeof nome !== 'string' || nome.trim().length < 3)) {
      return error(res, 'O nome deve conter pelo menos 3 caracteres.', 400);
    }

    if (estado_operacional !== undefined && !ESTADOS_OPERACIONAIS.includes(estado_operacional)) {
      return error(res, `Estado operacional inválido. Valores aceites: ${ESTADOS_OPERACIONAIS.join(', ')}`, 400);
    }

    if (latitude !== undefined || longitude !== undefined) {
      const latToCheck = latitude !== undefined ? latitude : oldMiniGrid.latitude;
      const lonToCheck = longitude !== undefined ? longitude : oldMiniGrid.longitude;
      const norm = normalizeMozambiqueCoordinates(latToCheck, lonToCheck);
      if (!norm.valid) {
        return error(res, 'Coordenadas geográficas inválidas para o território moçambicano.', 400);
      }
      if (latitude !== undefined && latitude !== null && latitude !== '') latitude = norm.lat;
      if (longitude !== undefined && longitude !== null && longitude !== '') longitude = norm.lon;
    }

    // 3. Montagem dinâmica dos campos de atualização
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (nome !== undefined) {
      updates.push(`nome = $${paramIndex++}`);
      values.push(nome.trim());
    }
    if (provincia !== undefined) {
      updates.push(`provincia = $${paramIndex++}`);
      values.push(provincia.trim());
    }
    if (distrito !== undefined) {
      updates.push(`distrito = $${paramIndex++}`);
      values.push(distrito.trim());
    }
    if (localidade !== undefined) {
      updates.push(`localidade = $${paramIndex++}`);
      values.push(localidade ? localidade.trim() : null);
    }
    if (latitude !== undefined) {
      updates.push(`latitude = $${paramIndex++}`);
      values.push(latitude !== null ? Number(latitude) : null);
    }
    if (longitude !== undefined) {
      updates.push(`longitude = $${paramIndex++}`);
      values.push(longitude !== null ? Number(longitude) : null);
    }
    if (capacidade_kwp !== undefined) {
      updates.push(`capacidade_kwp = $${paramIndex++}`);
      values.push(Math.max(0, Number(capacidade_kwp)));
    }
    if (capacidade_bateria_kwh !== undefined) {
      updates.push(`capacidade_bateria_kwh = $${paramIndex++}`);
      values.push(Math.max(0, Number(capacidade_bateria_kwh)));
    }
    if (estado_operacional !== undefined) {
      updates.push(`estado_operacional = $${paramIndex++}`);
      values.push(estado_operacional);
    }
    if (data_comissionamento !== undefined) {
      updates.push(`data_comissionamento = $${paramIndex++}`);
      values.push(data_comissionamento || null);
    }

    if (updates.length === 0) {
      return error(res, 'Nenhum campo fornecido para atualização.', 400);
    }

    values.push(id);
    const updateSql = `
      UPDATE mini_grids
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const updateRes = await query(updateSql, values);
    const updatedMiniGrid = updateRes.rows[0];

    // 4. Registo de auditoria
    await logAudit({
      userId: req.user.id,
      tabelaAfetada: 'mini_grids',
      accao: 'UPDATE',
      registoId: updatedMiniGrid.id,
      dadosAntigos: oldMiniGrid,
      dadosNovos: updatedMiniGrid
    });

    return success(res, updatedMiniGrid, 'Mini-rede atualizada com sucesso.');
  } catch (err) {
    console.error('[MINI_GRIDS UPDATE ERROR]:', err);
    return error(res, 'Erro ao atualizar mini-rede.', 500);
  }
}

module.exports = {
  listMiniGrids,
  getMiniGridsGIS,
  getMiniGridById,
  createMiniGrid,
  updateMiniGrid,
  ESTADOS_OPERACIONAIS
};

