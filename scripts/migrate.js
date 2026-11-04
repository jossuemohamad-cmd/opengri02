/**
 * LECASU GridOps - Executor de Migrações em JavaScript Puro
 * 
 * Executa ficheiros de migração SQL (.sql) na pasta migrations/ em ordem sequencial.
 * Utiliza o pool de conexões nativo do pg (sem ORMs ou dependências pesadas).
 * Executa cada migração dentro de uma transação isolada (BEGIN/COMMIT/ROLLBACK).
 * 
 * Uso:
 *   node scripts/migrate.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool, closePool } = require('../server/config/db');

async function runMigrations() {
  console.log('\n======================================================');
  console.log('⚡ LECASU GridOps - Sistema de Migrações de Base de Dados');
  console.log('======================================================\n');

  const migrationsDir = path.join(__dirname, '..', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error(`[ERRO] Diretório de migrações não encontrado: ${migrationsDir}`);
    process.exit(1);
  }

  // Identifica e ordena os ficheiros .sql
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('[AVISO] Nenhum ficheiro SQL encontrado na pasta migrations/.');
    await closePool();
    return;
  }

  console.log(`📁 Ficheiros de migração descobertos: ${migrationFiles.length}`);

  let client;
  try {
    // Adquire cliente dedicado para executar as operações de migração
    client = await pool.connect();
    console.log('[DB] Ligação estabelecida com sucesso à base de dados PostgreSQL.\n');

    // 1. Garante que a tabela de histórico de migrações existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Consulta as migrações já aplicadas
    const { rows: appliedRows } = await client.query('SELECT name FROM _migrations ORDER BY id ASC;');
    const appliedNames = new Set(appliedRows.map((r) => r.name));

    let executedCount = 0;
    let skippedCount = 0;

    // 3. Itera e aplica cada migração sequencialmente
    for (const file of migrationFiles) {
      if (appliedNames.has(file)) {
        console.log(`⏩ [IGNORADA] ${file} (já aplicada anteriormente)`);
        skippedCount++;
        continue;
      }

      console.log(`⚙️  [A EXECUTAR] ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      const startTime = Date.now();

      try {
        // Cada ficheiro de migração corre na sua própria transação atómica
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO _migrations (name) VALUES ($1);', [file]);
        await client.query('COMMIT');

        const duration = Date.now() - startTime;
        console.log(`✅ [SUCESSO]   ${file} aplicada com êxito em ${duration}ms\n`);
        executedCount++;
      } catch (migrationError) {
        await client.query('ROLLBACK');
        console.error(`\n❌ [FALHA CRÍTICA] Erro ao aplicar migração ${file}:`);
        console.error(`   Detalhes: ${migrationError.message}`);
        if (migrationError.position) {
          console.error(`   Posição do erro no SQL: caractere ${migrationError.position}`);
        }
        throw migrationError;
      }
    }

    console.log('------------------------------------------------------');
    console.log(`📊 Resumo da Execução:`);
    console.log(`   • Migrações aplicadas nesta execução: ${executedCount}`);
    console.log(`   • Migrações já existentes ignoradas:  ${skippedCount}`);
    console.log(`   • Total de ficheiros catalogados:     ${migrationFiles.length}`);
    console.log('------------------------------------------------------\n');
    console.log('🎉 Todas as migrações foram concluídas com sucesso!');
  } catch (error) {
    console.error(`\n💥 O processo de migração foi interrompido: ${error.message}`);
    process.exitCode = 1;
  } finally {
    if (client) {
      client.release();
    }
    await closePool();
  }
}

// Execução direta via CLI
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
