/**
 * LECASU GridOps - Controlador de Gestão de Utilizadores (User Controller)
 * 
 * Implementa operações CRUD completas para gestão de contas de utilizadores e perfis RBAC.
 * Acesso exclusivo a utilizadores com o perfil 'administrador'.
 */

const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { success, error } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');

// Perfis autorizados de acordo com a especificação LECASU GridOps
const VALID_ROLES = [
  'administrador',
  'gestor_operacoes',
  'gestor_comercial',
  'tecnico_campo',
  'agente_comunitario',
  'financeiro',
  'parceiro_auditor'
];

const VALID_STATUSES = ['ativo', 'inativo'];

/**
 * Validação de formato de email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && emailRegex.test(email.trim());
}

/**
 * Validação de complexidade mínima de senha
 * Requisitos: no mínimo 8 caracteres, pelo menos uma letra e um número.
 */
function isValidPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return false;
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

/**
 * GET /api/users
 * Lista utilizadores com suporte a paginação e filtros (role, status, busca textual).
 */
async function listUsers(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '10', 10)));
    const offset = (page - 1) * limit;

    const { role, status, search } = req.query;

    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (role && VALID_ROLES.includes(role)) {
      conditions.push(`role = $${paramIndex++}`);
      params.push(role);
    }

    if (status && VALID_STATUSES.includes(status)) {
      conditions.push(`status = $${paramIndex++}`);
      params.push(status);
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      conditions.push(`(nome ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Contagem total para metadados de paginação
    const countSql = `SELECT COUNT(*) AS total FROM users ${whereClause};`;
    const countRes = await query(countSql, params);
    const total = parseInt(countRes.rows[0].total, 10);

    // Consulta paginada dos utilizadores (sem password_hash)
    const usersSql = `
      SELECT id, nome, email, role, status, telefone, criado_em, atualizado_em
      FROM users
      ${whereClause}
      ORDER BY criado_em DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    params.push(limit, offset);

    const usersRes = await query(usersSql, params);

    return success(
      res,
      {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        users: usersRes.rows
      },
      'Lista de utilizadores recuperada com sucesso.'
    );
  } catch (err) {
    console.error('[USERS LIST ERROR]:', err);
    return error(res, 'Erro ao listar utilizadores do sistema.', 500);
  }
}

/**
 * POST /api/users
 * Regista um novo utilizador no sistema com senha encriptada em bcrypt.
 */
async function createUser(req, res) {
  try {
    const { nome, email, password, role, telefone } = req.body;

    // 1. Validação de campos obrigatórios
    if (!nome || !email || !password || !role) {
      return error(res, 'Os campos nome, email, palavra-passe e perfil (role) são obrigatórios.', 400);
    }

    if (typeof nome !== 'string' || nome.trim().length < 3) {
      return error(res, 'O nome deve conter pelo menos 3 caracteres.', 400);
    }

    if (!isValidEmail(email)) {
      return error(res, 'Endereço de email inválido.', 400);
    }

    if (!isValidPassword(password)) {
      return error(
        res,
        'A palavra-passe deve ter pelo menos 8 caracteres e incluir letras e números.',
        400
      );
    }

    if (!VALID_ROLES.includes(role)) {
      return error(
        res,
        `Perfil inválido. Perfis autorizados: ${VALID_ROLES.join(', ')}`,
        400
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 2. Verificação de unicidade do email
    const checkEmailRes = await query('SELECT id FROM users WHERE LOWER(email) = $1;', [cleanEmail]);
    if (checkEmailRes.rowCount > 0) {
      return error(res, 'Já existe um utilizador registado com este endereço de email.', 409);
    }

    // 3. Encriptação segura da senha com bcrypt (10 salt rounds)
    const passwordHash = await bcrypt.hash(String(password), 10);

    // 4. Inserção na base de dados
    const insertSql = `
      INSERT INTO users (
        nome,
        email,
        password_hash,
        role,
        status,
        telefone
      ) VALUES ($1, $2, $3, $4, 'ativo', $5)
      RETURNING id, nome, email, role, status, telefone, criado_em, atualizado_em;
    `;

    const insertValues = [
      nome.trim(),
      cleanEmail,
      passwordHash,
      role,
      telefone ? String(telefone).trim() : null
    ];

    const insertRes = await query(insertSql, insertValues);
    const newUser = insertRes.rows[0];

    // 5. Registo na trilha de auditoria
    await logAudit({
      userId: req.user.id,
      tabelaAfetada: 'users',
      accao: 'INSERT',
      registoId: newUser.id,
      dadosAntigos: null,
      dadosNovos: newUser
    });

    return success(res, newUser, 'Utilizador criado com sucesso.', 201);
  } catch (err) {
    console.error('[USERS CREATE ERROR]:', err);
    return error(res, 'Erro ao criar novo utilizador.', 500);
  }
}

/**
 * GET /api/users/:id
 * Consulta os detalhes de um utilizador específico pelo UUID.
 */
async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const userRes = await query(
      `SELECT id, nome, email, role, status, telefone, criado_em, atualizado_em
       FROM users
       WHERE id = $1;`,
      [id]
    );

    if (userRes.rowCount === 0) {
      return error(res, 'Utilizador não encontrado.', 404);
    }

    return success(res, userRes.rows[0], 'Utilizador localizado com sucesso.');
  } catch (err) {
    console.error('[USERS GET_BY_ID ERROR]:', err);
    return error(res, 'Erro ao obter dados do utilizador.', 500);
  }
}

