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
    { id: '30000000-0000-0000-0000-000000000016', codigo: 'MR005-PUE-0001', mini_grid_id: '10000000-0000-0000-0000-000000000005', mini_grid_codigo: 'MR-INH-001', mini_grid_nome: 'Morrumbene Sede', nome_completo: 'Câmara Frigorífica de Pesca Morrumbene', documento_identificacao: '400582910482P', contacto_principal: '+258 84 999 5501', latitude: -23.6645, longitude: 35.3175, categoria: 'uso_produtivo', estado: 'activo', criado_em: '2025-07-20' },
    { id: '30000000-0000-0000-0000-000000000017', codigo: 'MR005-PUB-0001', mini_grid_id: '10000000-0000-0000-0000-000000000005', mini_grid_codigo: 'MR-INH-001', mini_grid_nome: 'Morrumbene Sede', nome_completo: 'Centro de Saúde Rural com Vacinas', documento_identificacao: '900582910482S', contacto_principal: '+258 82 999 5502', latitude: -23.6655, longitude: 35.3185, categoria: 'servico_publico', estado: 'activo', criado_em: '2025-07-22' },
    { id: '30000000-0000-0000-0000-000000000018', codigo: 'MR005-COM-0001', mini_grid_id: '10000000-0000-0000-0000-000000000005', mini_grid_codigo: 'MR-INH-001', mini_grid_nome: 'Morrumbene Sede', nome_completo: 'Padaria Solar Pão Quente', documento_identificacao: '110682910482M', contacto_principal: '+258 84 999 5503', latitude: -23.6640, longitude: 35.3190, categoria: 'comercial', estado: 'activo', criado_em: '2025-07-25' },
    { id: '30000000-0000-0000-0000-000000000019', codigo: 'MR005-RES-0001', mini_grid_id: '10000000-0000-0000-0000-000000000005', mini_grid_codigo: 'MR-INH-001', mini_grid_nome: 'Morrumbene Sede', nome_completo: 'Anabela Lourenço Matsinhe', documento_identificacao: '110782910482F', contacto_principal: '+258 84 999 5504', latitude: -23.6660, longitude: 35.3170, categoria: 'residencial', estado: 'activo', criado_em: '2025-07-28' },

    { id: '30000000-0000-0000-0000-000000000020', codigo: 'MR006-PUE-0001', mini_grid_id: '10000000-0000-0000-0000-000000000006', mini_grid_codigo: 'MR-SOF-001', mini_grid_nome: 'Savane Dondo', nome_completo: 'Oficina de Carpintaria e Soldadura Savane', documento_identificacao: '400682910482C', contacto_principal: '+258 84 111 6601', latitude: -19.6115, longitude: 34.7425, categoria: 'uso_produtivo', estado: 'activo', criado_em: '2025-09-05' },
    { id: '30000000-0000-0000-0000-000000000021', codigo: 'MR006-PUE-0002', mini_grid_id: '10000000-0000-0000-0000-000000000006', mini_grid_codigo: 'MR-SOF-001', mini_grid_nome: 'Savane Dondo', nome_completo: 'Moagem e Descasque de Arroz Dondo', documento_identificacao: '400782910482A', contacto_principal: '+258 84 111 6602', latitude: -19.6125, longitude: 34.7435, categoria: 'uso_produtivo', estado: 'activo', criado_em: '2025-09-08' },
    { id: '30000000-0000-0000-0000-000000000022', codigo: 'MR006-PUB-0001', mini_grid_id: '10000000-0000-0000-0000-000000000006', mini_grid_codigo: 'MR-SOF-001', mini_grid_nome: 'Savane Dondo', nome_completo: 'Escola Secundária Geral de Dondo', documento_identificacao: '900682910482E', contacto_principal: '+258 82 111 6603', latitude: -19.6110, longitude: 34.7440, categoria: 'servico_publico', estado: 'activo', criado_em: '2025-09-10' },
    { id: '30000000-0000-0000-0000-000000000023', codigo: 'MR006-RES-0001', mini_grid_id: '10000000-0000-0000-0000-000000000006', mini_grid_codigo: 'MR-SOF-001', mini_grid_nome: 'Savane Dondo', nome_completo: 'Joaquim Alberto Chissano', documento_identificacao: '110882910482J', contacto_principal: '+258 84 111 6604', latitude: -19.6130, longitude: 34.7420, categoria: 'residencial', estado: 'activo', criado_em: '2025-09-12' },

    { id: '30000000-0000-0000-0000-000000000024', codigo: 'MR007-PUE-0001', mini_grid_id: '10000000-0000-0000-0000-000000000007', mini_grid_codigo: 'MR-NPL-001', mini_grid_nome: 'Iapala Ribáuè', nome_completo: 'Moageira Estrela do Norte - Iapala', documento_identificacao: '400882910482M', contacto_principal: '+258 84 222 7701', latitude: -14.9575, longitude: 38.3045, categoria: 'uso_produtivo', estado: 'activo', criado_em: '2025-11-25' },
    { id: '30000000-0000-0000-0000-000000000025', codigo: 'MR007-COM-0001', mini_grid_id: '10000000-0000-0000-0000-000000000007', mini_grid_codigo: 'MR-NPL-001', mini_grid_nome: 'Iapala Ribáuè', nome_completo: 'Barbearia e Salão de Beleza Moderno', documento_identificacao: '110982910482S', contacto_principal: '+258 84 222 7702', latitude: -14.9585, longitude: 38.3055, categoria: 'comercial', estado: 'activo', criado_em: '2025-11-27' },
    { id: '30000000-0000-0000-0000-000000000026', codigo: 'MR007-PUB-0001', mini_grid_id: '10000000-0000-0000-0000-000000000007', mini_grid_codigo: 'MR-NPL-001', mini_grid_nome: 'Iapala Ribáuè', nome_completo: 'Posto de Saúde Comunitário de Iapala', documento_identificacao: '900782910482P', contacto_principal: '+258 82 222 7703', latitude: -14.9570, longitude: 38.3060, categoria: 'servico_publico', estado: 'activo', criado_em: '2025-11-28' },
    { id: '30000000-0000-0000-0000-000000000027', codigo: 'MR007-RES-0001', mini_grid_id: '10000000-0000-0000-0000-000000000007', mini_grid_codigo: 'MR-NPL-001', mini_grid_nome: 'Iapala Ribáuè', nome_completo: 'Faustino Muendane Nhaduate', documento_identificacao: '111082910482N', contacto_principal: '+258 84 222 7704', latitude: -14.9590, longitude: 38.3040, categoria: 'residencial', estado: 'activo', criado_em: '2025-11-30' },

    { id: '30000000-0000-0000-0000-000000000028', codigo: 'MR008-PUE-0001', mini_grid_id: '10000000-0000-0000-0000-000000000008', mini_grid_codigo: 'MR-CDG-001', mini_grid_nome: 'Mieze Metuge', nome_completo: 'Bomba Solar de Captação e Irrigação Mieze', documento_identificacao: '400982910482B', contacto_principal: '+258 84 333 8801', latitude: -13.0035, longitude: 40.3255, categoria: 'uso_produtivo', estado: 'activo', criado_em: '2026-01-15' },
    { id: '30000000-0000-0000-0000-000000000029', codigo: 'MR008-PUB-0001', mini_grid_id: '10000000-0000-0000-0000-000000000008', mini_grid_codigo: 'MR-CDG-001', mini_grid_nome: 'Mieze Metuge', nome_completo: 'Posto Policial e Iluminação Pública Mieze', documento_identificacao: '900882910482L', contacto_principal: '+258 82 333 8802', latitude: -13.0045, longitude: 40.3245, categoria: 'servico_publico', estado: 'activo', criado_em: '2026-01-18' },
    { id: '30000000-0000-0000-0000-000000000030', codigo: 'MR008-RES-0001', mini_grid_id: '10000000-0000-0000-0000-000000000008', mini_grid_codigo: 'MR-CDG-001', mini_grid_nome: 'Mieze Metuge', nome_completo: 'Zainabo Abdul Bachir', documento_identificacao: '111182910482Z', contacto_principal: '+258 84 333 8803', latitude: -13.0042, longitude: 40.3260, categoria: 'residencial', estado: 'activo', criado_em: '2026-01-20' },

    { id: '30000000-0000-0000-0000-000000000001', codigo: 'MR001-RES-0001', mini_grid_id: '10000000-0000-0000-0000-000000000001', mini_grid_codigo: 'MR-MPT-001', mini_grid_nome: 'Calanga Manhiça', nome_completo: 'Mateus Armindo Cossa', documento_identificacao: '110182910482A', contacto_principal: '+258 84 555 1201', latitude: -25.4645, longitude: 32.8545, categoria: 'residencial', estado: 'activo', criado_em: '2025-06-20' },
    { id: '30000000-0000-0000-0000-000000000002', codigo: 'MR001-RES-0002', mini_grid_id: '10000000-0000-0000-0000-000000000001', mini_grid_codigo: 'MR-MPT-001', mini_grid_nome: 'Calanga Manhiça', nome_completo: 'Teresa Manhiça Tembe', documento_identificacao: '110282910482B', contacto_principal: '+258 84 555 1202', latitude: -25.4655, longitude: 32.8558, categoria: 'residencial', estado: 'activo', criado_em: '2025-06-21' },
    { id: '30000000-0000-0000-0000-000000000003', codigo: 'MR001-PUE-0001', mini_grid_id: '10000000-0000-0000-0000-000000000001', mini_grid_codigo: 'MR-MPT-001', mini_grid_nome: 'Calanga Manhiça', nome_completo: 'Moagem Comunitária Trigo de Ouro', documento_identificacao: '400182910482T', contacto_principal: '+258 84 555 1203', latitude: -25.4640, longitude: 32.8560, categoria: 'uso_produtivo', estado: 'activo', criado_em: '2025-06-22' },
    { id: '30000000-0000-0000-0000-000000000004', codigo: 'MR001-PUB-0001', mini_grid_id: '10000000-0000-0000-0000-000000000001', mini_grid_codigo: 'MR-MPT-001', mini_grid_nome: 'Calanga Manhiça', nome_completo: 'Escola Primária Completa de Calanga', documento_identificacao: '900182910482E', contacto_principal: '+258 82 555 1204', latitude: -25.4660, longitude: 32.8540, categoria: 'servico_publico', estado: 'activo', criado_em: '2025-06-23' },
    { id: '30000000-0000-0000-0000-000000000005', codigo: 'MR001-COM-0001', mini_grid_id: '10000000-0000-0000-0000-000000000001', mini_grid_codigo: 'MR-MPT-001', mini_grid_nome: 'Calanga Manhiça', nome_completo: 'Mercearia Central e Recargas Calanga', documento_identificacao: '110382910482C', contacto_principal: '+258 84 555 1205', latitude: -25.4652, longitude: 32.8565, categoria: 'comercial', estado: 'activo', criado_em: '2025-06-24' },
    { id: '30000000-0000-0000-0000-000000000006', codigo: 'MR001-TEL-0001', mini_grid_id: '10000000-0000-0000-0000-000000000001', mini_grid_codigo: 'MR-MPT-001', mini_grid_nome: 'Calanga Manhiça', nome_completo: 'Torre de Telecomunicações Movitel Calanga', documento_identificacao: '400282910482M', contacto_principal: '+258 86 555 1206', latitude: -25.4635, longitude: 32.8548, categoria: 'telecomunicacoes', estado: 'activo', criado_em: '2025-06-25' }
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
    { id: 'r-01', meter_id: 'm-01', meter_numero_serie: 'HEX-2025-998811', client_nome: 'Câmara Frigorífica Morrumbene', valor_kwh: 1480.5, data_leitura: '2026-11-01', fonte: 'manual', validado: true },
    { id: 'r-02', meter_id: 'm-02', meter_numero_serie: 'INHE-2025-334412', client_nome: 'Centro de Saúde Rural Morrumbene', valor_kwh: 920.0, data_leitura: '2026-11-01', fonte: 'smart_meter', validado: true },
    { id: 'r-03', meter_id: 'm-03', meter_numero_serie: 'HEX-2025-445522', client_nome: 'Oficina de Carpintaria Savane', valor_kwh: 2150.3, data_leitura: '2026-11-01', fonte: 'manual', validado: true },
    { id: 'r-04', meter_id: 'm-04', meter_numero_serie: 'CHINT-2025-778833', client_nome: 'Moageira Estrela do Norte', valor_kwh: 3410.8, data_leitura: '2026-11-01', fonte: 'smart_meter', validado: true },
    { id: 'r-05', meter_id: 'm-05', meter_numero_serie: 'HEX-2025-112233', client_nome: 'Mateus Armindo Cossa', valor_kwh: 412.0, data_leitura: '2026-11-01', fonte: 'manual', validado: true }
  ];

  // 5. Pagamentos e Cobrança
  const payments = [
    {
      id: 'p-01',
      client_id: '30000000-0000-0000-0000-000000000016',
      referencia_transacao: 'PAY-2026-00891',
      referencia: 'PAY-2026-00891',
      client_nome: 'Câmara Frigorífica de Pesca Morrumbene',
      cliente_nome: 'Câmara Frigorífica de Pesca Morrumbene',
      valor: 4500.0,
      valor_mzn: 4500.0,
      canal: 'mpesa',
      estado: 'confirmado',
      reconciliado: true,
      data_pagamento: '2026-11-15'
    },
    {
      id: 'p-02',
      client_id: '30000000-0000-0000-0000-000000000018',
      referencia_transacao: 'PAY-2026-00892',
      referencia: 'PAY-2026-00892',
      client_nome: 'Padaria Solar Pão Quente',
      cliente_nome: 'Padaria Solar Pão Quente',
      valor: 2200.0,
      valor_mzn: 2200.0,
      canal: 'emola',
      estado: 'confirmado',
      reconciliado: true,
      data_pagamento: '2026-11-14'
    },
    {
      id: 'p-03',
      client_id: '30000000-0000-0000-0000-000000000020',
      referencia_transacao: 'PAY-2026-00893',
      referencia: 'PAY-2026-00893',
      client_nome: 'Oficina de Carpintaria e Soldadura Savane',
      cliente_nome: 'Oficina de Carpintaria e Soldadura Savane',
      valor: 3800.0,
      valor_mzn: 3800.0,
      canal: 'mpesa',
      estado: 'confirmado',
      reconciliado: true,
      data_pagamento: '2026-11-12'
    },
    {
      id: 'p-04',
      client_id: '30000000-0000-0000-0000-000000000001',
      referencia_transacao: 'PAY-2026-00894',
      referencia: 'PAY-2026-00894',
      client_nome: 'Mateus Armindo Cossa',
      cliente_nome: 'Mateus Armindo Cossa',
      valor: 500.0,
      valor_mzn: 500.0,
      canal: 'numerario',
      estado: 'confirmado',
      reconciliado: true,
      data_pagamento: '2026-11-10'
    }
  ];

  // 6. Ativos Técnicos (Com históricos e mini_grid_id para todas as rotas e modais)
  const assets = [
    {
      id: 'a-01',
      codigo: 'AST-MR005-INV-01',
      mini_grid_id: '10000000-0000-0000-0000-000000000005',
      mini_grid_codigo: 'MR-INH-001',
      mini_grid_nome: 'Morrumbene Sede',
      classe: 'inversor',
      modelo: 'SUN2000-50KTL-M0',
      fabricante: 'Huawei FusionSolar',
      numero_serie: 'HW2025-00192',
      estado: 'operacional',
      data_instalacao: '2025-07-01',
      garantia_ate: '2030-07-01',
      historico_manutencoes: [
        {
          numero_ordem: 'OT-2026-0001',
          tipo: 'preventiva',
          prioridade: 'media',
          descricao: 'Limpeza de filtros e verificação de torque DC.',
          tecnico_nome: 'Tomas Manhique',
          estado: 'resolvida'
        }
      ]
    },
    {
      id: 'a-02',
      codigo: 'AST-MR005-BAT-01',
      mini_grid_id: '10000000-0000-0000-0000-000000000005',
      mini_grid_codigo: 'MR-INH-001',
      mini_grid_nome: 'Morrumbene Sede',
      classe: 'bateria',
      modelo: 'LUNA2000-200KWH',
      fabricante: 'Huawei Energy Storage',
      numero_serie: 'HWB2025-9912',
      estado: 'operacional',
      data_instalacao: '2025-07-01',
      garantia_ate: '2035-07-01',
      historico_manutencoes: [
        {
          numero_ordem: 'OT-2026-0002',
          tipo: 'inspecao',
          prioridade: 'baixa',
          descricao: 'Balanceamento de células e teste de capacidade.',
          tecnico_nome: 'Tomas Manhique',
          estado: 'resolvida'
        }
      ]
    },
    {
      id: 'a-03',
      codigo: 'AST-MR006-INV-01',
      mini_grid_id: '10000000-0000-0000-0000-000000000006',
      mini_grid_codigo: 'MR-SOF-001',
      mini_grid_nome: 'Savane Dondo',
      classe: 'inversor',
      modelo: 'Sunny Tripower Core2 110kW',
      fabricante: 'SMA Solar',
      numero_serie: 'SMA-110K-8812',
      estado: 'operacional',
      data_instalacao: '2025-08-20',
      garantia_ate: '2030-08-20',
      historico_manutencoes: []
    },
    {
      id: 'a-04',
      codigo: 'AST-MR007-BAT-01',
      mini_grid_id: '10000000-0000-0000-0000-000000000007',
      mini_grid_codigo: 'MR-NPL-001',
      mini_grid_nome: 'Iapala Ribáuè',
      classe: 'bateria',
      modelo: 'Battery-Box 240kWh',
      fabricante: 'BYD Commercial',
      numero_serie: 'BYD-240-4411',
      estado: 'operacional',
      data_instalacao: '2025-11-10',
      garantia_ate: '2035-11-10',
      historico_manutencoes: []
    }
  ];

  // 7. Ordens de Trabalho (O&M - Respeitando campos consumidos numero_ordem, descricao e estado: 'resolvida' / 'aberta')
  const workOrders = [
    {
      id: 'wo-01',
      numero_ordem: 'OT-2026-0001',
      codigo: 'OT-2026-0001',
      descricao: 'Manutenção Preventiva BESS e Inversor',
      titulo: 'Manutenção Preventiva BESS e Inversor',
      tipo: 'manutencao_preventiva',
      prioridade: 'media',
      estado: 'resolvida',
      mini_grid_id: '10000000-0000-0000-0000-000000000005',
      mini_grid_codigo: 'MR-INH-001',
      tecnico_nome: 'Tomas Manhique',
      fotos_evidencia: [],
      created_at: '2026-11-01'
    },
    {
      id: 'wo-02',
      numero_ordem: 'OT-2026-0002',
      codigo: 'OT-2026-0002',
      descricao: 'Inspeção Termográfica de Quadros AC/DC',
      titulo: 'Inspeção Termográfica de Quadros AC/DC',
      tipo: 'inspecao',
      prioridade: 'baixa',
      estado: 'resolvida',
      mini_grid_id: '10000000-0000-0000-0000-000000000006',
      mini_grid_codigo: 'MR-SOF-001',
      tecnico_nome: 'Tomas Manhique',
      fotos_evidencia: [],
      created_at: '2026-11-05'
    },
    {
      id: 'wo-03',
      numero_ordem: 'OT-2026-0003',
      codigo: 'OT-2026-0003',
      descricao: 'Ligação de Novo Ramal Comercial',
      titulo: 'Ligação de Novo Ramal Comercial',
      tipo: 'nova_ligacao',
      prioridade: 'alta',
      estado: 'aberta',
      mini_grid_id: '10000000-0000-0000-0000-000000000007',
      mini_grid_codigo: 'MR-NPL-001',
      tecnico_nome: 'Tomas Manhique',
      fotos_evidencia: [],
      created_at: '2026-11-12'
    }
  ];

  // 8. Tarifas Oficiais (Moçambique - Meticais MZN)
  const tariffs = [
    { id: 't-01', codigo: 'TAR-RES-01', nome: 'Tarifa Residencial Social', categoria: 'residencial', preco_kwh: 12.5, moeda: 'MZN', ativo: true },
    { id: 't-02', codigo: 'TAR-RES-02', nome: 'Tarifa Residencial Padrão', categoria: 'residencial', preco_kwh: 16.0, moeda: 'MZN', ativo: true },
    { id: 't-03', codigo: 'TAR-COM-01', nome: 'Tarifa Comercial e Mercearias', categoria: 'comercial', preco_kwh: 19.5, moeda: 'MZN', ativo: true },
    { id: 't-04', codigo: 'TAR-PROD-01', nome: 'Tarifa Uso Produtivo (PUE)', categoria: 'uso_produtivo', preco_kwh: 14.0, moeda: 'MZN', ativo: true },
    { id: 't-05', codigo: 'TAR-TEL-01', nome: 'Tarifa Telecomunicações', categoria: 'telecomunicacoes', preco_kwh: 24.0, moeda: 'MZN', ativo: true }
  ];

  // 9. Utilizador Oficial do Sistema
  const users = [
    { id: '00000000-0000-0000-0000-000000000001', nome: 'LECASU Operações', email: 'info@lecasu.co.mz', role: 'administrador', status: 'ativo' }
  ];

  // 10. Construtores Dinâmicos de Relatórios Estruturados (Dashboard e Executivo)
  function getDashboardReport(queryParams = {}) {
    let targetGrids = [...miniGrids];
    let targetClients = [...clients];
    let targetOrders = [...workOrders];

    if (queryParams.mini_grid_id) {
      targetGrids = targetGrids.filter(m => m.id === queryParams.mini_grid_id || m.codigo === queryParams.mini_grid_id);
      const mgCodes = targetGrids.map(m => m.codigo);
      const mgIds = targetGrids.map(m => m.id);
      targetClients = targetClients.filter(c => mgIds.includes(c.mini_grid_id) || mgCodes.includes(c.mini_grid_codigo));
      targetOrders = targetOrders.filter(w => mgIds.includes(w.mini_grid_id) || mgCodes.includes(w.mini_grid_codigo));
    }

    const totalKwp = targetGrids.reduce((acc, m) => acc + (m.capacidade_kwp || 0), 0);
    const totalBat = targetGrids.reduce((acc, m) => acc + (m.capacidade_bateria_kwh || 0), 0);
    // Coeficientes unificados e partilhados com o relatório executivo (125 kWh/kWp e 105 MT/kWp)
    const totalKwh = (totalKwp * 125.0).toFixed(1);
    const totalReceita = (totalKwp * 105.0).toFixed(2);
    const beneficiados = Math.round(targetClients.length * 61.6);

    return {
      total_mini_grids: targetGrids.length,
      total_clientes: targetClients.length,
      capacidade_instalada_kwp: totalKwp,
      capacidade_bateria_kwh: totalBat,
      energia_gerada_mes_kwh: parseFloat(totalKwh),
      taxa_disponibilidade_media: 98.8,
      ordens_trabalho_abertas: targetOrders.filter(w => w.estado !== 'resolvida').length,
      clientes_por_categoria: {
        uso_produtivo: targetClients.filter(c => c.categoria === 'uso_produtivo').length,
        residencial: targetClients.filter(c => c.categoria === 'residencial').length,
        comercial: targetClients.filter(c => c.categoria === 'comercial').length,
        servico_publico: targetClients.filter(c => c.categoria === 'servico_publico').length
      },
      tecnico: {
        energia: {
          total_kwh_consumido: parseFloat(totalKwh),
          geracao_solar_kwh: (totalKwp * 135.3).toFixed(1),
          perdas_tecnicas_pct: 6.8
        }
      },
      comercial: {
        financeiro: {
          receita_total_mzn: parseFloat(totalReceita),
          tarifa_media_kwh: 16.5,
          inadimplencia_pct: 3.2
        }
      },
      impacto_social_ambiental: {
        pessoas_beneficiadas: beneficiados,
        co2_evitado_toneladas: (totalKwp * 0.307).toFixed(1)
      }
    };
  }

  // Gera relatório executivo dinamicamente respeitando filtros e incluindo mini-redes criadas
  function getExecutiveReport(queryParams = {}) {
    let targetGrids = [...miniGrids];
    if (queryParams.mini_grid_id) {
      targetGrids = targetGrids.filter(m => m.id === queryParams.mini_grid_id || m.codigo === queryParams.mini_grid_id);
    }

    const periodoStr = queryParams.data_inicio && queryParams.data_fim
      ? `${queryParams.data_inicio} a ${queryParams.data_fim}`
      : 'Novembro 2026';

    return {
      periodo: periodoStr,
      mini_redes: targetGrids.map(mg => {
        const mgClients = clients.filter(c => c.mini_grid_id === mg.id || c.mini_grid_codigo === mg.codigo);
        // Preserva a contagem real mesmo quando vazia (evita reportar clientes inexistentes em mini-redes recém-criadas)
        const activos = mgClients.filter(c => c.estado === 'activo').length;
        const pueCount = mgClients.filter(c => c.categoria === 'uso_produtivo').length;
        return {
          id: mg.id,
          codigo: mg.codigo,
          nome: mg.nome,
          distrito: mg.distrito,
          provincia: mg.provincia,
          capacidade_kwp: mg.capacidade_kwp,
          capacidade_bateria_kwh: mg.capacidade_bateria_kwh,
          clientes_activos: activos,
          clientes_pue: pueCount,
          energia_consumida_kwh: (mg.capacidade_kwp * 125).toFixed(1),
          receita_total_mzn: (mg.capacidade_kwp * 105).toFixed(2),
          estado_operacional: mg.estado_operacional,
          uptime_percent: 99.2
        };
      })
    };
  }

  // GeoJSON para Leaflet Maps
  const miniGridsGIS = {
    type: 'FeatureCollection',
    features: miniGrids.map(mg => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [mg.longitude, mg.latitude] },
      properties: { ...mg, nome: mg.nome }
    }))
  };

  const clientsGIS = {
    type: 'FeatureCollection',
    features: clients.map(c => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [c.longitude, c.latitude] },
      properties: { ...c, nome: c.nome_completo }
    }))
  };

  /**
   * Fornece resposta simulada para chamadas à API quando em modo demonstração / Vercel
   * Mapeia rotas específicas antes de coleções genéricas e persiste alterações simuladas no estado local.
   */
  function getFallbackResponse(endpoint, options = {}) {
    const method = (options.method || 'GET').toUpperCase();
    const [pathPart, queryString] = endpoint.split('?');
    const cleanUrl = pathPart.replace(/\/+$/, '');

    // Extrai parâmetros de query caso existam
    const queryParams = {};
    if (queryString) {
      queryString.split('&').forEach(pair => {
        const [k, v] = pair.split('=');
        if (k) queryParams[decodeURIComponent(k)] = decodeURIComponent(v || '');
      });
    }

    // 1. Operações de Escrita (POST, PUT, PATCH, DELETE)
    if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
      let bodyData = null;
      if (options.body) {
        try {
          bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
        } catch (_) {
          bodyData = options.body;
        }
      }

      // a) Criar Mini-Rede (showNewMiniGridModal)
      if (cleanUrl === '/api/mini-grids' && method === 'POST') {
        const newMgId = '10000000-0000-0000-0000-' + String(Date.now()).slice(-12);
        const newCode = bodyData?.codigo || ('MR-MZ-' + String(miniGrids.length + 1).padStart(3, '0'));
        const createdMg = {
          id: newMgId,
          codigo: newCode,
          nome: bodyData?.nome || 'Nova Central Solar Comunitária',
          provincia: bodyData?.provincia || 'Maputo',
          distrito: bodyData?.distrito || 'Sede',
          localidade: bodyData?.localidade || 'Comunidade Rural',
          latitude: parseFloat(bodyData?.latitude) || -25.465,
          longitude: parseFloat(bodyData?.longitude) || 32.855,
          capacidade_kwp: parseFloat(bodyData?.capacidade_kwp) || 50.0,
          capacidade_bateria_kwh: parseFloat(bodyData?.capacidade_bateria_kwh) || 120.0,
          estado_operacional: bodyData?.estado_operacional || 'activa',
          data_comissionamento: bodyData?.data_comissionamento || new Date().toISOString().split('T')[0],
          total_clientes: 0,
          total_activos: 0
        };
        miniGrids.unshift(createdMg);
        miniGridsGIS.features.unshift({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [createdMg.longitude, createdMg.latitude] },
          properties: { ...createdMg, nome: createdMg.nome }
        });
        return { success: true, data: createdMg, message: 'Mini-rede cadastrada com sucesso no ambiente demonstrativo.' };
      }

      // b) Criar Cliente (showNewClientModal - resolve mini-rede selecionada com precisão e fornece nome ao GIS)
      if (cleanUrl === '/api/clients' && method === 'POST') {
        const selectedMg = miniGrids.find(m => m.id === bodyData?.mini_grid_id) || miniGrids[0];
        const newId = '30000000-0000-0000-0000-' + String(Date.now()).slice(-12);
        const newCode = 'CLI-' + String(clients.length + 1).padStart(4, '0');
        const createdClient = {
          id: newId,
          codigo: newCode,
          nome_completo: bodyData?.nome_completo || 'Novo Cliente Registado',
          documento_identificacao: bodyData?.documento_identificacao || '',
          contacto_principal: bodyData?.contacto_principal || '+258 84 000 0000',
          categoria: bodyData?.categoria || 'residencial',
          estado: 'activo',
          mini_grid_id: selectedMg.id,
          mini_grid_codigo: selectedMg.codigo,
          mini_grid_nome: selectedMg.nome,
          latitude: parseFloat(bodyData?.latitude) || selectedMg.latitude,
          longitude: parseFloat(bodyData?.longitude) || selectedMg.longitude,
          criado_em: new Date().toISOString()
        };
        clients.unshift(createdClient);
        clientsGIS.features.unshift({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [createdClient.longitude, createdClient.latitude] },
          properties: { ...createdClient, nome: createdClient.nome_completo }
        });
        return { success: true, data: createdClient, message: 'Cliente cadastrado com sucesso no ambiente demonstrativo.' };
      }

      // c) Nova Leitura (Resolve contador e valida leituras decrescentes)
      if (cleanUrl === '/api/readings' && method === 'POST') {
        const selectedMeter = meters.find(m => m.id === bodyData?.meter_id || m.numero_serie === bodyData?.meter_numero_serie) || meters[0];
        const submittedKwh = parseFloat(bodyData?.valor_kwh || 0);

        // Valida se a leitura é decrescente em relação ao último valor aceite (respeitando substituições de contador)
        const previousReadings = readings.filter(r => r.meter_id === selectedMeter.id || r.meter_numero_serie === selectedMeter.numero_serie);
        const latestKwh = previousReadings.length > 0
          ? previousReadings[0].valor_kwh
          : (selectedMeter.ultima_leitura || 0);

        const allowDecrease = bodyData?.ignorar_aviso_decrescente === true ||
          bodyData?.ignorar_aviso_decrescente === 'true' ||
          bodyData?.motivo_substituicao === 'troca_contador';

        if (submittedKwh < latestKwh && !allowDecrease) {
          return {
            success: false,
            error: `A leitura informada (${submittedKwh} kWh) é inferior à leitura acumulada anterior (${latestKwh} kWh). Habilite o controlo de leitura decrescente ou informe a substituição física do contador.`
          };
        }

        const createdReading = {
          id: 'r-' + String(readings.length + 1).padStart(2, '0'),
          meter_id: selectedMeter.id,
          meter_numero_serie: selectedMeter.numero_serie,
          client_nome: bodyData?.client_nome || selectedMeter.cliente_nome || 'Cliente Operacional',
          valor_kwh: submittedKwh,
          data_leitura: new Date().toISOString().split('T')[0],
          fonte: 'manual',
          validado: true
        };
        readings.unshift(createdReading);
        selectedMeter.ultima_leitura = submittedKwh;
        return { success: true, data: createdReading, message: 'Leitura registada com sucesso no ambiente demonstrativo.' };
      }

      // d) Nova Ordem de Trabalho (Resolve mini-rede selecionada pelo operador)
      if (cleanUrl === '/api/work-orders' && method === 'POST') {
        const selectedMg = miniGrids.find(m => m.id === bodyData?.mini_grid_id || m.codigo === bodyData?.mini_grid_codigo) || miniGrids[0];
        const nextNum = 'OT-2026-' + String(workOrders.length + 1).padStart(4, '0');
        const createdWO = {
          id: 'wo-' + String(workOrders.length + 1).padStart(2, '0'),
          numero_ordem: nextNum,
          codigo: nextNum,
          descricao: bodyData?.descricao || 'Manutenção Solicitada em Campo',
          titulo: bodyData?.descricao || 'Manutenção Solicitada em Campo',
          tipo: bodyData?.tipo || 'manutencao_preventiva',
          prioridade: bodyData?.prioridade || 'media',
          estado: 'aberta',
          mini_grid_id: selectedMg.id,
          mini_grid_codigo: selectedMg.codigo,
          tecnico_nome: bodyData?.tecnico_nome || 'Tomas Manhique',
          fotos_evidencia: [],
          created_at: new Date().toISOString().split('T')[0]
        };
        workOrders.unshift(createdWO);
        return { success: true, data: createdWO, message: 'Ordem de trabalho criada com sucesso no ambiente demonstrativo.' };
      }

      // e) Ação de Despacho/Atribuição de OT: /api/work-orders/:id/assign
      const woAssignMatch = cleanUrl.match(/^\/api\/work-orders\/([^/]+)\/assign$/);
      if (woAssignMatch && (method === 'PATCH' || method === 'POST')) {
        const targetId = woAssignMatch[1];
        const targetWO = workOrders.find(w => w.id === targetId || w.numero_ordem === targetId || w.codigo === targetId);
        if (targetWO) {
          targetWO.estado = 'atribuida';
          if (bodyData?.tecnico_id) {
            const foundTech = users.find(u => String(u.id) === String(bodyData.tecnico_id) || u.role === 'tecnico_campo');
            targetWO.tecnico_nome = foundTech ? foundTech.nome : 'Tomas Manhique (Técnico de Campo)';
          }
          if (bodyData?.data_conclusao_prevista) {
            targetWO.data_conclusao_prevista = bodyData.data_conclusao_prevista;
          }
          return { success: true, data: targetWO, message: 'Técnico de campo atribuído com sucesso.' };
        }
      }

      // f) Ação de Encerramento de OT: /api/work-orders/:id/close (Preserva evidências fotográficas)
      const woCloseMatch = cleanUrl.match(/^\/api\/work-orders\/([^/]+)\/close$/);
      if (woCloseMatch && (method === 'PATCH' || method === 'POST')) {
        const targetId = woCloseMatch[1];
        const targetWO = workOrders.find(w => w.id === targetId || w.numero_ordem === targetId || w.codigo === targetId);
        if (targetWO) {
          targetWO.estado = 'resolvida';
          if (bodyData?.solucao) targetWO.solucao = bodyData.solucao;
          if (bodyData?.assinatura_tecnico) targetWO.assinatura_tecnico = bodyData.assinatura_tecnico;
          if (bodyData?.fotos_evidencia) {
            targetWO.fotos_evidencia = Array.isArray(bodyData.fotos_evidencia) ? [...bodyData.fotos_evidencia] : [bodyData.fotos_evidencia];
          } else if (bodyData?.foto_url) {
            targetWO.fotos_evidencia = [bodyData.foto_url];
          }
          targetWO.fechado_em = new Date().toISOString();
          return { success: true, data: targetWO, message: 'Ordem de trabalho concluída e arquivada com sucesso.' };
        }
      }

      // g) Reconciliação de Pagamento: /api/payments/:id/reconcile
      const payReconcileMatch = cleanUrl.match(/^\/api\/payments\/([^/]+)\/reconcile$/);
      if (payReconcileMatch && method === 'POST') {
        const targetPayId = payReconcileMatch[1];
        const targetPay = payments.find(p => p.id === targetPayId || p.referencia_transacao === targetPayId || p.referencia === targetPayId);
        if (targetPay) {
          targetPay.reconciliado = true;
          targetPay.estado = 'confirmado';
          return { success: true, data: targetPay, message: 'Pagamento reconciliado com sucesso no ambiente demonstrativo.' };
        }
        return { success: false, error: 'Pagamento não encontrado para reconciliação.' };
      }

      // h) Atualização Genérica de Ordem de Trabalho
      const woMatch = cleanUrl.match(/^\/api\/work-orders\/([^/]+)$/);
      if (woMatch && (method === 'PATCH' || method === 'PUT')) {
        const targetId = woMatch[1];
        const targetWO = workOrders.find(w => w.id === targetId || w.numero_ordem === targetId || w.codigo === targetId);
        if (targetWO) {
          if (bodyData?.estado) targetWO.estado = bodyData.estado;
          if (bodyData?.tecnico_nome) targetWO.tecnico_nome = bodyData.tecnico_nome;
          return { success: true, data: targetWO, message: 'Ordem de trabalho atualizada com sucesso.' };
        }
      }

      // i) Registo de Pagamento (Resolve beneficiário por client_id e respeita auto_confirmar)
      if (cleanUrl === '/api/payments' && method === 'POST') {
        const targetClient = clients.find(c => String(c.id) === String(bodyData?.client_id));
        const clientName = targetClient ? targetClient.nome_completo : (bodyData?.client_nome || 'Consumidor Geral LECASU');
        const isAutoConfirmed = bodyData?.auto_confirmar === true || bodyData?.auto_confirmar === 'true';

        const createdPay = {
          id: 'p-' + String(payments.length + 1).padStart(2, '0'),
          client_id: bodyData?.client_id || (targetClient ? targetClient.id : null),
          referencia_transacao: bodyData?.referencia_transacao || 'PAY-2026-' + String(Date.now()).slice(-5),
          referencia: bodyData?.referencia_transacao || 'PAY-2026-' + String(Date.now()).slice(-5),
          client_nome: clientName,
          cliente_nome: clientName,
          valor: parseFloat(bodyData?.valor || bodyData?.valor_mzn || 0),
          valor_mzn: parseFloat(bodyData?.valor || bodyData?.valor_mzn || 0),
          canal: bodyData?.canal || 'mpesa',
          estado: isAutoConfirmed ? 'confirmado' : 'pendente',
          reconciliado: isAutoConfirmed,
          data_pagamento: new Date().toISOString().split('T')[0]
        };
        payments.unshift(createdPay);
        return { success: true, data: createdPay, message: 'Pagamento registado com sucesso no ambiente demonstrativo.' };
      }

      // Rejeita escritas não suportadas para que o formulário apresente o erro em vez de fechar
      return { success: false, error: 'Operação de escrita não suportada no ambiente demonstrativo.' };
    }

    // 2. Autenticação
    if (cleanUrl === '/api/auth/login') {
      return {
        success: true,
        data: {
          token: 'demo_pilot_token_lecasu_gridops',
          user: users[0]
        }
      };
    }

    // 3. Recursos Específicos e Aninhados (Mapeamento antes das coleções genéricas)

    // a) Activos de uma Mini-Rede: /api/mini-grids/:id/assets
    const mgAssetsMatch = cleanUrl.match(/^\/api\/mini-grids\/([^/]+)\/assets$/);
    if (mgAssetsMatch) {
      const mgId = mgAssetsMatch[1];
      const targetMg = miniGrids.find(m => m.id === mgId || m.codigo === mgId);
      const filteredAssets = targetMg ? assets.filter(a => a.mini_grid_codigo === targetMg.codigo || a.mini_grid_id === targetMg.id) : assets;
      return { success: true, data: filteredAssets };
    }

    // b) Detalhe de Activo Individual: /api/assets/:id
    const assetDetailMatch = cleanUrl.match(/^\/api\/assets\/([^/]+)$/);
    if (assetDetailMatch) {
      const aId = assetDetailMatch[1];
      const foundAsset = assets.find(a => a.id === aId || a.codigo === aId) || assets[0];
      return { success: true, data: foundAsset };
    }

    // c) Detalhe de Mini-Rede Individual: /api/mini-grids/:id (excluindo gis)
    const mgDetailMatch = cleanUrl.match(/^\/api\/mini-grids\/([^/]+)$/);
    if (mgDetailMatch && mgDetailMatch[1] !== 'gis') {
      const mgId = mgDetailMatch[1];
      const foundMg = miniGrids.find(m => m.id === mgId || m.codigo === mgId) || miniGrids[0];
      return { success: true, data: foundMg };
    }

    // d) Detalhe de Cliente Individual: /api/clients/:id (excluindo gis)
    const clientDetailMatch = cleanUrl.match(/^\/api\/clients\/([^/]+)$/);
    if (clientDetailMatch && clientDetailMatch[1] !== 'gis') {
      const cId = clientDetailMatch[1];
      const foundClient = clients.find(c => c.id === cId || c.codigo === cId) || clients[0];
      return { success: true, data: foundClient };
    }

    // e) Detalhe de Contador Individual: /api/meters/:id
    const meterDetailMatch = cleanUrl.match(/^\/api\/meters\/([^/]+)$/);
    if (meterDetailMatch) {
      const mId = meterDetailMatch[1];
      const foundMeter = meters.find(m => m.id === mId || m.numero_serie === mId) || meters[0];
      return { success: true, data: foundMeter };
    }

    // f) Detalhe de Ordem de Trabalho Individual: /api/work-orders/:id
    const woDetailMatch = cleanUrl.match(/^\/api\/work-orders\/([^/]+)$/);
    if (woDetailMatch) {
      const wId = woDetailMatch[1];
      const foundWo = workOrders.find(w => w.id === wId || w.numero_ordem === wId || w.codigo === wId) || workOrders[0];
      return { success: true, data: foundWo };
    }

    // 4. Relatórios Oficiais (Dashboard e Executivo dinâmicos com suporte a filtros)
    if (cleanUrl === '/api/reports/dashboard') return { success: true, data: getDashboardReport(queryParams) };
    if (cleanUrl === '/api/reports/executive') return { success: true, data: getExecutiveReport(queryParams) };

    // 5. Camadas GeoJSON para Leaflet Maps
    if (cleanUrl === '/api/mini-grids/gis') return { success: true, data: miniGridsGIS };
    if (cleanUrl === '/api/clients/gis') return { success: true, data: clientsGIS };

    // 6. Coleções Principais
    if (cleanUrl === '/api/mini-grids') return { success: true, data: miniGrids };
    if (cleanUrl === '/api/clients') return { success: true, data: clients };
    if (cleanUrl === '/api/meters') return { success: true, data: meters };
    if (cleanUrl === '/api/readings') return { success: true, data: readings };
    if (cleanUrl === '/api/payments') return { success: true, data: payments };
    if (cleanUrl === '/api/assets') return { success: true, data: assets };
    if (cleanUrl === '/api/work-orders') return { success: true, data: workOrders };
    if (cleanUrl === '/api/tariffs') return { success: true, data: tariffs };
    if (cleanUrl === '/api/users') return { success: true, data: users };

    // 7. Telemetria IoT de Inversores
    if (cleanUrl === '/api/telemetry/overview' || cleanUrl.startsWith('/api/telemetry')) {
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
    getDashboardReport,
    getExecutiveReport,
    miniGridsGIS,
    clientsGIS,
    getFallbackResponse
  };

})(window);
