# LECASU GridOps — Especificação Técnica e Arquitetura de Software

**Documento:** Especificação Técnica de Engenharia (SRS & Architecture Document)  
**Versão:** 1.0.0-MVP  
**Data:** Outubro de 2026  
**Cliente:** LECASU, Lda.  
**Stack Definida:** Frontend Vanilla (HTML5, Vanilla JavaScript, CSS3), Backend Node.js nativo (JavaScript puro), PostgreSQL (com PostGIS), Autenticação JWT e Arquitetura CRUD RESTful.

---

## 1. Visão Geral e Objetivos do Sistema

### 1.1 Objetivo Geral
Construir uma plataforma digital centralizada para gestão técnica, operacional, comercial e comunitária de mini-redes de eletrificação rural, com suporte nativo a geolocalização (GIS), operação offline em campo com sincronização posterior, e rastreabilidade total (logs de auditoria).

### 1.2 Objetivos Específicos do MVP
1. **Cadastro Unificado:** Mini-redes, clientes, contratos, contadores e ativos com suporte a coordenadas geográficas (lat/long).
2. **Ciclo Comercial:** Registro manual e via importação em lote (CSV/JSON) de leituras e pagamentos com cálculo automático de saldos e dívidas.
3. **Gestão de O&M:** Emissão, atribuição, registo fotográfico e encerramento de Ordens de Trabalho (OT).
4. **Operação Offline-First no Terreno:** PWA (Progressive Web App) nativo sem frameworks para permitir recolha de dados e preenchimento de formulários em zonas sem conectividade GSM.
5. **Segurança e Auditoria:** Autenticação stateless via JWT, controlo de acesso baseado em papéis (RBAC) e tabela imutável de histórico de auditoria.

### 1.3 Fora de Escopo do MVP
* Controlo em tempo real de inversores ou despacho de baterias (SCADA/EMS).
* Integração direta por API de telecomunicações (M-Pesa, e-Mola) — implementada como carga de transações ou importação no MVP.
* Algoritmos de Machine Learning e previsão preditiva.

---

## 2. Perfis de Utilizador e Matriz de Permissões (RBAC)

O acesso é controlado por papéis atribuídos no token JWT (`role`) e validados na camada de middleware do banco de dados e da API.

| Perfil (`role`) | Descrição e Escopo | Permissões Principais (CRUD) |
| :--- | :--- | :--- |
| `admin` | Administrador de TI / Direção | Acesso total a todas as rotas e tabelas, gestão de utilizadores e auditoria. |
| `gestor_operacoes` | Gestor de Engenharia / Operações | Read/Write em mini-redes, ativos, ocorrências e OTs. Acesso a relatórios técnicos. |
| `gestor_comercial` | Gestor de Vendas e Faturação | Read/Write em clientes, contratos, tarifas, contadores e conciliação de pagamentos. |
| `tecnico_campo` | Eletricista e Inspetor de Terreno | Read nas OTs atribuídas; Create/Update em leituras, inspeções e fecho de OTs (incluindo upload de evidências). |
| `agente_comunitario`| Agente de proximidade local | Create/Update de cadastro de clientes, registo de leituras de campo e suporte local. |
| `financeiro` | Auditor e Contabilista | Read em pagamentos, faturas, dívidas e exportação de relatórios financeiros. |

---

## 3. Arquitetura de Software e Padrões de Projeto

### 3.1 Padrão Arquitetural
* **Frontend:** Single-Page Application (SPA) / Progressive Web App (PWA) construída com **Vanilla JavaScript (ES6+)**, HTML semântico e CSS nativo modularizado (CSS Custom Properties para temas e Flexbox/Grid para layouts responsivos).
* **Armazenamento Local:** `IndexedDB` nativo do navegador para cache de formulários e armazenamento de ordens de trabalho pendentes quando offline, sincronizadas via `Service Worker` e `Fetch API` assíncrona.
* **Backend:** Servidor HTTP construído em **Node.js puro** (sem dependência de Express ou Nest se for objetivo manter código nativo limpo, ou utilizando apenas `node:http` nativo com roteador modular leve).
* **Base de Dados:** **PostgreSQL 15+** com extensão **PostGIS** ativada para cálculo de distâncias, raios de cobertura e representação cartográfica (GeoJSON).
* **Autenticação:** Tokens JWT (JSON Web Tokens) assinados com algoritmo HMAC SHA-256 (`HS256`) com expiração curta (ex: 2h) e refresh tokens rotativos guardados em cookies `HttpOnly; SameSite=Strict`.

