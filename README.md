# LECASU GridOps

> Plataforma de Gestão Técnica, Comercial e Operacional para Mini-Redes de Eletrificação Rural em Moçambique.  
> Desenvolvido para a **LECASU, Lda.**

---

## 🛠️ Stack Tecnológica

- **Backend:** Node.js (Vanilla JavaScript, CommonJS, Express minimalista)
- **Base de Dados:** PostgreSQL (suporte nativo a JSON e dados geoespaciais PostGIS)
- **Autenticação & Segurança:** JWT (`jsonwebtoken`) e hash de senhas (`bcryptjs`)
- **Frontend:** HTML5 Semântico, CSS3 Puro e Vanilla JS (SPA sem frameworks externas)
- **Arquitetura:** REST API modular, padrões CRUD claros e desacoplados

---

## 📁 Estrutura de Diretórios

```
Mini Rede/
├── .env.example                # Modelo de variáveis de ambiente
├── .env                        # Variáveis de ambiente locais (não versionado)
├── .gitignore                  # Ficheiros ignorados pelo Git
├── package.json                # Dependências e scripts de execução
├── README.md                   # Documentação do projeto
│
├── migrations/                 # Scripts SQL para inicialização e evolução da BD
│   ├── 001_initial_schema.sql  # Esquema relacional completo (10 tabelas essenciais + índices)
│   └── 002_seed_initial_data.sql # Carga inicial: Admin, Mini-Rede, Tarifas, Ativos, etc.
│
├── scripts/                    # Scripts utilitários em Vanilla JS
│   ├── migrate.js              # Executor transacional de migrações SQL
│   └── test_server.js          # Bateria de testes automatizados E2E
│
├── server/                     # Backend da aplicação
│   ├── config/
│   │   └── db.js               # Conexão PostgreSQL (pg.Pool com graceful shutdown)
│   ├── controllers/
│   │   └── healthController.js # Controlador de integridade do sistema
│   ├── middleware/
│   │   ├── auth.js             # Validação e autorização de tokens JWT (RBAC)
│   │   └── errorHandler.js     # Tratamento centralizado de erros e 404
│   ├── models/                 # Modelos de dados (preparado para passos futuros)
│   ├── routes/
│   │   └── api.js              # Router central da API (/api)
│   ├── utils/
│   │   └── response.js         # Padronização de respostas JSON
│   └── server.js               # Servidor principal HTTP Express
│
└── public/                     # Frontend estático (Vanilla JS SPA)
    ├── css/
    │   └── style.css           # Estilos CSS puros (minimalista, funcional)
    ├── js/
    │   └── app.js              # Lógica da aplicação frontend
    └── index.html              # Estrutura HTML5 semântica principal
```

---

## 🚀 Instalação e Execução

### 1. Pré-requisitos
- **Node.js** (v18 ou superior recomendado; testado em v24)
- **PostgreSQL** (v14 ou superior)

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Copie o ficheiro `.env.example` para `.env` e ajuste as credenciais da sua base de dados PostgreSQL:
```bash
cp .env.example .env
```

Configurações disponíveis:
```ini
PORT=3000
NODE_ENV=development

# Conexão PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/lecasu_gridops
PGHOST=localhost
PGPORT=5432
PGDATABASE=lecasu_gridops
PGUSER=postgres
PGPASSWORD=postgres
PGSSL=false

# Segurança JWT
JWT_SECRET=super_segredo_jwt_lecasu_gridops_alterar_em_producao_2026
JWT_EXPIRES_IN=24h
```

### 4. Executar Migrações da Base de Dados
Crie a base de dados no PostgreSQL (por exemplo `lecasu_gridops`) e execute as migrações:
```bash
npm run migrate
```

### 5. Iniciar o Servidor ou Executar Testes
- **Executar Testes Automatizados:**
  ```bash
  npm test
  ```
- **Modo Desenvolvimento (com auto-reload nativo):**
  ```bash
  npm run dev
  ```
- **Modo Produção:**
  ```bash
  npm start
  ```

---

## 🗄️ Modelo Relacional e Dados Iniciais (Passo 2)

### Tabelas Principais do Esquema (`001_initial_schema.sql`):
1. **`users`**: Utilizadores do sistema com controlo de acesso baseado em funções (RBAC).
2. **`mini_grids`**: Registo de centrais fotovoltaicas/híbridas e mini-redes rurais.
3. **`tariffs`**: Estrutura tarifária em Meticais (MZN) por categoria de consumo.
4. **`clients`**: Clientes/beneficiários com geolocalização e classificação de uso.
5. **`contracts`**: Contratos de serviço (pré-pago, pós-pago, híbrido) e potência alocada.
6. **`meters`**: Contadores inteligentes e STS vinculados a clientes e mini-redes.
7. **`readings`**: Leituras de consumo em kWh (manuais, ficheiro, telemetria/API).
8. **`payments`**: Transações e pagamentos (M-Pesa, e-Mola, mKesh, Numerário) e reconciliação.
9. **`assets`**: Ativos físicos da infraestrutura (painéis, inversores, baterias, transformadores).
10. **`work_orders`**: Ordens de serviço para intervenções técnicas e avarias no terreno.
11. **`audit_logs`**: Tabela estritamente append-only para auditoria e governação de dados.
12. **`system_settings`**: Parâmetros globais de negócio, segurança e faturação.

