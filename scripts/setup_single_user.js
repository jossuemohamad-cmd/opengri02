/**
 * LECASU GridOps - Configuração do Utilizador Único
 * Remove todos os utilizadores e cria o utilizador oficial info@lecasu.co.mz
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../server/config/db');

async function setupSingleUser() {
  console.log('⚡ A reconfigurar utilizadores no LECASU GridOps...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Desvincular chaves estrangeiras temporariamente se necessário
    await client.query('UPDATE work_orders SET tecnico_id = NULL WHERE tecnico_id IS NOT NULL;');
    await client.query('UPDATE audit_logs SET user_id = NULL WHERE user_id IS NOT NULL;');

    // 2. Remover todos os utilizadores existentes
    const delRes = await client.query('DELETE FROM users;');
    console.log(`🗑️  Utilizadores anteriores removidos: ${delRes.rowCount}`);

    // 3. Gerar hash real com bcrypt para a senha solicitada: Lecasu@2026
    const plainPassword = 'Lecasu@2026';
    const passwordHash = bcrypt.hashSync(plainPassword, 10);

    const insertSql = `
      INSERT INTO users (
        id,
        nome,
        email,
        password_hash,
        role,
        status,
        telefone,
        criado_em,
        atualizado_em
      ) VALUES (
        '00000000-0000-0000-0000-000000000001',
        'LECASU Operações',
        'info@lecasu.co.mz',
        $1,
        'administrador',
        'ativo',
        '+258 84 000 0000',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      );
    `;

    await client.query(insertSql, [passwordHash]);
    console.log('✅ Utilizador único criado com sucesso: info@lecasu.co.mz (Role: administrador)');

    // 4. Associar os logs de auditoria e ordens de trabalho ao novo utilizador administrador
    await client.query("UPDATE audit_logs SET user_id = '00000000-0000-0000-0000-000000000001';");

    await client.query('COMMIT');

    const checkRes = await client.query('SELECT id, nome, email, role, status FROM users;');
    console.log('📋 Utilizadores activos na base de dados:', checkRes.rows);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao configurar utilizador único:', err);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

setupSingleUser().catch(() => process.exit(1));
