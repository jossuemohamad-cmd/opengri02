# Perfil de Acesso: OPERATIONS_MANAGER (Gestor de Operações)

## 1. Identificação do Perfil
* **Código Canónico:** `OPERATIONS_MANAGER`
* **Identificador na Base de Dados:** `gestor_operacoes`
* **Nível Hierárquico:** Nível 2 (Gestão Técnica e Engenharia de O&M)
* **Utilizador Padrão no Sistema:**
  * **Nome:** Délcio Cossa - Gestor de Operações
  * **Email:** `operacoes@lecasu.co.mz`
  * **Senha Inicial de Teste:** `Admin@LECASU2026`

---

## 2. Responsabilidades Principais
* Monitorização do desempenho técnico, capacidade de geração solar fotovoltaica e armazenamento em baterias da carteira.
* Supervisão de ativos patrimoniais e equipamentos de geração/distribuição (inversores, transformadores, painéis, baterias).
* Gestão e planeamento de intervenções preventivas e despacho de ocorrências corretivas.
* Atribuição de Ordens de Trabalho (OTs) a técnicos de campo e aprovação do fecho de serviços técnicos.

---

## 3. Nível de Acesso no Sistema
* **Módulos Autorizados:**
  * Painel Executivo e Métricas Técnicas.
  * Mapa GIS de Activos, Rede e Clientes (visualização de camadas técnicas).
  * Registo e Fichas Técnicas de Mini-Redes.
  * Gestão de Activos e Planos de Manutenção Preventiva.
  * Ocorrências, Ordens de Trabalho (OTs) e Despacho de Técnicos.
  * Relatórios Técnicos e de Desempenho Operacional (exportação CSV).

---

## 4. Restrições & Escopo de Dados (Menor Privilégio)
* ❌ **Sem acesso a edições financeiras diretas:** Não pode criar, alterar ou reconciliar pagamentos nem alterar tabelas contabilísticas.
* ❌ **Sem acesso a parâmetros globais do sistema:** Não altera parametrizações gerais do sistema nem administra contas de utilizadores.
* ❌ **Sem controlo industrial em tempo real:** Não realiza operações físicas de telemetria em milissegundos nem manobras diretas em inversores (fora do escopo do GridOps).
* **Escopo Geográfico:** Toda a carteira de mini-redes operadas pela LECASU.

---

## 5. Matriz CRUD por Entidade do Sistema
| Entidade | Create | Read | Update | Delete / Inativação |
| :--- | :---: | :---: | :---: | :---: |
| **Mini-Redes (`mini_grids`)** | ✅ Sim | ✅ Sim | ✅ Sim | ❌ Bloqueado |
| **Activos Técnicos (`assets`)** | ✅ Sim | ✅ Sim | ✅ Sim | ❌ Bloqueado |
| **Ordens de Trabalho (`work_orders`)** | ✅ Sim | ✅ Sim | ✅ Sim (Atribuição/Fecho) | ❌ Bloqueado |
| **Clientes (`clients`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Não |
| **Contratos (`contracts`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Não |
| **Contadores (`meters`)** | ✅ Sim | ✅ Sim | ✅ Sim (Alocação Técnica) | ❌ Não |
| **Leituras (`readings`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Não |
| **Pagamentos (`payments`)** | ❌ Não | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |
| **Utilizadores (`users`)** | ❌ Não | ✅ Sim (Ver Técnicos) | ❌ Não | ❌ Não |
| **Auditoria (`audit_logs`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Não |

---

## 6. Endpoints Autorizados da API
* `@Roles(['OPERATIONS_MANAGER', 'gestor_operacoes', 'ADMIN'])`
  * `GET /api/mini-grids` | `POST /api/mini-grids` | `PUT /api/mini-grids/:id`
  * `GET /api/assets` | `POST /api/assets` | `PUT /api/assets/:id`
  * `GET /api/work-orders` | `POST /api/work-orders` | `PATCH /api/work-orders/:id/assign` | `PATCH /api/work-orders/:id/close`
  * `GET /api/reports/dashboard` | `GET /api/reports/executive`

