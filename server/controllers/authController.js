/**
 * LECASU GridOps - Controlador de Autenticação (Auth Controller)
 * 
 * Gerencia autenticação via JWT, início de sessão, perfil do utilizador
 * e renovação de tokens (secção 2 e 11 da especificação LECASU).
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { success, error } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'super_segredo_jwt_lecasu_gridops_alterar_em_producao_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * POST /api/auth/login
 * Autentica o utilizador através de email e palavra-passe.
 */
async function login(req, res) {
  try {
    const { email, username, password } = req.body;
    const identifier = (email || username || '').trim().toLowerCase();

    // 1. Validação de campos obrigatórios
    if (!identifier || !password) {
      return error(res, 'Email/usuário e palavra-passe são de preenchimento obrigatório.', 400);
    }

    // 2. Consulta do utilizador na base de dados por email ou nome de utilizador
    const sql = `
      SELECT id, nome, email, password_hash, role, status, telefone
      FROM users
      WHERE LOWER(email) = $1;
    `;
    const userRes = await query(sql, [identifier]);

    // Mensagem genérica para mitigar enumeração de contas
    const credenciaisInvalidasMsg = 'Credenciais inválidas. Verifique o email/usuário e a palavra-passe.';

    if (userRes.rowCount === 0) {
      return error(res, credenciaisInvalidasMsg, 401);
    }

    const user = userRes.rows[0];

    // 3. Verificação da senha com bcrypt
    const passwordMatch = await bcrypt.compare(String(password), user.password_hash);
    if (!passwordMatch) {
      return error(res, credenciaisInvalidasMsg, 401);
    }

    // 4. Verificação de estado ativo da conta
    if (user.status !== 'ativo') {
      return error(res, 'Esta conta de utilizador encontra-se inativa. Contacte a administração.', 403);
    }

    // 5. Geração do token JWT assinado
    const payload = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    // 6. Resposta com o token e dados públicos (sem password_hash)
    return success(
      res,
      {
        token,
        token_type: 'Bearer',
        expires_in: JWT_EXPIRES_IN,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
          telefone: user.telefone
        }
      },
      'Autenticação realizada com sucesso.'
    );
  } catch (err) {
    console.error('[AUTH LOGIN ERROR]:', err);
    return error(res, 'Erro interno ao processar autenticação.', 500);
  }
}

/**
 * GET /api/auth/me
 * Retorna o perfil do utilizador autenticado a partir do token ativo.
 */
async function me(req, res) {
  try {
    if (!req.user) {
      return error(res, 'Utilizador não autenticado.', 401);
    }

    return success(res, req.user, 'Perfil de utilizador obtido com sucesso.');
  } catch (err) {
    console.error('[AUTH ME ERROR]:', err);
    return error(res, 'Erro ao obter dados do perfil.', 500);
  }
}

/**
 * POST /api/auth/refresh
 * Renova o token de sessão do utilizador autenticado.
 */
async function refresh(req, res) {
  try {
    if (!req.user) {
      return error(res, 'Utilizador não autenticado.', 401);
    }

    const payload = {
      id: req.user.id,
      nome: req.user.nome,
      email: req.user.email,
      role: req.user.role
    };

    const newToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    return success(
      res,
      {
        token: newToken,
        token_type: 'Bearer',
        expires_in: JWT_EXPIRES_IN,
        user: req.user
      },
      'Token renovado com sucesso.'
    );
  } catch (err) {
    console.error('[AUTH REFRESH ERROR]:', err);
    return error(res, 'Erro ao renovar token de sessão.', 500);
  }
}

// Armazenamento em memória de códigos de recuperação (expiram em 15 minutos)
const recoveryStore = new Map();

/**
 * POST /api/auth/forgot-password
 * Gera código de recuperação de senha para o email fornecido.
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return error(res, 'Por favor, insira o seu endereço de e-mail.', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return error(res, 'O endereço de e-mail inserido não possui um formato válido.', 400);
    }

    const userRes = await query('SELECT id, nome, email, status FROM users WHERE LOWER(email) = $1;', [cleanEmail]);
    if (userRes.rowCount === 0) {
      return error(res, 'Não foi encontrada nenhuma conta associada a este e-mail.', 404);
    }

    const user = userRes.rows[0];
    if (user.status !== 'ativo') {
      return error(res, 'Esta conta de utilizador encontra-se inativa. Contacte a administração.', 403);
    }

    // Gerar código numérico de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;

    recoveryStore.set(cleanEmail, { code, expiresAt, userId: user.id });

    return success(
      res,
      {
        email: user.email,
        code,
        expires_in: '15 minutos'
      },
      'Código de recuperação gerado com sucesso.'
    );
  } catch (err) {
    console.error('[AUTH FORGOT PASSWORD ERROR]:', err);
    return error(res, 'Erro interno ao processar recuperação de palavra-passe.', 500);
  }
}

/**
 * POST /api/auth/reset-password
 * Redefine a palavra-passe do utilizador após validação do código.
 */
async function resetPassword(req, res) {
  try {
    const { email, code, newPassword } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanCode = (code || '').trim();

    if (!cleanEmail || !cleanCode || !newPassword) {
      return error(res, 'Email, código de verificação e nova palavra-passe são obrigatórios.', 400);
    }

    if (String(newPassword).length < 6) {
      return error(res, 'A nova palavra-passe deve conter pelo menos 6 caracteres.', 400);
    }

    const record = recoveryStore.get(cleanEmail);
    if (!record || record.code !== cleanCode) {
      return error(res, 'Código de verificação incorreto ou inválido.', 400);
    }

    if (Date.now() > record.expiresAt) {
      recoveryStore.delete(cleanEmail);
      return error(res, 'O código de verificação expirou. Por favor solicite um novo.', 400);
    }

    // Gerar hash seguro com bcrypt
    const passwordHash = await bcrypt.hash(String(newPassword), 10);

    await query(
      'UPDATE users SET password_hash = $1, atualizado_em = CURRENT_TIMESTAMP WHERE id = $2;',
      [passwordHash, record.userId]
    );

    recoveryStore.delete(cleanEmail);

    return success(res, null, 'Palavra-passe redefinida com sucesso. Pode agora iniciar sessão.');
  } catch (err) {
    console.error('[AUTH RESET PASSWORD ERROR]:', err);
    return error(res, 'Erro interno ao redefinir palavra-passe.', 500);
  }
}

module.exports = {
  login,
  me,
  refresh,
  forgotPassword,
  resetPassword
};

