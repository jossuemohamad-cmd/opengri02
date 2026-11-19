/**
 * LECASU GridOps - Controlador de Clientes e Ligações
 * 
 * Implementa a gestão comercial e cadastro geográfico de clientes da mini-rede,
 * com geração padronizada de códigos e auditoria contínua de operações.
 */

const { query, getClient } = require('../config/db');
const { success, error } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');
const { generateNextClientCode } = require('../utils/codeGenerator');

// Categorias válidas de cliente
const VALID_CATEGORIES = [
  'residencial',
  'comercial',
  'institucional',
  'telecomunicacoes',
  'servico_publico',
  'uso_produtivo'
];

// Estados válidos de cliente
const VALID_STATUSES = ['activo', 'suspenso', 'desligado'];

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
    return true; // Coordenadas são opcionais
  }
  const norm = normalizeMozambiqueCoordinates(lat, lon);
  return norm.valid;
}

/**
 * Listagem paginada e filtrada de clientes.
 * GET /api/clients
 */
async function listClients(req, res) {
  try {
    const {
      mini_grid_id,
      categoria,
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
    let paramIndex = 1;

    if (mini_grid_id) {
      conditions.push(`c.mini_grid_id = $${paramIndex++}`);
      params.push(mini_grid_id);
    }

    if (categoria) {
      conditions.push(`c.categoria = $${paramIndex++}`);
      params.push(categoria.toLowerCase());
    }

    if (estado) {
      conditions.push(`c.estado = $${paramIndex++}`);
      params.push(estado.toLowerCase());
    }

    if (q && q.trim()) {
      const searchPattern = `%${q.trim()}%`;
      conditions.push(`(
        c.nome_completo ILIKE $${paramIndex} OR
        c.codigo ILIKE $${paramIndex} OR
        c.contacto_principal ILIKE $${paramIndex} OR
        c.documento_identificacao ILIKE $${paramIndex}
      )`);
      params.push(searchPattern);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Contagem total para paginação
    const countSql = `SELECT COUNT(*) AS total FROM clients c ${whereClause};`;
    const countRes = await query(countSql, params);
    const totalRecords = parseInt(countRes.rows[0].total, 10);

    // Consulta principal com dados agregados de mini-rede e contador
    const selectParams = [...params, limitNum, offset];
    const sql = `
      SELECT 
        c.id,
        c.codigo,
        c.nome_completo,
        c.documento_identificacao,
        c.contacto_principal,
        c.contacto_secundario,
        c.latitude,
        c.longitude,
        c.categoria,
        c.foto_url,
        c.estado,
        c.criado_em,
        c.atualizado_em,
        mg.id AS mini_grid_id,
        mg.codigo AS mini_grid_codigo,
        mg.nome AS mini_grid_nome,
        (SELECT COUNT(*) FROM contracts ctr WHERE ctr.client_id = c.id AND ctr.estado = 'activo') AS contratos_activos,
        (SELECT m.numero_serie FROM meters m WHERE m.client_id = c.id LIMIT 1) AS contador_numero_serie
      FROM clients c
      JOIN mini_grids mg ON c.mini_grid_id = mg.id
      ${whereClause}
      ORDER BY c.criado_em DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;

    const result = await query(sql, selectParams);

    return success(res, result.rows, {
      total: totalRecords,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalRecords / limitNum)
    });
  } catch (err) {
    return error(res, 'Erro ao consultar clientes.', 500, err.message);
  }
}

/**
 * Consulta de clientes otimizada para mapas GIS.
 * GET /api/clients/gis
 */
async function getClientsGIS(req, res) {
  try {
    const { mini_grid_id, categoria } = req.query;
    const conditions = ['c.latitude IS NOT NULL', 'c.longitude IS NOT NULL'];
    const params = [];
    let pIdx = 1;

    if (mini_grid_id) {
      conditions.push(`c.mini_grid_id = $${pIdx++}`);
      params.push(mini_grid_id);
    }

    if (categoria) {
      conditions.push(`c.categoria = $${pIdx++}`);
      params.push(categoria.toLowerCase());
    }

    const sql = `
      SELECT 
        c.id,
        c.codigo,
        c.nome_completo,
        c.categoria,
        c.estado,
        c.latitude,
        c.longitude,
        c.contacto_principal,
        mg.codigo AS mini_grid_codigo,
        mg.nome AS mini_grid_nome
      FROM clients c
      JOIN mini_grids mg ON c.mini_grid_id = mg.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY c.criado_em DESC;
    `;

    const result = await query(sql, params);

    // Formato GeoJSON FeatureCollection
    const features = result.rows.map(row => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [parseFloat(row.longitude), parseFloat(row.latitude)]
      },
      properties: {
        id: row.id,
        codigo: row.codigo,
        nome_completo: row.nome_completo,
        categoria: row.categoria,
        estado: row.estado,
        contacto: row.contacto_principal,
        mini_grid_codigo: row.mini_grid_codigo,
        mini_grid_nome: row.mini_grid_nome
      }
    }));

    return success(res, {
      type: 'FeatureCollection',
      features
    });
  } catch (err) {
    return error(res, 'Erro ao carregar dados geoespaciais de clientes.', 500, err.message);
  }
}

/**
 * Detalhes completos da ficha cadastral de um cliente.
 * GET /api/clients/:id
 */
async function getClientById(req, res) {
  try {
    const { id } = req.params;

    const clientSql = `
      SELECT 
        c.*,
        mg.codigo AS mini_grid_codigo,
        mg.nome AS mini_grid_nome,
        mg.provincia AS mini_grid_provincia,
        mg.distrito AS mini_grid_distrito,
        mg.localidade AS mini_grid_localidade
      FROM clients c
      JOIN mini_grids mg ON c.mini_grid_id = mg.id
      WHERE c.id = $1;
    `;
    const clientRes = await query(clientSql, [id]);

    if (clientRes.rowCount === 0) {
      return error(res, 'Cliente não encontrado.', 404);
    }

    const clientData = clientRes.rows[0];

    // Contratos associados
    const contractsRes = await query(
      'SELECT * FROM contracts WHERE client_id = $1 ORDER BY criado_em DESC;',
      [id]
    );

    // Contadores associados
    const metersRes = await query(
      'SELECT * FROM meters WHERE client_id = $1 ORDER BY criado_em DESC;',
      [id]
    );

    // Últimos pagamentos
    const paymentsRes = await query(
      'SELECT * FROM payments WHERE client_id = $1 ORDER BY data_pagamento DESC LIMIT 10;',
      [id]
    );

    return success(res, {
      ...clientData,
      contracts: contractsRes.rows,
      meters: metersRes.rows,
      recent_payments: paymentsRes.rows
    });
  } catch (err) {
    return error(res, 'Erro ao obter dados do cliente.', 500, err.message);
  }
}

/**
 * Cadastro de novo cliente com geração automática de código padronizado.
 * POST /api/clients
 */
async function createClient(req, res) {
  const dbClient = await getClient();

  try {
    const {
      mini_grid_id,
      nome_completo,
      documento_identificacao,
      contacto_principal,
      contacto_secundario,
      latitude,
      longitude,
      categoria,
      foto_url
    } = req.body;

    // Validações obrigatórias
    if (!mini_grid_id || !nome_completo || !contacto_principal || !categoria) {
      return error(res, 'Campos obrigatórios em falta: mini_grid_id, nome_completo, contacto_principal, categoria.', 400);
    }

    const cleanCategory = categoria.toLowerCase().trim();
    if (!VALID_CATEGORIES.includes(cleanCategory)) {
      return error(res, `Categoria inválida. Categorias aceites: ${VALID_CATEGORIES.join(', ')}.`, 400);
    }

    let normLat = null;
    let normLon = null;
    if (latitude !== undefined && longitude !== undefined && latitude !== null && longitude !== null && latitude !== '' && longitude !== '') {
      const norm = normalizeMozambiqueCoordinates(latitude, longitude);
      if (!norm.valid) {
        return error(res, 'Coordenadas geográficas fora dos limites territoriais de Moçambique.', 400);
      }
      normLat = norm.lat;
      normLon = norm.lon;
    }

    await dbClient.query('BEGIN');

    // 1. Verifica se a mini-rede existe
    const mgRes = await dbClient.query('SELECT id, codigo FROM mini_grids WHERE id = $1;', [mini_grid_id]);
    if (mgRes.rowCount === 0) {
      await dbClient.query('ROLLBACK');
      return error(res, 'Mini-rede especificada não existe.', 404);
    }

    // 2. Gera código único padronizado (ex: MR001-RES-0001)
    const codigo = await generateNextClientCode(mini_grid_id, cleanCategory, dbClient);

    // 3. Insere o cliente
    const insertSql = `
      INSERT INTO clients (
        codigo,
        mini_grid_id,
        nome_completo,
        documento_identificacao,
        contacto_principal,
        contacto_secundario,
        latitude,
        longitude,
        categoria,
        foto_url,
        estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'activo')
      RETURNING *;
    `;

    const insertParams = [
      codigo,
      mini_grid_id,
      nome_completo.trim(),
      documento_identificacao ? documento_identificacao.trim() : null,
      contacto_principal.trim(),
      contacto_secundario ? contacto_secundario.trim() : null,
      normLat,
      normLon,
      cleanCategory,
      foto_url || null
    ];

    const insertRes = await dbClient.query(insertSql, insertParams);
    const newClient = insertRes.rows[0];

    // 4. Regista em audit_logs
    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'INSERT',
      entity: 'clients',
      entityId: newClient.id,
      newValues: newClient,
      req
    });

    await dbClient.query('COMMIT');

    return success(res, newClient, 'Cliente cadastrado com sucesso.', 201);
  } catch (err) {
    await dbClient.query('ROLLBACK');
    return error(res, 'Erro ao cadastrar cliente.', 500, err.message);
  } finally {
    dbClient.release();
  }
}

/**
 * Atualização dos dados de um cliente existente.
 * PUT /api/clients/:id
 */
async function updateClient(req, res) {
  try {
    const { id } = req.params;
    const {
      nome_completo,
      documento_identificacao,
      contacto_principal,
      contacto_secundario,
      latitude,
      longitude,
      categoria,
      foto_url,
      estado
    } = req.body;

    const currentRes = await query('SELECT * FROM clients WHERE id = $1;', [id]);
    if (currentRes.rowCount === 0) {
      return error(res, 'Cliente não encontrado.', 404);
    }
    const currentData = currentRes.rows[0];

    if (categoria && !VALID_CATEGORIES.includes(categoria.toLowerCase())) {
      return error(res, `Categoria inválida. Categorias aceites: ${VALID_CATEGORIES.join(', ')}.`, 400);
    }

    if (estado && !VALID_STATUSES.includes(estado.toLowerCase())) {
      return error(res, `Estado inválido. Estados aceites: ${VALID_STATUSES.join(', ')}.`, 400);
    }

    let normLat = latitude !== undefined && latitude !== null && latitude !== '' ? Number(latitude) : null;
    let normLon = longitude !== undefined && longitude !== null && longitude !== '' ? Number(longitude) : null;

    if (latitude !== undefined || longitude !== undefined) {
      const latToCheck = latitude !== undefined ? latitude : currentData.latitude;
      const lonToCheck = longitude !== undefined ? longitude : currentData.longitude;
      const norm = normalizeMozambiqueCoordinates(latToCheck, lonToCheck);
      if (!norm.valid) {
        return error(res, 'Coordenadas geográficas fora dos limites territoriais de Moçambique.', 400);
      }
      if (latitude !== undefined && latitude !== null && latitude !== '') normLat = norm.lat;
      if (longitude !== undefined && longitude !== null && longitude !== '') normLon = norm.lon;
    }

    const updateSql = `
      UPDATE clients
      SET
        nome_completo = COALESCE($1, nome_completo),
        documento_identificacao = COALESCE($2, documento_identificacao),
        contacto_principal = COALESCE($3, contacto_principal),
        contacto_secundario = COALESCE($4, contacto_secundario),
        latitude = COALESCE($5, latitude),
        longitude = COALESCE($6, longitude),
        categoria = COALESCE($7, categoria),
        foto_url = COALESCE($8, foto_url),
        estado = COALESCE($9, estado)
      WHERE id = $10
      RETURNING *;
    `;

    const updateParams = [
      nome_completo ? nome_completo.trim() : null,
      documento_identificacao !== undefined ? documento_identificacao : null,
      contacto_principal ? contacto_principal.trim() : null,
      contacto_secundario !== undefined ? contacto_secundario : null,
      normLat,
      normLon,
      categoria ? categoria.toLowerCase().trim() : null,
      foto_url !== undefined ? foto_url : null,
      estado ? estado.toLowerCase().trim() : null,
      id
    ];

    const result = await query(updateSql, updateParams);
    const updatedClient = result.rows[0];

    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'UPDATE',
      entity: 'clients',
      entityId: id,
      oldValues: currentData,
      newValues: updatedClient,
      req
    });

    return success(res, updatedClient, 'Cliente atualizado com sucesso.');
  } catch (err) {
    return error(res, 'Erro ao atualizar dados do cliente.', 500, err.message);
  }
}

/**
 * Atualização rápida do estado operacional de um cliente (ativo, suspenso, desligado).
 * PATCH /api/clients/:id/status
 */
async function changeClientStatus(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || !VALID_STATUSES.includes(estado.toLowerCase().trim())) {
      return error(res, `Estado inválido. Estados permitidos: ${VALID_STATUSES.join(', ')}.`, 400);
    }

    const currentRes = await query('SELECT * FROM clients WHERE id = $1;', [id]);
    if (currentRes.rowCount === 0) {
      return error(res, 'Cliente não encontrado.', 404);
    }
    const currentData = currentRes.rows[0];

    const updateSql = `
      UPDATE clients
      SET estado = $1
      WHERE id = $2
      RETURNING *;
    `;

    const result = await query(updateSql, [estado.toLowerCase().trim(), id]);
    const updatedClient = result.rows[0];

    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'UPDATE_STATUS',
      entity: 'clients',
      entityId: id,
      oldValues: { estado: currentData.estado },
      newValues: { estado: updatedClient.estado },
      req
    });

    return success(res, updatedClient, `Estado do cliente alterado para '${estado}'.`);
  } catch (err) {
    return error(res, 'Erro ao alterar estado do cliente.', 500, err.message);
  }
}

module.exports = {
  listClients,
  getClientsGIS,
  getClientById,
  createClient,
  updateClient,
  changeClientStatus
};

