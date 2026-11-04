# Guia de Implementação e Prompts Sequenciais — LECASU GridOps

Utilize este roteiro com prompts organizados para guiar o desenvolvimento do projeto passo a passo, respeitando a stack: **Vanilla JS, CSS nativo, Node.js nativo/pg, PostgreSQL e JWT**.

---

### Passo 1: Configuração do Banco de Dados e Migrações
* **Objetivo:** Inicializar o PostgreSQL, habilitar PostGIS e rodar o schema completo com índices.
* **Prompt para copiar e executar:**
> "Escreva um script Node.js nativo (usando o driver `pg`) para executar as migrações iniciais no PostgreSQL para o LECASU GridOps. O script deve conectar ao banco, verificar e habilitar a extensão PostGIS e `uuid-ossp`, criar as tabelas (`users`, `mini_grids`, `customers`, `meters`, `contracts`, `meter_readings`, `payments`, `assets`, `work_orders`, `audit_logs`) com suas restrições e índices geoespaciais, e criar um utilizador administrador inicial padrão com senha cifrada em bcrypt."

---

### Passo 2: Servidor Node.js Nativo e Sistema de Autenticação JWT
* **Objetivo:** Criar o servidor HTTP em JavaScript puro com roteamento REST, hash de senha e emissão de tokens JWT.
* **Prompt para copiar e executar:**
> "Crie um servidor HTTP em Node.js utilizando apenas módulos nativos (`node:http`, `node:crypto`) e o driver `pg` para conectar ao PostgreSQL. Implemente:
> 1. Um roteador HTTP simples que suporte métodos (GET, POST, PUT, DELETE) e rotas com parâmetros (ex: `/api/v1/customers/:id`).
> 2. Módulo de autenticação com login (`POST /api/v1/auth/login`), verificação de senha e geração manual de token JWT (sem bibliotecas externas pesadas, ou usando `jsonwebtoken` leve).
> 3. Middleware para proteger rotas validando o header `Authorization: Bearer <token>` e conferindo se a role do utilizador tem permissão para a rota."

---

### Passo 3: CRUDs RESTful das Entidades Principais
* **Objetivo:** Desenvolver os endpoints de mini-redes, clientes e ordens de trabalho com saída GeoJSON.
* **Prompt para copiar e executar:**
> "Implemente as funções controladoras em Node.js puro para as entidades do LECASU GridOps:
> 1. `mini_grids`: listar (com coordenadas formatadas em GeoJSON através do `ST_AsGeoJSON`), cadastrar e atualizar.
> 2. `customers`: cadastrar cliente com validação de código único, categoria e coordenadas GPS.
> 3. `work_orders`: criar ocorrência, atribuir a um técnico e endpoint de encerramento com registo do resumo da solução.
> Em cada mutação (INSERT/UPDATE/DELETE), crie automaticamente um registo correspondente na tabela `audit_logs`."

---

### Passo 4: Estrutura Frontend em Vanilla JS e CSS Nativo
* **Objetivo:** Criar a casca da SPA/PWA com layout moderno, barra lateral, autenticação e gestão de rotas sem frameworks.
* **Prompt para copiar e executar:**
> "Crie a estrutura básica de frontend SPA para o LECASU GridOps utilizando apenas HTML5, CSS3 nativo e Vanilla JavaScript (ES6 Modules):
> 1. Arquivo `index.html` limpo com container principal `#app`.
> 2. CSS modular com variáveis nativas (`:root`), tema escuro/claro com foco em usabilidade industrial, sidebar responsiva e cartões de estatísticas (Dashboard).
> 3. Um roteador client-side simples em Vanilla JS que interceta cliques e renderiza as visões: `/login`, `/dashboard`, `/mini-grids`, `/clientes` e `/ordens-trabalho` dinamicamente sem recarregar a página."

---

### Passo 5: Suporte a Offline e Sincronização de Campo com IndexedDB
* **Objetivo:** Permitir que o agente ou técnico de campo trabalhe sem sinal e sincronize posteriormente.
* **Prompt para copiar e executar:**
> "Escreva um módulo em Vanilla JavaScript (`offline-sync.js`) utilizando `IndexedDB` nativo do navegador para o LECASU GridOps:
> 1. Crie uma base de dados local chamada `GridOpsLocal` com stores `pending_customers` e `pending_orders`.
> 2. Implemente uma função `saveOfflineCustomer(customerData)` para salvar localmente se a requisição `fetch` falhar por falta de conexão (`navigator.onLine === false`).
> 3. Implemente a função `syncPendingData()` acionada pelo evento `window.addEventListener('online')` para enviar os registos guardados para a API e limpar a fila local após confirmação do servidor."

---

### Passo 6: Visualização Cartográfica com Leaflet.js
* **Objetivo:** Apresentar a carteira de mini-redes e clientes em um mapa interativo.
* **Prompt para copiar e executar:**
> "Crie um componente em Vanilla JavaScript para integrar o mapa Leaflet.js no painel do LECASU GridOps:
> 1. Consuma o endpoint `GET /api/v1/mini-grids` e renderize os marcadores com as centrais fotovoltaicas.
> 2. Adicione clusters de clientes e cores diferentes com base no tipo (`residencial`, `comercial`, `pue`).
> 3. Ao clicar num marcador, exiba um pop-up com nome, capacidade instalada, estado operacional e um botão para ver detalhes."