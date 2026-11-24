-- ==============================================================================
-- LECASU GridOps - Migração 001: Esquema Relacional Completo
-- Plataforma de Gestão de Mini-Redes de Eletrificação Rural em Moçambique
-- ==============================================================================

-- 1. Extensões do PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabela de controlo de migrações
CREATE TABLE IF NOT EXISTS _migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Função para atualização automática da coluna atualizado_em
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 4. Tabela: users (Utilizadores e Perfis de Acesso - RBAC)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (
        role IN (
            'administrador',
            'gestor_operacoes',
            'gestor_comercial',
            'tecnico_campo',
            'agente_comunitario',
            'financeiro',
            'parceiro_auditor'
        )
    ),
    status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    telefone VARCHAR(50),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS set_timestamp_users ON users;
CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 5. Tabela: mini_grids (Mini-Redes e Centrais de Geração)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mini_grids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) NOT NULL UNIQUE, -- Ex: MR-MPT-001
    nome VARCHAR(255) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    distrito VARCHAR(100) NOT NULL,
    localidade VARCHAR(100),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    capacidade_kwp NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    capacidade_bateria_kwh NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    estado_operacional VARCHAR(30) NOT NULL DEFAULT 'planeada' CHECK (
        estado_operacional IN ('planeada', 'instalacao', 'activa', 'indisponivel', 'suspensa')
    ),
    data_comissionamento DATE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS set_timestamp_mini_grids ON mini_grids;
CREATE TRIGGER set_timestamp_mini_grids
BEFORE UPDATE ON mini_grids
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 6. Tabela: tariffs (Planos e Categorias Tarifárias)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tariffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) NOT NULL UNIQUE, -- Ex: TAR-RES-01
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    preco_kwh NUMERIC(10, 2) NOT NULL CHECK (preco_kwh >= 0),
    taxa_disponibilidade NUMERIC(10, 2) DEFAULT 0.00 CHECK (taxa_disponibilidade >= 0),
    moeda VARCHAR(10) DEFAULT 'MZN',
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. Tabela: clients (Beneficiários e Consumidores de Energia)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) NOT NULL UNIQUE, -- Ex: MR001-RES-0001
    mini_grid_id UUID NOT NULL REFERENCES mini_grids(id) ON DELETE RESTRICT,
    nome_completo VARCHAR(255) NOT NULL,
    documento_identificacao VARCHAR(100), -- BI, NIF, Passaporte, DIRE
    contacto_principal VARCHAR(50) NOT NULL,
    contacto_secundario VARCHAR(50),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    categoria VARCHAR(50) NOT NULL CHECK (
        categoria IN (
            'residencial',
            'comercial',
            'institucional',
            'telecomunicacoes',
            'servico_publico',
            'uso_produtivo'
        )
    ),
    foto_url TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'suspenso', 'desligado')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

