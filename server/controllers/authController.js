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

module.exports = {
  login,
  me,
  refresh
};

