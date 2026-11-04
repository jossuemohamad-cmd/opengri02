-- ==============================================================================
-- LECASU GridOps - Migração 002: Carga Inicial de Dados (Seed Data)
-- Plataforma de Gestão de Mini-Redes de Eletrificação Rural em Moçambique
-- ==============================================================================

-- 1. Utilizadores do Sistema (RBAC)
-- Senha padrão para utilizadores iniciais: Admin@LECASU2026
-- Hash bcrypt (10 rounds): $2a$10$9dR354iwY7vcw89KhXU65OcQ5TbG4u4GCHR0tvalYE3odqKS25LmK
INSERT INTO users (id, nome, email, password_hash, role, status, telefone)
VALUES 
    (
        '00000000-0000-0000-0000-000000000001',
        'Administrador de Sistemas LECASU',
        'admin@lecasu.co.mz',
        '$2a$10$9dR354iwY7vcw89KhXU65OcQ5TbG4u4GCHR0tvalYE3odqKS25LmK',
        'administrador',
        'ativo',
        '+258 84 000 0001'
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'Délcio Cossa - Gestor de Operações',
        'operacoes@lecasu.co.mz',
        '$2a$10$9dR354iwY7vcw89KhXU65OcQ5TbG4u4GCHR0tvalYE3odqKS25LmK',
        'gestor_operacoes',
        'ativo',
        '+258 84 000 0002'
    ),
    (
        '00000000-0000-0000-0000-000000000003',
        'Mateus Macuácua - Técnico de Campo',
        'tecnico@lecasu.co.mz',
        '$2a$10$9dR354iwY7vcw89KhXU65OcQ5TbG4u4GCHR0tvalYE3odqKS25LmK',
        'tecnico_campo',
        'ativo',
        '+258 84 000 0003'
    )
ON CONFLICT (email) DO NOTHING;

-- 2. Mini-Rede Piloto de Eletrificação Rural
INSERT INTO mini_grids (
    id,
    codigo,
    nome,
    provincia,
    distrito,
    localidade,
    latitude,
    longitude,
    capacidade_kwp,
    capacidade_bateria_kwh,
    estado_operacional,
    data_comissionamento
) VALUES (
    '10000000-0000-0000-0000-000000000001',
    'MR-MPT-001',
    'Mini-Rede Solar Fotovoltaica de Calanga',
    'Maputo',
    'Manhiça',
    'Calanga',
    -25.43280000,
    32.98120000,
    50.00,
    120.00,
    'activa',
    '2025-06-15'
) ON CONFLICT (codigo) DO NOTHING;

-- 3. Planos e Categorias Tarifárias (Moçambique - Meticais / MZN)
INSERT INTO tariffs (codigo, nome, categoria, preco_kwh, taxa_disponibilidade, moeda, ativo)
VALUES 
    ('TAR-RES-01', 'Tarifa Residencial Social (Apoio Comunitário)', 'residencial', 12.50, 0.00, 'MZN', TRUE),
    ('TAR-RES-02', 'Tarifa Residencial Padrão', 'residencial', 16.00, 50.00, 'MZN', TRUE),
    ('TAR-COM-01', 'Tarifa Comercial e Pequenas Mercearias', 'comercial', 19.50, 100.00, 'MZN', TRUE),
    ('TAR-PROD-01', 'Tarifa Uso Produtivo (Irrigação / Moageiras)', 'uso_produtivo', 14.00, 150.00, 'MZN', TRUE),
    ('TAR-TEL-01', 'Tarifa Telecomunicações (Torres e Rádios)', 'telecomunicacoes', 24.00, 500.00, 'MZN', TRUE)
ON CONFLICT (codigo) DO NOTHING;

-- 4. Parâmetros Globais do Sistema
INSERT INTO system_settings (chave, valor, descricao)
VALUES 
    (
        'config_financeira',
        '{"moeda_padrao": "MZN", "iva_percentual": 16.0, "taxa_reconexao": 250.00, "limite_credito_emergencia_kwh": 5.0}'::jsonb,
        'Configurações financeiras e tarifárias gerais'
    ),
    (
        'canais_pagamento',
        '{"mpesa": {"ativo": true, "nome": "M-Pesa Moçambique"}, "emola": {"ativo": true, "nome": "e-Mola Movitel"}, "mkesh": {"ativo": false, "nome": "mKesh"}, "numerario": {"ativo": true, "nome": "Agente Comunitário"}}'::jsonb,
        'Configuração dos canais de pagamento suportados'
    ),
    (
        'seguranca_regras',
        '{"expiracao_sessao_horas": 24, "tentativas_login_bloqueio": 5, "tempo_bloqueio_minutos": 15}'::jsonb,
        'Políticas de autenticação e mitigação de força bruta'
    )
ON CONFLICT (chave) DO NOTHING;

-- 5. Ativos de Exemplo na Central de Calanga
INSERT INTO assets (
    id,
    codigo,
    mini_grid_id,
    classe,
    modelo,
    fabricante,
    numero_serie,
    data_instalacao,
    garantia_ate,
    estado
) VALUES 
    (
        '20000000-0000-0000-0000-000000000001',
        'AST-MR001-INV-01',
        '10000000-0000-0000-0000-000000000001',
        'inversor',
        'SUN2000-50KTL-M3',
        'Huawei FusionSolar',
        'HW-INV-2025-09881',
        '2025-06-01',
        '2030-06-01',
        'operacional'
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        'AST-MR001-BAT-01',
        '10000000-0000-0000-0000-000000000001',
        'bateria',
        'LUNA2000-100KWH-L1',
        'Huawei Energy Storage',
        'HW-BAT-2025-01124',
        '2025-06-01',
        '2035-06-01',
        'operacional'
    )
ON CONFLICT (codigo) DO NOTHING;

-- 6. Cliente Piloto de Teste
INSERT INTO clients (
    id,
    codigo,
    mini_grid_id,
    nome_completo,
    documento_identificacao,
    contacto_principal,
    contacto_secundario,
    latitude,
    longitude,
    categoria,
    estado
) VALUES (
    '30000000-0000-0000-0000-000000000001',
    'MR001-RES-0001',
    '10000000-0000-0000-0000-000000000001',
    'Alberto Chissano',
    '110293847581B',
    '+258 84 123 4567',
    '+258 82 987 6543',
    -25.43320000,
    32.98250000,
    'residencial',
    'activo'
) ON CONFLICT (codigo) DO NOTHING;

-- 7. Contrato de Fornecimento
INSERT INTO contracts (
    id,
    numero_contrato,
    client_id,
    tipo_tarifa,
    potencia_contratada_kva,
    valor_caucao,
    data_ativacao,
    estado
) VALUES (
    '40000000-0000-0000-0000-000000000001',
    'CTR-MR001-0001',
    '30000000-0000-0000-0000-000000000001',
    'pre_pago',
    1.50,
    500.00,
    '2025-06-20',
    'activo'
) ON CONFLICT (numero_contrato) DO NOTHING;

-- 8. Contador Inteligente Associado ao Cliente
INSERT INTO meters (
    id,
    numero_serie,
    mini_grid_id,
    client_id,
    tecnologia,
    estado,
    data_instalacao,
    ultima_comunicacao
) VALUES (
    '50000000-0000-0000-0000-000000000001',
    'MTR-MR001-0001',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000001',
    'inteligente_prepago',
    'instalado',
    '2025-06-20 10:30:00+02',
    CURRENT_TIMESTAMP
) ON CONFLICT (numero_serie) DO NOTHING;

