/**
 * LECASU GridOps - Controlador de Tarifas de Energia
 * 
 * Implementa a parametrização de planos tarifários, custos por kWh e taxas fixas em Meticais (MZN).
 */

const { query } = require('../config/db');
const { success, error } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');

/**
 * Listagem de tarifas ativas no sistema.
 * GET /api/tariffs
 */
async function listTariffs(req, res) {
  try {
    const { ativo } = req.query;
    let sql = 'SELECT * FROM tariffs';
    const params = [];

    if (ativo !== undefined) {
      sql += ' WHERE ativo = $1';
      params.push(ativo === 'true');
    }

    sql += ' ORDER BY codigo ASC;';

    const result = await query(sql, params);
    return success(res, result.rows);
  } catch (err) {
    return error(res, 'Erro ao listar tarifas.', 500, err.message);
  }
}

/**
 * Consulta de detalhe de uma tarifa.
 * GET /api/tariffs/:id
 */
async function getTariffById(req, res) {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM tariffs WHERE id = $1;', [id]);

    if (result.rowCount === 0) {
      return error(res, 'Tarifa não encontrada.', 404);
    }

    return success(res, result.rows[0]);
  } catch (err) {
    return error(res, 'Erro ao consultar tarifa.', 500, err.message);
  }
}

/**
 * Cadastro de nova tarifa parametrizada.
 * POST /api/tariffs
 */
async function createTariff(req, res) {
  try {
    const {
      codigo,
      nome,
      categoria,
      preco_kwh,
      taxa_disponibilidade = 0.00,
      moeda = 'MZN'
    } = req.body;

    if (!codigo || !nome || !categoria || preco_kwh === undefined) {
      return error(res, 'Campos obrigatórios: codigo, nome, categoria, preco_kwh.', 400);
    }

    const nPreco = parseFloat(preco_kwh);
    const nTaxa = parseFloat(taxa_disponibilidade);

    if (isNaN(nPreco) || nPreco < 0 || isNaN(nTaxa) || nTaxa < 0) {
      return error(res, 'Os valores de preço e taxa devem ser numéricos positivos ou zero.', 400);
    }

    const sql = `
      INSERT INTO tariffs (
        codigo,
        nome,
        categoria,
        preco_kwh,
        taxa_disponibilidade,
        moeda,
        ativo
      ) VALUES ($1, $2, $3, $4, $5, $6, TRUE)
      RETURNING *;
    `;

    const result = await query(sql, [
      codigo.trim().toUpperCase(),
      nome.trim(),
      categoria.trim(),
      nPreco,
      nTaxa,
      moeda.trim().toUpperCase()
    ]);

    const newTariff = result.rows[0];

    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'INSERT',
      entity: 'tariffs',
      entityId: newTariff.id,
      newValues: newTariff,
      req
    });

    return success(res, newTariff, 'Tarifa cadastrada com sucesso.', 201);
  } catch (err) {
    if (err.code === '23505') {
      return error(res, 'Já existe uma tarifa com este código.', 409);
    }
    return error(res, 'Erro ao criar tarifa.', 500, err.message);
  }
}

/**
 * Atualização dos valores de uma tarifa.
 * PUT /api/tariffs/:id
 */
async function updateTariff(req, res) {
  try {
    const { id } = req.params;
    const {
      nome,
      preco_kwh,
      taxa_disponibilidade,
      ativo
    } = req.body;

    const currentRes = await query('SELECT * FROM tariffs WHERE id = $1;', [id]);
    if (currentRes.rowCount === 0) {
      return error(res, 'Tarifa não encontrada.', 404);
    }
    const currentData = currentRes.rows[0];

    const sql = `
      UPDATE tariffs
      SET
        nome = COALESCE($1, nome),
        preco_kwh = COALESCE($2, preco_kwh),
        taxa_disponibilidade = COALESCE($3, taxa_disponibilidade),
        ativo = COALESCE($4, ativo)
      WHERE id = $5
      RETURNING *;
    `;

    const result = await query(sql, [
      nome ? nome.trim() : null,
      preco_kwh !== undefined ? parseFloat(preco_kwh) : null,
      taxa_disponibilidade !== undefined ? parseFloat(taxa_disponibilidade) : null,
      ativo !== undefined ? Boolean(ativo) : null,
      id
    ]);

    const updatedTariff = result.rows[0];

    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'UPDATE',
      entity: 'tariffs',
      entityId: id,
      oldValues: currentData,
      newValues: updatedTariff,
      req
    });

    return success(res, updatedTariff, 'Tarifa atualizada com sucesso.');
  } catch (err) {
    return error(res, 'Erro ao atualizar tarifa.', 500, err.message);
  }
}

module.exports = {
  listTariffs,
  getTariffById,
  createTariff,
  updateTariff
};

