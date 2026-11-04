# Perfil de Acesso: COMMERCIAL_MANAGER (Gestor Comercial)

## 1. Identificação do Perfil
* **Código Canónico:** `COMMERCIAL_MANAGER`
* **Identificador na Base de Dados:** `gestor_comercial`
* **Nível Hierárquico:** Nível 2 (Gestão de Clientes, Contratos e Tarifas)
* **Utilizador Padrão no Sistema:**
  * **Nome:** Sofia Sitoe - Gestora Comercial
  * **Email:** `comercial@lecasu.co.mz`
  * **Senha Inicial de Teste:** `Admin@LECASU2026`

---

## 2. Responsabilidades Principais
* Gestão e expansão da carteira de clientes consumidores (residencial, comercial, PUE e serviços públicos).
* Emissão, renovação, suspensão e cancelamento de contratos de fornecimento de energia elétrica.
* Gestão de potências contratadas (kVA), pontos de ligação e amarração de contadores a clientes.
* Parametrização e manutenção da estrutura tarifária (escalões, tarifas pré-pagas, pós-pagas e sociais).
* Monitorização da receita faturada, histórico de vendas de energia e controlo de saldos devedores.

---

## 3. Nível de Acesso no Sistema
* **Módulos Autorizados:**
  * Cadastro de Clientes e Fichas Individuais.
  * Gestão Contratual e Controlo da Ligação Elétrica.
  * Inventário Comercial de Contadores (vinculação a clientes e emissão STS).
  * Faturação, Histórico de Vendas e Pagamentos de Energia.
  * Parametrização de Tarifas e Categorias de Consumo (PUE, Linha Social, etc.).
  * Relatórios Comerciais, Estatísticas de Vendas e Exportações CSV.

---

## 4. Restrições & Escopo de Dados (Menor Privilégio)
* ❌ **Não edita parâmetros técnicos de activos:** Não cria nem altera especificações de geradores, inversores ou transformadores de potência.
* ❌ **Não despacha equipas técnicas de campo:** Não cria nem aprova ordens de serviço técnico de O&M (da competência de Operações).
* ❌ **Não acede a logs de sistema ou utilizadores:** Não tem permissão para gerir credenciais nem auditar acessos administrativos.
* **Escopo Geográfico:** Todas as praças comerciais e clientes das mini-redes da LECASU.

---

## 5. Matriz CRUD por Entidade do Sistema
| Entidade | Create | Read | Update | Delete / Inativação |
| :--- | :---: | :---: | :---: | :---: |
| **Clientes (`clients`)** | ✅ Sim | ✅ Sim | ✅ Sim | ❌ Bloqueado |
| **Contratos (`contracts`)** | ✅ Sim | ✅ Sim | ✅ Sim (Alterar Estado) | ❌ Bloqueado |
| **Contadores (`meters`)** | ✅ Sim | ✅ Sim | ✅ Sim (Vincular/Desvincular) | ❌ Bloqueado |
| **Tarifas (`tariffs`)** | ✅ Sim | ✅ Sim | ✅ Sim | ❌ Bloqueado |
| **Pagamentos (`payments`)** | ✅ Sim | ✅ Sim | ❌ Apenas Financeiro | ❌ Bloqueado |
| **Leituras (`readings`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Não |
| **Activos Técnicos (`assets`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Não |
| **Ordens de Trabalho (`work_orders`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Não |
| **Utilizadores (`users`)** | ❌ Não | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |
| **Auditoria (`audit_logs`)** | ❌ Não | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |

---

## 6. Endpoints Autorizados da API
* `@Roles(['COMMERCIAL_MANAGER', 'gestor_comercial', 'ADMIN'])`
  * `GET /api/clients` | `POST /api/clients` | `PUT /api/clients/:id`
  * `GET /api/contracts` | `POST /api/contracts` | `PUT /api/contracts/:id`
  * `GET /api/meters` | `POST /api/meters` | `POST /api/meters/:id/install`
  * `GET /api/tariffs` | `POST /api/tariffs` | `PUT /api/tariffs/:id`
  * `GET /api/payments`
  * `GET /api/reports/dashboard` | `GET /api/reports/export/csv`

