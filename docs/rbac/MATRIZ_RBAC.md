# Matriz Unificada de Controlo de Acesso Baseado em Funções (RBAC) — LECASU GridOps

## 1. Princípio Fundamental: Menor Privilégio
O **LECASU GridOps** aplica rigorosamente o **Princípio do Menor Privilégio**. Nenhum utilizador possui acesso a rotas da API, tabelas ou ações de interface fora do seu escopo funcional e geográfico estritamente atribuído.

---

## 2. Matriz Consolidada de Perfis (Roles)

| Perfil (Role) | Identificador BD | Responsabilidades Principais | Nível de Acesso no Sistema | Restrições & Escopo de Dados |
| :--- | :--- | :--- | :--- | :--- |
| **`ADMIN`** | `administrador` | Gestão geral da plataforma, utilizadores, perfis, auditoria e parâmetros do sistema. | **Acesso Total:** Configurações globais, logs de auditoria, utilizadores e permissões. | Acesso irrestrito a todas as organizações, mini-redes e tabelas. |
| **`OPERATIONS_MANAGER`** | `gestor_operacoes` | Acompanhamento do desempenho técnico, monitorização de avarias e coordenação de equipas. | **Operações e Ativos:** Painéis técnicos, mini-redes, ativos, ordens de trabalho (OTs). | Sem acesso a edições financeiras diretas ou parâmetros do sistema. |
| **`COMMERCIAL_MANAGER`** | `gestor_comercial` | Gestão da carteira de clientes, contratos, definição de tarifas, faturação e controlo de pagamentos. | **Comercial e Cobrança:** Clientes, contratos, contadores, tarifas, histórico de vendas e dívidas. | Não edita parâmetros técnicos de ativos nem despacha equipas de manutenção. |
| **`FIELD_TECHNICIAN`** | `tecnico_campo` | Execução de inspeções, recolha de leituras manuais, diagnóstico de avarias e resolução de ordens de serviço. | **Móvel / Campo (Offline-First):** Vê apenas as Ordens de Trabalho e ativos atribuídos a si ou à sua zona. | Não vê dados consolidados de receitas, tarifas ou clientes de outras áreas. |
| **`COMMUNITY_AGENT`** | `agente_comunitario` | Apoio local aos clientes, pré-cadastro comunitário, registo inicial de solicitações e dúvidas. | **Apoio Local:** Cadastro de clientes da sua localidade e abertura de tickets/pedidos básicos. | **Isolamento geográfico estrito:** Apenas dados da sua comunidade/mini-rede atribuída. |
| **`FINANCE`** | `financeiro` | Reconciliação contabilística, validação de pagamentos, gestão de saldos devedores e relatórios de receita. | **Módulo Financeiro:** Balanços, histórico de transações, extratos de receitas e relatórios contabilísticos. | Acesso de leitura/escrita financeira; apenas leitura nos módulos de clientes/ativos. |
| **`AUDITOR_PARTNER`** | `parceiro_auditor` | Avaliação de impacto social, auditoria de dados e verificação de métricas para financiadores. | **Somente Leitura (Read-Only):** Painéis analíticos e relatórios exportáveis autorizados. | Sem permissão de escrita em nenhum módulo do sistema. |
| **`CUSTOMER`** *(Fora do MVP)* | `cliente` | Fase posterior (fora do MVP imediato). Consulta de saldo, faturas, consumo e histórico. | **Portal / App do Cliente:** Exclusivamente aos seus próprios dados de contrato e consumo. | Isolamento absoluto ao seu próprio `CustomerID`. |

---

## 3. Regras Operacionais para o Agente (Anti-Alucinação para RBAC)

### Regra 1: Validação de Permissões em Todas as Rotas
* Todo o endpoint ou funcionalidade proposta no backend deve especificar explicitamente os papéis autorizados utilizando o middleware `authorizeRoles`:
  * Exemplo: `authorizeRoles(['OPERATIONS_MANAGER', 'ADMIN'])` ou `authorizeRoles(['COMMERCIAL_MANAGER', 'ADMIN'])`.
* Tentativas de acesso por perfis não autorizados devem retornar de imediato `403 Forbidden`.

### Regra 2: Escopo Geográfico e Multilocação
* Os perfis de campo (**`FIELD_TECHNICIAN`** e **`COMMUNITY_AGENT`**) têm os dados filtrados estritamente por `mini_grid_id`, `region_id` ou `tecnico_id`.
* O backend **NÃO DEVE** fornecer listagens globais da carteira a utilizadores com perfis de campo.

### Regra 3: Bloqueio Formal do Perfil CUSTOMER no MVP
* O agente não deve propor nem implementar interfaces web de consumidor, portais de autoatendimento ou apps de cliente na Fase 1.
* O foco é manter a integridade relacional da base de dados (chaves estrangeiras `client_id` em contratos, contadores e pagamentos).

---

## 4. Ficheiros Individuais Detalhados por Perfil
* [ADMIN.md](file:///c:/Users/LECASU/Desktop/LECASU%20LDA%202026/Sistemas/Mini%20Rede/docs/rbac/ADMIN.md)
* [OPERATIONS_MANAGER.md](file:///c:/Users/LECASU/Desktop/LECASU%20LDA%202026/Sistemas/Mini%20Rede/docs/rbac/OPERATIONS_MANAGER.md)
* [COMMERCIAL_MANAGER.md](file:///c:/Users/LECASU/Desktop/LECASU%20LDA%202026/Sistemas/Mini%20Rede/docs/rbac/COMMERCIAL_MANAGER.md)
* [FIELD_TECHNICIAN.md](file:///c:/Users/LECASU/Desktop/LECASU%20LDA%202026/Sistemas/Mini%20Rede/docs/rbac/FIELD_TECHNICIAN.md)
* [COMMUNITY_AGENT.md](file:///c:/Users/LECASU/Desktop/LECASU%20LDA%202026/Sistemas/Mini%20Rede/docs/rbac/COMMUNITY_AGENT.md)
* [FINANCE.md](file:///c:/Users/LECASU/Desktop/LECASU%20LDA%202026/Sistemas/Mini%20Rede/docs/rbac/FINANCE.md)
* [AUDITOR_PARTNER.md](file:///c:/Users/LECASU/Desktop/LECASU%20LDA%202026/Sistemas/Mini%20Rede/docs/rbac/AUDITOR_PARTNER.md)
* [CUSTOMER.md](file:///c:/Users/LECASU/Desktop/LECASU%20LDA%202026/Sistemas/Mini%20Rede/docs/rbac/CUSTOMER.md)

