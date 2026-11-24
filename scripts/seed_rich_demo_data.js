/**
/**
 * LECASU GridOps - Script de Carga de Dados Fictícios Ricos e Realistas
 * Popula todas as tabelas: mini_grids, assets, clients, contracts, meters, readings, payments, work_orders, audit_logs.
 */

const { pool } = require('../server/config/db');

async function seedData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('⚡ A carregar dados de demonstração no LECASU GridOps...');

    // 1. Mini-Redes Adicionais (Inhambane, Sofala, Nampula, Cabo Delgado)
    const miniGrids = [
      {
        id: '10000000-0000-0000-0000-000000000005',
        codigo: 'MR-INH-001',
        nome: 'Central Solar Fotovoltaica de Morrumbene',
        provincia: 'Inhambane',
        distrito: 'Morrumbene',
        localidade: 'Morrumbene Sede',
        latitude: -23.66500000,
        longitude: 35.31800000,
        capacidade_kwp: 85.00,
        capacidade_bateria_kwh: 210.00,
        estado_operacional: 'activa',
        data_comissionamento: '2025-07-15'
      },
      {
        id: '10000000-0000-0000-0000-000000000006',
        codigo: 'MR-SOF-001',
        nome: 'Mini-Rede Solar Híbrida de Dondo',
        provincia: 'Sofala',
        distrito: 'Dondo',
        localidade: 'Savane',
        latitude: -19.61200000,
        longitude: 34.74300000,
        capacidade_kwp: 120.00,
        capacidade_bateria_kwh: 300.00,
        estado_operacional: 'activa',
        data_comissionamento: '2025-09-01'
      },
      {
        id: '10000000-0000-0000-0000-000000000007',
        codigo: 'MR-NPL-001',
        nome: 'Central Solar Comunitária de Ribáuè',
        provincia: 'Nampula',
        distrito: 'Ribáuè',
        localidade: 'Iapala',
        latitude: -14.95800000,
        longitude: 38.30500000,
        capacidade_kwp: 95.00,
        capacidade_bateria_kwh: 240.00,
        estado_operacional: 'activa',
        data_comissionamento: '2025-11-20'
      },
      {
        id: '10000000-0000-0000-0000-000000000008',
        codigo: 'MR-CDG-001',
        nome: 'Mini-Rede Solar de Metuge',
        provincia: 'Cabo Delgado',
        distrito: 'Metuge',
        localidade: 'Mieze',
        latitude: -13.00400000,
        longitude: 40.32500000,
        capacidade_kwp: 70.00,
        capacidade_bateria_kwh: 180.00,
        estado_operacional: 'activa',
        data_comissionamento: '2026-01-10'
      }
    ];

    for (const mg of miniGrids) {
      await client.query(`
        INSERT INTO mini_grids (id, codigo, nome, provincia, distrito, localidade, latitude, longitude, capacidade_kwp, capacidade_bateria_kwh, estado_operacional, data_comissionamento)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          capacidade_kwp = EXCLUDED.capacidade_kwp,
          capacidade_bateria_kwh = EXCLUDED.capacidade_bateria_kwh,
          estado_operacional = EXCLUDED.estado_operacional;
      `, [mg.id, mg.codigo, mg.nome, mg.provincia, mg.distrito, mg.localidade, mg.latitude, mg.longitude, mg.capacidade_kwp, mg.capacidade_bateria_kwh, mg.estado_operacional, mg.data_comissionamento]);
    }
    console.log('✅ Mini-redes expandidas para 8 províncias.');

    // 2. Activos Técnicos para as novas centrais
    const assets = [
      // Morrumbene (MR-INH-001)
      { id: '20000000-0000-0000-0000-000000000008', codigo: 'AST-MR005-INV-01', mini_grid_id: '10000000-0000-0000-0000-000000000005', classe: 'inversor', modelo: 'SUN2000-50KTL', fabricante: 'Huawei FusionSolar', numero_serie: 'HW-INV-MOR-01', data_instalacao: '2025-07-01', garantia_ate: '2030-07-01', estado: 'operacional' },
      { id: '20000000-0000-0000-0000-000000000009', codigo: 'AST-MR005-BAT-01', mini_grid_id: '10000000-0000-0000-0000-000000000005', classe: 'bateria', modelo: 'LUNA2000-200KWH', fabricante: 'Huawei Energy Storage', numero_serie: 'HW-BAT-MOR-01', data_instalacao: '2025-07-01', garantia_ate: '2035-07-01', estado: 'operacional' },
      { id: '20000000-0000-0000-0000-000000000010', codigo: 'AST-MR005-QDR-01', mini_grid_id: '10000000-0000-0000-0000-000000000005', classe: 'quadro', modelo: 'PrismaSeT P 400A', fabricante: 'Schneider Electric', numero_serie: 'SCH-QDR-MOR-01', data_instalacao: '2025-07-05', garantia_ate: '2030-07-05', estado: 'operacional' },

      // Dondo (MR-SOF-001)
      { id: '20000000-0000-0000-0000-000000000011', codigo: 'AST-MR006-INV-01', mini_grid_id: '10000000-0000-0000-0000-000000000006', classe: 'inversor', modelo: 'Sunny Tripower Core2 110kW', fabricante: 'SMA Solar', numero_serie: 'SMA-INV-DON-01', data_instalacao: '2025-08-20', garantia_ate: '2030-08-20', estado: 'operacional' },
      { id: '20000000-0000-0000-0000-000000000012', codigo: 'AST-MR006-BAT-01', mini_grid_id: '10000000-0000-0000-0000-000000000006', classe: 'bateria', modelo: 'BESS LiFePO4 300kWh', fabricante: 'CATL Energy', numero_serie: 'CTL-BAT-DON-01', data_instalacao: '2025-08-20', garantia_ate: '2035-08-20', estado: 'operacional' },
      { id: '20000000-0000-0000-0000-000000000013', codigo: 'AST-MR006-TRF-01', mini_grid_id: '10000000-0000-0000-0000-000000000006', classe: 'transformador', modelo: '160kVA 33/0.4kV', fabricante: 'EFACEC', numero_serie: 'EFA-TRF-DON-01', data_instalacao: '2025-08-25', garantia_ate: '2030-08-25', estado: 'operacional' },

      // Ribáuè (MR-NPL-001)
      { id: '20000000-0000-0000-0000-000000000014', codigo: 'AST-MR007-INV-01', mini_grid_id: '10000000-0000-0000-0000-000000000007', classe: 'inversor', modelo: 'Tauro ECO 100-3-D', fabricante: 'Fronius', numero_serie: 'FR-INV-RIB-01', data_instalacao: '2025-11-10', garantia_ate: '2030-11-10', estado: 'operacional' },
      { id: '20000000-0000-0000-0000-000000000015', codigo: 'AST-MR007-BAT-01', mini_grid_id: '10000000-0000-0000-0000-000000000007', classe: 'bateria', modelo: 'Battery-Box Commercial 240kWh', fabricante: 'BYD', numero_serie: 'BYD-BAT-RIB-01', data_instalacao: '2025-11-10', garantia_ate: '2035-11-10', estado: 'operacional' },

      // Metuge (MR-CDG-001)
      { id: '20000000-0000-0000-0000-000000000016', codigo: 'AST-MR008-INV-01', mini_grid_id: '10000000-0000-0000-0000-000000000008', classe: 'inversor', modelo: 'SUN2000-60KTL-M0', fabricante: 'Huawei FusionSolar', numero_serie: 'HW-INV-MET-01', data_instalacao: '2026-01-05', garantia_ate: '2031-01-05', estado: 'operacional' },
      { id: '20000000-0000-0000-0000-000000000017', codigo: 'AST-MR008-BAT-01', mini_grid_id: '10000000-0000-0000-0000-000000000008', classe: 'bateria', modelo: 'LUNA2000-180KWH', fabricante: 'Huawei Energy Storage', numero_serie: 'HW-BAT-MET-01', data_instalacao: '2026-01-05', garantia_ate: '2036-01-05', estado: 'operacional' }
    ];

    for (const a of assets) {
      await client.query(`
        INSERT INTO assets (id, codigo, mini_grid_id, classe, modelo, fabricante, numero_serie, data_instalacao, garantia_ate, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET estado = EXCLUDED.estado;
      `, [a.id, a.codigo, a.mini_grid_id, a.classe, a.modelo, a.fabricante, a.numero_serie, a.data_instalacao, a.garantia_ate, a.estado]);
    }
    console.log('✅ Activos técnicos populados.');

    // 3. Clientes Diversificados (PUEs, Comerciais, Residenciais, Serviços Públicos)
    const clients = [
      // Morrumbene
      { id: '30000000-0000-0000-0000-000000000016', codigo: 'MR005-PUE-0001', mini_grid_id: '10000000-0000-0000-0000-000000000005', nome_completo: 'Câmara Frigorífica de Pesca Morrumbene', doc: '400582910482P', tel: '+258 84 999 5501', lat: -23.6645, lon: 35.3175, cat: 'uso_produtivo', estado: 'activo' },
      { id: '30000000-0000-0000-0000-000000000017', codigo: 'MR005-PUB-0001', mini_grid_id: '10000000-0000-0000-0000-000000000005', nome_completo: 'Centro de Saúde Rural com Vacinas', doc: '900582910482S', tel: '+258 82 999 5502', lat: -23.6655, lon: 35.3185, cat: 'servico_publico', estado: 'activo' },
      { id: '30000000-0000-0000-0000-000000000018', codigo: 'MR005-COM-0001', mini_grid_id: '10000000-0000-0000-0000-000000000005', nome_completo: 'Padaria Solar Pão Quente', doc: '110682910482M', tel: '+258 84 999 5503', lat: -23.6640, lon: 35.3190, cat: 'comercial', estado: 'activo' },
      { id: '30000000-0000-0000-0000-000000000019', codigo: 'MR005-RES-0001', mini_grid_id: '10000000-0000-0000-0000-000000000005', nome_completo: 'Anabela Lourenço Matsinhe', doc: '110782910482F', tel: '+258 84 999 5504', lat: -23.6660, lon: 35.3170, cat: 'residencial', estado: 'activo' },

      // Dondo
      { id: '30000000-0000-0000-0000-000000000020', codigo: 'MR006-PUE-0001', mini_grid_id: '10000000-0000-0000-0000-000000000006', nome_completo: 'Oficina de Carpintaria e Soldadura Savane', doc: '400682910482C', tel: '+258 84 111 6601', lat: -19.6115, lon: 34.7425, cat: 'uso_produtivo', estado: 'activo' },
      { id: '30000000-0000-0000-0000-000000000021', codigo: 'MR006-PUE-0002', mini_grid_id: '10000000-0000-0000-0000-000000000006', nome_completo: 'Moagem e Descasque de Arroz Dondo', doc: '400782910482A', tel: '+258 84 111 6602', lat: -19.6125, lon: 34.7435, cat: 'uso_produtivo', estado: 'activo' },
      { id: '30000000-0000-0000-0000-000000000022', codigo: 'MR006-PUB-0001', mini_grid_id: '10000000-0000-0000-0000-000000000006', nome_completo: 'Escola Secundária Geral de Dondo', doc: '900682910482E', tel: '+258 82 111 6603', lat: -19.6110, lon: 34.7440, cat: 'servico_publico', estado: 'activo' },
      { id: '30000000-0000-0000-0000-000000000023', codigo: 'MR006-RES-0001', mini_grid_id: '10000000-0000-0000-0000-000000000006', nome_completo: 'Joaquim Alberto Chissano', doc: '110882910482J', tel: '+258 84 111 6604', lat: -19.6130, lon: 34.7420, cat: 'residencial', estado: 'activo' },

      // Ribáuè
      { id: '30000000-0000-0000-0000-000000000024', codigo: 'MR007-PUE-0001', mini_grid_id: '10000000-0000-0000-0000-000000000007', nome_completo: 'Moageira Estrela do Norte - Iapala', doc: '400882910482M', tel: '+258 84 222 7701', lat: -14.9575, lon: 38.3045, cat: 'uso_produtivo', estado: 'activo' },
      { id: '30000000-0000-0000-0000-000000000025', codigo: 'MR007-COM-0001', mini_grid_id: '10000000-0000-0000-0000-000000000007', nome_completo: 'Barbearia e Salão de Beleza Moderno', doc: '110982910482S', tel: '+258 84 222 7702', lat: -14.9585, lon: 38.3055, cat: 'comercial', estado: 'activo' },
      { id: '30000000-0000-0000-0000-000000000026', codigo: 'MR007-PUB-0001', mini_grid_id: '10000000-0000-0000-0000-000000000007', nome_completo: 'Posto de Saúde Comunitário de Iapala', doc: '900782910482P', tel: '+258 82 222 7703', lat: -14.9570, lon: 38.3060, cat: 'servico_publico', estado: 'activo' },
      { id: '30000000-0000-0000-0000-000000000027', codigo: 'MR007-RES-0001', mini_grid_id: '10000000-0000-0000-0000-000000000007', nome_completo: 'Faustino Muendane Nhaduate', doc: '111082910482N', tel: '+258 84 222 7704', lat: -14.9590, lon: 38.3040, cat: 'residencial', estado: 'activo' },

      // Metuge
      { id: '30000000-0000-0000-0000-000000000028', codigo: 'MR008-PUE-0001', mini_grid_id: '10000000-0000-0000-0000-000000000008', nome_completo: 'Bomba Solar de Captação e Irrigação Mieze', doc: '400982910482B', tel: '+258 84 333 8801', lat: -13.0035, lon: 40.3255, cat: 'uso_produtivo', estado: 'activo' },
      { id: '30000000-0000-0000-0000-000000000029', codigo: 'MR008-PUB-0001', mini_grid_id: '10000000-0000-0000-0000-000000000008', nome_completo: 'Posto Policial e Iluminação Pública Mieze', doc: '900882910482L', tel: '+258 82 333 8802', lat: -13.0045, lon: 40.3245, cat: 'servico_publico', estado: 'activo' },
      { id: '30000000-0000-0000-0000-000000000030', codigo: 'MR008-RES-0001', mini_grid_id: '10000000-0000-0000-0000-000000000008', nome_completo: 'Zainabo Abdul Bachir', doc: '111182910482Z', tel: '+258 84 333 8803', lat: -13.0042, lon: 40.3260, cat: 'residencial', estado: 'activo' }
    ];

    for (const c of clients) {
      await client.query(`
        INSERT INTO clients (id, codigo, mini_grid_id, nome_completo, documento_identificacao, contacto_principal, latitude, longitude, categoria, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          nome_completo = EXCLUDED.nome_completo,
          categoria = EXCLUDED.categoria,
          estado = EXCLUDED.estado;
      `, [c.id, c.codigo, c.mini_grid_id, c.nome_completo, c.doc, c.tel, c.lat, c.lon, c.cat, c.estado]);
    }
    console.log('✅ Clientes diversificados adicionados.');

    // 4. Contratos
    const contracts = [
      { id: '40000000-0000-0000-0000-000000000014', num: 'CTR-MR005-0001', client_id: '30000000-0000-0000-0000-000000000016', tipo: 'pre_pago', kva: 10.0, caucao: 4500.0, data: '2025-07-20' },
      { id: '40000000-0000-0000-0000-000000000015', num: 'CTR-MR005-0002', client_id: '30000000-0000-0000-0000-000000000017', tipo: 'pos_pago', kva: 5.0, caucao: 0.0, data: '2025-07-22' },
      { id: '40000000-0000-0000-0000-000000000016', num: 'CTR-MR005-0003', client_id: '30000000-0000-0000-0000-000000000018', tipo: 'pre_pago', kva: 4.0, caucao: 1500.0, data: '2025-07-25' },
      { id: '40000000-0000-0000-0000-000000000017', num: 'CTR-MR005-0004', client_id: '30000000-0000-0000-0000-000000000019', tipo: 'pre_pago', kva: 1.0, caucao: 500.0, data: '2025-07-28' },

      { id: '40000000-0000-0000-0000-000000000018', num: 'CTR-MR006-0001', client_id: '30000000-0000-0000-0000-000000000020', tipo: 'pre_pago', kva: 8.0, caucao: 3500.0, data: '2025-09-05' },
      { id: '40000000-0000-0000-0000-000000000019', num: 'CTR-MR006-0002', client_id: '30000000-0000-0000-0000-000000000021', tipo: 'pre_pago', kva: 12.0, caucao: 5000.0, data: '2025-09-08' },
      { id: '40000000-0000-0000-0000-000000000020', num: 'CTR-MR006-0003', client_id: '30000000-0000-0000-0000-000000000022', tipo: 'pos_pago', kva: 6.0, caucao: 0.0, data: '2025-09-10' },
      { id: '40000000-0000-0000-0000-000000000021', num: 'CTR-MR006-0004', client_id: '30000000-0000-0000-0000-000000000023', tipo: 'pre_pago', kva: 1.5, caucao: 500.0, data: '2025-09-12' },

      { id: '40000000-0000-0000-0000-000000000022', num: 'CTR-MR007-0001', client_id: '30000000-0000-0000-0000-000000000024', tipo: 'pre_pago', kva: 15.0, caucao: 6000.0, data: '2025-11-25' },
      { id: '40000000-0000-0000-0000-000000000023', num: 'CTR-MR007-0002', client_id: '30000000-0000-0000-0000-000000000025', tipo: 'pre_pago', kva: 3.0, caucao: 1200.0, data: '2025-11-28' },
      { id: '40000000-0000-0000-0000-000000000024', num: 'CTR-MR007-0003', client_id: '30000000-0000-0000-0000-000000000026', tipo: 'pos_pago', kva: 4.0, caucao: 0.0, data: '2025-12-01' },
      { id: '40000000-0000-0000-0000-000000000025', num: 'CTR-MR007-0004', client_id: '30000000-0000-0000-0000-000000000027', tipo: 'pre_pago', kva: 1.0, caucao: 500.0, data: '2025-12-05' },

      { id: '40000000-0000-0000-0000-000000000026', num: 'CTR-MR008-0001', client_id: '30000000-0000-0000-0000-000000000028', tipo: 'pre_pago', kva: 8.0, caucao: 3000.0, data: '2026-01-15' },
      { id: '40000000-0000-0000-0000-000000000027', num: 'CTR-MR008-0002', client_id: '30000000-0000-0000-0000-000000000029', tipo: 'pos_pago', kva: 3.0, caucao: 0.0, data: '2026-01-18' },
      { id: '40000000-0000-0000-0000-000000000028', num: 'CTR-MR008-0003', client_id: '30000000-0000-0000-0000-000000000030', tipo: 'pre_pago', kva: 1.0, caucao: 500.0, data: '2026-01-20' }
    ];

    for (const ctr of contracts) {
      await client.query(`
        INSERT INTO contracts (id, numero_contrato, client_id, tipo_tarifa, potencia_contratada_kva, valor_caucao, data_ativacao, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'activo')
        ON CONFLICT (id) DO NOTHING;
      `, [ctr.id, ctr.num, ctr.client_id, ctr.tipo, ctr.kva, ctr.caucao, ctr.data]);
    }
    console.log('✅ Contratos adicionados.');

    // 5. Contadores de Energia
    const meters = [
      { id: '50000000-0000-0000-0000-000000000011', serie: 'MTR-MR005-0001', mg: '10000000-0000-0000-0000-000000000005', cli: '30000000-0000-0000-0000-000000000016', tec: 'inteligente_prepago', data: '2025-07-20' },
      { id: '50000000-0000-0000-0000-000000000012', serie: 'MTR-MR005-0002', mg: '10000000-0000-0000-0000-000000000005', cli: '30000000-0000-0000-0000-000000000017', tec: 'digital', data: '2025-07-22' },
      { id: '50000000-0000-0000-0000-000000000013', serie: 'MTR-MR005-0003', mg: '10000000-0000-0000-0000-000000000005', cli: '30000000-0000-0000-0000-000000000018', tec: 'inteligente_prepago', data: '2025-07-25' },
      { id: '50000000-0000-0000-0000-000000000014', serie: 'MTR-MR005-0004', mg: '10000000-0000-0000-0000-000000000005', cli: '30000000-0000-0000-0000-000000000019', tec: 'inteligente_prepago', data: '2025-07-28' },

      { id: '50000000-0000-0000-0000-000000000015', serie: 'MTR-MR006-0001', mg: '10000000-0000-0000-0000-000000000006', cli: '30000000-0000-0000-0000-000000000020', tec: 'inteligente_prepago', data: '2025-09-05' },
      { id: '50000000-0000-0000-0000-000000000016', serie: 'MTR-MR006-0002', mg: '10000000-0000-0000-0000-000000000006', cli: '30000000-0000-0000-0000-000000000021', tec: 'inteligente_prepago', data: '2025-09-08' },
      { id: '50000000-0000-0000-0000-000000000017', serie: 'MTR-MR006-0003', mg: '10000000-0000-0000-0000-000000000006', cli: '30000000-0000-0000-0000-000000000022', tec: 'digital', data: '2025-09-10' },
      { id: '50000000-0000-0000-0000-000000000018', serie: 'MTR-MR006-0004', mg: '10000000-0000-0000-0000-000000000006', cli: '30000000-0000-0000-0000-000000000023', tec: 'inteligente_prepago', data: '2025-09-12' },

      { id: '50000000-0000-0000-0000-000000000019', serie: 'MTR-MR007-0001', mg: '10000000-0000-0000-0000-000000000007', cli: '30000000-0000-0000-0000-000000000024', tec: 'inteligente_prepago', data: '2025-11-25' },
      { id: '50000000-0000-0000-0000-000000000020', serie: 'MTR-MR007-0002', mg: '10000000-0000-0000-0000-000000000007', cli: '30000000-0000-0000-0000-000000000025', tec: 'inteligente_prepago', data: '2025-11-28' },
      { id: '50000000-0000-0000-0000-000000000021', serie: 'MTR-MR007-0003', mg: '10000000-0000-0000-0000-000000000007', cli: '30000000-0000-0000-0000-000000000026', tec: 'digital', data: '2025-12-01' },
      { id: '50000000-0000-0000-0000-000000000022', serie: 'MTR-MR007-0004', mg: '10000000-0000-0000-0000-000000000007', cli: '30000000-0000-0000-0000-000000000027', tec: 'inteligente_prepago', data: '2025-12-05' },

      { id: '50000000-0000-0000-0000-000000000023', serie: 'MTR-MR008-0001', mg: '10000000-0000-0000-0000-000000000008', cli: '30000000-0000-0000-0000-000000000028', tec: 'inteligente_prepago', data: '2026-01-15' },
      { id: '50000000-0000-0000-0000-000000000024', serie: 'MTR-MR008-0002', mg: '10000000-0000-0000-0000-000000000008', cli: '30000000-0000-0000-0000-000000000029', tec: 'digital', data: '2026-01-18' },
      { id: '50000000-0000-0000-0000-000000000025', serie: 'MTR-MR008-0003', mg: '10000000-0000-0000-0000-000000000008', cli: '30000000-0000-0000-0000-000000000030', tec: 'inteligente_prepago', data: '2026-01-20' },

      // Contadores em estoque para instalação
      { id: '50000000-0000-0000-0000-000000000026', serie: 'MTR-STOCK-001', mg: '10000000-0000-0000-0000-000000000001', cli: null, tec: 'inteligente_prepago', data: null },
      { id: '50000000-0000-0000-0000-000000000027', serie: 'MTR-STOCK-002', mg: '10000000-0000-0000-0000-000000000005', cli: null, tec: 'inteligente_prepago', data: null },
      { id: '50000000-0000-0000-0000-000000000028', serie: 'MTR-STOCK-003', mg: '10000000-0000-0000-0000-000000000006', cli: null, tec: 'digital', data: null }
    ];

    for (const m of meters) {
      await client.query(`
        INSERT INTO meters (id, numero_serie, mini_grid_id, client_id, tecnologia, estado, data_instalacao, ultima_comunicacao)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE SET client_id = EXCLUDED.client_id, estado = EXCLUDED.estado;
      `, [m.id, m.serie, m.mg, m.cli, m.tec, m.cli ? 'instalado' : 'em_estoque', m.data]);
    }
    console.log('✅ Contadores de energia atualizados.');

    // 6. Leituras de Consumo Realistas
    const readings = [
      { meter_id: '50000000-0000-0000-0000-000000000011', valor: 980.50, data: '2026-10-10 10:00:00+02', obs: 'Câmara frigorífica de peixe' },
      { meter_id: '50000000-0000-0000-0000-000000000012', valor: 420.00, data: '2026-10-10 10:30:00+02', obs: 'Centro de Saúde Morrumbene' },
      { meter_id: '50000000-0000-0000-0000-000000000013', valor: 750.30, data: '2026-10-10 11:00:00+02', obs: 'Padaria fornos e amassadeiras' },
      { meter_id: '50000000-0000-0000-0000-000000000014', valor: 85.20, data: '2026-10-10 11:30:00+02', obs: 'Residencial' },

      { meter_id: '50000000-0000-0000-0000-000000000015', valor: 1120.40, data: '2026-10-12 09:00:00+02', obs: 'Carpintaria serras e plainas' },
      { meter_id: '50000000-0000-0000-0000-000000000016', valor: 1650.00, data: '2026-10-12 09:30:00+02', obs: 'Descasque e moagem de arroz contínua' },
      { meter_id: '50000000-0000-0000-0000-000000000017', valor: 560.80, data: '2026-10-12 10:00:00+02', obs: 'Escola Dondo laboratório de informática' },
      { meter_id: '50000000-0000-0000-0000-000000000018', valor: 110.50, data: '2026-10-12 10:30:00+02', obs: 'Consumo familiar' },

      { meter_id: '50000000-0000-0000-0000-000000000019', valor: 2150.80, data: '2026-10-15 08:30:00+02', obs: 'Moageira Estrela do Norte alta rotação' },
      { meter_id: '50000000-0000-0000-0000-000000000020', valor: 310.20, data: '2026-10-15 09:00:00+02', obs: 'Barbearia e Salão' },
      { meter_id: '50000000-0000-0000-0000-000000000021', valor: 380.00, data: '2026-10-15 09:30:00+02', obs: 'Posto de Saúde Iapala' },
      { meter_id: '50000000-0000-0000-0000-000000000022', valor: 72.10, data: '2026-10-15 10:00:00+02', obs: 'Residencial' },

      { meter_id: '50000000-0000-0000-0000-000000000023', valor: 890.00, data: '2026-10-18 11:00:00+02', obs: 'Bomba solar de irrigação Mieze' },
      { meter_id: '50000000-0000-0000-0000-000000000024', valor: 240.50, data: '2026-10-18 11:30:00+02', obs: 'Posto Policial iluminação perimetral' },
      { meter_id: '50000000-0000-0000-0000-000000000025', valor: 65.40, data: '2026-10-18 12:00:00+02', obs: 'Família Mieze' }
    ];

    for (const r of readings) {
      await client.query(`
        INSERT INTO readings (meter_id, valor_kwh, data_leitura, tipo_origem, observacoes)
        VALUES ($1, $2, $3, 'api', $4);
      `, [r.meter_id, r.valor, r.data, r.obs]);
    }
    console.log('✅ Leituras de consumo registadas.');

    // 7. Pagamentos (Meticais - M-Pesa, e-Mola, Numerário)
    const payments = [
      { ref: 'MPESA-2026-MOR-01', cli: '30000000-0000-0000-0000-000000000016', val: 5500.00, canal: 'mpesa', conf: true, rec: true, data: '2026-10-20 09:15:00+02' },
      { ref: 'EMOLA-2026-MOR-02', cli: '30000000-0000-0000-0000-000000000018', val: 2800.00, canal: 'emola', conf: true, rec: true, data: '2026-10-21 14:30:00+02' },
      { ref: 'MPESA-2026-MOR-03', cli: '30000000-0000-0000-0000-000000000019', val: 450.00, canal: 'mpesa', conf: true, rec: false, data: '2026-10-29 16:45:00+02' },

      { ref: 'MPESA-2026-DON-01', cli: '30000000-0000-0000-0000-000000000020', val: 4200.00, canal: 'mpesa', conf: true, rec: true, data: '2026-10-22 10:00:00+02' },
      { ref: 'EMOLA-2026-DON-02', cli: '30000000-0000-0000-0000-000000000021', val: 7800.00, canal: 'emola', conf: true, rec: true, data: '2026-10-22 11:20:00+02' },
      { ref: 'TRANS-2026-DON-03', cli: '30000000-0000-0000-0000-000000000022', val: 3500.00, canal: 'transferencia', conf: true, rec: false, data: '2026-10-28 15:00:00+02' },
      { ref: 'NUMER-2026-DON-04', cli: '30000000-0000-0000-0000-000000000023', val: 500.00, canal: 'numerario', conf: true, rec: true, data: '2026-10-23 08:30:00+02' },

      { ref: 'MPESA-2026-RIB-01', cli: '30000000-0000-0000-0000-000000000024', val: 9600.00, canal: 'mpesa', conf: true, rec: true, data: '2026-10-24 13:10:00+02' },
      { ref: 'EMOLA-2026-RIB-02', cli: '30000000-0000-0000-0000-000000000025', val: 1200.00, canal: 'emola', conf: true, rec: false, data: '2026-10-29 17:30:00+02' },
      { ref: 'NUMER-2026-RIB-03', cli: '30000000-0000-0000-0000-000000000027', val: 400.00, canal: 'numerario', conf: true, rec: true, data: '2026-10-25 09:40:00+02' },

      { ref: 'MPESA-2026-MET-01', cli: '30000000-0000-0000-0000-000000000028', val: 3900.00, canal: 'mpesa', conf: true, rec: true, data: '2026-10-26 11:50:00+02' },
      { ref: 'EMOLA-2026-MET-02', cli: '30000000-0000-0000-0000-000000000030', val: 350.00, canal: 'emola', conf: true, rec: false, data: '2026-10-30 08:15:00+02' }
    ];

    for (const p of payments) {
      await client.query(`
        INSERT INTO payments (referencia_transacao, client_id, valor, canal, estado, reconciliado, data_pagamento)
        VALUES ($1, $2, $3, $4, 'confirmado', $5, $6)
        ON CONFLICT (referencia_transacao) DO UPDATE SET reconciliado = EXCLUDED.reconciliado;
      `, [p.ref, p.cli, p.val, p.canal, p.rec, p.data]);
    }
    console.log('✅ Pagamentos adicionados com transações reconciliadas e pendentes.');

    // 8. Ordens de Trabalho (Operação e Manutenção)
    const workOrders = [
      {
        num: 'OT-2026-000105',
        mg: '10000000-0000-0000-0000-000000000005',
        ast: '20000000-0000-0000-0000-000000000008',
        cli: null,
        tipo: 'preventiva',
        prio: 'media',
        desc: 'Manutenção semestral preventiva aos filtros de refrigeração e reaperto de barramentos no inversor de Morrumbene',
        tec: '00000000-0000-0000-0000-000000000003',
        estado: 'resolvida',
        sol: 'Filtros de ar lavados e substituídos. Binários de aperto verificados com torquímetro calibrado.',
        dt_c: '2026-10-15 08:00:00+02',
        dt_e: '2026-10-15 13:00:00+02'
      },
      {
        num: 'OT-2026-000106',
        mg: '10000000-0000-0000-0000-000000000006',
        ast: '20000000-0000-0000-0000-000000000013',
        cli: null,
        tipo: 'avaria',
        prio: 'urgente',
        desc: 'Disparo de proteção térmica no transformador de Savane após tempestade de vento e descargas atmosféricas',
        tec: '00000000-0000-0000-0000-000000000003',
        estado: 'em_execucao',
        sol: null,
        dt_c: '2026-10-29 16:30:00+02',
        dt_e: null
      },
      {
        num: 'OT-2026-000107',
        mg: '10000000-0000-0000-0000-000000000007',
        ast: null,
        cli: '30000000-0000-0000-0000-000000000024',
        tipo: 'nova_ligacao',
        prio: 'alta',
        desc: 'Ligação e instalação de ramal com contador trifásico STS para a Moageira Estrela do Norte em Iapala',
        tec: '00000000-0000-0000-0000-000000000003',
        estado: 'resolvida',
        sol: 'Ramal aéreo de 25 metros montado, contador trifásico configurado e testes com carga de moagem aprovados.',
        dt_c: '2026-10-20 09:00:00+02',
        dt_e: '2026-10-20 16:15:00+02'
      },
      {
        num: 'OT-2026-000108',
        mg: '10000000-0000-0000-0000-000000000008',
        ast: null,
        cli: '30000000-0000-0000-0000-000000000028',
        tipo: 'preventiva',
        prio: 'baixa',
        desc: 'Inspecção técnica de rotina e verificação do estado dos painéis fotovoltaicos dedicados à bomba de água de Mieze',
        tec: '00000000-0000-0000-0000-000000000003',
        estado: 'atribuida',
        sol: null,
        dt_c: '2026-10-30 08:00:00+02',
        dt_e: null
      },
      {
        num: 'OT-2026-000109',
        mg: '10000000-0000-0000-0000-000000000001',
        ast: null,
        cli: '30000000-0000-0000-0000-000000000005',
        tipo: 'avaria',
        prio: 'alta',
        desc: 'Alerta de queda de tensão noturna nos congeladores da Mercearia Boa Esperança em Calanga',
        tec: '00000000-0000-0000-0000-000000000003',
        estado: 'atribuida',
        sol: null,
        dt_c: '2026-10-30 11:20:00+02',
        dt_e: null
      }
    ];

    for (const wo of workOrders) {
      await client.query(`
        INSERT INTO work_orders (numero_ordem, mini_grid_id, asset_id, client_id, tipo, prioridade, descricao, tecnico_id, estado, solucao, criado_em, encerrado_em)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (numero_ordem) DO NOTHING;
      `, [wo.num, wo.mg, wo.ast, wo.cli, wo.tipo, wo.prio, wo.desc, wo.tec, wo.estado, wo.sol, wo.dt_c, wo.dt_e]);
    }
    console.log('✅ Ordens de serviço enriquecidas.');

    // 9. Registos Reais na Tabela audit_logs
    const auditLogs = [
      {
        user_id: '00000000-0000-0000-0000-000000000001',
        tabela: 'mini_grids',
        accao: 'INSERT',
        registo_id: 'MR-INH-001',
        dados_novos: { nome: 'Central Solar de Morrumbene', provincia: 'Inhambane', capacidade_kwp: 85.0 },
        criado_em: '2026-10-01 08:30:00+02'
      },
      {
        user_id: '00000000-0000-0000-0000-000000000001',
        tabela: 'mini_grids',
        accao: 'INSERT',
        registo_id: 'MR-SOF-001',
        dados_novos: { nome: 'Mini-Rede Solar de Dondo', provincia: 'Sofala', capacidade_kwp: 120.0 },
        criado_em: '2026-10-02 09:15:00+02'
      },
      {
        user_id: '00000000-0000-0000-0000-000000000004',
        tabela: 'tariffs',
        accao: 'UPDATE',
        registo_id: 'TAR-PUE-01',
        dados_novos: { valor_kwh_mzn: 6.50, descricao: 'Tarifa Bonificada para Usos Produtivos (PUE)' },
        criado_em: '2026-10-05 14:00:00+02'
      },
      {
        user_id: '00000000-0000-0000-0000-000000000005',
        tabela: 'clients',
        accao: 'INSERT',
        registo_id: 'MR005-PUE-0001',
        dados_novos: { nome: 'Câmara Frigorífica de Pesca Morrumbene', categoria: 'uso_produtivo' },
        criado_em: '2026-10-08 11:20:00+02'
      },
      {
        user_id: '00000000-0000-0000-0000-000000000005',
        tabela: 'contracts',
        accao: 'INSERT',
        registo_id: 'CTR-MR005-0001',
        dados_novos: { tipo_tarifa: 'pre_pago', potencia_kva: 10.0 },
        criado_em: '2026-10-08 11:45:00+02'
      },
      {
        user_id: '00000000-0000-0000-0000-000000000003',
        tabela: 'meters',
        accao: 'UPDATE',
        registo_id: 'MTR-MR005-0001',
        dados_novos: { client_id: '30000000-0000-0000-0000-000000000016', estado: 'instalado' },
        criado_em: '2026-10-10 10:15:00+02'
      },
      {
        user_id: '00000000-0000-0000-0000-000000000006',
        tabela: 'payments',
        accao: 'UPDATE',
        registo_id: 'MPESA-2026-MOR-01',
        dados_novos: { valor: 5500.00, reconciliado: true, canal: 'mpesa' },
        criado_em: '2026-10-21 16:00:00+02'
      },
      {
        user_id: '00000000-0000-0000-0000-000000000003',
        tabela: 'work_orders',
        accao: 'UPDATE',
        registo_id: 'OT-2026-000105',
        dados_novos: { estado: 'resolvida', solucao: 'Filtros de ar lavados e aperto calibrado' },
        criado_em: '2026-10-15 13:00:00+02'
      },
      {
        user_id: '00000000-0000-0000-0000-000000000002',
        tabela: 'work_orders',
        accao: 'UPDATE',
        registo_id: 'OT-2026-000106',
        dados_novos: { tecnico_id: '00000000-0000-0000-0000-000000000003', estado: 'em_execucao' },
        criado_em: '2026-10-29 16:35:00+02'
      },
      {
        user_id: '00000000-0000-0000-0000-000000000001',
        tabela: 'users',
        accao: 'UPDATE',
        registo_id: '00000000-0000-0000-0000-000000000005',
        dados_novos: { status: 'ativo', role: 'agente_comunitario' },
        criado_em: '2026-10-30 08:00:00+02'
      }
    ];

    for (const al of auditLogs) {
      await client.query(`
        INSERT INTO audit_logs (user_id, tabela_afetada, accao, registo_id, dados_antigos, dados_novos, criado_em)
        VALUES ($1, $2, $3, $4, NULL, $5, $6);
      `, [al.user_id, al.tabela, al.accao, al.registo_id, JSON.stringify(al.dados_novos), al.criado_em]);
    }
    console.log('✅ Trilha de auditoria (audit_logs) populada com registos cronológicos.');

    await client.query('COMMIT');
    console.log('🎉 Toda a base de dados do LECASU GridOps foi populada com sucesso!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao povoar dados:', err);
    throw err;
  } finally {
    client.release();
    pool.end();
  }
}

seedData();
