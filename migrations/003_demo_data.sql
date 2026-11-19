-- ==============================================================================
-- LECASU GridOps - Migração 003: Carga de Dados Demonstrativos (Dados Demo)
-- Proporciona uma visão completa e realista da operação de mini-redes rurais
-- ==============================================================================

-- 1. Utilizadores com papéis operacionais e comerciais
INSERT INTO users (id, nome, email, password_hash, role, status, telefone)
VALUES 
    (
        '00000000-0000-0000-0000-000000000004',
        'Sofia Sitoe - Gestora Comercial',
        'comercial@lecasu.co.mz',
        '$2a$10$9dR354iwY7vcw89KhXU65OcQ5TbG4u4GCHR0tvalYE3odqKS25LmK',
        'gestor_comercial',
        'ativo',
        '+258 84 222 0004'
    ),
    (
        '00000000-0000-0000-0000-000000000005',
        'Carlos Nhantumbo - Agente Comunitário',
        'agente@lecasu.co.mz',
        '$2a$10$9dR354iwY7vcw89KhXU65OcQ5TbG4u4GCHR0tvalYE3odqKS25LmK',
        'agente_comunitario',
        'ativo',
        '+258 84 333 0005'
    ),
    (
        '00000000-0000-0000-0000-000000000006',
        'Fátima Guambe - Responsável Financeira',
        'financeiro@lecasu.co.mz',
        '$2a$10$9dR354iwY7vcw89KhXU65OcQ5TbG4u4GCHR0tvalYE3odqKS25LmK',
        'financeiro',
        'ativo',
        '+258 84 444 0006'
    ),
    (
        '00000000-0000-0000-0000-000000000007',
        'Dr. Paulo Mondlane - Auditor / Parceiro',
        'auditor@lecasu.co.mz',
        '$2a$10$9dR354iwY7vcw89KhXU65OcQ5TbG4u4GCHR0tvalYE3odqKS25LmK',
        'parceiro_auditor',
        'ativo',
        '+258 84 555 0007'
    )
ON CONFLICT (email) DO NOTHING;

-- 2. Carteira de Mini-Redes Solares em Moçambique
INSERT INTO mini_grids (
    id, codigo, nome, provincia, distrito, localidade,
    latitude, longitude, capacidade_kwp, capacidade_bateria_kwh,
    estado_operacional, data_comissionamento
) VALUES 
    (
        '10000000-0000-0000-0000-000000000002',
        'MR-MPT-002',
        'Central Solar Fotovoltaica de Maluana',
        'Maputo',
        'Manhiça',
        'Maluana Sede',
        -25.40500000,
        32.85200000,
        75.00,
        180.00,
        'activa',
        '2025-08-10'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'MR-GZA-001',
        'Mini-Rede Comunitária de Muembene',
        'Gaza',
        'Chibuto',
        'Muembene',
        -24.68500000,
        33.53000000,
        45.00,
        100.00,
        'activa',
        '2025-10-01'
    ),
    (
        '10000000-0000-0000-0000-000000000004',
        'MR-GZA-002',
        'Mini-Rede Solar de Mazivila',
        'Gaza',
        'Bilene',
        'Mazivila',
        -24.95200000,
        33.12500000,
        60.00,
        140.00,
        'instalacao',
        '2026-03-01'
    )
ON CONFLICT (codigo) DO NOTHING;