/**
 * PUT /api/users/:id
 * Atualiza dados cadastrais, perfil de acesso e/ou palavra-passe de um utilizador existente.
 */
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { nome, telefone, role, password } = req.body;

    // 1. Obtém o estado atual para validação e auditoria
    const existingRes = await query(
      `SELECT id, nome, email, role, status, telefone, criado_em, atualizado_em
       FROM users
       WHERE id = $1;`,
      [id]
    );

    if (existingRes.rowCount === 0) {
      return error(res, 'Utilizador não encontrado.', 404);
    }

    const oldUser = existingRes.rows[0];

    // 2. Validações de entrada
    if (nome !== undefined && (typeof nome !== 'string' || nome.trim().length < 3)) {
      return error(res, 'O nome deve conter pelo menos 3 caracteres.', 400);
    }

    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return error(
        res,
        `Perfil inválido. Perfis autorizados: ${VALID_ROLES.join(', ')}`,
        400
      );
    }

    let passwordHash = null;
    if (password !== undefined) {
      if (!isValidPassword(password)) {
        return error(
          res,
          'A nova palavra-passe deve ter pelo menos 8 caracteres e incluir letras e números.',
          400
        );
      }
      passwordHash = await bcrypt.hash(String(password), 10);
    }

    // 3. Montagem dinâmica dos campos para atualização
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (nome !== undefined) {
      updates.push(`nome = $${paramIndex++}`);
      values.push(nome.trim());
    }

    if (telefone !== undefined) {
      updates.push(`telefone = $${paramIndex++}`);
      values.push(telefone ? String(telefone).trim() : null);
    }

    if (role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      values.push(role);
    }

    if (passwordHash) {
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(passwordHash);
    }

    if (updates.length === 0) {
      return error(res, 'Nenhum campo fornecido para atualização.', 400);
    }

    values.push(id);
    const updateSql = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, nome, email, role, status, telefone, criado_em, atualizado_em;
    `;

    const updateRes = await query(updateSql, values);
    const updatedUser = updateRes.rows[0];

    // 4. Registo na trilha de auditoria
    await logAudit({
      userId: req.user.id,
      tabelaAfetada: 'users',
      accao: 'UPDATE',
      registoId: updatedUser.id,
      dadosAntigos: oldUser,
      dadosNovos: updatedUser
    });

    return success(res, updatedUser, 'Dados do utilizador atualizados com sucesso.');
  } catch (err) {
    console.error('[USERS UPDATE ERROR]:', err);
    return error(res, 'Erro ao atualizar dados do utilizador.', 500);
  }
}

/**
 * PATCH /api/users/:id/status
 * Altera o estado do utilizador (ativo/inativo) sem remoção física da base de dados.
 */
async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    let { status } = req.body;

    if (!status && req.body.ativo !== undefined) {
      status = req.body.ativo ? 'ativo' : 'inativo';
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      return error(res, `Estado inválido. Valores aceites: ${VALID_STATUSES.join(', ')}`, 400);
    }

    // Prevenção de bloqueio: o administrador não pode desativar a sua própria conta ativa
    if (req.user.id === id && status === 'inativo') {
      return error(res, 'Não é permitido desativar a sua própria conta de administrador.', 400);
    }

    const checkRes = await query('SELECT id, nome, email, role, status FROM users WHERE id = $1;', [id]);
    if (checkRes.rowCount === 0) {
      return error(res, 'Utilizador não encontrado.', 404);
    }

    const oldUser = checkRes.rows[0];

    const updateRes = await query(
      `UPDATE users
       SET status = $1
       WHERE id = $2
       RETURNING id, nome, email, role, status, telefone, atualizado_em;`,
      [status, id]
    );

    const updatedUser = updateRes.rows[0];

    // Registo na trilha de auditoria
    await logAudit({
      userId: req.user.id,
      tabelaAfetada: 'users',
      accao: 'UPDATE',
      registoId: updatedUser.id,
      dadosAntigos: { status: oldUser.status },
      dadosNovos: { status: updatedUser.status }
    });

    return success(
      res,
      updatedUser,
      `Estado do utilizador alterado para '${status}' com sucesso.`
    );
  } catch (err) {
    console.error('[USERS UPDATE_STATUS ERROR]:', err);
    return error(res, 'Erro ao alterar estado do utilizador.', 500);
  }
}

module.exports = {
  listUsers,
  createUser,
  getUserById,
  updateUser,
  updateUserStatus,
  VALID_ROLES
};

