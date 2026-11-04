# Perfil de Acesso: ADMIN (Administrador de Sistemas)

## 1. Identificação do Perfil
* **Código Canónico:** `ADMIN`
* **Identificador na Base de Dados:** `administrador`
* **Nível Hierárquico:** Nível 1 (Super Administrador da Plataforma)
* **Utilizador Padrão no Sistema:**
  * **Nome:** Administrador de Sistemas LECASU
  * **Email:** `admin@lecasu.co.mz`
  * **Senha Inicial de Teste:** `Admin@LECASU2026`

---

## 2. Responsabilidades Principais
* Gestão geral da plataforma digital LECASU GridOps.
* Cadastro, configuração e gestão do ciclo de vida de utilizadores e atribuição de perfis RBAC.
* Supervisão da segurança da informação, integridade de dados e monitorização da **trilha de auditoria** (`audit_logs`).
* Definição e parametrização dos valores globais do sistema, variáveis operacionais e regras de governação.

---

## 3. Nível de Acesso no Sistema
* **Acesso Total e Irrestrito:** Permissão plena de leitura (`READ`), escrita (`CREATE`), atualização (`UPDATE`) e gestão sobre todas as tabelas e módulos.
* Gestão de contas de utilizadores (ativação, desativação, redefinição de senhas).
* Acesso exclusivo ao ecrã de **Trilha de Auditoria e Segurança**.

---

## 4. Restrições & Escopo de Dados
* **Restrições:** Nenhuma no âmbito da aplicação. Contudo, deve respeitar a política de **eliminação não-física** (soft-delete / arquivamento) de registos operacionais para salvaguarda de auditoria histórica.
* **Escopo Geográfico:** Global — Acesso irrestrito a todas as províncias, distritos, postos administrativos e mini-redes da carteira LECASU.

---

## 5. Matriz CRUD por Entidade do Sistema
| Entidade | Create | Read | Update | Delete / Soft-Delete |
| :--- | :---: | :---: | :---: | :---: |
| **Utilizadores (`users`)** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim (Inativação) |
| **Logs de Auditoria (`audit_logs`)** | ❌ Sistema | ✅ Sim | ❌ Imutável | ❌ Imutável |
| **Mini-Redes (`mini_grids`)** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Activos Técnicos (`assets`)** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Clientes (`clients`)** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Contratos (`contracts`)** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Contadores (`meters`)** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Leituras (`readings`)** | ✅ Sim | ✅ Sim | ✅ Sim | ❌ Auditado |
| **Pagamentos (`payments`)** | ✅ Sim | ✅ Sim | ✅ Sim | ❌ Auditado |
| **Ordens de Trabalho (`work_orders`)** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Estrutura Tarifária (`tariffs`)** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |
| **Parâmetros (`system_settings`)** | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Sim |

---

## 6. Endpoints Autorizados da API
* `@Roles(['ADMIN', 'administrador'])`
  * `GET /api/users` | `POST /api/users` | `PUT /api/users/:id` | `PATCH /api/users/:id/status`
  * `GET /api/audit-logs`
  * Todas as rotas operacionais, comerciais, técnicas e de relatórios do sistema.

