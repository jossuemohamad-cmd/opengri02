# LECASU GRIDOPS — DOCUMENTAÇÃO TÉCNICA FINAL
**Documento:** 25 — Documentação Técnica Final  
**Versão:** 1.0.0 (Produção)  
**Proprietário:** LECASU, Lda.  
**Data:** 05 de Novembro de 2026  
**Classificação:** Confidencial / Técnico  

---

## 1. Arquitetura de Software e Topologia Geral

O **LECASU GridOps** foi projetado seguindo o padrão arquitetural em 3 camadas desacopladas, com foco em alta disponibilidade, latência ultrabaixa (< 50ms), suporte offline e facilidade de manutenção.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CAMADA DE APRESENTAÇÃO (FRONTEND)                    │
│   Vanilla JavaScript ES2022 (SPA) • Design System CSS3 Corporativo      │
│   Leaflet GIS Offline • Service Worker Cache • IndexedDB Local Storage │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTPS / JSON REST APIs (JWT)
┌────────────────────────────────────▼───────────────────────────────────┐
│                    CAMADA DE APLICAÇÃO (BACKEND)                       │
│   Node.js 20 LTS • Express Server Modular • Middlewares RBAC           │
│   CORS & Helmet Security • Sanitização de Entradas • Winston Logging   │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Pool Nativo pg (Conexões Seguras)
┌────────────────────────────────────▼───────────────────────────────────┐
│                      CAMADA DE DADOS (DATABASE)                        │
│   PostgreSQL 15+ Relacional • Transações Atómicas ACID                 │
│   Índices B-Tree • Restrições de Integridade • Trilha Audit Logs       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dicionário de Dados e Modelo Relacional

O banco de dados PostgreSQL `lecasu_gridops` é composto por 11 tabelas de negócio e 1 tabela de controlo de versões:

### 2.1 Tabela `users` (Controlo de Acesso e Utilizadores)
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(150) NOT NULL)
- `email` (VARCHAR(150) NOT NULL UNIQUE)
- `password_hash` (VARCHAR(255) NOT NULL - bcrypt)
- `role` (VARCHAR(50) NOT NULL - `administrador`, `gestor_operacoes`, `gestor_comercial`, `tecnico_campo`, `financeiro`, `parceiro_auditor`)
- `status` (VARCHAR(20) DEFAULT 'ativo' - `ativo`, `inativo`, `bloqueado`)
- `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)
- `last_login` (TIMESTAMP WITH TIME ZONE)

### 2.2 Tabela `mini_grids` (Centrais Fotovoltaicas e Redes Rurais)
- `id` (SERIAL PRIMARY KEY)
- `code` (VARCHAR(50) NOT NULL UNIQUE, ex.: `MG-CAB-01`)
- `name` (VARCHAR(150) NOT NULL)
- `provincia` (VARCHAR(50) NOT NULL)
- `distrito` (VARCHAR(100) NOT NULL)
- `posto_administrativo` (VARCHAR(100))
- `latitude` (NUMERIC(10, 7) NOT NULL)
- `longitude` (NUMERIC(10, 7) NOT NULL)
- `capacidade_kwp` (NUMERIC(10, 2) NOT NULL)
- `capacidade_bess_kwh` (NUMERIC(10, 2) NOT NULL)
- `tipo_geracao` (VARCHAR(50) DEFAULT 'solar_fotovoltaica')
- `estado_operacional` (VARCHAR(30) DEFAULT 'operacional')
- `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)

