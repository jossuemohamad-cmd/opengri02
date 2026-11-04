/**
 * LECASU GridOps - Gerador de Códigos e Identificadores Operacionais
 * 
 * Implementa as regras de codificação da secção 5 da especificação funcional:
 * - Mini-redes: MR-[REGIAO]-[SEQUENCIAL] (ex: MR-MPT-001)
 * - Activos: AST-[MINI_REDE]-[CLASSE]-[SEQUENCIAL] (ex: AST-MR001-INV-02)
 * - Clientes: [MINI_REDE]-[CATEGORIA]-[SEQUENCIAL] (ex: MR001-RES-0001, MR001-PUE-0012)
 * - Contadores: MTR-[MINI_REDE]-[SEQUENCIAL] (ex: MTR-MR001-0048)
 * - Contratos: CTR-[ANO]-[SEQUENCIAL] (ex: CTR-2026-0001)
 * - Ordens de Trabalho: OT-[ANO]-[SEQUENCIAL] (ex: OT-2026-000145)
 */

const { query } = require('../config/db');

// Siglas padrão para as províncias de Moçambique
const PROVINCE_CODES = {
  maputo: 'MPT',
  'maputo cidade': 'MPC',
  'maputo província': 'MPT',
  'maputo provincia': 'MPT',
  gaza: 'GZA',
  inhambane: 'INH',
  sofala: 'SOF',
  manica: 'MAN',
  tete: 'TET',
  zambézia: 'ZAM',
  zambezia: 'ZAM',
  nampula: 'NAM',
  'cabo delgado': 'CAB',
  niassa: 'NIA'
};

// Siglas padrão para as classes técnicas de activos
const ASSET_CLASS_CODES = {
  central: 'CEN',
  inversor: 'INV',
  bateria: 'BAT',
  quadro: 'QDR',
  transformador: 'TRF',
  cabo: 'CAB',
  poste: 'PST',
  proteccao: 'PRT'
};

// Siglas padrão para categorias de clientes
const CLIENT_CATEGORY_CODES = {
  residencial: 'RES',
  comercial: 'COM',
  institucional: 'INS',
  telecomunicacoes: 'TEL',
  servico_publico: 'PUB',
  uso_produtivo: 'PUE'
};

/**
 * Obtém a sigla regional a partir do nome da província.
 * @param {string} provincia 
 * @returns {string} Sigla de 3 caracteres (ex: 'MPT', 'GZA')
 */
function getProvinceCode(provincia) {
  if (!provincia) return 'GEN';
  const clean = provincia.trim().toLowerCase();
  return PROVINCE_CODES[clean] || clean.substring(0, 3).toUpperCase();
}

/**
 * Obtém a sigla técnica a partir da classe do activo.
 * @param {string} classe 
 * @returns {string} Sigla de 3 caracteres (ex: 'INV', 'BAT')
 */
function getAssetClassCode(classe) {
  if (!classe) return 'AST';
  const clean = classe.trim().toLowerCase();
  return ASSET_CLASS_CODES[clean] || clean.substring(0, 3).toUpperCase();
}

/**
 * Obtém a sigla a partir da categoria do cliente.
 * @param {string} categoria 
 * @returns {string} Sigla de 3 caracteres (ex: 'RES', 'PUE')
 */
function getClientCategoryCode(categoria) {
  if (!categoria) return 'RES';
  const clean = categoria.trim().toLowerCase();
  return CLIENT_CATEGORY_CODES[clean] || 'RES';
}

/**
 * Simplifica o código da mini-rede para composição em códigos derivados de activos e clientes.
 * Exemplo: 'MR-MPT-001' -> 'MR001'
 * @param {string} miniGridCodigo 
 * @returns {string}
 */
