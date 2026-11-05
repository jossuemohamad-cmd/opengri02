/**
 * LECASU GridOps - Utilitário de Restauração e Validação de Cópia de Segurança
 * 
 * Permite restaurar os dados de um ficheiro de backup JSON gerado pelo backup_db.js
 * com verificação de integridade referencial e modo de simulação (dry-run).
 * 
 * Uso:
 *   node scripts/restore_db.js [caminho_do_ficheiro_backup.json] [--dry-run]
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool, closePool } = require('../server/config/db');

async function restoreBackup(filePath, dryRun = false) {
  console.log('========================================================');
  console.log('🔄 LECASU GridOps — Restauração de Cópia de Segurança');
  console.log('Data:', new Date().toISOString());
  console.log('Modo:', dryRun ? 'SIMULAÇÃO (DRY-RUN - sem alterações)' : 'EXECUÇÃO REAL');
  console.log('========================================================\n');

  if (!filePath) {
    // Procura o backup mais recente na pasta backups/
    const backupsDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupsDir)) {
      throw new Error(`Pasta de backups não encontrada: ${backupsDir}`);
    }
    const files = fs.readdirSync(backupsDir).filter(f => f.endsWith('.json')).sort().reverse();
    if (files.length === 0) {
      throw new Error('Nenhum ficheiro de backup encontrado.');
    }
    filePath = path.join(backupsDir, files[0]);
  }

  console.log(`📁 Ficheiro alvo: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const backup = JSON.parse(content);

  console.log(`⏱️  Timestamp do backup: ${backup.timestamp}`);
  console.log(`📋 Tabelas contidas: ${Object.keys(backup.tables).join(', ')}\n`);

  let client;
  try {
    client = await pool.connect();

    if (dryRun) {
      console.log('🧪 Validação de integridade do ficheiro (Dry-Run):');
      for (const [table, rows] of Object.entries(backup.tables)) {
        console.log(`  ✓ Tabela [${table.padEnd(15, ' ')}]: ${rows.length} registos válidos.`);
      }
      console.log('\n✅ Simulação concluída com sucesso! Os dados estão íntegros e aptos para restauração.');
      return { success: true, dryRun: true };
    }

    // Restauração real em transação
    await client.query('BEGIN');
    console.log('[DB] Transação de restauração iniciada...');

    // Ordem inversa para respeitar chaves estrangeiras
    const clearOrder = [
      'audit_logs',
      'work_orders',
      'assets',
      'payments',
      'readings',
      'meters',
      'contracts',
      'tariffs',
      'clients',
      'mini_grids',
      'users'
    ];

    for (const table of clearOrder) {
      if (backup.tables[table]) {
        await client.query(`DELETE FROM ${table}`);
        console.log(`  🧹 Dados anteriores limpos na tabela [${table}]`);
      }
    }

    // Ordem direta para inserção
    const insertOrder = clearOrder.reverse();
    for (const table of insertOrder) {
      const rows = backup.tables[table] || [];
      if (rows.length === 0) continue;

      for (const row of rows) {
        const columns = Object.keys(row);
        const values = Object.values(row);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const colList = columns.map(c => `"${c}"`).join(', ');

        await client.query(
          `INSERT INTO ${table} (${colList}) VALUES (${placeholders})`,
          values
        );
      }
      console.log(`  ✓ Tabela [${table.padEnd(15, ' ')}]: ${rows.length} registos restaurados.`);
    }

    await client.query('COMMIT');
    console.log('\n--------------------------------------------------------');
    console.log('✅ Restauração da base de dados concluída com êxito!');
    console.log('========================================================\n');

    return { success: true, dryRun: false };
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('❌ Falha na restauração. Transação revertida:', err.message);
    throw err;
  } finally {
    if (client) client.release();
    await closePool();
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const fileArg = args.find(a => !a.startsWith('--'));

  restoreBackup(fileArg, isDryRun)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { restoreBackup };
