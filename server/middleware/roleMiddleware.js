/**
 * LECASU GridOps - Middleware de Controlo de Acesso Baseado em Perfis (RBAC)
 * 
 * Implementa o Princípio do Menor Privilégio com suporte bidirecional
 * aos identificadores canónicos em inglês e aos identificadores na base de dados:
 * 
 * - ADMIN / administrador
 * - OPERATIONS_MANAGER / gestor_operacoes
 * - COMMERCIAL_MANAGER / gestor_comercial
 * - FIELD_TECHNICIAN / tecnico_campo
 * - COMMUNITY_AGENT / agente_comunitario
 * - FINANCE / financeiro
 * - AUDITOR_PARTNER / parceiro_auditor
 * - CUSTOMER / cliente (fora do MVP - fase posterior)
 */

const { error } = require('../utils/response');

// Mapeamento canónico de equivalências RBAC
const ROLE_ALIASES = {
  // Canónicos em Inglês -> Base de Dados
  ADMIN: 'administrador',
  OPERATIONS_MANAGER: 'gestor_operacoes',
  COMMERCIAL_MANAGER: 'gestor_comercial',
  FIELD_TECHNICIAN: 'tecnico_campo',
  COMMUNITY_AGENT: 'agente_comunitario',
  FINANCE: 'financeiro',
  AUDITOR_PARTNER: 'parceiro_auditor',
  CUSTOMER: 'cliente',

  // Base de Dados (Português) -> Base de Dados
  administrador: 'administrador',
  gestor_operacoes: 'gestor_operacoes',
  gestor_comercial: 'gestor_comercial',
  tecnico_campo: 'tecnico_campo',
  agente_comunitario: 'agente_comunitario',
  financeiro: 'financeiro',
  parceiro_auditor: 'parceiro_auditor',
  cliente: 'cliente'
};

/**
 * Normaliza um perfil para o identificador padrão da base de dados.
 * @param {string} role 
 * @returns {string}
 */
function normalizeRole(role) {
  if (!role) return '';
  const trimmed = String(role).trim();
  return ROLE_ALIASES[trimmed] || ROLE_ALIASES[trimmed.toUpperCase()] || trimmed.toLowerCase();
}

/**
 * Função de ordem superior para autorização de rotas com base no perfil (role).
 * Suporta anotações em formato array ou lista de argumentos:
 *   authorizeRoles(['OPERATIONS_MANAGER', 'ADMIN'])
 *   authorizeRoles('administrador', 'gestor_operacoes')
 * 
 * @param  {...string|string[]} allowedRoles
 * @returns {import('express').RequestHandler}
 */
function authorizeRoles(...allowedRoles) {
  // Unifica e normaliza todos os papéis aceites na rota
  const rawRoles = allowedRoles.flat();
  const normalizedAllowedRoles = rawRoles.map(r => normalizeRole(r));

  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Acesso não autorizado: contexto de utilizador não encontrado.', 401);
    }

    const userRole = normalizeRole(req.user.role);

    if (!normalizedAllowedRoles.includes(userRole)) {
      return error(
        res,
        `Acesso negado: o seu perfil (${req.user.role}) não tem permissão para aceder a este recurso.`,
        403
      );
    }

    next();
  };
}

module.exports = {
  authorizeRoles,
  normalizeRole,
  ROLE_ALIASES
};