function sanitizeMiniGridCode(miniGridCodigo) {
  if (!miniGridCodigo) return 'MR001';
  const match = miniGridCodigo.match(/(\d+)$/);
  if (match) {
    return `MR${match[1]}`;
  }
  return miniGridCodigo.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

/**
 * Gera de forma segura o próximo código sequencial para uma nova mini-rede.
 * Formato: MR-[REGIAO]-[SEQ3] (ex: MR-MPT-001, MR-MPT-002)
 * 
 * @param {string} provincia - Nome da província da mini-rede
 * @param {import('pg').PoolClient} [client] - Opcional para suporte a transações
 * @returns {Promise<string>}
 */
async function generateNextMiniGridCode(provincia, client = null) {
  const regiao = getProvinceCode(provincia);
  const prefix = `MR-${regiao}-`;

  const sql = `
    SELECT codigo
    FROM mini_grids
    WHERE codigo LIKE $1
    ORDER BY codigo DESC
    LIMIT 1;
  `;

  const queryFn = client ? client.query.bind(client) : query;
  const res = await queryFn(sql, [`${prefix}%`]);

  let nextSeq = 1;

  if (res.rowCount > 0) {
    const lastCode = res.rows[0].codigo;
    const parts = lastCode.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const seqStr = String(nextSeq).padStart(3, '0');
  return `${prefix}${seqStr}`;
}

/**
 * Gera de forma segura o próximo código sequencial para um novo activo técnico.
 * Formato: AST-[MINI_REDE]-[CLASSE]-[SEQ2] (ex: AST-MR001-INV-02)
 * 
 * @param {string} miniGridId - UUID da mini-rede
 * @param {string} classe - Classe do activo ('inversor', 'bateria', etc.)
 * @param {import('pg').PoolClient} [client] - Opcional para suporte a transações
 * @returns {Promise<string>}
 */
async function generateNextAssetCode(miniGridId, classe, client = null) {
  const queryFn = client ? client.query.bind(client) : query;

  const mgRes = await queryFn('SELECT codigo FROM mini_grids WHERE id = $1;', [miniGridId]);
  if (mgRes.rowCount === 0) {
    throw new Error('Mini-rede não encontrada para gerar código de activo.');
  }

  const rawMiniGridCode = mgRes.rows[0].codigo;
  const shortMgCode = sanitizeMiniGridCode(rawMiniGridCode);
  const classCode = getAssetClassCode(classe);

  const prefix = `AST-${shortMgCode}-${classCode}-`;

  const sql = `
    SELECT codigo
    FROM assets
    WHERE mini_grid_id = $1 AND classe = $2 AND codigo LIKE $3
    ORDER BY codigo DESC
    LIMIT 1;
  `;

  const res = await queryFn(sql, [miniGridId, classe, `${prefix}%`]);

  let nextSeq = 1;

  if (res.rowCount > 0) {
    const lastCode = res.rows[0].codigo;
    const parts = lastCode.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const seqStr = String(nextSeq).padStart(2, '0');
  return `${prefix}${seqStr}`;
}

/**
 * Gera de forma segura o próximo código sequencial para um novo cliente.
 * Formato: [SHORT_MINI_REDE]-[CATEGORIA]-[SEQ4] (ex: MR001-RES-0001, MR001-PUE-0012)
 * 
 * @param {string} miniGridId - UUID da mini-rede
 * @param {string} categoria - Categoria do cliente ('residencial', 'comercial', 'uso_produtivo', etc.)
 * @param {import('pg').PoolClient} [client] - Opcional para suporte a transações
 * @returns {Promise<string>}
 */
async function generateNextClientCode(miniGridId, categoria, client = null) {
  const queryFn = client ? client.query.bind(client) : query;

  const mgRes = await queryFn('SELECT codigo FROM mini_grids WHERE id = $1;', [miniGridId]);
  if (mgRes.rowCount === 0) {
    throw new Error('Mini-rede não encontrada para gerar código de cliente.');
  }

  const shortMgCode = sanitizeMiniGridCode(mgRes.rows[0].codigo);
  const catCode = getClientCategoryCode(categoria);
  const prefix = `${shortMgCode}-${catCode}-`;

  const sql = `
    SELECT codigo
    FROM clients
    WHERE mini_grid_id = $1 AND codigo LIKE $2
    ORDER BY codigo DESC
    LIMIT 1;
  `;

  const res = await queryFn(sql, [miniGridId, `${prefix}%`]);

  let nextSeq = 1;

  if (res.rowCount > 0) {
    const lastCode = res.rows[0].codigo;
    const parts = lastCode.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const seqStr = String(nextSeq).padStart(4, '0');
  return `${prefix}${seqStr}`;
}

/**
 * Gera de forma segura o próximo número de série/código para um novo contador.
 * Formato: MTR-[SHORT_MINI_REDE]-[SEQ4] (ex: MTR-MR001-0048)
 * 
 * @param {string} miniGridId - UUID da mini-rede
 * @param {import('pg').PoolClient} [client] - Opcional para suporte a transações
 * @returns {Promise<string>}
 */
async function generateNextMeterCode(miniGridId, client = null) {
  const queryFn = client ? client.query.bind(client) : query;

  const mgRes = await queryFn('SELECT codigo FROM mini_grids WHERE id = $1;', [miniGridId]);
  if (mgRes.rowCount === 0) {
    throw new Error('Mini-rede não encontrada para gerar código de contador.');
  }

  const shortMgCode = sanitizeMiniGridCode(mgRes.rows[0].codigo);
  const prefix = `MTR-${shortMgCode}-`;

  const sql = `
    SELECT numero_serie
    FROM meters
    WHERE mini_grid_id = $1 AND numero_serie LIKE $2
    ORDER BY numero_serie DESC
    LIMIT 1;
  `;

  const res = await queryFn(sql, [miniGridId, `${prefix}%`]);

  let nextSeq = 1;

  if (res.rowCount > 0) {
    const lastCode = res.rows[0].numero_serie;
    const parts = lastCode.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const seqStr = String(nextSeq).padStart(4, '0');
  return `${prefix}${seqStr}`;
}

/**
 * Gera de forma segura o próximo número sequencial para um novo contrato.
 * Formato: CTR-[ANO]-[SEQ4] (ex: CTR-2026-0001)
 * 
 * @param {number} [ano] - Ano do contrato (default: ano atual)
 * @param {import('pg').PoolClient} [client] - Opcional para suporte a transações
 * @returns {Promise<string>}
 */
async function generateNextContractCode(ano = new Date().getFullYear(), client = null) {
  const queryFn = client ? client.query.bind(client) : query;
  const prefix = `CTR-${ano}-`;

  const sql = `
    SELECT numero_contrato
    FROM contracts
    WHERE numero_contrato LIKE $1
    ORDER BY numero_contrato DESC
    LIMIT 1;
  `;

  const res = await queryFn(sql, [`${prefix}%`]);

  let nextSeq = 1;

  if (res.rowCount > 0) {
    const lastCode = res.rows[0].numero_contrato;
    const parts = lastCode.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const seqStr = String(nextSeq).padStart(4, '0');
  return `${prefix}${seqStr}`;
}

/**
 * Gera de forma segura o próximo número sequencial para uma ordem de trabalho.
 * Formato: OT-[ANO]-[SEQ6] (ex: OT-2026-000145)
 * 
 * @param {number} [ano] - Ano da OT (default: ano atual)
 * @param {import('pg').PoolClient} [client] - Opcional para suporte a transações
 * @returns {Promise<string>}
 */
async function generateNextWorkOrderCode(ano = new Date().getFullYear(), client = null) {
  const queryFn = client ? client.query.bind(client) : query;
  const prefix = `OT-${ano}-`;

  const sql = `
    SELECT numero_ordem
    FROM work_orders
    WHERE numero_ordem LIKE $1
    ORDER BY numero_ordem DESC
    LIMIT 1;
  `;

  const res = await queryFn(sql, [`${prefix}%`]);

  let nextSeq = 1;

  if (res.rowCount > 0) {
    const lastCode = res.rows[0].numero_ordem;
    const parts = lastCode.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextSeq = lastNum + 1;
    }
  }

  const seqStr = String(nextSeq).padStart(6, '0');
  return `${prefix}${seqStr}`;
}

module.exports = {
  PROVINCE_CODES,
  ASSET_CLASS_CODES,
  CLIENT_CATEGORY_CODES,
  getProvinceCode,
  getAssetClassCode,
  getClientCategoryCode,
  sanitizeMiniGridCode,
  generateNextMiniGridCode,
  generateNextAssetCode,
  generateNextClientCode,
  generateNextMeterCode,
  generateNextContractCode,
  generateNextWorkOrderCode
};