DROP TRIGGER IF EXISTS set_timestamp_clients ON clients;
CREATE TRIGGER set_timestamp_clients
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- ------------------------------------------------------------------------------
-- 8. Tabela: contracts (Contratos de Fornecimento de Energia)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_contrato VARCHAR(50) NOT NULL UNIQUE, -- Ex: CTR-2026-0001
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    tipo_tarifa VARCHAR(30) NOT NULL DEFAULT 'pre_pago' CHECK (
        tipo_tarifa IN ('pre_pago', 'pos_pago', 'hibrido')
    ),
    potencia_contratada_kva NUMERIC(6, 2) DEFAULT 1.00,
    valor_caucao NUMERIC(12, 2) DEFAULT 0.00 CHECK (valor_caucao >= 0),
    data_ativacao DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'suspenso', 'cancelado')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 9. Tabela: meters (Contadores de Energia STS / IoT Inteligentes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS meters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_serie VARCHAR(100) NOT NULL UNIQUE, -- Ex: MTR-MR001-0048
    mini_grid_id UUID NOT NULL REFERENCES mini_grids(id) ON DELETE RESTRICT,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    tecnologia VARCHAR(50) NOT NULL DEFAULT 'inteligente_prepago',
    estado VARCHAR(30) NOT NULL DEFAULT 'em_estoque' CHECK (
        estado IN ('em_estoque', 'instalado', 'defeituoso', 'desativado')
    ),
    data_instalacao TIMESTAMP WITH TIME ZONE,
    ultima_comunicacao TIMESTAMP WITH TIME ZONE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 10. Tabela: readings (Leituras e Consumos de Energia em kWh)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meter_id UUID NOT NULL REFERENCES meters(id) ON DELETE CASCADE,
    valor_kwh NUMERIC(12, 4) NOT NULL CHECK (valor_kwh >= 0),
    data_leitura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo_origem VARCHAR(30) NOT NULL DEFAULT 'manual' CHECK (
        tipo_origem IN ('manual', 'ficheiro', 'api')
    ),
    utilizador_id UUID REFERENCES users(id) ON DELETE SET NULL,
    observacoes TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 11. Tabela: payments (Pagamentos, Vendas de Energia e Tokens)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referencia_transacao VARCHAR(100) NOT NULL UNIQUE, -- Ex: MPESA-2026-X88921
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    valor NUMERIC(12, 2) NOT NULL CHECK (valor > 0),
    canal VARCHAR(30) NOT NULL CHECK (
        canal IN ('numerario', 'mpesa', 'emola', 'mkesh', 'transferencia')
    ),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (
        estado IN ('pendente', 'confirmado', 'revertido')
    ),
    reconciliado BOOLEAN NOT NULL DEFAULT FALSE,
    data_pagamento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    comprovativo_url TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 12. Tabela: assets (Ativos Físicos e Infraestrutura Técnica)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) NOT NULL UNIQUE, -- Ex: AST-MR001-INV-02
    mini_grid_id UUID NOT NULL REFERENCES mini_grids(id) ON DELETE RESTRICT,
    classe VARCHAR(50) NOT NULL CHECK (
        classe IN ('central', 'inversor', 'bateria', 'quadro', 'transformador', 'cabo', 'poste', 'proteccao')
    ),
    modelo VARCHAR(150),
    fabricante VARCHAR(150),
    numero_serie VARCHAR(150),
    data_instalacao DATE,
    garantia_ate DATE,
    estado VARCHAR(30) NOT NULL DEFAULT 'operacional' CHECK (
        estado IN ('operacional', 'degradado', 'inoperante')
    ),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 13. Tabela: work_orders (Ordens de Trabalho e Manutenção Técnica)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_ordem VARCHAR(50) NOT NULL UNIQUE, -- Ex: OT-2026-000145
    mini_grid_id UUID NOT NULL REFERENCES mini_grids(id) ON DELETE RESTRICT,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    tipo VARCHAR(30) NOT NULL CHECK (
        tipo IN ('avaria', 'preventiva', 'nova_ligacao', 'desinstalacao')
    ),
    prioridade VARCHAR(20) NOT NULL DEFAULT 'media' CHECK (
        prioridade IN ('baixa', 'media', 'alta', 'urgente')
    ),
    descricao TEXT NOT NULL,
    tecnico_id UUID REFERENCES users(id) ON DELETE SET NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'aberta' CHECK (
        estado IN ('aberta', 'atribuida', 'em_execucao', 'resolvida', 'cancelada')
    ),
    solucao TEXT,
    fotos_evidencia JSONB DEFAULT '[]'::jsonb,
    assinatura_tecnico TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    encerrado_em TIMESTAMP WITH TIME ZONE
);

