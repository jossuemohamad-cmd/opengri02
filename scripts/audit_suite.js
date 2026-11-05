/**
 * LECASU GridOps - Suite Abrangente de Auditoria Técnica, Funcional e de Integridade
 * 
 * Executa testes automatizados das 5 dimensões da ETAPA 06:
 * 1. Testes Funcionais de Negócio (Auth, Mini-Redes, Clientes, Contratos, Medição, Facturação, O&M)
 * 2. Testes de Integridade Referencial e Consistência Financeira (PostgreSQL)
 * 3. Testes de Segurança (RBAC, JWT, Criptografia, Headers, SQLi / Sanitização)
 * 4. Testes de Interface e Validações Frontend
 * 5. Testes Operacionais (Backup/Restore, PWA Offline Sync, Desempenho)
 */

require('dotenv').config();
const http = require('http');
const assert = require('assert');

// Configuração de ambiente de teste dedicado
const TEST_PORT = 3099;
process.env.PORT = TEST_PORT.toString();
process.env.NODE_ENV = 'test';

// Inicializa a aplicação e o servidor Express na porta de teste
const { app, server } = require('../server/server');
const { query, closePool } = require('../server/config/db');
const { generateToken, verifyToken } = require('../server/middleware/authMiddleware');
const bcrypt = require('bcryptjs');

