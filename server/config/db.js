/**
 * LECASU GridOps - Configuração e Módulo de Ligação ao PostgreSQL
 * 
 * Utiliza pg.Pool para gestão eficiente de conexões com suporte a consultas parametrizadas,
 * verificação de integridade (health check) e encerramento gracioso (graceful shutdown).
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { Pool } = require('pg');

// Deteção inteligente de SSL (obrigatório para Neon e instâncias cloud com sslmode=require)
const isSsl = process.env.PGSSL === 'true' ||
  (process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('sslmode=require') || process.env.DATABASE_URL.includes('neon.tech')));

// Configuração da Pool com suporte a DATABASE_URL ou variáveis discretas
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isSsl ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.PGMAX_POOL || '5', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      database: process.env.PGDATABASE || 'lecasu_gridops',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      ssl: isSsl ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.PGMAX_POOL || '5', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    };

const pool = new Pool(poolConfig);

// Eventos de monitorização da Pool
pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DB] Nova ligação estabelecida com o PostgreSQL.');
  }
});

pool.on('error', (err) => {
  console.error('[DB] Erro inesperado no cliente inativo da pool do PostgreSQL:', err.message);
});

/**
 * Executa uma consulta parametrizada na pool.
 * Garante segurança contra SQL Injection através do uso de parâmetros $1, $2, etc.
 * 
 * @param {string} text - Consulta SQL com marcadores parametrizados
 * @param {Array} [params] - Valores dos parâmetros
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 500) {
      console.warn(`[DB WARN] Consulta lenta (${duration}ms): ${text}`);
    }
    return res;
  } catch (error) {
    console.error(`[DB ERROR] Falha ao executar consulta: ${text}`);
    console.error(`[DB ERROR Detalhe]: ${error.message}`);
    throw error;
  }
}

/**
 * Obtém um cliente dedicado da pool para execução de transações (BEGIN, COMMIT, ROLLBACK).
 * Lembre-se de invocar client.release() após finalizar a transação.
 * 
 * @returns {Promise<import('pg').PoolClient>}
 */
async function getClient() {
  const client = await pool.connect();
  return client;
}

/**
 * Verifica o estado de prontidão e conectividade com a base de dados PostgreSQL.
 * Utilizado pelos endpoints de health check da API.
 * 
 * @returns {Promise<{ ok: boolean, timestamp?: string, database?: string, version?: string, error?: string }>}
 */
async function checkConnection() {
  try {
    const res = await pool.query('SELECT NOW() AS server_time, current_database() AS db_name, version() AS db_version;');
    return {
      ok: true,
      timestamp: res.rows[0].server_time,
      database: res.rows[0].db_name,
      version: res.rows[0].db_version
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message
    };
  }
}

/**
 * Encerra todas as conexões da pool de forma limpa (graceful shutdown).
 */
async function closePool() {
  console.log('[DB] A encerrar pool de ligações do PostgreSQL...');
  await pool.end();
  console.log('[DB] Pool do PostgreSQL encerrada com sucesso.');
}

module.exports = {
  pool,
  query,
  getClient,
  checkConnection,
  closePool
};