### 2.3 Tabela `clients` (Consumidores de Energia)
- `id` (SERIAL PRIMARY KEY)
- `code` (VARCHAR(50) NOT NULL UNIQUE, ex.: `CLI-CAB-0001`)
- `mini_grid_id` (INT REFERENCES mini_grids(id) ON DELETE RESTRICT)
- `nome` (VARCHAR(200) NOT NULL)
- `bi_documento` (VARCHAR(50))
- `nuit` (VARCHAR(30))
- `telefone` (VARCHAR(30))
- `categoria` (VARCHAR(50) NOT NULL - `domestico`, `comercial`, `uso_produtivo`, `institucional`)
- `latitude` (NUMERIC(10, 7))
- `longitude` (NUMERIC(10, 7))
- `saldo_atual` (NUMERIC(12, 2) DEFAULT 0.00)
- `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)

### 2.4 Tabela `tariffs` (Estrutura Tarifária Homologada)
- `id` (SERIAL PRIMARY KEY)
- `codigo` (VARCHAR(50) NOT NULL UNIQUE)
- `nome` (VARCHAR(100) NOT NULL)
- `categoria` (VARCHAR(50) NOT NULL)
- `tarifa_kwh` (NUMERIC(10, 4) NOT NULL - em Meticais MZN)
- `taxa_disponibilidade_mensal` (NUMERIC(10, 2) DEFAULT 0.00)
- `ativo` (BOOLEAN DEFAULT TRUE)

### 2.5 Tabela `contracts` (Relação Contratual e Fornecimento)
- `id` (SERIAL PRIMARY KEY)
- `numero_contrato` (VARCHAR(50) NOT NULL UNIQUE)
- `client_id` (INT REFERENCES clients(id) ON DELETE RESTRICT)
- `tariff_id` (INT REFERENCES tariffs(id) ON DELETE RESTRICT)
- `potencia_contratada_kva` (NUMERIC(8, 2) NOT NULL)
- `regime_faturacao` (VARCHAR(30) DEFAULT 'pre_pagamento')
- `caucao_mzn` (NUMERIC(12, 2) DEFAULT 0.00)
- `estado` (VARCHAR(30) DEFAULT 'vigente')
- `data_inicio` (DATE NOT NULL)
- `data_fim` (DATE)

### 2.6 Tabela `meters` (Parque de Contadores STS e Smart)
- `id` (SERIAL PRIMARY KEY)
- `numero_serie` (VARCHAR(50) NOT NULL UNIQUE)
- `mini_grid_id` (INT REFERENCES mini_grids(id) ON DELETE RESTRICT)
- `client_id` (INT REFERENCES clients(id) ON DELETE SET NULL)
- `contract_id` (INT REFERENCES contracts(id) ON DELETE SET NULL)
- `modelo` (VARCHAR(100))
- `fabricante` (VARCHAR(100))
- `tecnologia` (VARCHAR(50) DEFAULT 'sts_pre_pago')
- `estado` (VARCHAR(30) DEFAULT 'instalado')
- `data_instalacao` (TIMESTAMP WITH TIME ZONE)

### 2.7 Tabela `readings` (Histórico de Consumo e Leituras)
- `id` (SERIAL PRIMARY KEY)
- `meter_id` (INT REFERENCES meters(id) ON DELETE RESTRICT)
- `user_id` (INT REFERENCES users(id) ON DELETE SET NULL)
- `valor_kwh` (NUMERIC(12, 4) NOT NULL CHECK (valor_kwh >= 0))
- `consumo_calculado_kwh` (NUMERIC(12, 4) DEFAULT 0.00)
- `data_leitura` (TIMESTAMP WITH TIME ZONE NOT NULL)
- `metodo` (VARCHAR(30) DEFAULT 'manual')
- `foto_evidencia_url` (TEXT)
- `alerta_fraude` (BOOLEAN DEFAULT FALSE)

### 2.8 Tabela `payments` (Transações Financeiras em Meticais)
- `id` (SERIAL PRIMARY KEY)
- `codigo_transacao` (VARCHAR(100) NOT NULL UNIQUE)
- `client_id` (INT REFERENCES clients(id) ON DELETE RESTRICT)
- `contract_id` (INT REFERENCES contracts(id) ON DELETE RESTRICT)
- `montante_mzn` (NUMERIC(12, 2) NOT NULL CHECK (montante_mzn > 0))
- `energia_kwh_creditada` (NUMERIC(10, 2) NOT NULL)
- `token_sts` (VARCHAR(50))
- `canal_pagamento` (VARCHAR(50) NOT NULL - `mpesa`, `emola`, `mkesh`, `numerario`, `banco`)
- `referencia_externa` (VARCHAR(100))
- `estado` (VARCHAR(30) DEFAULT 'confirmado')
- `reconciliado_por` (INT REFERENCES users(id) ON DELETE SET NULL)
- `data_pagamento` (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)

### 2.9 Tabela `assets` (Equipamentos Técnicos e Ativos)
- `id` (SERIAL PRIMARY KEY)
- `codigo_patrimonial` (VARCHAR(50) NOT NULL UNIQUE)
- `mini_grid_id` (INT REFERENCES mini_grids(id) ON DELETE RESTRICT)
- `nome` (VARCHAR(150) NOT NULL)
- `tipo` (VARCHAR(50) NOT NULL - `modulo_solar`, `inversor`, `bateria_bess`, `transformador`, `gerador_diesel`)
- `fabricante` (VARCHAR(100))
- `modelo` (VARCHAR(100))
- `capacidade_nominal` (VARCHAR(50))
- `estado_conservacao` (VARCHAR(30) DEFAULT 'excelente')
- `data_instalacao` (DATE)
- `data_proxima_manutencao` (DATE)

### 2.10 Tabela `work_orders` (Ordens de Trabalho e Manutenção)
- `id` (SERIAL PRIMARY KEY)
- `numero_ordem` (VARCHAR(50) NOT NULL UNIQUE)
- `mini_grid_id` (INT REFERENCES mini_grids(id) ON DELETE RESTRICT)
- `asset_id` (INT REFERENCES assets(id) ON DELETE SET NULL)
- `tipo` (VARCHAR(50) NOT NULL - `corretiva`, `preventiva`, `ligacao_nova`, `inspecao_fraude`)
- `prioridade` (VARCHAR(20) DEFAULT 'media' - `baixa`, `media`, `alta`, `critica`)
- `estado` (VARCHAR(30) DEFAULT 'aberta' - `aberta`, `atribuida`, `em_resolucao`, `concluida`, `cancelada`)
- `tecnico_id` (INT REFERENCES users(id) ON DELETE SET NULL)
- `descricao_problema` (TEXT NOT NULL)
- `resolucao_tecnica` (TEXT)
- `data_abertura` (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)
- `data_conclusao` (TIMESTAMP WITH TIME ZONE)

### 2.11 Tabela `audit_logs` (Rastreabilidade e Trilha de Auditoria)
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INT REFERENCES users(id) ON DELETE SET NULL)
- `acao` (VARCHAR(100) NOT NULL)
- `entidade` (VARCHAR(50) NOT NULL)
- `entidade_id` (VARCHAR(50))
- `detalhes` (JSONB)
- `ip_address` (VARCHAR(50))
- `created_at` (TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)

---

## 3. Catálogo de APIs RESTful

Todas as rotas da API encontram-se sob o prefixo `/api` e respondem em formato JSON estruturado com chave `success: true|false`, `data` e `message`.

| Método | Endpoint | Perfil Autorizado (RBAC) | Descrição |
|---|---|---|---|
| **POST** | `/api/auth/login` | Público | Autenticação por credenciais com geração de token JWT. |
| **GET** | `/api/auth/me` | Autenticado | Retorna os dados do utilizador autenticado. |
| **GET** | `/api/health` | Público | Verificação da integridade do servidor e PostgreSQL. |
| **GET** | `/api/mini-grids` | Autenticado | Listagem e filtros de mini-redes solares. |
| **POST** | `/api/mini-grids` | `administrador`, `gestor_operacoes` | Criação de nova central fotovoltaica. |
| **GET** | `/api/mini-grids/gis` | Autenticado | Camada GeoJSON para visualização no mapa GIS. |
| **GET** | `/api/clients` | Autenticado | Listagem de clientes com busca e paginação. |
| **POST** | `/api/clients` | `administrador`, `gestor_comercial`, `tecnico_campo` | Cadastro de novo consumidor. |
| **GET** | `/api/contracts` | Autenticado | Consulta de contratos e tarifas vigentes. |
| **POST** | `/api/contracts` | `administrador`, `gestor_comercial` | Emissão de novo contrato de fornecimento. |
| **GET** | `/api/meters` | Autenticado | Inventário do parque de contadores. |
| **POST** | `/api/meters` | `administrador`, `gestor_operacoes` | Cadastro de contador em estoque. |
| **POST** | `/api/meters/:id/install` | `administrador`, `tecnico_campo` | Instalação e vinculação a cliente. |
| **GET** | `/api/readings` | Autenticado | Histórico de leituras de consumo. |
| **POST** | `/api/readings` | `administrador`, `tecnico_campo` | Registo de leitura no terreno com validação. |
| **GET** | `/api/payments` | Autenticado | Histórico financeiro e tokens STS. |
| **POST** | `/api/payments` | `administrador`, `financeiro`, `gestor_comercial` | Registo de pagamento e emissão de token. |
| **POST** | `/api/payments/:id/reconcile` | `administrador`, `financeiro` | Reconciliação com carteira móvel. |
| **GET** | `/api/assets` | Autenticado | Inventário de ativos e equipamentos. |
| **POST** | `/api/assets` | `administrador`, `gestor_operacoes` | Cadastro de equipamento técnico. |
| **GET** | `/api/work-orders` | Autenticado | Gestão de ordens de serviço. |
| **POST** | `/api/work-orders` | `administrador`, `gestor_operacoes`, `tecnico_campo` | Abertura de ordem de trabalho. |
| **PATCH**| `/api/work-orders/:id/assign` | `administrador`, `gestor_operacoes` | Atribuição de OS a técnico de campo. |
| **PATCH**| `/api/work-orders/:id/close` | `administrador`, `tecnico_campo` | Fecho e conclusão do serviço técnico. |
| **GET** | `/api/reports/dashboard` | Autenticado | Consolidação de métricas operacionais e financeiras. |
| **GET** | `/api/reports/export/csv` | `administrador`, `gestor_operacoes`, `financeiro` | Exportação de dados para folha de cálculo. |
| **POST** | `/api/system/reset-demo` | `administrador` | Restauro da base para dados de demonstração. |

---

## 4. Instruções de Instalação e Requisitos do Servidor

### 4.1 Requisitos Mínimos Recomendados
- **Sistema Operativo:** Ubuntu 22.04 LTS / Debian 12 ou Windows Server 2022.
- **Processador:** 2 vCPUs x86-64 (2.0 GHz ou superior).
- **Memória RAM:** 4 GB (mínimo de 2 GB livres para o PostgreSQL).
- **Armazenamento:** 40 GB SSD (espaço dedicado para base de dados e backups diários).
- **Ambiente de Execução:** Node.js v20 LTS e PostgreSQL v15+.

### 4.2 Passo a Passo de Instalação em Servidor Limpo (Linux)

1. **Atualizar o sistema operativo:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Instalar Node.js 20 LTS e PostgreSQL 15:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs postgresql postgresql-contrib git nginx
   ```

