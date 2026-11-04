/**
 * LECASU GridOps - Atualização de Esquema e Dados da Base de Dados
 */
const bcrypt = require('bcryptjs');
const { pool } = require('../server/config/db');

async function updateDb() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('1. A verificar e criar colunas no PostgreSQL...');

    // Coluna username em users
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;');

    // Colunas de inversores e fotos em mini_grids
    await client.query('ALTER TABLE mini_grids ADD COLUMN IF NOT EXISTS inversor_modelo VARCHAR(150);');
    await client.query('ALTER TABLE mini_grids ADD COLUMN IF NOT EXISTS inversor_numero_serie VARCHAR(100);');
    await client.query('ALTER TABLE mini_grids ADD COLUMN IF NOT EXISTS inversor_potencia_kw NUMERIC(10,2);');
    await client.query('ALTER TABLE mini_grids ADD COLUMN IF NOT EXISTS foto_campo_url TEXT;');
    await client.query('ALTER TABLE mini_grids ADD COLUMN IF NOT EXISTS foto_contentor_url TEXT;');
    await client.query('ALTER TABLE mini_grids ADD COLUMN IF NOT EXISTS foto_bess_url TEXT;');

    // Colunas de fotos e vistorias em clients
    await client.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS foto_fachada_url TEXT;');
    await client.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS foto_contador_url TEXT;');
    await client.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS foto_poste_url TEXT;');
    await client.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS vistoria_aprovada BOOLEAN DEFAULT true;');
    await client.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS vistoria_tecnico VARCHAR(150);');
    await client.query('ALTER TABLE clients ADD COLUMN IF NOT EXISTS vistoria_data DATE;');

    // 2. Registar o utilizador jossuemohamad@gmail.com
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Joswil@8464', salt);

    const userSql = `
      INSERT INTO users (id, nome, email, username, password_hash, role, status, telefone)
      VALUES (
        gen_random_uuid(),
        'Jossue Mohamad',
        'jossuemohamad@gmail.com',
        'jossue',
        $1,
        'administrador',
        'ativo',
        '+258 84 640 0000'
      )
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = 'administrador',
        status = 'ativo',
        username = 'jossue';
    `;
    await client.query(userSql, [hash]);
    console.log('✅ Utilizador jossuemohamad@gmail.com registado como administrador com sucesso!');

    // 3. Atualizar dados de inversores e fotos para todas as mini-redes
    await client.query(`
      UPDATE mini_grids SET
        inversor_modelo = COALESCE(inversor_modelo, 'Huawei SUN2000-100KTL-M2'),
        inversor_numero_serie = COALESCE(inversor_numero_serie, 'HW-INV-' || SUBSTRING(codigo, 4)),
        inversor_potencia_kw = COALESCE(inversor_potencia_kw, ROUND((capacidade_kwp * 0.95)::numeric, 2)),
        foto_campo_url = COALESCE(foto_campo_url, 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80'),
        foto_contentor_url = COALESCE(foto_contentor_url, 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80'),
        foto_bess_url = COALESCE(foto_bess_url, 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80')
      WHERE foto_campo_url IS NULL OR inversor_modelo IS NULL;
    `);
    console.log('✅ Inversores e fotografias das centrais atualizados!');

    // 4. Atualizar fotos e vistorias dos clientes
    await client.query(`
      UPDATE clients SET
        foto_fachada_url = COALESCE(foto_fachada_url, 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80'),
        foto_contador_url = COALESCE(foto_contador_url, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'),
        foto_poste_url = COALESCE(foto_poste_url, 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80'),
        vistoria_aprovada = COALESCE(vistoria_aprovada, true),
        vistoria_tecnico = COALESCE(vistoria_tecnico, 'Mateus Macuácua'),
        vistoria_data = COALESCE(vistoria_data, CURRENT_DATE - INTERVAL '15 days')
      WHERE foto_fachada_url IS NULL;
    `);
    console.log('✅ Fotografias de clientes e vistorias técnicas atualizadas!');

    await client.query('COMMIT');
    console.log('🎉 Atualização da Base de Dados concluída com sucesso!');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Erro na atualização:', e);
    process.exit(1);
  } finally {
    client.release();
    pool.end();
  }
}

updateDb();