```
           +-----------------------------------------------------------+
           |                   CLIENTE (Navegador/PWA)                 |
           |  [Vanilla JS] <---> [IndexedDB Cache] <---> [ServiceWorker]|
           +-----------------------------+-----------------------------+
                                         | HTTPS / REST (JSON)
                                         | Bearer JWT
           +-----------------------------v-----------------------------+
           |                    API SERVER (Node.js)                   |
           |  [Router / HTTP Dispatcher]                               |
           |  [Auth Middleware (JWT Verify & RBAC)]                    |
           |  [Business Controllers (Mini-redes, Clientes, O&M)]       |
           |  [Audit Logger]                                           |
           +-----------------------------+-----------------------------+
                                         | TCP Pool (node-postgres / pg)
           +-----------------------------v-----------------------------+
           |                   POSTGRESQL + PostGIS                    |
           |  [Tabelas Relacionais | Triggers de Auditoria | Índices]  |
           +-----------------------------------------------------------+
```

---

## 4. Requisitos de Sistema

### 4.1 Requisitos Funcionais (RF)
* **RF01 - Gestão de Mini-Redes:** Cadastrar mini-redes com código padronizado (ex: `MR-MPT-001`), capacidade (kWp PV, kWh Baterias), coordenadas geográficas (POINT) e estado operacional.
* **RF02 - Cadastro de Clientes e Ligações:** Registar clientes com geolocalização, categoria (residencial, comercial, uso produtivo), mini-rede associada e fase elétrica conectada.
* **RF03 - Gestão de Contratos e Tarifas:** Associar contratos a clientes, definindo tipo de tarifa (kWh, taxa fixa, subsídio) e tipo de contador.
* **RF04 - Leituras e Consumos:** Permitir inserção de leituras periódicas de contadores, detetando consumos anormais e inconsistências de data.
* **RF05 - Faturação e Pagamentos:** Registar cobranças e pagamentos com referências exclusivas, suportando reconciliação manual e saldo pré-pago/pós-pago.
* **RF06 - Gestão de Ativos:** Cadastrar centrais, inversores, controladores e transformadores com números de série, marcas e prazos de garantia.
* **RF07 - Operações e Manutenção (O&M):** Registar avarias, despachar ordens de trabalho para técnicos, registar fotografias de antes/depois e registar assinatura de validação em base64/blob.
* **RF08 - Relatórios e Exportação:** Gerar dados agregados de energia, faturação, indisponibilidade e impacto social (ex: mulheres chefiando agregados com energia, negócios PUE ativos), exportáveis para CSV e JSON.

### 4.2 Requisitos Não Funcionais (RNF)
* **RNF01 - Modo Offline:** A aplicação móvel deve permitir o cadastro de clientes e registo de OTs sem acesso à internet, armazenando os dados localmente no `IndexedDB` e enviando-os quando a rede for restabelecida.
* **RNF02 - Desempenho e Leveza:** Tempo de carregamento inicial inferior a 2 segundos em conexões 3G instáveis. Bundle frontend sem bibliotecas pesadas de terceiros.
* **RNF03 - Rastreabilidade (Audit Trail):** Nenhuma exclusão física (`DELETE`) em registos centrais. Uso de exclusão lógica (`deleted_at IS NOT NULL`) e tabela de log com registo de `user_id`, `action`, `payload_before`, `payload_after`, `timestamp`.
* **RNF04 - Segurança:** Todas as rotas (exceto `/api/v1/auth/login`) requerem autenticação JWT. Senhas cifradas no banco via `bcrypt` (custo mínimo 12).

---

## 5. Modelo da Base de Dados (PostgreSQL DDL)

