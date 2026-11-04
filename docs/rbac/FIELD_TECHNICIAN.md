# Perfil de Acesso: FIELD_TECHNICIAN (Técnico de Campo)

## 1. Identificação do Perfil
* **Código Canónico:** `FIELD_TECHNICIAN`
* **Identificador na Base de Dados:** `tecnico_campo`
* **Nível Hierárquico:** Nível 3 (Execução Operacional de Campo e Terreno)
* **Utilizador Padrão no Sistema:**
  * **Nome:** Mateus Macuácua - Técnico de Campo
  * **Email:** `tecnico@lecasu.co.mz`
  * **Senha Inicial de Teste:** `Admin@LECASU2026`

---

## 2. Responsabilidades Principais
* Execução de inspeções técnicas periódicas e rondas de manutenção preventiva nas centrais solares e redes de distribuição.
* Diagnóstico de avarias no terreno, reparação de componentes e reporte de materiais utilizados.
* Execução física e registo de encerramento de Ordens de Trabalho (OTs) com registo de evidências fotográficas e descritivas.
* Registo de leituras manuais de contadores de energia em clientes sem telemetria.
* Instalação física, substituição e selagem de contadores STS/convencionais em novos clientes.

---

## 3. Nível de Acesso no Sistema (Móvel / Offline-First)
* **Módulos Autorizados:**
  * Vista de Ordens de Trabalho atribuídas ao próprio técnico ou à sua base operacional.
  * Registo e fecho de intervenções (solução aplicada, tempo decorrido, materiais aplicados).
  * Formulário de Registo de Leituras de Consumo (com validação anti-decrescimento).
  * Associação de contadores (`install`) aos novos pontos de ligação física.
  * Operação em modo **Offline-First**: persistência local em IndexedDB e sincronização automática por fila quando restabelecida a ligação de rede.

---

## 4. Restrições & Escopo de Dados (Menor Privilégio & Isolamento)
* ❌ **Isolamento de Ordens de Trabalho:** Vê **estritamente as OTs e activos atribuídos a si** ou à sua zona operacional (`tecnico_id` ou `mini_grid_id`). Não recebe listagens globais da carteira.
* ❌ **Sem acesso a dados comerciais consolidados:** Não tem acesso ao montante de receitas globais, faturação global, parâmetros de tarifas nem conciliação bancária.
* ❌ **Sem acesso a outros territórios:** Bloqueado de consultar ou intervir em mini-redes fora do seu raio geográfico de alocação.
* **Escopo Geográfico / Multilocação:** Restrito à mini-rede ou conjunto de centrais em que o técnico se encontra destacado.

---

## 5. Matriz CRUD por Entidade do Sistema
| Entidade | Create | Read | Update | Delete |
| :--- | :---: | :---: | :---: | :---: |
| **Ordens de Trabalho (`work_orders`)** | ❌ Não | ✅ Sim (Apenas as suas OTs) | ✅ Sim (Encerramento/Materiais) | ❌ Bloqueado |
| **Leituras de Consumo (`readings`)** | ✅ Sim | ✅ Sim (Local) | ❌ Não | ❌ Bloqueado |
| **Instalação Contadores (`meters`)** | ❌ Não | ✅ Sim (Apenas Leitura) | ✅ Sim (`install`) | ❌ Bloqueado |
| **Activos Técnicos (`assets`)** | ❌ Não | ✅ Sim (Activos da Central) | ❌ Não | ❌ Bloqueado |
| **Clientes (`clients`)** | ❌ Não | ✅ Sim (Apenas dados de ligação) | ❌ Não | ❌ Bloqueado |
| **Contratos (`contracts`)** | ❌ Não | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |
| **Pagamentos / Receitas (`payments`)** | ❌ Não | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |
| **Relatórios Executivos (`reports`)** | ❌ Não | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |
| **Utilizadores (`users`)** | ❌ Não | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |

---

## 6. Endpoints Autorizados da API
* `@Roles(['FIELD_TECHNICIAN', 'tecnico_campo', 'ADMIN'])`
  * `GET /api/work-orders` *(filtrado automaticamente por `tecnico_id` no backend)*
  * `PATCH /api/work-orders/:id/close` *(com registo de solução, materiais e evidências)*
  * `POST /api/readings` *(registo de leitura de energia em kWh)*
  * `POST /api/meters/:id/install` *(instalação física e amarração do contador)*
  * `GET /api/assets/by-minigrid/:id` *(consulta de ativos da sua mini-rede)*