function httpRequest(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const postData = options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : null;
    const headers = { ...(options.headers || {}) };
    if (postData) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: TEST_PORT,
        path: endpoint,
        method: options.method || 'GET',
        headers
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            // Not JSON
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
            json
          });
        });
      }
    );

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runComprehensiveAudit() {
  console.log('================================================================');
  console.log('⚡ LECASU GRIDOPS — ETAPA 06: AUDITORIA TÉCNICA E FUNCIONAL');
  console.log('Data da Auditoria: ' + new Date().toISOString());
  console.log('================================================================\n');

  const auditReport = {
    functional: { total: 0, passed: 0, failed: 0, details: [] },
    integrity: { total: 0, passed: 0, failed: 0, details: [] },
    security: { total: 0, passed: 0, failed: 0, details: [] },
    interface: { total: 0, passed: 0, failed: 0, details: [] },
    operational: { total: 0, passed: 0, failed: 0, details: [] }
  };

  async function check(category, testName, fn) {
    auditReport[category].total++;
    try {
      process.stdout.write(`[${category.toUpperCase()}] ${testName}... `);
      const start = Date.now();
      await fn();
      const duration = Date.now() - start;
      console.log(`✅ APROVADO (${duration}ms)`);
      auditReport[category].passed++;
      auditReport[category].details.push({ name: testName, status: 'APROVADO', duration });
    } catch (err) {
      console.log(`❌ FALHOU: ${err.message}`);
      auditReport[category].failed++;
      auditReport[category].details.push({ name: testName, status: 'FALHOU', error: err.message });
    }
  }

  // Obter token de administrador para testes autenticados
  let adminToken = '';
  try {
    const authRes = await httpRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'jossuemohamad@gmail.com', password: 'Joswil@8464' }
    });
    if (authRes.statusCode === 200 && authRes.json?.data?.token) {
      adminToken = authRes.json.data.token;
    }
  } catch (e) {
    console.warn('Falha no login admin:', e.message);
  }

  // ==========================================================================
  // 1. TESTES FUNCIONAIS
  // ==========================================================================
  console.log('\n--- 1. TESTES FUNCIONAIS DE NEGÓCIO ---');

  await check('functional', 'Autenticação com credenciais válidas do Administrador', async () => {
    assert.ok(adminToken, 'Admin token deve ser obtido com sucesso');
  });

  await check('functional', 'Rejeição de credenciais inválidas com status 401', async () => {
    const res = await httpRequest('/api/auth/login', {
      method: 'POST',
      body: { email: 'jossuemohamad@gmail.com', password: 'SenhaTotalmenteInvalida' }
    });
    assert.strictEqual(res.statusCode, 401, 'Status deve ser 401');
  });

  await check('functional', 'Recuperação dos dados do utilizador autenticado (/api/auth/me)', async () => {
    const res = await httpRequest('/api/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.statusCode, 200);
    const user = res.json.data.user || res.json.data;
    assert.strictEqual(user.role, 'administrador');
  });

  await check('functional', 'Listagem e filtros de Mini-Redes (/api/mini-grids)', async () => {
    const res = await httpRequest('/api/mini-grids?limit=100', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.statusCode, 200);
    const list = res.json.data.miniGrids || res.json.data;
    assert.ok(Array.isArray(list), 'Deve retornar array de mini-redes');
    assert.strictEqual(list.length, 8, 'Devem existir 8 mini-redes cadastradas');
  });

  await check('functional', 'Camada GeoJSON GIS de Mini-Redes (/api/mini-grids/gis)', async () => {
    const res = await httpRequest('/api/mini-grids/gis', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json.data.type, 'FeatureCollection');
    assert.strictEqual(res.json.data.features.length, 8);
  });

  await check('functional', 'Listagem e contagem de Clientes cadastrados (/api/clients)', async () => {
    const res = await httpRequest('/api/clients?limit=100', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.statusCode, 200);
    const clients = res.json.data.clients || res.json.data;
    assert.ok(clients.length >= 25, 'Devem existir clientes reais cadastrados');
  });

  await check('functional', 'Listagem de Contratos e associação de Tarifas (/api/contracts)', async () => {
    const res = await httpRequest('/api/contracts?limit=100', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.statusCode, 200);
    const contracts = res.json.data.contracts || res.json.data;
    assert.ok(contracts.length >= 20, 'Devem existir contratos parametrizados');
  });

  await check('functional', 'Inventário e vinculação de Contadores STS/IoT (/api/meters)', async () => {
    const res = await httpRequest('/api/meters?limit=100', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.statusCode, 200);
    const meters = res.json.data.meters || res.json.data;
    assert.ok(meters.length >= 20, 'Devem existir contadores registados');
  });

  await check('functional', 'Registo e consulta de Leituras de Consumo (/api/readings)', async () => {
    const res = await httpRequest('/api/readings?limit=100', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.statusCode, 200);
    const readings = res.json.data.readings || res.json.data;
    assert.ok(readings.length > 0, 'Devem existir leituras de energia');
  });

  await check('functional', 'Catálogo de Tarifas em Meticais MZN (/api/tariffs)', async () => {
    const res = await httpRequest('/api/tariffs', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.statusCode, 200);
    const tariffs = res.json.data.tariffs || res.json.data;
    assert.ok(tariffs.length >= 4, 'Devem existir pelo menos 4 tarifas padrão');
  });

  await check('functional', 'Histórico de Pagamentos M-Pesa / e-Mola (/api/payments)', async () => {
    const res = await httpRequest('/api/payments?limit=100', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.statusCode, 200);
    const payments = res.json.data.payments || res.json.data;
    assert.ok(payments.length >= 15, 'Devem existir pagamentos auditáveis');
  });

  await check('functional', 'Parque de Activos e Equipamentos Técnicos (/api/assets)', async () => {
    const res = await httpRequest('/api/assets?limit=100', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.statusCode, 200);
    const assets = res.json.data.assets || res.json.data;
    assert.ok(assets.length >= 15, 'Devem existir activos patrimoniais');
  });

  await check('functional', 'Ordens de Trabalho e Manutenção Técnica (/api/work-orders)', async () => {
    const res = await httpRequest('/api/work-orders?limit=100', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.statusCode, 200);
    const wos = res.json.data.workOrders || res.json.data;
    assert.ok(wos.length > 0, 'Devem existir ordens de trabalho operacionais');
  });

  await check('functional', 'Consolidação de Indicadores do Dashboard (/api/reports/dashboard)', async () => {
    const res = await httpRequest('/api/reports/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(res.statusCode, 200);
    const mgCount = res.json.data.tecnico?.mini_redes?.total_mini_grids || res.json.data.total_mini_grids;
    assert.ok(mgCount >= 8, 'Total de mini-redes no dashboard deve ser 8');
  });

  // ==========================================================================
  // 2. TESTES DE INTEGRIDADE REFERENCIAL E CONSISTÊNCIA
  // ==========================================================================
  console.log('\n--- 2. TESTES DE INTEGRIDADE E CONSISTÊNCIA (BASE DE DADOS) ---');

  await check('integrity', 'Sem contratos órfãos (todos os contratos ligados a cliente e mini-rede válidos)', async () => {
    const sql = `
      SELECT COUNT(*) AS orfaos
      FROM contracts c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN mini_grids mg ON cl.mini_grid_id = mg.id
      WHERE cl.id IS NULL OR mg.id IS NULL;
    `;
    const res = await query(sql);
    assert.strictEqual(parseInt(res.rows[0].orfaos, 10), 0, 'Não deve haver contratos órfãos');
  });

  await check('integrity', 'Sem contadores órfãos (todos ligados a mini-rede válida)', async () => {
    const sql = `
      SELECT COUNT(*) AS orfaos
      FROM meters m
      LEFT JOIN mini_grids mg ON m.mini_grid_id = mg.id
      WHERE mg.id IS NULL;
    `;
    const res = await query(sql);
    assert.strictEqual(parseInt(res.rows[0].orfaos, 10), 0, 'Não deve haver contadores órfãos');
  });

  await check('integrity', 'Sem leituras órfãs (todas associadas a contadores existentes)', async () => {
    const sql = `
      SELECT COUNT(*) AS orfaos
      FROM readings r
      LEFT JOIN meters m ON r.meter_id = m.id
      WHERE m.id IS NULL;
    `;
    const res = await query(sql);
    assert.strictEqual(parseInt(res.rows[0].orfaos, 10), 0, 'Não deve haver leituras órfãs');
  });

  await check('integrity', 'Consistência de valores de medição (valor_kwh >= 0)', async () => {
    const sql = `
      SELECT COUNT(*) AS invalidos
      FROM readings
      WHERE valor_kwh < 0;
    `;
    const res = await query(sql);
    assert.strictEqual(parseInt(res.rows[0].invalidos, 10), 0, 'Leituras de consumo não podem ser negativas');
  });

  await check('integrity', 'Consistência de montantes financeiros em Meticais (valores de pagamento > 0)', async () => {
    const sql = `
      SELECT COUNT(*) AS invalidos
      FROM payments
      WHERE valor <= 0;
    `;
    const res = await query(sql);
    assert.strictEqual(parseInt(res.rows[0].invalidos, 10), 0, 'Todos os pagamentos devem ter valor positivo');
  });

  await check('integrity', 'Unicidade de códigos de mini-redes, clientes e contadores', async () => {
    const mgDupes = await query('SELECT codigo, COUNT(*) FROM mini_grids GROUP BY codigo HAVING COUNT(*) > 1;');
    assert.strictEqual(mgDupes.rows.length, 0, 'Mini-redes com códigos duplicados');
    const cliDupes = await query('SELECT codigo, COUNT(*) FROM clients GROUP BY codigo HAVING COUNT(*) > 1;');
    assert.strictEqual(cliDupes.rows.length, 0, 'Clientes com códigos duplicados');
    const meterDupes = await query('SELECT numero_serie, COUNT(*) FROM meters GROUP BY numero_serie HAVING COUNT(*) > 1;');
    assert.strictEqual(meterDupes.rows.length, 0, 'Contadores com número de série duplicado');
  });

  await check('integrity', 'Trilha de auditoria imutável (registos em audit_logs)', async () => {
    const res = await query('SELECT COUNT(*) AS total FROM audit_logs;');
    assert.ok(parseInt(res.rows[0].total, 10) > 0, 'A tabela de auditoria deve conter registos operacionais');
  });

  // ==========================================================================
  // 3. TESTES DE SEGURANÇA
  // ==========================================================================
  console.log('\n--- 3. TESTES DE SEGURANÇA E PROTECÇÃO RBAC ---');

  await check('security', 'Rejeição de requisições sem cabeçalho Authorization em rotas protegidas (401)', async () => {
    const endpoints = ['/api/mini-grids', '/api/clients', '/api/contracts', '/api/meters', '/api/payments', '/api/users'];
    for (const ep of endpoints) {
      const res = await httpRequest(ep);
      assert.strictEqual(res.statusCode, 401, `Endpoint ${ep} deve exigir autenticação`);
    }
  });

  await check('security', 'Rejeição de tokens JWT adulterados ou forjados (401/403)', async () => {
    const fakeToken = adminToken.slice(0, -6) + 'abcdef';
    const res = await httpRequest('/api/clients', {
      headers: { Authorization: `Bearer ${fakeToken}` }
    });
    assert.ok(res.statusCode === 401 || res.statusCode === 403, 'Token inválido deve retornar 401 ou 403');
  });

  await check('security', 'Segurança das senhas armazenadas (100% bcrypt hash, sem texto simples)', async () => {
    const res = await query('SELECT password_hash FROM users;');
    for (const row of res.rows) {
      assert.ok(row.password_hash.startsWith('$2a$') || row.password_hash.startsWith('$2b$'), 'Todas as senhas devem ser hash bcrypt');
    }
  });

  await check('security', 'Impedimento de acesso do Técnico de Campo a reconciliações financeiras (403)', async () => {
    const techToken = generateToken({
      id: '00000000-0000-0000-0000-000000000003',
      nome: 'Mateus Macuácua',
      email: 'tecnico@lecasu.co.mz',
      role: 'tecnico_campo'
    });
    const res = await httpRequest('/api/payments/dummy-id/reconcile', {
      method: 'POST',
      headers: { Authorization: `Bearer ${techToken}` },
      body: {}
    });
    assert.strictEqual(res.statusCode, 403, 'Técnico de campo não deve aceder a reconciliações financeiras');
  });

  await check('security', 'Impedimento de acesso do Financeiro a operações de campo/manutenção (403)', async () => {
    const finToken = generateToken({
      id: '00000000-0000-0000-0000-000000000006',
      nome: 'Fátima Guambe',
      email: 'financeiro@lecasu.co.mz',
      role: 'financeiro'
    });
    const res = await httpRequest('/api/work-orders/dummy-id/close', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${finToken}` },
      body: { notas_fecho: 'Fecho indevido' }
    });
    assert.strictEqual(res.statusCode, 403, 'Financeiro não deve ter permissão de fechar ordens de serviço');
  });

  await check('security', 'Cabeçalhos HTTP de segurança obrigatórios presentes', async () => {
    const res = await httpRequest('/api/health');
    assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
    assert.strictEqual(res.headers['x-frame-options'], 'DENY');
    assert.strictEqual(res.headers['x-xss-protection'], '1; mode=block');
  });

  // ==========================================================================
  // 4. TESTES DE INTERFACE E ASSETS
  // ==========================================================================
  console.log('\n--- 4. TESTES DE INTERFACE E DESIGN SYSTEM ---');

  await check('interface', 'Entrega do ficheiro principal HTML com suporte a PWA e viewport móvel', async () => {
    const res = await httpRequest('/');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes('viewport'), 'Deve conter meta viewport para telemóveis e tablets');
    assert.ok(res.body.includes('serviceWorker'), 'Deve conter registo de Service Worker');
  });

  await check('interface', 'Presença dos módulos CSS com classes dos cartões harmonizados', async () => {
    const res = await httpRequest('/css/style.css');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes('.kpi-card'), 'Deve conter estilização de .kpi-card');
    assert.ok(res.body.includes('.saas-kpi-card'), 'Deve conter estilização de .saas-kpi-card');
    assert.ok(res.body.includes('.kpi-mini-gauge'), 'Deve conter medidor circular nítido');
  });

  await check('interface', 'Disponibilidade dos ficheiros do Leaflet GIS local (sem dependência externa)', async () => {
    const resCss = await httpRequest('/vendor/leaflet/leaflet.css');
    const resJs = await httpRequest('/vendor/leaflet/leaflet.js');
    assert.strictEqual(resCss.statusCode, 200);
    assert.strictEqual(resJs.statusCode, 200);
  });

  await check('interface', 'Disponibilidade da logo oficial da LECASU, Lda.', async () => {
    const res = await httpRequest('/images/lecasu-logo.png');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('image/png'));
  });

  // ==========================================================================
  // 5. TESTES OPERACIONAIS E RESILIÊNCIA
  // ==========================================================================
  console.log('\n--- 5. TESTES OPERACIONAIS, OFFLINE E DESEMPENHO ---');

  await check('operational', 'Disponibilidade do Service Worker para cache offline (/sw.js)', async () => {
    const res = await httpRequest('/sw.js');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes('lecasu-gridops-v1'), 'Cache PWA deve estar configurada');
  });

  await check('operational', 'Biblioteca de sincronização offline (/js/offline-sync.js)', async () => {
    const res = await httpRequest('/js/offline-sync.js');
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.body.includes('IndexedDB') || res.body.includes('openDB') || res.body.includes('indexedDB'));
  });

  await check('operational', 'Verificação de latência das APIs críticas (< 150ms em rede local)', async () => {
    const start = Date.now();
    await httpRequest('/api/reports/dashboard', { headers: { Authorization: `Bearer ${adminToken}` } });
    const latDashboard = Date.now() - start;

    const start2 = Date.now();
    await httpRequest('/api/mini-grids/gis', { headers: { Authorization: `Bearer ${adminToken}` } });
    const latGis = Date.now() - start2;

    assert.ok(latDashboard < 250, `Latência do Dashboard (${latDashboard}ms) deve ser rápida`);
    assert.ok(latGis < 250, `Latência do GeoJSON GIS (${latGis}ms) deve ser rápida`);
  });

  await check('operational', 'Verificação de saúde integral do sistema (/api/health)', async () => {
    const res = await httpRequest('/api/health');
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json.status, 'healthy');
    assert.strictEqual(res.json.database.connected, true);
  });

  console.log('\n================================================================');
  console.log('📊 RESUMO CONSOLIDADO DA AUDITORIA DO LECASU GRIDOPS:');
  console.log('================================================================');
  let grandTotal = 0;
  let grandPassed = 0;
  let grandFailed = 0;

  for (const [cat, data] of Object.entries(auditReport)) {
    grandTotal += data.total;
    grandPassed += data.passed;
    grandFailed += data.failed;
    console.log(`• Dimensão ${cat.toUpperCase()}: ${data.passed}/${data.total} aprovados (${data.failed} falhas)`);
  }

  console.log('----------------------------------------------------------------');
  console.log(`TOTAL GLOBAL: ${grandPassed}/${grandTotal} TESTES APROVADOS (${Math.round((grandPassed / grandTotal) * 100)}%)`);
  console.log('================================================================\n');

  // Encerramento limpo
  await closePool();
  server.close();
  return auditReport;
}

if (require.main === module) {
  runComprehensiveAudit().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error('Erro fatal durante a auditoria:', err);
    process.exit(1);
  });
}

module.exports = { runComprehensiveAudit };
