# Perfil de Acesso: AUDITOR_PARTNER (Parceiro / Auditor)

## 1. Identificação do Perfil
* **Código Canónico:** `AUDITOR_PARTNER`
* **Identificador na Base de Dados:** `parceiro_auditor`
* **Nível Hierárquico:** Nível 3 (Auditoria Externa, Financiadores e Regulação)
* **Utilizador Padrão no Sistema:**
  * **Nome:** Dr. Paulo Mondlane - Auditor / Parceiro
  * **Email:** `auditor@lecasu.co.mz`
  * **Senha Inicial de Teste:** `Admin@LECASU2026`

---

## 2. Responsabilidades Principais
* Verificação independente de métricas de impacto socioeconómico e progresso de eletrificação rural (ODS 7).
* Auditoria de consistência dos registos de geração solar, número de ligações ativas e volumes de energia consumida.
* Verificação de conformidade regulatória para apresentação de evidências a entidades públicas (ex: ARENE, FUNAE) e doadores/financiadores internacionais.
* Inspeção da rastreabilidade das operações através da consulta aos registos de auditoria (`audit_logs`).

---

## 3. Nível de Acesso no Sistema (Estritamente Somente Leitura)
* **Acesso Read-Only Totalmente Protegido:**
  * Visualização de dashboards executivos e mapas cartográficos de cobertura.
  * Consulta a relatórios consolidados de clientes, ligações de usos produtivos (PUE) e energia entregue.
  * Exportação de ficheiros oficiais em formato CSV e relatórios executivos em PDF.
  * Acesso de leitura à trilha cronológica de auditoria (`audit_logs`).

---

## 4. Restrições & Escopo de Dados (Menor Privilégio Absoluto)
* ❌ **Sem permissão de escrita em nenhum módulo:** O perfil é 100% de leitura. Qualquer tentativa de executar operações `POST`, `PUT`, `PATCH` ou `DELETE` no backend é bloqueada com código de erro `403 Forbidden`.
* ❌ **Sem acesso a senhas ou dados bancários sensíveis:** Vê apenas referências comerciais e totais reconciliados, sem exposição de credenciais ou dados pessoais protegidos.
* **Escopo Geográfico:** Leitura analítica em toda a carteira de mini-redes da LECASU.

---

## 5. Matriz CRUD por Entidade do Sistema
| Entidade | Create | Read | Update | Delete |
| :--- | :---: | :---: | :---: | :---: |
| **Painéis e Relatórios (`reports`)** | ❌ Não | ✅ Sim (Exportação Autorizada) | ❌ Não | ❌ Não |
| **Auditoria (`audit_logs`)** | ❌ Não | ✅ Sim (Consulta) | ❌ Imutável | ❌ Imutável |
| **Mini-Redes (`mini_grids`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Não |
| **Clientes (`clients`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Não |
| **Contratos (`contracts`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Não |
| **Activos Técnicos (`assets`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Não |
| **Ordens de Trabalho (`work_orders`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Não |
| **Pagamentos (`payments`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ❌ Não | ❌ Não |
| **Utilizadores (`users`)** | ❌ Não | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |

---

## 6. Endpoints Autorizados da API
* `@Roles(['AUDITOR_PARTNER', 'parceiro_auditor', 'ADMIN'])` *(apenas métodos HTTP GET)*
  * `GET /api/reports/dashboard`
  * `GET /api/reports/executive`
  * `GET /api/reports/export/csv`
  * `GET /api/mini-grids` | `GET /api/mini-grids/gis`
  * `GET /api/clients` | `GET /api/clients/gis`
  * `GET /api/assets`
  * `GET /api/audit-logs`

