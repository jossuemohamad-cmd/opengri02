# Perfil de Acesso: COMMUNITY_AGENT (Agente Comunitário)

## 1. Identificação do Perfil
* **Código Canónico:** `COMMUNITY_AGENT`
* **Identificador na Base de Dados:** `agente_comunitario`
* **Nível Hierárquico:** Nível 3 (Apoio Comunitário Local e Proximidade)
* **Utilizador Padrão no Sistema:**
  * **Nome:** Carlos Nhantumbo - Agente Comunitário
  * **Email:** `agente@lecasu.co.mz`
  * **Senha Inicial de Teste:** `Admin@LECASU2026`

---

## 2. Responsabilidades Principais
* Ponto de contacto direto e atendimento diário aos consumidores na localidade rural.
* Realização do pré-cadastro comunitário de novos clientes no terreno (recolha de BI/NIF, contacto e coordenadas GPS).
* Registo inicial de solicitações comunitárias, dúvidas sobre faturas/créditos e reporte preliminar de queixas de avarias.
* Cobrança pontual de pagamentos de energia em numerário para emissão de recibo/recarga em zonas sem dinheiro móvel.

---

## 3. Nível de Acesso no Sistema (Apoio Local & Offline)
* **Módulos Autorizados:**
  * Formulário de Cadastro de Novos Clientes (com captura GPS e dados de identificação).
  * Lista local de clientes pertencentes à sua comunidade/povoado.
  * Registo inicial de Ocorrências / Tickets de atendimento com baixa complexidade.
  * Registo de recebimento de pagamentos em numerário.
  * Suporte a formulários em modo **offline** para recolha de dados em áreas sem cobertura de rede móvel.

---

## 4. Restrições & Escopo de Dados (Isolamento Geográfico Estrito)
* ❌ **Isolamento Geográfico Absoluto:** O agente comunitário tem **acesso exclusivo aos clientes e dados da sua própria mini-rede / localidade** (`mini_grid_id`). É estritamente impedido de ver clientes ou mini-redes de outras regiões.
* ❌ **Sem acesso a dados de Engenharia e O&M:** Não edita nem acede a especificações de inversores, configurações de baterias ou planos de manutenção preventiva.
* ❌ **Sem acesso a relatórios executivos:** Não acede ao módulo de auditoria, consolidados financeiros nem indicadores estratégicos da empresa.
* **Escopo Geográfico:** Estritamente circunscrito à sua localidade comunitária designada.

---

## 5. Matriz CRUD por Entidade do Sistema
| Entidade | Create | Read | Update | Delete |
| :--- | :---: | :---: | :---: | :---: |
| **Clientes (`clients`)** | ✅ Sim | ✅ Sim (Apenas da sua Localidade) | ✅ Sim (Atualizar Telefone) | ❌ Bloqueado |
| **Pagamentos (`payments`)** | ✅ Sim (Numerário) | ✅ Sim (Apenas os seus) | ❌ Não | ❌ Bloqueado |
| **Ocorrências (`work_orders`)** | ✅ Sim (Abertura Básica) | ✅ Sim (Apenas as que reportou) | ❌ Não pode fechar | ❌ Bloqueado |
| **Contratos (`contracts`)** | ❌ Não | ✅ Sim (Apenas Leitura Local) | ❌ Não | ❌ Bloqueado |
| **Contadores (`meters`)** | ❌ Não | ✅ Sim (Apenas Leitura Local) | ❌ Não | ❌ Bloqueado |
| **Activos Técnicos (`assets`)** | ❌ Não | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |
| **Tarifas (`tariffs`)** | ❌ Não | ✅ Sim (Apenas Consulta de Preço) | ❌ Não | ❌ Bloqueado |
| **Relatórios (`reports`)** | ❌ Não | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |
| **Utilizadores (`users`)** | ❌ Não | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |

---

## 6. Endpoints Autorizados da API
* `@Roles(['COMMUNITY_AGENT', 'agente_comunitario', 'ADMIN'])`
  * `POST /api/clients` *(criação de cliente com vínculo obrigatório à sua `mini_grid_id`)*
  * `GET /api/clients` *(filtrado estritamente por `mini_grid_id` do agente)*
  * `POST /api/payments` *(registo de pagamento local em numerário)*
  * `POST /api/work-orders` *(registo e reporte de avaria na sua localidade)*