```sql
-- Habilitação da extensão de geolocalização
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Tabela de Utilizadores
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('admin', 'gestor_operacoes', 'gestor_comercial', 'tecnico_campo', 'agente_comunitario', 'financeiro')),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Mini-Redes
CREATE TABLE mini_grids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL, -- Ex: MR-MPT-001
    name VARCHAR(100) NOT NULL,
    province VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    locality VARCHAR(50) NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    pv_capacity_kw NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    battery_capacity_kwh NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL CHECK (status IN ('planeada', 'instalacao', 'ativa', 'manutencao', 'suspensa')),
    commissioning_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Clientes
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mini_grid_id UUID NOT NULL REFERENCES mini_grids(id),
    code VARCHAR(30) UNIQUE NOT NULL, -- Ex: MR001-RES-0001
    full_name VARCHAR(150) NOT NULL,
    identity_document VARCHAR(50),
    phone VARCHAR(20),
    customer_type VARCHAR(20) NOT NULL CHECK (customer_type IN ('residencial', 'comercial', 'pue', 'institucional', 'servico_publico')),
    location GEOMETRY(Point, 4326) NOT NULL,
    is_female_headed BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Contadores (Meters)
CREATE TABLE meters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    meter_model VARCHAR(50) NOT NULL,
    meter_type VARCHAR(20) NOT NULL CHECK (meter_type IN ('pre_pago_sts', 'pos_pago_manual', 'smart_meter')),
    status VARCHAR(20) NOT NULL DEFAULT 'em_stock' CHECK (status IN ('em_stock', 'instalado', 'avariado', 'retirado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Contratos e Ligações
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_number VARCHAR(40) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    meter_id UUID UNIQUE REFERENCES meters(id),
    tariff_category VARCHAR(30) NOT NULL,
    contracted_power_w NUMERIC(8, 2) NOT NULL,
    connection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'cancelado')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Leituras de Consumo
CREATE TABLE meter_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meter_id UUID NOT NULL REFERENCES meters(id),
    reading_value_kwh NUMERIC(12, 2) NOT NULL,
    reading_date TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(20) NOT NULL CHECK (source IN ('manual_campo', 'importacao_csv', 'api_smart')),
    read_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Faturação e Pagamentos
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    reference_code VARCHAR(50) UNIQUE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_channel VARCHAR(30) NOT NULL CHECK (payment_channel IN ('dinheiro', 'mpesa', 'emola', 'mkesh', 'banco')),
    status VARCHAR(20) NOT NULL DEFAULT 'concluido' CHECK (status IN ('pendente', 'concluido', 'revertido')),
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reconciled_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Ativos da Mini-Rede
CREATE TABLE assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mini_grid_id UUID NOT NULL REFERENCES mini_grids(id),
    asset_code VARCHAR(50) UNIQUE NOT NULL, -- Ex: AST-MR001-INV-02
    category VARCHAR(30) NOT NULL CHECK (category IN ('modulo_pv', 'inversor', 'bateria', 'quadro', 'transformador', 'gerador_apoio')),
    brand_model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100),
    installation_date DATE,
    warranty_expiry DATE,
    operational_status VARCHAR(20) NOT NULL DEFAULT 'operacional' CHECK (operational_status IN ('operacional', 'manutencao', 'degradado', 'inativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Ocorrências e Ordens de Trabalho (O&M)
CREATE TABLE work_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL, -- Ex: OT-2026-000145
    mini_grid_id UUID NOT NULL REFERENCES mini_grids(id),
    asset_id UUID REFERENCES assets(id),
    customer_id UUID REFERENCES customers(id),
    assigned_technician_id UUID REFERENCES users(id),
    priority VARCHAR(15) NOT NULL CHECK (priority IN ('baixa', 'media', 'alta', 'critica')),
    status VARCHAR(20) NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'em_progresso', 'aguardando_peca', 'concluida', 'cancelada')),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    solution_summary TEXT,
    photo_before_url TEXT,
    photo_after_url TEXT,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de Auditoria Imutável (Audit Trail)
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    action_type VARCHAR(10) NOT NULL CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices de Desempenho e GIS
CREATE INDEX idx_mini_grids_location ON mini_grids USING GIST (location);
CREATE INDEX idx_customers_location ON customers USING GIST (location);
CREATE INDEX idx_customers_mini_grid ON customers (mini_grid_id);
CREATE INDEX idx_work_orders_technician ON work_orders (assigned_technician_id);
CREATE INDEX idx_work_orders_status ON work_orders (status);
```

---

## 6. Sugestões de Melhorias Técnicas para o Projeto

1. **Uso de Leaflet.js Nativo para GIS no Frontend:**  
   Como a restrição é Vanilla JS sem frameworks pesados, utilize a biblioteca leve **Leaflet.js** (cerca de 40KB) injetada via script tag para desenhar o mapa de mini-redes, ramais e clientes consumindo endpoints GeoJSON do PostgreSQL com `ST_AsGeoJSON(location)`.
2. **Suporte a PWA com Service Worker Nativo:**  
   Implemente um `sw.js` com estratégia *Network First with Fallback to Cache* para as telas, e *Cache-First* para imagens e estilos. Para requisições POST offline (como novos cadastros de clientes ou fecho de OTs), o Service Worker salva no `IndexedDB` e emite evento `SyncEvent` (`Background Sync`) para enviar ao servidor assim que voltar a ligação.
3. **Mecanismo de Importação em Lote via Stream nativa:**  
   Como os contadores podem não ter API na fase inicial, construa um leitor de CSV/Excel nativo no servidor com Node.js Streams (`readline`) para carregar milhares de leituras sem sobrecarregar a memória do servidor.
4. **Exportações com HTML nativo para PDF/Excel:**  
   Para gerar relatórios sem dependências pesadas, crie views CSS com `@media print` no próprio navegador (usando `window.print()`) e exportação para CSV formatado em UTF-8 com BOM para abrir perfeitamente no Excel.