### Utilizadores Iniciais de Demonstração (`002_seed_initial_data.sql`):
- **Email:** `admin@lecasu.co.mz` | **Senha:** `Admin@LECASU2026` (Perfil: `administrador`)
- **Email:** `operacoes@lecasu.co.mz` | **Senha:** `Admin@LECASU2026` (Perfil: `gestor_operacoes`)
- **Email:** `tecnico@lecasu.co.mz` | **Senha:** `Admin@LECASU2026` (Perfil: `tecnico_campo`)

---

## 🔒 Autenticação e Controlo de Acesso (RBAC) - Passo 3

### Matriz de Perfis do Sistema:
1. **`administrador`**: Acesso total, gestão de utilizadores e parametrização do sistema.
2. **`gestor_operacoes`**: Gestão de mini-redes, ativos técnicos, ordens de trabalho e painéis operacionais.
3. **`gestor_comercial`**: Gestão de clientes, contratos, tarifas e cobrança de consumo.
4. **`tecnico_campo`**: Execução de ordens de serviço atribuídas, leituras de campo e inspeções.
5. **`agente_comunitario`**: Cadastro simplificado de beneficiários e receção de pedidos locais.
6. **`financeiro`**: Reconciliação de pagamentos móveis (M-Pesa/e-Mola/mKesh) e relatórios financeiros.
7. **`parceiro_auditor`**: Acesso somente-leitura a indicadores de impacto, sustentabilidade e evidências.

---

## 🩺 Endpoints da API REST

| Método | Endpoint | Proteção | Descrição |
|---|---|---|---|
| `GET` | `/` | Pública | Interface Frontend (Vanilla JS SPA) |
| `GET` | `/api` | Pública | Metadados e catálogo base de rotas da API |
| `GET` | `/api/health` | Pública | Diagnóstico de integridade do Node.js e ligação PostgreSQL |
| **`POST`** | `/api/auth/login` | Pública | Autenticação com email e senha, emissão de token JWT |
| **`GET`** | `/api/auth/me` | JWT | Retorna o perfil do utilizador autenticado |
| **`POST`** | `/api/auth/refresh` | JWT | Emite um novo token JWT renovado |
| **`GET`** | `/api/users` | JWT + Admin | Listagem paginada de utilizadores com filtros (`role`, `status`) |
| **`POST`** | `/api/users` | JWT + Admin | Criação de novo utilizador (validação, hash bcrypt 10 rounds e auditoria) |
| **`GET`** | `/api/users/:id` | JWT + Admin | Consulta detalhada de um utilizador específico |
| **`PUT`** | `/api/users/:id` | JWT + Admin | Atualização de dados cadastrais, perfil de acesso ou senha |
| **`PATCH`**| `/api/users/:id/status`| JWT + Admin | Ativação ou desativação de conta de utilizador (soft delete) |
| **`GET`** | `/api/mini-grids` | JWT + Leitura | Listagem com filtros por província, estado operacional e busca |
| **`GET`** | `/api/mini-grids/gis` | JWT + Leitura | Camada geoespacial GeoJSON FeatureCollection para mapas |
| **`GET`** | `/api/mini-grids/:id` | JWT + Leitura | Ficha completa da mini-rede, activos e estatísticas de clientes |
| **`GET`** | `/api/mini-grids/:miniGridId/assets` | JWT + Leitura | Inventário de activos pertencentes a uma mini-rede |
| **`POST`** | `/api/mini-grids` | JWT + Gestão | Registo de nova mini-rede (validação geoespacial de Moçambique e códigos) |
| **`PUT`** | `/api/mini-grids/:id` | JWT + Gestão | Atualização cadastral, potência instalada e estado com auditoria |
| **`GET`** | `/api/assets` | JWT + Leitura | Listagem de activos com filtros por classe, estado e mini-rede |
| **`GET`** | `/api/assets/:id` | JWT + Leitura | Ficha do activo técnico e histórico de ordens de trabalho |
| **`POST`** | `/api/assets` | JWT + Gestão | Registo de activo associado a mini-rede com código gerado |
| **`PUT`** | `/api/assets/:id` | JWT + Gestão | Atualização do estado do activo e garantia com auditoria |

*(Níveis de Acesso: **Leitura** = admin, gestor_operacoes, gestor_comercial, tecnico_campo, financeiro, parceiro_auditor \| **Gestão** = admin, gestor_operacoes).*

### Exemplo de Resposta do `GET /api/health`:
```json
{
  "service": "LECASU GridOps API",
  "status": "healthy",
  "uptime": "42s",
  "environment": "development",
  "serverTimestamp": "2026-10-30T09:30:00.000Z",
  "database": {
    "connected": true,
    "name": "lecasu_gridops",
    "dbTimestamp": "2026-10-30T09:30:00.000Z",
    "version": "PostgreSQL 16.2 on x86_64-pc-windows-msvc, 64-bit"
  }
}
```
*(Caso a base de dados não esteja acessível, o endpoint responde com status HTTP 503 e `status: "degraded"` com o motivo do erro sem quebrar o processo do servidor).*

