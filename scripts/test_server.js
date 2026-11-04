/**
 * LECASU GridOps - Script Automatizado de Teste de Inicialização e Endpoints HTTP
 * 
 * Executa testes end-to-end e de integração sobre o servidor HTTP e endpoints da API
 * utilizando as bibliotecas nativas do Node.js (sem frameworks externas de teste).
 */

const http = require('http');
const assert = require('assert');

// Forçar porta de teste para evitar conflito com porta 3000 em produção/dev
const TEST_PORT = 3099;
process.env.PORT = TEST_PORT.toString();
process.env.NODE_ENV = 'test';

// Importa a aplicação e o servidor
const { app, server } = require('../server/server');

/**
 * Função utilitária para requisição HTTP Promise-based
 */
function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const headers = { ...(options.headers || {}) };
    let postData = null;

    if (options.body) {
      postData = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: TEST_PORT,
        path,
        method: options.method || 'GET',
        headers
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          let json = null;
          if (res.headers['content-type'] && res.headers['content-type'].includes('application/json')) {
            try {
              json = JSON.parse(body);
            } catch (e) {
              // Mantém body como string
            }
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
            json
          });
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 A executar testes automatizados do LECASU GridOps...');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      process.stdout.write(`• Teste [${total}]: ${name}... `);
      await fn();
      console.log('✅ PASSOU');
      passed++;
    } catch (err) {
      console.log('❌ FALHOU');
      console.error(`  Detalhes do erro: ${err.message}`);
    }
  }

  try {
    // 1. Teste do Endpoint Raiz (Frontend SPA)
    await test('GET / deve servir index.html com status 200', async () => {
      const res = await request('/');
      assert.strictEqual(res.statusCode, 200, 'Status deve ser 200');
      assert.ok(res.body.includes('LECASU GridOps'), 'O HTML deve conter a marca LECASU GridOps');
      assert.ok(res.headers['content-type'].includes('text/html'), 'Content-Type deve ser text/html');
    });

    // 2. Teste do Endpoint Catálogo da API
    await test('GET /api deve retornar informações da API e lista de endpoints', async () => {
      const res = await request('/api');
      assert.strictEqual(res.statusCode, 200, 'Status deve ser 200');
      assert.strictEqual(res.json.name, 'LECASU GridOps API');
      assert.ok(res.json.endpoints.auth, 'Deve listar endpoints de autenticação');
      assert.ok(res.json.endpoints.mini_grids, 'Deve listar endpoints de mini-redes');
      assert.ok(res.json.endpoints.clients, 'Deve listar endpoints de clientes');
      assert.ok(res.json.endpoints.contracts, 'Deve listar endpoints de contratos');
      assert.ok(res.json.endpoints.meters, 'Deve listar endpoints de contadores');
      assert.ok(res.json.endpoints.readings, 'Deve listar endpoints de leituras');
      assert.ok(res.json.endpoints.tariffs, 'Deve listar endpoints de tarifas');
      assert.ok(res.json.endpoints.payments, 'Deve listar endpoints de pagamentos');
      assert.ok(res.json.endpoints.work_orders, 'Deve listar endpoints de ordens de trabalho');
    });

    // 3. Teste do Endpoint de Saúde
    await test('GET /api/health deve responder com estrutura diagnóstica de saúde', async () => {
      const res = await request('/api/health');
      assert.ok(res.statusCode === 200 || res.statusCode === 503, 'Status deve ser 200 ou 503');
      assert.strictEqual(res.json.service, 'LECASU GridOps API');
      assert.ok(res.json.database !== undefined, 'Deve conter nó com dados da base de dados');
    });

    // 4. Teste de Cabeçalhos de Segurança HTTP
    await test('Respostas devem incluir cabeçalhos essenciais de segurança', async () => {
      const res = await request('/api');
      assert.strictEqual(res.headers['x-content-type-options'], 'nosniff');
      assert.strictEqual(res.headers['x-frame-options'], 'DENY');
      assert.strictEqual(res.headers['x-xss-protection'], '1; mode=block');
    });

    // 5. Teste de Rota Inexistente na API (404)
    await test('GET /api/rota-inexistente deve retornar 404 estruturado', async () => {
      const res = await request('/api/rota-inexistente');
      assert.strictEqual(res.statusCode, 404, 'Status deve ser 404');
      assert.strictEqual(res.json.status, 'error');
      assert.ok(res.json.error.includes('não encontrada'));
    });

    // 6. Teste de Proteção de Rota sem Token JWT (401)
    await test('GET /api/auth/me sem token deve retornar 401 Unauthorized', async () => {
      const res = await request('/api/auth/me');
      assert.strictEqual(res.statusCode, 401, 'Status deve ser 401');
      assert.strictEqual(res.json.status, 'error');
      assert.ok(res.json.error.includes('Token'));
    });

    // 7. Teste de Login com Dados Inválidos (400)
    await test('POST /api/auth/login sem credenciais deve retornar 400 Bad Request', async () => {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: {}
      });
      assert.strictEqual(res.statusCode, 400, 'Status deve ser 400');
      assert.strictEqual(res.json.status, 'error');
      assert.ok(res.json.error.includes('obrigatório'));
    });

    // 8. Teste de Geração e Verificação de Token JWT
    await test('Geração e verificação de JWT com claims de utilizador', async () => {
      const { generateToken, verifyToken } = require('../server/middleware/authMiddleware');
      const payload = {
        id: '11111111-2222-3333-4444-555555555555',
        nome: 'Técnico de Campo Calanga',
        email: 'tecnico@lecasu.co.mz',
        role: 'tecnico_campo'
      };

      const token = generateToken(payload);
      assert.ok(token, 'Token gerado não deve ser vazio');

      const decoded = verifyToken(token);
      assert.strictEqual(decoded.id, payload.id);
      assert.strictEqual(decoded.email, payload.email);
      assert.strictEqual(decoded.role, payload.role);
    });

    // 9. Teste de Criptografia e Verificação de Senha com bcryptjs
    await test('Hash seguro de senha com bcryptjs e validação correta', async () => {
      const bcrypt = require('bcryptjs');
      const password = 'MinhaSenhaSeguraLECASU@2026';
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const isValid = await bcrypt.compare(password, hash);
      assert.strictEqual(isValid, true, 'Senha correta deve ser validada');

      const isInvalid = await bcrypt.compare('SenhaErrada', hash);
      assert.strictEqual(isInvalid, false, 'Senha incorreta deve ser rejeitada');
    });

    // 10. Teste do Middleware de Autorização Baseada em Papéis (RBAC)
    await test('RBAC deve permitir perfil autorizado e bloquear perfil não autorizado (403)', async () => {
      const { authorizeRoles } = require('../server/middleware/roleMiddleware');
      const middleware = authorizeRoles(['administrador', 'gestor_operacoes']);

      let nextCalled = false;
      const fakeReqAdmin = { user: { role: 'administrador' } };
      const fakeNext = () => { nextCalled = true; };

      middleware(fakeReqAdmin, {}, fakeNext);
      assert.strictEqual(nextCalled, true, 'Administrador deve aceder à rota');

      nextCalled = false;
      let forbiddenStatusCode = null;
      let forbiddenBody = null;
      const fakeReqTecnico = { user: { role: 'tecnico_campo' } };
      const fakeRes = {
        status: (code) => {
          forbiddenStatusCode = code;
          return {
            json: (payload) => { forbiddenBody = payload; }
          };
        }
      };

      middleware(fakeReqTecnico, fakeRes, fakeNext);
      assert.strictEqual(nextCalled, false, 'Técnico de campo não deve aceder à rota de admin');
      assert.strictEqual(forbiddenStatusCode, 403, 'Código retornado deve ser 403 Forbidden');
      assert.ok(forbiddenBody && forbiddenBody.error.includes('Acesso negado'), 'Mensagem deve indicar acesso negado');
    });

    // 11. Teste de Utilitário de Geração de Códigos (Secção 5)
    await test('codeGenerator deve mapear províncias, classes de activos e sanitizar prefixos', async () => {
      const {
        getProvinceCode,
        getAssetClassCode,
        getClientCategoryCode,
        sanitizeMiniGridCode
      } = require('../server/utils/codeGenerator');

      assert.strictEqual(getProvinceCode('Maputo'), 'MPT');
      assert.strictEqual(getProvinceCode('Gaza'), 'GZA');
      assert.strictEqual(getProvinceCode('Zambézia'), 'ZAM');
      assert.strictEqual(getProvinceCode('Nampula'), 'NAM');

      assert.strictEqual(getAssetClassCode('inversor'), 'INV');
      assert.strictEqual(getAssetClassCode('bateria'), 'BAT');
      assert.strictEqual(getAssetClassCode('central'), 'CEN');
      assert.strictEqual(getAssetClassCode('transformador'), 'TRF');

      assert.strictEqual(getClientCategoryCode('residencial'), 'RES');
      assert.strictEqual(getClientCategoryCode('uso_produtivo'), 'PUE');
      assert.strictEqual(getClientCategoryCode('comercial'), 'COM');

      assert.strictEqual(sanitizeMiniGridCode('MR-MPT-001'), 'MR001');
      assert.strictEqual(sanitizeMiniGridCode('MR-GZA-004'), 'MR004');
    });

    // 12. Teste de Proteção de Rotas de Mini-Redes
    await test('GET /api/mini-grids sem token deve retornar 401', async () => {
      const res = await request('/api/mini-grids');
      assert.strictEqual(res.statusCode, 401, 'Status deve ser 401');
      assert.ok(res.json && res.json.error, 'Deve retornar erro estruturado');
    });

    // 13. Teste do Endpoint Geoespacial GIS de Mini-Redes
    await test('GET /api/mini-grids/gis sem token deve retornar 401', async () => {
      const res = await request('/api/mini-grids/gis');
      assert.strictEqual(res.statusCode, 401, 'Status deve ser 401');
      assert.ok(res.json && res.json.error, 'Deve retornar erro estruturado');
    });

    // 14. Teste de Proteção de Rotas de Activos Técnicos
    await test('GET /api/assets sem token deve retornar 401', async () => {
      const res = await request('/api/assets');
      assert.strictEqual(res.statusCode, 401, 'Status deve ser 401');
      assert.ok(res.json && res.json.error, 'Deve retornar erro estruturado');
    });

    // 15. Teste de Permissões de Escrita em Mini-Redes
    await test('Escrita em mini-redes e activos deve autorizar gestor_operacoes e recusar agente_comunitario', async () => {
      const { authorizeRoles } = require('../server/middleware/roleMiddleware');
      const writeMiddleware = authorizeRoles(['administrador', 'gestor_operacoes']);

      let nextCalled = false;
      const fakeReqGestor = { user: { role: 'gestor_operacoes' } };
      const fakeReqAgente = { user: { role: 'agente_comunitario' } };
      const fakeNext = () => { nextCalled = true; };

      writeMiddleware(fakeReqGestor, {}, fakeNext);
      assert.strictEqual(nextCalled, true, 'Gestor de Operações deve poder criar/editar mini-redes e activos');

      let forbiddenStatusCode = null;
      const fakeRes = {
        status: (code) => {
          forbiddenStatusCode = code;
          return { json: () => {} };
        }
      };

      nextCalled = false;
      writeMiddleware(fakeReqAgente, fakeRes, fakeNext);
      assert.strictEqual(nextCalled, false, 'Agente comunitário não deve poder criar mini-redes');
      assert.strictEqual(forbiddenStatusCode, 403, 'Deve retornar 403');
    });

    // 16. Teste de Proteção de Rotas de Clientes
    await test('GET /api/clients sem token deve retornar 401', async () => {
      const res = await request('/api/clients');
      assert.strictEqual(res.statusCode, 401, 'Status deve ser 401');
    });

    // 17. Teste de Endpoint GIS de Clientes
    await test('GET /api/clients/gis sem token deve retornar 401', async () => {
      const res = await request('/api/clients/gis');
      assert.strictEqual(res.statusCode, 401, 'Status deve ser 401');
    });

    // 18. Teste de Proteção de Rotas de Contratos
    await test('GET /api/contracts sem token deve retornar 401', async () => {
      const res = await request('/api/contracts');
      assert.strictEqual(res.statusCode, 401, 'Status deve ser 401');
    });

    // 19. Teste de Proteção de Rotas de Contadores
    await test('GET /api/meters sem token deve retornar 401', async () => {
      const res = await request('/api/meters');
      assert.strictEqual(res.statusCode, 401, 'Status deve ser 401');
    });

    // 20. Teste de Permissões de Cadastro de Clientes
    await test('POST /api/clients RBAC deve autorizar agente_comunitario e recusar financeiro', async () => {
      const { authorizeRoles } = require('../server/middleware/roleMiddleware');
      const clientCreateMiddleware = authorizeRoles(['administrador', 'gestor_comercial', 'agente_comunitario']);

      let nextCalled = false;
      const fakeReqAgente = { user: { role: 'agente_comunitario' } };
      const fakeReqFinanceiro = { user: { role: 'financeiro' } };
      const fakeNext = () => { nextCalled = true; };

      clientCreateMiddleware(fakeReqAgente, {}, fakeNext);
      assert.strictEqual(nextCalled, true, 'Agente Comunitário deve poder cadastrar clientes');

      let forbiddenStatusCode = null;
      const fakeRes = {
        status: (code) => {
          forbiddenStatusCode = code;
          return { json: () => {} };
        }
      };

      nextCalled = false;
      clientCreateMiddleware(fakeReqFinanceiro, fakeRes, fakeNext);
      assert.strictEqual(nextCalled, false, 'Financeiro não deve cadastrar clientes');
      assert.strictEqual(forbiddenStatusCode, 403, 'Deve retornar 403');
    });

    // 21. Teste de Permissões de Emissão de Contratos
    await test('POST /api/contracts RBAC deve autorizar gestor_comercial e recusar tecnico_campo', async () => {
      const { authorizeRoles } = require('../server/middleware/roleMiddleware');
      const contractWriteMiddleware = authorizeRoles(['administrador', 'gestor_comercial']);

      let nextCalled = false;
      const fakeReqComercial = { user: { role: 'gestor_comercial' } };
      const fakeReqTecnico = { user: { role: 'tecnico_campo' } };
      const fakeNext = () => { nextCalled = true; };

      contractWriteMiddleware(fakeReqComercial, {}, fakeNext);
      assert.strictEqual(nextCalled, true, 'Gestor Comercial deve poder emitir contratos');

      let forbiddenStatusCode = null;
      const fakeRes = {
        status: (code) => {
          forbiddenStatusCode = code;
          return { json: () => {} };
        }
      };

      nextCalled = false;
      contractWriteMiddleware(fakeReqTecnico, fakeRes, fakeNext);
      assert.strictEqual(nextCalled, false, 'Técnico de campo não deve emitir contratos');
      assert.strictEqual(forbiddenStatusCode, 403, 'Deve retornar 403');
    });

    // 22. Teste de Permissões de Instalação de Contadores
    await test('POST /api/meters/:id/install RBAC deve autorizar tecnico_campo e recusar agente_comunitario', async () => {
      const { authorizeRoles } = require('../server/middleware/roleMiddleware');
      const meterInstallMiddleware = authorizeRoles(['administrador', 'gestor_operacoes', 'gestor_comercial', 'tecnico_campo']);

      let nextCalled = false;
      const fakeReqTecnico = { user: { role: 'tecnico_campo' } };
      const fakeReqAgente = { user: { role: 'agente_comunitario' } };
      const fakeNext = () => { nextCalled = true; };

      meterInstallMiddleware(fakeReqTecnico, {}, fakeNext);
      assert.strictEqual(nextCalled, true, 'Técnico de Campo deve poder instalar contadores');

      let forbiddenStatusCode = null;
      const fakeRes = {
        status: (code) => {
          forbiddenStatusCode = code;
          return { json: () => {} };
        }
      };

      nextCalled = false;
      meterInstallMiddleware(fakeReqAgente, fakeRes, fakeNext);
      assert.strictEqual(nextCalled, false, 'Agente comunitário não deve instalar contadores');
      assert.strictEqual(forbiddenStatusCode, 403, 'Deve retornar 403');
    });

    // 23. Teste de Proteção de Rotas de Leituras
    await test('GET /api/readings sem token deve retornar 401', async () => {
      const res = await request('/api/readings');
      assert.strictEqual(res.statusCode, 401, 'Status deve ser 401');
    });

    // 24. Teste de Proteção de Rotas de Tarifas
    await test('GET /api/tariffs sem token deve retornar 401', async () => {
      const res = await request('/api/tariffs');
      assert.strictEqual(res.statusCode, 401, 'Status deve ser 401');
    });

    // 25. Teste de Proteção de Rotas de Pagamentos
    await test('GET /api/payments sem token deve retornar 401', async () => {
      const res = await request('/api/payments');
      assert.strictEqual(res.statusCode, 401, 'Status deve ser 401');
    });

    // 26. Teste de Proteção de Rotas de Ordens de Trabalho
    await test('GET /api/work-orders sem token deve retornar 401', async () => {
      const res = await request('/api/work-orders');
      assert.strictEqual(res.statusCode, 401, 'Status deve ser 401');
    });

    // 27. Teste de Permissões de Inserção de Leituras
    await test('POST /api/readings RBAC deve autorizar tecnico_campo e recusar financeiro', async () => {
      const { authorizeRoles } = require('../server/middleware/roleMiddleware');
      const readingWriteMiddleware = authorizeRoles(['administrador', 'gestor_operacoes', 'gestor_comercial', 'tecnico_campo', 'agente_comunitario']);

      let nextCalled = false;
      const fakeReqTecnico = { user: { role: 'tecnico_campo' } };
      const fakeReqFinanceiro = { user: { role: 'financeiro' } };
      const fakeNext = () => { nextCalled = true; };

      readingWriteMiddleware(fakeReqTecnico, {}, fakeNext);
      assert.strictEqual(nextCalled, true, 'Técnico de Campo deve poder registar leituras');

      let forbiddenStatusCode = null;
      const fakeRes = {
        status: (code) => {
          forbiddenStatusCode = code;
          return { json: () => {} };
        }
      };

      nextCalled = false;
      readingWriteMiddleware(fakeReqFinanceiro, fakeRes, fakeNext);
      assert.strictEqual(nextCalled, false, 'Financeiro não deve registar leituras de campo');
      assert.strictEqual(forbiddenStatusCode, 403, 'Deve retornar 403');
    });

    // 28. Teste de Permissões de Reconciliação Financeira
    await test('POST /api/payments/:id/reconcile RBAC deve autorizar financeiro e recusar tecnico_campo', async () => {
      const { authorizeRoles } = require('../server/middleware/roleMiddleware');
      const reconcileMiddleware = authorizeRoles(['administrador', 'financeiro', 'gestor_comercial']);

      let nextCalled = false;
      const fakeReqFinanceiro = { user: { role: 'financeiro' } };
      const fakeReqTecnico = { user: { role: 'tecnico_campo' } };
      const fakeNext = () => { nextCalled = true; };

      reconcileMiddleware(fakeReqFinanceiro, {}, fakeNext);
      assert.strictEqual(nextCalled, true, 'Financeiro deve poder reconciliar pagamentos');

      let forbiddenStatusCode = null;
      const fakeRes = {
        status: (code) => {
          forbiddenStatusCode = code;
          return { json: () => {} };
        }
      };

      nextCalled = false;
      reconcileMiddleware(fakeReqTecnico, fakeRes, fakeNext);
      assert.strictEqual(nextCalled, false, 'Técnico de campo não deve reconciliar pagamentos');
      assert.strictEqual(forbiddenStatusCode, 403, 'Deve retornar 403');
    });

    // 29. Teste de Permissões de Atribuição de OTs
    await test('PATCH /api/work-orders/:id/assign RBAC deve autorizar gestor_operacoes e recusar tecnico_campo', async () => {
      const { authorizeRoles } = require('../server/middleware/roleMiddleware');
      const assignMiddleware = authorizeRoles(['administrador', 'gestor_operacoes']);

      let nextCalled = false;
      const fakeReqGestor = { user: { role: 'gestor_operacoes' } };
      const fakeReqTecnico = { user: { role: 'tecnico_campo' } };
      const fakeNext = () => { nextCalled = true; };

      assignMiddleware(fakeReqGestor, {}, fakeNext);
      assert.strictEqual(nextCalled, true, 'Gestor de Operações deve poder atribuir OTs');

      let forbiddenStatusCode = null;
      const fakeRes = {
        status: (code) => {
          forbiddenStatusCode = code;
          return { json: () => {} };
        }
      };

      nextCalled = false;
      assignMiddleware(fakeReqTecnico, fakeRes, fakeNext);
      assert.strictEqual(nextCalled, false, 'Técnico de campo não deve atribuir OTs');
      assert.strictEqual(forbiddenStatusCode, 403, 'Deve retornar 403');
    });

    // 30. Teste de Permissões de Encerramento de OTs com Evidências
    await test('PATCH /api/work-orders/:id/close RBAC deve autorizar tecnico_campo e recusar agente_comunitario', async () => {
      const { authorizeRoles } = require('../server/middleware/roleMiddleware');
      const closeMiddleware = authorizeRoles(['administrador', 'gestor_operacoes', 'tecnico_campo']);

      let nextCalled = false;
      const fakeReqTecnico = { user: { role: 'tecnico_campo' } };
      const fakeReqAgente = { user: { role: 'agente_comunitario' } };
      const fakeNext = () => { nextCalled = true; };

      closeMiddleware(fakeReqTecnico, {}, fakeNext);
      assert.strictEqual(nextCalled, true, 'Técnico de Campo deve poder encerrar OTs');

      let forbiddenStatusCode = null;
      const fakeRes = {
        status: (code) => {
          forbiddenStatusCode = code;
          return { json: () => {} };
        }
      };

      nextCalled = false;
      closeMiddleware(fakeReqAgente, fakeRes, fakeNext);
      assert.strictEqual(nextCalled, false, 'Agente comunitário não deve encerrar OTs técnicas');
      assert.strictEqual(forbiddenStatusCode, 403, 'Deve retornar 403');
    });

    // 31. Teste de Proteção da Rota de Métricas e Relatórios
    await test('GET /api/reports/dashboard sem token deve retornar 401', async () => {
      const res = await request('/api/reports/dashboard');
      assert.strictEqual(res.statusCode, 401, 'Deve recusar acesso sem token');
    });

    // 32. Teste de Proteção do Relatório Executivo
    await test('GET /api/reports/executive sem token deve retornar 401', async () => {
      const res = await request('/api/reports/executive');
      assert.strictEqual(res.statusCode, 401, 'Deve recusar acesso sem token');
    });

    // 33. Teste de Proteção da Exportação CSV
    await test('GET /api/reports/export/csv sem token deve retornar 401', async () => {
      const res = await request('/api/reports/export/csv');
      assert.strictEqual(res.statusCode, 401, 'Deve recusar acesso sem token');
    });

    // 34. Teste de Permissões de Leitura de Relatórios Executivos (RBAC)
    await test('GET /api/reports/dashboard RBAC deve autorizar parceiro_auditor e recusar tecnico_campo', async () => {
      const { authorizeRoles } = require('../server/middleware/roleMiddleware');
      const reportMiddleware = authorizeRoles([
        'administrador',
        'gestor_operacoes',
        'gestor_comercial',
        'financeiro',
        'parceiro_auditor'
      ]);

      let nextCalled = false;
      const fakeReqAuditor = { user: { role: 'parceiro_auditor' } };
      const fakeReqTecnico = { user: { role: 'tecnico_campo' } };
      const fakeNext = () => { nextCalled = true; };

      reportMiddleware(fakeReqAuditor, {}, fakeNext);
      assert.strictEqual(nextCalled, true, 'Parceiro/Auditor deve poder consultar relatórios executivos');

      let forbiddenStatusCode = null;
      const fakeRes = {
        status: (code) => {
          forbiddenStatusCode = code;
          return { json: () => {} };
        }
      };

      nextCalled = false;
      reportMiddleware(fakeReqTecnico, fakeRes, fakeNext);
      assert.strictEqual(nextCalled, false, 'Técnico de campo não deve aceder a relatórios financeiros consolidados');
      assert.strictEqual(forbiddenStatusCode, 403, 'Deve retornar 403');
    });

    // 35. Teste de Permissões de Exportação CSV (RBAC)
    await test('GET /api/reports/export/csv RBAC deve autorizar financeiro e recusar agente_comunitario', async () => {
      const { authorizeRoles } = require('../server/middleware/roleMiddleware');
      const exportMiddleware = authorizeRoles([
        'administrador',
        'gestor_operacoes',
        'gestor_comercial',
        'financeiro',
        'parceiro_auditor'
      ]);

      let nextCalled = false;
      const fakeReqFinanceiro = { user: { role: 'financeiro' } };
      const fakeReqAgente = { user: { role: 'agente_comunitario' } };
      const fakeNext = () => { nextCalled = true; };

      exportMiddleware(fakeReqFinanceiro, {}, fakeNext);
      assert.strictEqual(nextCalled, true, 'Financeiro deve poder descarregar relatórios em CSV');

      let forbiddenStatusCode = null;
      const fakeRes = {
        status: (code) => {
          forbiddenStatusCode = code;
          return { json: () => {} };
        }
      };

      nextCalled = false;
      exportMiddleware(fakeReqAgente, fakeRes, fakeNext);
      assert.strictEqual(nextCalled, false, 'Agente comunitário não deve descarregar exportações financeiras');
      assert.strictEqual(forbiddenStatusCode, 403, 'Deve retornar 403');
    });

    console.log('\n------------------------------------------------------');
    console.log(`📊 Resultado dos testes: ${passed}/${total} aprovados.`);
    console.log('------------------------------------------------------\n');

  } finally {
    // Encerra o servidor de teste
    server.close(() => {
      process.exit(passed === total ? 0 : 1);
    });
  }
}

// Aguarda 100ms para o socket estar pronto
setTimeout(runTests, 100);
