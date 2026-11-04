# Perfil de Acesso: FINANCE (Responsável Financeiro)

## 1. Identificação do Perfil
* **Código Canónico:** `FINANCE`
* **Identificador na Base de Dados:** `financeiro`
* **Nível Hierárquico:** Nível 2 (Gestão Financeira, Faturação e Tesouraria)
* **Utilizador Padrão no Sistema:**
  * **Nome:** Fátima Guambe - Responsável Financeira
  * **Email:** `financeiro@lecasu.co.mz`
  * **Senha Inicial de Teste:** `Admin@LECASU2026`

---

## 2. Responsabilidades Principais
* Supervisão de todas as entradas de receita e fluxos de pagamentos de energia na carteira da LECASU.
* Reconciliação contabilística e bancária entre canais de liquidação (M-Pesa, e-Mola, mKesh e numerário recolhido).
* Monitorização de saldos devedores, taxas de recuperação de receita e dívidas pendentes de clientes.
* Emissão de balancetes, extratos de faturação e relatórios de fluxo financeiro para a direção executiva.
* Análise dos custos financeiros associados às reparações e peças consumidas nas ordens de trabalho.

---

## 3. Nível de Acesso no Sistema
* **Módulos Autorizados:**
  * Módulo de Faturação e Cobrança de Energia.
  * Validação e **Reconciliação Contabilística** de Pagamentos.
  * Emissão e segunda via de recibos com código/token STS.
  * Módulo de Relatórios Financeiros Executivos e exportações consolidadas em CSV e PDF.
  * Consulta cadastral a clientes, contratos e tarifas vigentes.

---

## 4. Restrições & Escopo de Dados (Menor Privilégio)
* ❌ **Apenas Leitura em Clientes e Activos:** O perfil Financeiro consulta dados de clientes e instalações apenas para verificação de cobrança; não altera dados pessoais, coordenadas nem cadastros técnicos.
* ❌ **Sem poder de despacho técnico:** Não atribui nem fecha Ordens de Trabalho de manutenção.
* ❌ **Sem registo de leituras técnicas:** Não regista leituras de kWh em contadores (função exclusiva de técnicos de campo).
* **Escopo Geográfico:** Visão financeira global de todas as centrais solares e clientes da carteira.

---

## 5. Matriz CRUD por Entidade do Sistema
| Entidade | Create | Read | Update | Delete |
| :--- | :---: | :---: | :---: | :---: |
| **Pagamentos (`payments`)** | ✅ Sim | ✅ Sim | ✅ Sim (Reconciliação) | ❌ Bloqueado |
| **Relatórios Financeiros (`reports`)** | ✅ Sim (Exportação) | ✅ Sim | ❌ Não | ❌ Bloqueado |
| **Clientes (`clients`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Bloqueado |
| **Contratos (`contracts`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Bloqueado |
| **Tarifas (`tariffs`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Bloqueado |
| **Contadores (`meters`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Bloqueado |
| **Leituras (`readings`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Bloqueado |
| **Activos Técnicos (`assets`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Bloqueado |
| **Ordens de Trabalho (`work_orders`)** | ❌ Não | ✅ Sim (Custos de O&M) | ❌ Não | ❌ Bloqueado |
| **Utilizadores (`users`)** | ❌ Não | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |

---

## 6. Endpoints Autorizados da API
* `@Roles(['FINANCE', 'financeiro', 'ADMIN'])`
  * `GET /api/payments` | `POST /api/payments`
  * `POST /api/payments/:id/reconcile` *(ação exclusiva para validação contabilística)*
  * `GET /api/reports/dashboard` | `GET /api/reports/executive` | `GET /api/reports/export/csv`
  * `GET /api/clients` *(apenas consulta para confirmação de faturação)*
  * `GET /api/contracts` *(apenas consulta de cláusulas tarifárias e caução)*

