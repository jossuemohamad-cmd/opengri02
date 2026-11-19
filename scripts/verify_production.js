/**
 * LECASU GridOps - Verificação Pré-Voo de Entrada em Produção
 * 
 * Valida todos os requisitos técnicos, operacionais e de segurança
 * antes da homologação final e entrada em produção.
 * 
 * Uso:
 *   node scripts/verify_production.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool, closePool } = require('../server/config/db');

async function runProductionVerification() {
  console.log('==============================================================');
  console.log('🚀 LECASU GRIDOPS — VERIFICAÇÃO PRÉ-VOO PARA PRODUÇÃO (ETAPA 07)');
  console.log('Data:', new Date().toISOString());
  console.log('==============================================================\n');

  const checks = [];

  function check(category, name, passed, details = '') {
    checks.push({ category, name, passed, details });
    const mark = passed ? '✅ PASSOU' : '❌ FALHOU';
    console.log(`[${category}] ${name}: ${mark} ${details ? '(' + details + ')' : ''}`);
  }

  try {
    // 1. Ambiente de Execução
    const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
    check('RUNTIME', 'Node.js LTS Version >= 18', nodeMajor >= 18, `v${process.versions.node}`);
    check('RUNTIME', 'Ambiente configurado', Boolean(process.env.PORT), `Porta: ${process.env.PORT || 3000}`);

    // 2. Segurança de Variáveis
    const jwtSecret = process.env.JWT_SECRET || '';
    const isJwtSecure = jwtSecret.length >= 32;
    check('SECURITY', 'JWT Secret com entropia forte (>= 32 chars)', isJwtSecure, `${jwtSecret.length} caracteres`);

    // 3. Base de Dados PostgreSQL
    const client = await pool.connect();
    check('DATABASE', 'Ligação ao PostgreSQL activa', true);

    const requiredTables = [
      'users',
      'mini_grids',
      'clients',
      'contracts',
      'meters',
      'readings',
      'tariffs',
      'payments',
      'assets',
      'work_orders',
      'audit_logs',
      'inverter_telemetry'
    ];

    for (const tbl of requiredTables) {
      const res = await client.query(`SELECT COUNT(*)::int as count FROM ${tbl}`);
      check('DATABASE', `Tabela operacional [${tbl}]`, res.rows[0].count >= 0, `${res.rows[0].count} registos`);
    }

    // 4. Utilizador Administrador Activo
    const adminRes = await client.query(`SELECT email, role, status FROM users WHERE role = 'administrador' AND status = 'ativo'`);
    check('ACCESS', 'Administrador do sistema configurado e activo', adminRes.rows.length >= 1, `${adminRes.rows.length} conta(s)`);
    client.release();

    // 5. Ficheiros do Frontend e PWA
    const publicDir = path.join(__dirname, '..', 'public');
    const essentialFiles = [
      'index.html',
      'css/style.css',
      'js/app.js',
      'js/offline-sync.js',
      'sw.js',
      'manifest.json',
      'assets/icons/favicon.svg'
    ];

    for (const f of essentialFiles) {
      const exists = fs.existsSync(path.join(publicDir, f));
      check('ASSETS', `Ficheiro essencial [${f}]`, exists);
    }

    // 6. Cópias de Segurança (Backups)
    const backupsDir = path.join(__dirname, '..', 'backups');
    const hasBackups = fs.existsSync(backupsDir) && fs.readdirSync(backupsDir).some(f => f.endsWith('.json'));
    check('DISASTER_RECOVERY', 'Diretório e ficheiros de backup disponíveis', hasBackups);

    console.log('\n==============================================================');
    const totalChecks = checks.length;
    const passedChecks = checks.filter(c => c.passed).length;
    const failedChecks = totalChecks - passedChecks;

    console.log(`📊 RESULTADO FINAL: ${passedChecks}/${totalChecks} verificações aprovadas (${((passedChecks / totalChecks) * 100).toFixed(1)}%).`);
    if (failedChecks === 0) {
      console.log('🎉 SISTEMA PRONTO PARA ENTRADA EM PRODUÇÃO!');
    } else {
      console.warn(`⚠️  Existem ${failedChecks} verificações que requerem atenção.`);
    }
    console.log('==============================================================\n');

    return { totalChecks, passedChecks, failedChecks, checks };
  } catch (err) {
    console.error('❌ Falha na verificação de produção:', err);
    throw err;
  } finally {
    await closePool();
  }
}

if (require.main === module) {
  runProductionVerification()
    .then((res) => process.exit(res.failedChecks === 0 ? 0 : 1))
    .catch(() => process.exit(1));
}

module.exports = { runProductionVerification };