-- ------------------------------------------------------------------------------
-- 14. Tabela: audit_logs (Trilha de Auditoria Append-Only e Governança)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tabela_afetada VARCHAR(100) NOT NULL,
    accao VARCHAR(20) NOT NULL CHECK (accao IN ('INSERT', 'UPDATE', 'DELETE')),
    registo_id VARCHAR(100) NOT NULL,
    dados_antigos JSONB,
    dados_novos JSONB,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 15. Tabela: system_settings (Parâmetros e Configurações Globais)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_settings (
    chave VARCHAR(100) PRIMARY KEY,
    valor JSONB NOT NULL,
    descricao TEXT,
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 16. Índices de Desempenho e Otimização de Consultas
-- ==============================================================================

-- Utilizadores
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Mini-Redes
CREATE INDEX IF NOT EXISTS idx_mini_grids_codigo ON mini_grids(codigo);
CREATE INDEX IF NOT EXISTS idx_mini_grids_provincia_distrito ON mini_grids(provincia, distrito);
CREATE INDEX IF NOT EXISTS idx_mini_grids_estado ON mini_grids(estado_operacional);

-- Tarifas
CREATE INDEX IF NOT EXISTS idx_tariffs_codigo ON tariffs(codigo);
CREATE INDEX IF NOT EXISTS idx_tariffs_categoria ON tariffs(categoria);

-- Clientes
CREATE INDEX IF NOT EXISTS idx_clients_codigo ON clients(codigo);
CREATE INDEX IF NOT EXISTS idx_clients_mini_grid ON clients(mini_grid_id);
CREATE INDEX IF NOT EXISTS idx_clients_categoria ON clients(categoria);
CREATE INDEX IF NOT EXISTS idx_clients_estado ON clients(estado);
CREATE INDEX IF NOT EXISTS idx_clients_documento ON clients(documento_identificacao);

-- Contratos
CREATE INDEX IF NOT EXISTS idx_contracts_numero ON contracts(numero_contrato);
CREATE INDEX IF NOT EXISTS idx_contracts_client ON contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_contracts_estado ON contracts(estado);

-- Contadores
CREATE INDEX IF NOT EXISTS idx_meters_numero_serie ON meters(numero_serie);
CREATE INDEX IF NOT EXISTS idx_meters_mini_grid ON meters(mini_grid_id);
CREATE INDEX IF NOT EXISTS idx_meters_client ON meters(client_id);
CREATE INDEX IF NOT EXISTS idx_meters_estado ON meters(estado);

-- Leituras
CREATE INDEX IF NOT EXISTS idx_readings_meter ON readings(meter_id);
CREATE INDEX IF NOT EXISTS idx_readings_data ON readings(data_leitura DESC);
CREATE INDEX IF NOT EXISTS idx_readings_meter_data ON readings(meter_id, data_leitura DESC);

-- Pagamentos
CREATE INDEX IF NOT EXISTS idx_payments_referencia ON payments(referencia_transacao);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_canal ON payments(canal);
CREATE INDEX IF NOT EXISTS idx_payments_estado ON payments(estado);
CREATE INDEX IF NOT EXISTS idx_payments_data ON payments(data_pagamento DESC);

-- Ativos
CREATE INDEX IF NOT EXISTS idx_assets_codigo ON assets(codigo);
CREATE INDEX IF NOT EXISTS idx_assets_mini_grid ON assets(mini_grid_id);
CREATE INDEX IF NOT EXISTS idx_assets_classe ON assets(classe);
CREATE INDEX IF NOT EXISTS idx_assets_estado ON assets(estado);

-- Ordens de Trabalho
CREATE INDEX IF NOT EXISTS idx_work_orders_numero ON work_orders(numero_ordem);
CREATE INDEX IF NOT EXISTS idx_work_orders_mini_grid ON work_orders(mini_grid_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_asset ON work_orders(asset_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_client ON work_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_tecnico ON work_orders(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_estado ON work_orders(estado);
CREATE INDEX IF NOT EXISTS idx_work_orders_prioridade ON work_orders(prioridade);
CREATE INDEX IF NOT EXISTS idx_work_orders_criado_em ON work_orders(criado_em DESC);

-- Trilha de Auditoria
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabela_registo ON audit_logs(tabela_afetada, registo_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_criado_em ON audit_logs(criado_em DESC);
