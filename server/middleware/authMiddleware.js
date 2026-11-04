/**
 * LECASU GridOps - Middleware de Autenticação JWT
 * 
 * Interceta requisições, valida a assinatura e expiração do token JWT,
 * verifica se o utilizador existe e se encontra ativo na base de dados,
 * e anexa o perfil completo a req.user.
 */

const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { error } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'super_segredo_jwt_lecasu_gridops_alterar_em_producao_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Utilitário para gerar tokens JWT assinados
 */
function generateToken(payload, expiresIn = JWT_EXPIRES_IN) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Utilitário para verificar e decodificar tokens JWT
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Middleware de validação do token JWT e integridade do utilizador
 */
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Token de autenticação não fornecido ou formato inválido. Use: Authorization: Bearer <token>', 401);
  }

  const token = authHeader.substring(7).trim();

  if (!token) {
    return error(res, 'Token de autenticação ausente.', 401);
  }

  // 1. Verificação criptográfica do token JWT
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'A sua sessão expirou. Por favor efetue login novamente.', 401);
    }
    return error(res, 'Token de autenticação inválido ou corrompido.', 403);
  }

  // 2. Consulta à base de dados para garantir que a conta não foi desativada ou eliminada
  try {
    const userRes = await query(
      'SELECT id, nome, email, role, status, telefone FROM users WHERE id = $1;',
      [decoded.id]
    );

    if (userRes.rowCount === 0) {
      return error(res, 'Utilizador associado ao token não encontrado.', 401);
    }

    const user = userRes.rows[0];

    if (user.status !== 'ativo') {
      return error(res, 'A sua conta de utilizador encontra-se inativa. Contacte a administração.', 403);
    }

    // Anexa dados confiáveis do utilizador ao objeto de requisição
    req.user = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      status: user.status,
      telefone: user.telefone
    };

    next();
  } catch (dbErr) {
    console.error('[AUTH ERROR] Erro na verificação do utilizador na BD:', dbErr.message);
    return error(res, 'Erro de autenticação ao validar estado do utilizador.', 500);
  }
}

module.exports = {
  authenticateToken,
  generateToken,
  verifyToken
};