-- 3. Ativos Técnicos das Centrais
INSERT INTO assets (id, codigo, mini_grid_id, classe, modelo, fabricante, numero_serie, data_instalacao, garantia_ate, estado)
VALUES
    ('20000000-0000-0000-0000-000000000003', 'AST-MR002-INV-01', '10000000-0000-0000-0000-000000000002', 'inversor', 'SUN2000-60KTL-M0', 'Huawei FusionSolar', 'HW-INV-MAL-01', '2025-08-01', '2030-08-01', 'operacional'),
    ('20000000-0000-0000-0000-000000000004', 'AST-MR002-BAT-01', '10000000-0000-0000-0000-000000000002', 'bateria', 'LUNA2000-150KWH', 'Huawei Energy Storage', 'HW-BAT-MAL-01', '2025-08-01', '2035-08-01', 'operacional'),
    ('20000000-0000-0000-0000-000000000005', 'AST-MR003-INV-01', '10000000-0000-0000-0000-000000000003', 'inversor', 'Symo 20.0-3-M', 'Fronius', 'FR-INV-MUE-01', '2025-09-15', '2030-09-15', 'operacional'),
    ('20000000-0000-0000-0000-000000000006', 'AST-MR003-BAT-01', '10000000-0000-0000-0000-000000000003', 'bateria', 'BYD Battery-Box Pro', 'BYD', 'BYD-BAT-MUE-01', '2025-09-15', '2035-09-15', 'operacional'),
    ('20000000-0000-0000-0000-000000000007', 'AST-MR004-TRF-01', '10000000-0000-0000-0000-000000000004', 'transformador', '100kVA 33/0.4kV', 'EFACEC', 'EFA-TRF-MAZ-01', '2026-02-10', '2031-02-10', 'operacional')
ON CONFLICT (codigo) DO NOTHING;

-- 4. Clientes Diversificados (Residenciais, Mulheres Chefes de Família, PUEs, Escolas e Centros de Saúde)
INSERT INTO clients (id, codigo, mini_grid_id, nome_completo, documento_identificacao, contacto_principal, latitude, longitude, categoria, estado)
VALUES
    -- Calanga (MR-MPT-001)
    ('30000000-0000-0000-0000-000000000002', 'MR001-RES-0002', '10000000-0000-0000-0000-000000000001', 'Maria da Graça Mondlane', '110982736451C', '+258 84 555 1201', -25.43350000, 32.98180000, 'residencial', 'activo'),
    ('30000000-0000-0000-0000-000000000003', 'MR001-PUE-0001', '10000000-0000-0000-0000-000000000001', 'Moageira Comunitária de Calanga', '400192837482P', '+258 84 555 1202', -25.43250000, 32.98300000, 'uso_produtivo', 'activo'),
    ('30000000-0000-0000-0000-000000000004', 'MR001-PUB-0001', '10000000-0000-0000-0000-000000000001', 'Escola Primária Completa de Calanga', '900293847111G', '+258 82 555 1203', -25.43180000, 32.98050000, 'servico_publico', 'activo'),
    ('30000000-0000-0000-0000-000000000005', 'MR001-COM-0001', '10000000-0000-0000-0000-000000000001', 'Mercearia e Geleiras Boa Esperança', '110394857222M', '+258 84 555 1204', -25.43400000, 32.98220000, 'comercial', 'activo'),
    ('30000000-0000-0000-0000-000000000006', 'MR001-TEL-0001', '10000000-0000-0000-0000-000000000001', 'Torre de Telecomunicações Vodacom/Movitel', '500192837499T', '+258 84 555 1205', -25.43100000, 32.98400000, 'telecomunicacoes', 'activo'),

    -- Maluana (MR-MPT-002)
    ('30000000-0000-0000-0000-000000000007', 'MR002-RES-0001', '10000000-0000-0000-0000-000000000002', 'Beatriz Rosa Tembe', '110482910482B', '+258 84 666 2201', -25.40550000, 32.85250000, 'residencial', 'activo'),
    ('30000000-0000-0000-0000-000000000008', 'MR002-RES-0002', '10000000-0000-0000-0000-000000000002', 'Ernesto Samora Macamo', '110592837192C', '+258 82 666 2202', -25.40600000, 32.85150000, 'residencial', 'activo'),
    ('30000000-0000-0000-0000-000000000009', 'MR002-PUE-0001', '10000000-0000-0000-0000-000000000002', 'Oficina de Serralharia e Soldadura Maluana', '400281938471S', '+258 84 666 2203', -25.40450000, 32.85300000, 'uso_produtivo', 'activo'),
    ('30000000-0000-0000-0000-000000000010', 'MR002-PUB-0001', '10000000-0000-0000-0000-000000000002', 'Posto de Saúde Rural de Maluana', '900382910482H', '+258 82 666 2204', -25.40400000, 32.85100000, 'servico_publico', 'activo'),

    -- Muembene (MR-GZA-001)
    ('30000000-0000-0000-0000-000000000011', 'MR003-RES-0001', '10000000-0000-0000-0000-000000000003', 'Helena Munguambe', '120192837481F', '+258 84 777 3301', -24.68550000, 33.53050000, 'residencial', 'activo'),
    ('30000000-0000-0000-0000-000000000012', 'MR003-RES-0002', '10000000-0000-0000-0000-000000000003', 'Simão José Cossa', '120281928374M', '+258 82 777 3302', -24.68600000, 33.52950000, 'residencial', 'activo'),
    ('30000000-0000-0000-0000-000000000013', 'MR003-PUE-0001', '10000000-0000-0000-0000-000000000003', 'Bomba Solar de Irrigação Agrícola Muembene', '400382910482A', '+258 84 777 3303', -24.68450000, 33.53100000, 'uso_produtivo', 'activo'),

    -- Mazivila (MR-GZA-002)
    ('30000000-0000-0000-0000-000000000014', 'MR004-RES-0001', '10000000-0000-0000-0000-000000000004', 'Rosa Manhique', '120392817482R', '+258 84 888 4401', -25.05050000, 33.22050000, 'residencial', 'activo'),
    ('30000000-0000-0000-0000-000000000015', 'MR004-COM-0001', '10000000-0000-0000-0000-000000000004', 'Cantina & Padaria Sol Nascente', '400492817482P', '+258 82 888 4402', -25.04950000, 33.22150000, 'comercial', 'activo')