3. **Criar a Base de Dados e Utilizador PostgreSQL:**
   ```bash
   sudo -u postgres psql -c "CREATE USER lecasu_user WITH PASSWORD 'GerarSenhaSegura2026!';"
   sudo -u postgres psql -c "CREATE DATABASE lecasu_gridops OWNER lecasu_user;"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lecasu_gridops TO lecasu_user;"
   ```

4. **Clonar o Repositório do LECASU GridOps:**
   ```bash
   sudo mkdir -p /var/www/lecasu-gridops
   sudo chown -R $USER:$USER /var/www/lecasu-gridops
   git clone https://github.com/jossuemohamad-cmd/opengri02.git /var/www/lecasu-gridops
   cd /var/www/lecasu-gridops
   ```

5. **Instalar as Dependências:**
   ```bash
   npm ci --only=production
   ```

6. **Configurar as Variáveis de Ambiente:**
   ```bash
   cp .env.production.example .env
   nano .env
   ```
   *Preencher a senha do PostgreSQL e gerar uma chave JWT com:* `openssl rand -base64 48`.

7. **Executar as Migrações da Base de Dados:**
   ```bash
   node scripts/migrate.js
   ```

8. **Executar a Verificação Pré-Voo:**
   ```bash
   node scripts/verify_production.js
   ```

9. **Configurar o PM2 e Iniciar a Aplicação:**
   ```bash
   sudo npm install -g pm2
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

10. **Configurar o Proxy Reverso Nginx e Certificado SSL:**
    ```bash
    sudo cp nginx/lecasu-gridops.conf /etc/nginx/sites-available/
    sudo ln -s /etc/nginx/sites-available/lecasu-gridops.conf /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d gridops.lecasu.co.mz
    ```

---

## 5. Instruções de Atualização sem Downtime (Rollout)

Para aplicar novas versões do sistema em produção:

```bash
cd /var/www/lecasu-gridops
# 1. Puxar alterações do repositório
git pull origin main

# 2. Instalar eventuais novas dependências
npm ci --only=production

# 3. Aplicar migrações incrementais de base de dados
node scripts/migrate.js

# 4. Validar pré-voo
node scripts/verify_production.js

# 5. Recarregar o cluster PM2 sem perda de conexões
pm2 reload lecasu-gridops
```
