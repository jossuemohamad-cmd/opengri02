/**
 * LECASU GridOps - Módulo de Dados Demonstrativos & Fallback Resiliente
 * Fornece dados operacionais realistas completos para navegação contínua no Vercel e modo offline,
 * garantindo que todas as abas, tabelas, KPIs, mapas GIS e formulários funcionem perfeitamente.
 */

(function (window) {
  'use strict';

  // 1. Centrais Solares Fotovoltaicas (Coordenadas Reais Onshore Moçambique)
  const miniGrids = [
    {
      id: '10000000-0000-0000-0000-000000000005',
      codigo: 'MR-INH-001',
      nome: 'Central Solar Fotovoltaica de Morrumbene',
      provincia: 'Inhambane',
      distrito: 'Morrumbene',
      localidade: 'Morrumbene Sede',
      latitude: -23.6650,
      longitude: 35.3180,
      capacidade_kwp: 85.0,
      capacidade_bateria_kwh: 210.0,
      estado_operacional: 'activa',
      data_comissionamento: '2025-07-15',
      total_clientes: 38,
      total_activos: 4
    },
    {
      id: '10000000-0000-0000-0000-000000000006',
      codigo: 'MR-SOF-001',
      nome: 'Mini-Rede Solar Híbrida de Dondo',
      provincia: 'Sofala',
      distrito: 'Dondo',
      localidade: 'Savane',
      latitude: -19.6120,
      longitude: 34.7430,
      capacidade_kwp: 120.0,
      capacidade_bateria_kwh: 300.0,
      estado_operacional: 'activa',
      data_comissionamento: '2025-09-01',
      total_clientes: 45,
      total_activos: 5
    },
    {
      id: '10000000-0000-0000-0000-000000000007',
      codigo: 'MR-NPL-001',
      nome: 'Central Solar Comunitária de Ribáuè',
      provincia: 'Nampula',
      distrito: 'Ribáuè',
      localidade: 'Iapala',
      latitude: -14.9580,
      longitude: 38.3050,
      capacidade_kwp: 95.0,
      capacidade_bateria_kwh: 240.0,
      estado_operacional: 'activa',
      data_comissionamento: '2025-11-20',
      total_clientes: 40,
      total_activos: 3
    },
    {
      id: '10000000-0000-0000-0000-000000000008',
      codigo: 'MR-CDG-001',
      nome: 'Mini-Rede Solar de Metuge',
      provincia: 'Cabo Delgado',
      distrito: 'Metuge',
      localidade: 'Mieze',
      latitude: -13.0040,
      longitude: 40.3250,
      capacidade_kwp: 70.0,
      capacidade_bateria_kwh: 180.0,
      estado_operacional: 'activa',
      data_comissionamento: '2026-01-10',
      total_clientes: 32,
      total_activos: 3
    },
    {
      id: '10000000-0000-0000-0000-000000000001',
      codigo: 'MR-MPT-001',
      nome: 'Mini-Rede Solar Fotovoltaica de Calanga',
      provincia: 'Maputo',
      distrito: 'Manhiça',
      localidade: 'Calanga',
      latitude: -25.4650,
      longitude: 32.8550,
      capacidade_kwp: 50.0,
      capacidade_bateria_kwh: 120.0,
      estado_operacional: 'activa',
      data_comissionamento: '2025-06-15',
      total_clientes: 30,
      total_activos: 4
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      codigo: 'MR-MPT-002',
      nome: 'Central Solar Fotovoltaica de Maluana',
      provincia: 'Maputo',
      distrito: 'Manhiça',
      localidade: 'Maluana Sede',
      latitude: -25.4050,
      longitude: 32.8520,
      capacidade_kwp: 75.0,
      capacidade_bateria_kwh: 190.0,
      estado_operacional: 'activa',
      data_comissionamento: '2025-08-10',
      total_clientes: 35,
      total_activos: 3
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      codigo: 'MR-GZA-001',
      nome: 'Mini-Rede Comunitária de Muembene',
      provincia: 'Gaza',
      distrito: 'Chibuto',
      localidade: 'Muembene',
      latitude: -24.6850,
      longitude: 33.5300,
      capacidade_kwp: 45.0,
      capacidade_bateria_kwh: 110.0,
      estado_operacional: 'activa',
      data_comissionamento: '2025-10-01',
      total_clientes: 28,
      total_activos: 2
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      codigo: 'MR-GZA-002',
      nome: 'Mini-Rede Solar de Mazivila',
      provincia: 'Gaza',
      distrito: 'Bilene',
      localidade: 'Mazivila',
      latitude: -24.9520,
      longitude: 33.1250,
      capacidade_kwp: 60.0,
      capacidade_bateria_kwh: 150.0,
      estado_operacional: 'instalacao',
      data_comissionamento: '2026-03-01',
      total_clientes: 15,
      total_activos: 2
    }
  ];

  // 2. Clientes e Usos Produtivos (PUE)
  const clients = [
    { id: '30000000-0000-0000-0000-000000000016', codigo: 'MR005-PUE-0001', mini_grid_codigo: 'MR-INH-001', mini_grid_nome: 'Morrumbene Sede', nome_completo: 'Câmara Frigorífica de Pesca Morrumbene', documento_identificacao: '400582910482P', contacto_principal: '+258 84 999 5501', latitude: -23.6645, longitude: 35.3175, categoria: 'uso_produtivo', estado: 'activo', criado_em: '2025-07-20' },
    { id: '30000000-0000-0000-0000-000000000017', codigo: 'MR005-PUB-0001', mini_grid_codigo: 'MR-INH-001', mini_grid_nome: 'Morrumbene Sede', nome_completo: 'Centro de Saúde Rural com Vacinas', documento_identificacao: '900582910482S', contacto_principal: '+258 82 999 5502', latitude: -23.6655, longitude: 35.3185, categoria: 'servico_publico', estado: 'activo', criado_em: '2025-07-22' },
    { id: '30000000-0000-0000-0000-000000000018', codigo: 'MR005-COM-0001', mini_grid_codigo: 'MR-INH-001', mini_grid_nome: 'Morrumbene Sede', nome_completo: 'Padaria Solar Pão Quente', documento_identificacao: '110682910482M', contacto_principal: '+258 84 999 5503', latitude: -23.6640, longitude: 35.3190, categoria: 'comercial', estado: 'activo', criado_em: '2025-07-25' },
    { id: '30000000-0000-0000-0000-000000000019', codigo: 'MR005-RES-0001', mini_grid_codigo: 'MR-INH-001', mini_grid_nome: 'Morrumbene Sede', nome_completo: 'Anabela Lourenço Matsinhe', documento_identificacao: '110782910482F', contacto_principal: '+258 84 999 5504', latitude: -23.6660, longitude: 35.3170, categoria: 'residencial', estado: 'activo', criado_em: '2025-07-28' },

    { id: '30000000-0000-0000-0000-000000000020', codigo: 'MR006-PUE-0001', mini_grid_codigo: 'MR-SOF-001', mini_grid_nome: 'Savane Dondo', nome_completo: 'Oficina de Carpintaria e Soldadura Savane', documento_identificacao: '400682910482C', contacto_principal: '+258 84 111 6601', latitude: -19.6115, longitude: 34.7425, categoria: 'uso_produtivo', estado: 'activo', criado_em: '2025-09-05' },
    { id: '30000000-0000-0000-0000-000000000021', codigo: 'MR006-PUE-0002', mini_grid_codigo: 'MR-SOF-001', mini_grid_nome: 'Savane Dondo', nome_completo: 'Moagem e Descasque de Arroz Dondo', documento_identificacao: '400782910482A', contacto_principal: '+258 84 111 6602', latitude: -19.6125, longitude: 34.7435, categoria: 'uso_produtivo', estado: 'activo', criado_em: '2025-09-08' },
    { id: '30000000-0000-0000-0000-000000000022', codigo: 'MR006-PUB-0001', mini_grid_codigo: 'MR-SOF-001', mini_grid_nome: 'Savane Dondo', nome_completo: 'Escola Secundária Geral de Dondo', documento_identificacao: '900682910482E', contacto_principal: '+258 82 111 6603', latitude: -19.6110, longitude: 34.7440, categoria: 'servico_publico', estado: 'activo', criado_em: '2025-09-10' },
    { id: '30000000-0000-0000-0000-000000000023', codigo: 'MR006-RES-0001', mini_grid_codigo: 'MR-SOF-001', mini_grid_nome: 'Savane Dondo', nome_completo: 'Joaquim Alberto Chissano', documento_identificacao: '110882910482J', contacto_principal: '+258 84 111 6604', latitude: -19.6130, longitude: 34.7420, categoria: 'residencial', estado: 'activo', criado_em: '2025-09-12' },

    { id: '30000000-0000-0000-0000-000000000024', codigo: 'MR007-PUE-0001', mini_grid_codigo: 'MR-NPL-001', mini_grid_nome: 'Iapala Ribáuè', nome_completo: 'Moageira Estrela do Norte - Iapala', documento_identificacao: '400882910482M', contacto_principal: '+258 84 222 7701', latitude: -14.9575, longitude: 38.3045, categoria: 'uso_produtivo', estado: 'activo', criado_em: '2025-11-25' },
    { id: '30000000-0000-0000-0000-000000000025', codigo: 'MR007-COM-0001', mini_grid_codigo: 'MR-NPL-001', mini_grid_nome: 'Iapala Ribáuè', nome_completo: 'Barbearia e Salão de Beleza Moderno', documento_identificacao: '110982910482S', contacto_principal: '+258 84 222 7702', latitude: -14.9585, longitude: 38.3055, categoria: 'comercial', estado: 'activo', criado_em: '2025-11-27' },
    { id: '30000000-0000-0000-0000-000000000026', codigo: 'MR007-PUB-0001', mini_grid_codigo: 'MR-NPL-001', mini_grid_nome: 'Iapala Ribáuè', nome_completo: 'Posto de Saúde Comunitário de Iapala', documento_identificacao: '900782910482P', contacto_principal: '+258 82 222 7703', latitude: -14.9570, longitude: 38.3060, categoria: 'servico_publico', estado: 'activo', criado_em: '2025-11-28' },
    { id: '30000000-0000-0000-0000-000000000027', codigo: 'MR007-RES-0001', mini_grid_codigo: 'MR-NPL-001', mini_grid_nome: 'Iapala Ribáuè', nome_completo: 'Faustino Muendane Nhaduate', documento_identificacao: '111082910482N', contacto_principal: '+258 84 222 7704', latitude: -14.9590, longitude: 38.3040, categoria: 'residencial', estado: 'activo', criado_em: '2025-11-30' },

    { id: '30000000-0000-0000-0000-000000000028', codigo: 'MR008-PUE-0001', mini_grid_codigo: 'MR-CDG-001', mini_grid_nome: 'Mieze Metuge', nome_completo: 'Bomba Solar de Captação e Irrigação Mieze', documento_identificacao: '400982910482B', contacto_principal: '+258 84 333 8801', latitude: -13.0035, longitude: 40.3255, categoria: 'uso_produtivo', estado: 'activo', criado_em: '2026-01-15' },
    { id: '30000000-0000-0000-0000-000000000029', codigo: 'MR008-PUB-0001', mini_grid_codigo: 'MR-CDG-001', mini_grid_nome: 'Mieze Metuge', nome_completo: 'Posto Policial e Iluminação Pública Mieze', documento_identificacao: '900882910482L', contacto_principal: '+258 82 333 8802', latitude: -13.0045, longitude: 40.3245, categoria: 'servico_publico', estado: 'activo', criado_em: '2026-01-18' },
    { id: '30000000-0000-0000-0000-000000000030', codigo: 'MR008-RES-0001', mini_grid_codigo: 'MR-CDG-001', mini_grid_nome: 'Mieze Metuge', nome_completo: 'Zainabo Abdul Bachir', documento_identificacao: '111182910482Z', contacto_principal: '+258 84 333 8803', latitude: -13.0042, longitude: 40.3260, categoria: 'residencial', estado: 'activo', criado_em: '2026-01-20' },

    { id: '30000000-0000-0000-0000-000000000001', codigo: 'MR001-RES-0001', mini_grid_codigo: 'MR-MPT-001', mini_grid_nome: 'Calanga Manhiça', nome_completo: 'Mateus Armindo Cossa', documento_identificacao: '110182910482A', contacto_principal: '+258 84 555 1201', latitude: -25.4645, longitude: 32.8545, categoria: 'residencial', estado: 'activo', criado_em: '2025-06-20' },
    { id: '30000000-0000-0000-0000-000000000002', codigo: 'MR001-RES-0002', mini_grid_codigo: 'MR-MPT-001', mini_grid_nome: 'Calanga Manhiça', nome_completo: 'Teresa Manhiça Tembe', documento_identificacao: '110282910482B', contacto_principal: '+258 84 555 1202', latitude: -25.4655, longitude: 32.8558, categoria: 'residencial', estado: 'activo', criado_em: '2025-06-21' },
    { id: '30000000-0000-0000-0000-000000000003', codigo: 'MR001-PUE-0001', mini_grid_codigo: 'MR-MPT-001', mini_grid_nome: 'Calanga Manhiça', nome_completo: 'Moagem Comunitária Trigo de Ouro', documento_identificacao: '400182910482T', contacto_principal: '+258 84 555 1203', latitude: -25.4640, longitude: 32.8560, categoria: 'uso_produtivo', estado: 'activo', criado_em: '2025-06-22' },
    { id: '30000000-0000-0000-0000-000000000004', codigo: 'MR001-PUB-0001', mini_grid_codigo: 'MR-MPT-001', mini_grid_nome: 'Calanga Manhiça', nome_completo: 'Escola Primária Completa de Calanga', documento_identificacao: '900182910482E', contacto_principal: '+258 82 555 1204', latitude: -25.4660, longitude: 32.8540, categoria: 'servico_publico', estado: 'activo', criado_em: '2025-06-23' },
    { id: '30000000-0000-0000-0000-000000000005', codigo: 'MR001-COM-0001', mini_grid_codigo: 'MR-MPT-001', mini_grid_nome: 'Calanga Manhiça', nome_completo: 'Mercearia Central e Recargas Calanga', documento_identificacao: '110382910482C', contacto_principal: '+258 84 555 1205', latitude: -25.4652, longitude: 32.8565, categoria: 'comercial', estado: 'activo', criado_em: '2025-06-24' },
    { id: '30000000-0000-0000-0000-000000000006', codigo: 'MR001-TEL-0001', mini_grid_codigo: 'MR-MPT-001', mini_grid_nome: 'Calanga Manhiça', nome_completo: 'Torre de Telecomunicações Movitel Calanga', documento_identificacao: '400282910482M', contacto_principal: '+258 86 555 1206', latitude: -25.4635, longitude: 32.8548, categoria: 'telecomunicacoes', estado: 'activo', criado_em: '2025-06-25' }
  ];

  // 3. Contadores de Energia (STS Pré-pago e Smart AMI)
  const meters = [
    { id: 'm-01', numero_serie: 'HEX-2025-998811', tipo: 'sts_prepago', tecnologia: 'STS', fabricante: 'Hexing Electrical', modelo: 'HXE12-KP', cliente_codigo: 'MR005-PUE-0001', cliente_nome: 'Câmara Frigorífica de Pesca Morrumbene', mini_grid_codigo: 'MR-INH-001', estado: 'instalado', ultima_leitura: 1480.5 },
    { id: 'm-02', numero_serie: 'INHE-2025-334412', tipo: 'smart_ami', tecnologia: 'AMI IoT', fabricante: 'Inhemeter Co.', modelo: 'DDZ1513', cliente_codigo: 'MR005-PUB-0001', cliente_nome: 'Centro de Saúde Rural com Vacinas', mini_grid_codigo: 'MR-INH-001', estado: 'instalado', ultima_leitura: 920.0 },
    { id: 'm-03', numero_serie: 'HEX-2025-445522', tipo: 'sts_prepago', tecnologia: 'STS', fabricante: 'Hexing Electrical', modelo: 'HXE12-KP', cliente_codigo: 'MR006-PUE-0001', cliente_nome: 'Oficina de Carpintaria Savane', mini_grid_codigo: 'MR-SOF-001', estado: 'instalado', ultima_leitura: 2150.3 },
    { id: 'm-04', numero_serie: 'CHINT-2025-778833', tipo: 'smart_ami', tecnologia: 'AMI GSM', fabricante: 'Chint Instrument', modelo: 'DDS720', cliente_codigo: 'MR007-PUE-0001', cliente_nome: 'Moageira Estrela do Norte', mini_grid_codigo: 'MR-NPL-001', estado: 'instalado', ultima_leitura: 3410.8 },
    { id: 'm-05', numero_serie: 'HEX-2025-112233', tipo: 'sts_prepago', tecnologia: 'STS', fabricante: 'Hexing Electrical', modelo: 'HXE12-KP', cliente_codigo: 'MR001-RES-0001', cliente_nome: 'Mateus Armindo Cossa', mini_grid_codigo: 'MR-MPT-001', estado: 'instalado', ultima_leitura: 412.0 }
  ];

  // 4. Leituras de Consumo
  const readings = [
    { id: 'r-01', meter_numero_serie: 'HEX-2025-998811', client_nome: 'Câmara Frigorífica Morrumbene', valor_kwh: 1480.5, data_leitura: '2026-11-01', fonte: 'manual', validado: true },
    { id: 'r-02', meter_numero_serie: 'INHE-2025-334412', client_nome: 'Centro de Saúde Rural Morrumbene', valor_kwh: 920.0, data_leitura: '2026-11-01', fonte: 'smart_meter', validado: true },
    { id: 'r-03', meter_numero_serie: 'HEX-2025-445522', client_nome: 'Oficina de Carpintaria Savane', valor_kwh: 2150.3, data_leitura: '2026-11-01', fonte: 'manual', validado: true },
    { id: 'r-04', meter_numero_serie: 'CHINT-2025-778833', client_nome: 'Moageira Estrela do Norte', valor_kwh: 3410.8, data_leitura: '2026-11-01', fonte: 'smart_meter', validado: true },
    { id: 'r-05', meter_numero_serie: 'HEX-2025-112233', client_nome: 'Mateus Armindo Cossa', valor_kwh: 412.0, data_leitura: '2026-11-01', fonte: 'manual', validado: true }
  ];

  // 5. Pagamentos e Cobrança
  const payments = [
    { id: 'p-01', referencia: 'PAY-2026-00891', cliente_nome: 'Câmara Frigorífica Morrumbene', valor_mzn: 4500.0, canal: 'mpesa', estado: 'reconciliado', data_pagamento: '2026-11-15' },
    { id: 'p-02', referencia: 'PAY-2026-00892', cliente_nome: 'Padaria Solar Pão Quente', valor_mzn: 2200.0, canal: 'emola', estado: 'reconciliado', data_pagamento: '2026-11-14' },
    { id: 'p-03', referencia: 'PAY-2026-00893', cliente_nome: 'Oficina de Carpintaria Savane', valor_mzn: 3800.0, canal: 'mpesa', estado: 'reconciliado', data_pagamento: '2026-11-12' },
    { id: 'p-04', referencia: 'PAY-2026-00894', cliente_nome: 'Mateus Armindo Cossa', valor_mzn: 500.0, canal: 'numerario', estado: 'reconciliado', data_pagamento: '2026-11-10' }
  ];

  // 6. Ativos Técnicos
  const assets = [
    { id: 'a-01', codigo: 'AST-MR005-INV-01', mini_grid_codigo: 'MR-INH-001', classe: 'inversor', modelo: 'SUN2000-50KTL-M0', fabricante: 'Huawei FusionSolar', estado: 'operacional', data_instalacao: '2025-07-01' },
    { id: 'a-02', codigo: 'AST-MR005-BAT-01', mini_grid_codigo: 'MR-INH-001', classe: 'bateria', modelo: 'LUNA2000-200KWH', fabricante: 'Huawei Energy Storage', estado: 'operacional', data_instalacao: '2025-07-01' },
    { id: 'a-03', codigo: 'AST-MR006-INV-01', mini_grid_codigo: 'MR-SOF-001', classe: 'inversor', modelo: 'Sunny Tripower Core2 110kW', fabricante: 'SMA Solar', estado: 'operacional', data_instalacao: '2025-08-20' },
    { id: 'a-04', codigo: 'AST-MR007-BAT-01', mini_grid_codigo: 'MR-NPL-001', classe: 'bateria', modelo: 'Battery-Box 240kWh', fabricante: 'BYD Commercial', estado: 'operacional', data_instalacao: '2025-11-10' }
  ];

  // 7. Ordens de Trabalho (O&M)
  const workOrders = [
    { id: 'wo-01', codigo: 'OT-2026-0001', titulo: 'Manutenção Preventiva BESS e Inversor', tipo: 'manutencao_preventiva', prioridade: 'media', estado: 'concluida', mini_grid_codigo: 'MR-INH-001', tecnico_nome: 'Tomas Manhique' },
    { id: 'wo-02', codigo: 'OT-2026-0002', titulo: 'Inspeção Termográfica de Quadros AC/DC', tipo: 'inspecao', prioridade: 'baixa', estado: 'concluida', mini_grid_codigo: 'MR-SOF-001', tecnico_nome: 'Tomas Manhique' },
    { id: 'wo-03', codigo: 'OT-2026-0003', titulo: 'Ligação de Novo Ramal Comercial', tipo: 'nova_ligacao', prioridade: 'alta', estado: 'concluida', mini_grid_codigo: 'MR-NPL-001', tecnico_nome: 'Tomas Manhique' }
  ];

  // 8. Tarifas Oficiais (Moçambique - Meticais MZN)
  const tariffs = [
    { id: 't-01', codigo: 'TAR-RES-01', nome: 'Tarifa Residencial Social', categoria: 'residencial', preco_kwh: 12.5, moeda: 'MZN', ativo: true },
    { id: 't-02', codigo: 'TAR-RES-02', nome: 'Tarifa Residencial Padrão', categoria: 'residencial', preco_kwh: 16.0, moeda: 'MZN', ativo: true },
    { id: 't-03', codigo: 'TAR-COM-01', nome: 'Tarifa Comercial e Mercearias', categoria: 'comercial', preco_kwh: 19.5, moeda: 'MZN', ativo: true },
    { id: 't-04', codigo: 'TAR-PROD-01', nome: 'Tarifa Uso Produtivo (PUE)', categoria: 'uso_produtivo', preco_kwh: 14.0, moeda: 'MZN', ativo: true },
    { id: 't-05', codigo: 'TAR-TEL-01', nome: 'Tarifa Telecomunicações', categoria: 'telecomunicacoes', preco_kwh: 24.0, moeda: 'MZN', ativo: true }
  ];

  // 9. Utilizadores do Sistema (7 Perfis RBAC)
  const users = [
    { id: 'u-01', nome: 'Jossue Mohamad', email: 'jossuemohamad@gmail.com', role: 'administrador', status: 'ativo' },
    { id: 'u-02', nome: 'Eng. Américo Muchanga', email: 'operacoes@lecasu.co.mz', role: 'gestor_operacoes', status: 'ativo' },
    { id: 'u-03', nome: 'Sofia Sitoe', email: 'comercial@lecasu.co.mz', role: 'gestor_comercial', status: 'ativo' },
    { id: 'u-04', nome: 'Tomas Manhique', email: 'tecnico@lecasu.co.mz', role: 'tecnico_campo', status: 'ativo' },
    { id: 'u-05', nome: 'Carlos Nhantumbo', email: 'agente@lecasu.co.mz', role: 'agente_comunitario', status: 'ativo' },
    { id: 'u-06', nome: 'Fátima Guambe', email: 'financeiro@lecasu.co.mz', role: 'financeiro', status: 'ativo' },
    { id: 'u-07', nome: 'Dr. Paulo Mondlane', email: 'auditor@lecasu.co.mz', role: 'parceiro_auditor', status: 'ativo' }
  ];

  // 10. Relatório Consolidado do Dashboard
  const dashboardReport = {
    total_mini_grids: 8,
    total_clientes: 30,
    capacidade_instalada_kwp: 600.0,
    capacidade_bateria_kwh: 1490.0,
    energia_gerada_mes_kwh: 74500.0,
    taxa_disponibilidade_media: 98.8,
    ordens_trabalho_abertas: 0,
    clientes_por_categoria: {
      uso_produtivo: 12,
      residencial: 10,
      comercial: 5,
      servico_publico: 3
    }
  };

  // GeoJSON para Leaflet Maps
  const miniGridsGIS = {
    type: 'FeatureCollection',
    features: miniGrids.map(mg => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [mg.longitude, mg.latitude] },
      properties: { ...mg }
    }))
  };

  const clientsGIS = {
    type: 'FeatureCollection',
    features: clients.map(c => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [c.longitude, c.latitude] },
      properties: { ...c }
    }))
  };

  /**
   * Fornece resposta simulada para chamadas à API quando em modo demonstração / Vercel
   */
  function getFallbackResponse(endpoint, options = {}) {
    const url = endpoint.split('?')[0];

    if (url.includes('/api/auth/login')) {
      return {
        success: true,
        data: {
          token: 'demo_pilot_token_lecasu_gridops',
          user: users[0]
        }
      };
    }

    if (url.includes('/api/mini-grids/gis')) return { success: true, data: miniGridsGIS };
    if (url.includes('/api/mini-grids')) return { success: true, data: miniGrids };

    if (url.includes('/api/clients/gis')) return { success: true, data: clientsGIS };
    if (url.includes('/api/clients')) return { success: true, data: clients };

    if (url.includes('/api/meters')) return { success: true, data: meters };
    if (url.includes('/api/readings')) return { success: true, data: readings };
    if (url.includes('/api/payments')) return { success: true, data: payments };
    if (url.includes('/api/assets')) return { success: true, data: assets };
    if (url.includes('/api/work-orders')) return { success: true, data: workOrders };
    if (url.includes('/api/tariffs')) return { success: true, data: tariffs };
    if (url.includes('/api/users')) return { success: true, data: users };
    if (url.includes('/api/reports/dashboard')) return { success: true, data: dashboardReport };

    if (url.includes('/api/telemetry/overview')) {
      return {
        success: true,
        data: {
          totalDevices: 8,
          activeDevices: 8,
          totalLiveKwp: 468.0,
          avgSoc: 88,
          devices: miniGrids.map(mg => ({
            mini_grid_id: mg.id,
            device_sn: `INV-${mg.codigo}`,
            plant_name: mg.nome,
            active_power_kw: (mg.capacidade_kwp * 0.78).toFixed(1),
            battery_soc_percent: 88,
            grid_frequency_hz: 50.0,
            status: 'online'
          }))
        }
      };
    }

    if (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') {
      return { success: true, message: 'Operação simulada guardada com sucesso em modo demonstração.' };
    }

    return null;
  }

  // Exportação global
  window.DemoData = {
    miniGrids,
    clients,
    meters,
    readings,
    payments,
    assets,
    workOrders,
    tariffs,
    users,
    dashboardReport,
    miniGridsGIS,
    clientsGIS,
    getFallbackResponse
  };

})(window);