ON CONFLICT (codigo) DO NOTHING;

-- 5. Contratos de Fornecimento
INSERT INTO contracts (id, numero_contrato, client_id, tipo_tarifa, potencia_contratada_kva, valor_caucao, data_ativacao, estado)
VALUES
    ('40000000-0000-0000-0000-000000000002', 'CTR-MR001-0002', '30000000-0000-0000-0000-000000000002', 'pre_pago', 1.00, 500.00, '2025-06-22', 'activo'),
    ('40000000-0000-0000-0000-000000000003', 'CTR-MR001-0003', '30000000-0000-0000-0000-000000000003', 'pre_pago', 7.50, 2500.00, '2025-06-25', 'activo'),
    ('40000000-0000-0000-0000-000000000004', 'CTR-MR001-0004', '30000000-0000-0000-0000-000000000004', 'pos_pago', 3.00, 0.00, '2025-06-25', 'activo'),
    ('40000000-0000-0000-0000-000000000005', 'CTR-MR001-0005', '30000000-0000-0000-0000-000000000005', 'pre_pago', 3.00, 1000.00, '2025-06-28', 'activo'),
    ('40000000-0000-0000-0000-000000000006', 'CTR-MR001-0006', '30000000-0000-0000-0000-000000000006', 'pos_pago', 10.00, 5000.00, '2025-07-01', 'activo'),
    ('40000000-0000-0000-0000-000000000007', 'CTR-MR002-0001', '30000000-0000-0000-0000-000000000007', 'pre_pago', 1.00, 500.00, '2025-08-15', 'activo'),
    ('40000000-0000-0000-0000-000000000008', 'CTR-MR002-0002', '30000000-0000-0000-0000-000000000008', 'pre_pago', 1.50, 500.00, '2025-08-15', 'activo'),
    ('40000000-0000-0000-0000-000000000009', 'CTR-MR002-0003', '30000000-0000-0000-0000-000000000009', 'pre_pago', 8.00, 3000.00, '2025-08-18', 'activo'),
    ('40000000-0000-0000-0000-000000000010', 'CTR-MR002-0004', '30000000-0000-0000-0000-000000000010', 'pos_pago', 5.00, 0.00, '2025-08-20', 'activo'),
    ('40000000-0000-0000-0000-000000000011', 'CTR-MR003-0001', '30000000-0000-0000-0000-000000000011', 'pre_pago', 1.00, 500.00, '2025-10-05', 'activo'),
    ('40000000-0000-0000-0000-000000000012', 'CTR-MR003-0002', '30000000-0000-0000-0000-000000000012', 'pre_pago', 1.00, 500.00, '2025-10-05', 'activo'),
    ('40000000-0000-0000-0000-000000000013', 'CTR-MR003-0003', '30000000-0000-0000-0000-000000000013', 'pre_pago', 6.00, 2000.00, '2025-10-10', 'activo')
