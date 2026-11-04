/**
 * LECASU GridOps - Middleware de Autenticação e Autorização JWT
 * 
 * Valida o cabeçalho Authorization (Bearer token) e extrai o utilizador autenticado.
 */

const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_padrao_lecasu_gridops';

/**
 * Middleware para validar o token JWT nas requisições protegidas.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return error(res, 'Token de autenticação não fornecido ou formato inválido', 401);
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return error(res, 'A sua sessão expirou. Por favor efetue login novamente.', 401);
      }
      return error(res, 'Token de autenticação inválido ou corrompido', 403);
    }

    req.user = decodedUser;
    next();
  });
}

/**
 * Middleware para autorização baseada em papéis/perfis (RBAC).
 * Exemplo: authorizeRoles('admin', 'gestor')
 */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return error(res, 'Acesso negado: privilégios insuficientes para este recurso', 403);
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles
};

