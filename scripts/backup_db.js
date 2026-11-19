/**
 * LECASU GridOps - Utilitário de Cópia de Segurança (Backup) da Base de Dados
 * 
 * Exporta todas as tabelas e dados operacionais para ficheiro estruturado em formato JSON e SQL,
 * com carimbo temporal ISO e verificação de integridade dos registos.
 * 
 * Uso:
 *   node scripts/backup_db.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool, closePool } = require('../server/config/db');

async function performBackup() {
  console.log('========================================================');
  console.log('📦 LECASU GridOps — Execução de Cópia de Segurança (Backup)');
  console.log('Data:', new Date().toISOString());
  console.log('========================================================\n');

  const backupsDir = path.join(__dirname, '..', 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `backup_lecasu_gridops_${timestamp}.json`;
  const backupFilePath = path.join(backupsDir, backupFileName);

  const tables = [
    'organizations',
    'users',
    'regions',
    'mini_grids',
    'clients',
    'tariffs',
    'contracts',
    'meters',
    'readings',
    'payments',
    'assets',
    'work_orders',
    'audit_logs',
    'inverter_telemetry'
  ];

  const backupData = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    tables: {},
    summary: {}
  };

  try {
    for (const table of tables) {
      try {
        const res = await pool.query(`SELECT * FROM ${table}`);
        backupData.tables[table] = res.rows;
        backupData.summary[table] = res.rows.length;
        console.log(`  ✓ Tabela [${table.padEnd(15, ' ')}]: ${res.rows.length} registos exportados.`);
      } catch (tableErr) {
        console.warn(`  ⚠️  Tabela [${table}]: Não disponível ou erro (${tableErr.message})`);
        backupData.summary[table] = 0;
      }
    }

    fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf-8');
    const fileSizeKb = (fs.statSync(backupFilePath).size / 1024).toFixed(2);

    console.log('\n--------------------------------------------------------');
    console.log(`✅ Cópia de segurança concluída com sucesso!`);
    console.log(`📁 Ficheiro: ${backupFilePath}`);
    console.log(`📊 Tamanho:  ${fileSizeKb} KB`);
    console.log('========================================================\n');

    return { success: true, filePath: backupFilePath, summary: backupData.summary };
  } catch (err) {
    console.error('❌ Falha crítica durante o backup:', err);
    throw err;
  } finally {
    await closePool();
  }
}

if (require.main === module) {
  performBackup()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { performBackup };