ON CONFLICT (numero_contrato) DO NOTHING;

-- 6. Contadores de Energia
INSERT INTO meters (id, numero_serie, mini_grid_id, client_id, tecnologia, estado, data_instalacao, ultima_comunicacao)
VALUES
    ('50000000-0000-0000-0000-000000000002', 'MTR-MR001-0002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'inteligente_prepago', 'instalado', '2025-06-22 09:00:00+02', CURRENT_TIMESTAMP),
    ('50000000-0000-0000-0000-000000000003', 'MTR-MR001-0003', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', 'inteligente_prepago', 'instalado', '2025-06-25 11:30:00+02', CURRENT_TIMESTAMP),
    ('50000000-0000-0000-0000-000000000004', 'MTR-MR001-0004', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', 'digital', 'instalado', '2025-06-25 14:00:00+02', CURRENT_TIMESTAMP),
    ('50000000-0000-0000-0000-000000000005', 'MTR-MR001-0005', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005', 'inteligente_prepago', 'instalado', '2025-06-28 10:15:00+02', CURRENT_TIMESTAMP),
    ('50000000-0000-0000-0000-000000000006', 'MTR-MR002-0001', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000007', 'inteligente_prepago', 'instalado', '2025-08-15 08:30:00+02', CURRENT_TIMESTAMP),
    ('50000000-0000-0000-0000-000000000007', 'MTR-MR002-0002', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000008', 'inteligente_prepago', 'instalado', '2025-08-15 09:45:00+02', CURRENT_TIMESTAMP),
    ('50000000-0000-0000-0000-000000000008', 'MTR-MR002-0003', '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000009', 'inteligente_prepago', 'instalado', '2025-08-18 11:00:00+02', CURRENT_TIMESTAMP),
    ('50000000-0000-0000-0000-000000000009', 'MTR-MR003-0001', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000011', 'inteligente_prepago', 'instalado', '2025-10-05 10:00:00+02', CURRENT_TIMESTAMP),
    ('50000000-0000-0000-0000-000000000010', 'MTR-MR003-0002', '10000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000013', 'inteligente_prepago', 'instalado', '2025-10-10 14:20:00+02', CURRENT_TIMESTAMP)
ON CONFLICT (numero_serie) DO NOTHING;

-- 7. Leituras e Consumos de Energia
INSERT INTO readings (meter_id, valor_kwh, data_leitura, tipo_origem, observacoes)
VALUES
    ('50000000-0000-0000-0000-000000000001', 145.20, '2026-10-01 08:00:00+02', 'api', 'Leitura automática STS'),
    ('50000000-0000-0000-0000-000000000002', 88.50, '2026-10-01 08:15:00+02', 'api', 'Leitura automática STS'),
    ('50000000-0000-0000-0000-000000000003', 680.40, '2026-10-01 08:30:00+02', 'api', 'Moageira em produção contínua'),
    ('50000000-0000-0000-0000-000000000004', 320.10, '2026-10-01 09:00:00+02', 'manual', 'EPC Calanga iluminação e computadores'),
    ('50000000-0000-0000-0000-000000000005', 290.00, '2026-10-01 09:30:00+02', 'api', 'Mercearia congeladores'),
    ('50000000-0000-0000-0000-000000000006', 74.30, '2026-10-02 08:00:00+02', 'api', 'Consumo regular'),
    ('50000000-0000-0000-0000-000000000007', 95.80, '2026-10-02 08:30:00+02', 'api', 'Consumo regular'),
    ('50000000-0000-0000-0000-000000000008', 510.60, '2026-10-02 09:00:00+02', 'api', 'Serralharia uso de máquinas de soldar'),
    ('50000000-0000-0000-0000-000000000009', 62.40, '2026-10-03 10:00:00+02', 'api', 'Consumo doméstico'),
    ('50000000-0000-0000-0000-000000000010', 440.00, '2026-10-03 11:00:00+02', 'api', 'Bomba de rega solar');

-- 8. Pagamentos e Vendas de Energia em Meticais (M-Pesa e e-Mola)
INSERT INTO payments (referencia_transacao, client_id, valor, canal, estado, reconciliado, data_pagamento)
VALUES
    ('MPESA-2026-9812A', '30000000-0000-0000-0000-000000000001', 500.00, 'mpesa', 'confirmado', TRUE, '2026-10-05 14:20:00+02'),
    ('MPESA-2026-9813B', '30000000-0000-0000-0000-000000000002', 350.00, 'mpesa', 'confirmado', TRUE, '2026-10-06 10:15:00+02'),
    ('MPESA-2026-9814C', '30000000-0000-0000-0000-000000000003', 4500.00, 'mpesa', 'confirmado', TRUE, '2026-10-07 16:40:00+02'),
    ('EMOLA-2026-4412A', '30000000-0000-0000-0000-000000000005', 1800.00, 'emola', 'confirmado', TRUE, '2026-10-08 11:10:00+02'),
    ('MPESA-2026-9815D', '30000000-0000-0000-0000-000000000007', 400.00, 'mpesa', 'confirmado', TRUE, '2026-10-10 09:30:00+02'),
    ('EMOLA-2026-4413B', '30000000-0000-0000-0000-000000000008', 550.00, 'emola', 'confirmado', TRUE, '2026-10-11 12:45:00+02'),
    ('MPESA-2026-9816E', '30000000-0000-0000-0000-000000000009', 3200.00, 'mpesa', 'confirmado', TRUE, '2026-10-12 15:20:00+02'),
    ('NUMER-2026-0012A', '30000000-0000-0000-0000-000000000011', 300.00, 'numerario', 'confirmado', TRUE, '2026-10-14 08:30:00+02'),
    ('MPESA-2026-9817F', '30000000-0000-0000-0000-000000000013', 2800.00, 'mpesa', 'confirmado', TRUE, '2026-10-15 17:00:00+02'),
    ('TRANS-2026-0001T', '30000000-0000-0000-0000-000000000006', 8500.00, 'transferencia', 'confirmado', TRUE, '2026-10-18 10:00:00+02')
ON CONFLICT (referencia_transacao) DO NOTHING;

-- 9. Ordens de Trabalho (O&M)
INSERT INTO work_orders (
    numero_ordem, mini_grid_id, asset_id, client_id, tipo,
    prioridade, descricao, tecnico_id, estado, solucao, criado_em, encerrado_em
) VALUES
    (
        'OT-2026-000101',
        '10000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        NULL,
        'preventiva',
        'media',
        'Limpeza programada dos módulos solares fotovoltaicos e verificação do inversor central',
        '00000000-0000-0000-0000-000000000003',
        'resolvida',
        'Painéis limpos, conexões elétricas reapertadas e medição de rendimento térmico normalizada.',
        '2026-10-02 08:00:00+02',
        '2026-10-02 12:30:00+02'
    ),
    (
        'OT-2026-000102',
        '10000000-0000-0000-0000-000000000001',
        NULL,
        '30000000-0000-0000-0000-000000000003',
        'nova_ligacao',
        'alta',
        'Ligação trifásica para nova Moageira Comunitária de Calanga e teste do contador STS',
        '00000000-0000-0000-0000-000000000003',
        'resolvida',
        'Ramal instalado com cabo concêntrico e contador calibrado com crédito inicial.',
        '2026-10-04 09:00:00+02',
        '2026-10-04 15:45:00+02'
    ),
    (
        'OT-2026-000103',
        '10000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000003',
        NULL,
        'avaria',
        'urgente',
        'Alarme de sobreaquecimento no inversor secundário após pico de calor em Maluana',
        '00000000-0000-0000-0000-000000000003',
        'em_execucao',
        NULL,
        '2026-10-28 14:10:00+02',
        NULL
    ),
    (
        'OT-2026-000104',
        '10000000-0000-0000-0000-000000000003',
        NULL,
        '30000000-0000-0000-0000-000000000013',
        'avaria',
        'alta',
        'Verificação de relé de proteção no ramal da bomba solar de irrigação',
        '00000000-0000-0000-0000-000000000003',
        'atribuida',
        NULL,
        '2026-10-29 11:00:00+02',
        NULL
    )
ON CONFLICT (numero_ordem) DO NOTHING;

