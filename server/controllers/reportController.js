/**
 * LECASU GridOps - Controlador de Relatórios, Indicadores e Exportações
 * 
 * Implementa a agregação de indicadores técnicos, comerciais, financeiros,
 * de operação & manutenção (O&M), e métricas de impacto socioeconómico e ambiental.
 * Suporta também exportação nativa em CSV com BOM UTF-8 para Microsoft Excel.
 */

const { query } = require('../config/db');
const { success, error } = require('../utils/response');

/**
 * Função utilitária para escapar campos no formato RFC 4180 CSV
 */
function escapeCsvField(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converte um array de objetos para string CSV com delimitador vírgula
 */
function jsonToCsv(headers, rows) {
  const headerLine = headers.map(h => escapeCsvField(h.label)).join(',');
  const lines = rows.map(row => {
    return headers.map(h => escapeCsvField(row[h.key])).join(',');
  });
  // Adiciona BOM UTF-8 (\uFEFF) para garantir abertura correta no Microsoft Excel
  return '\uFEFF' + [headerLine, ...lines].join('\r\n');
}

/**
 * Retorna o painel consolidado de métricas e indicadores de desempenho e impacto.
 * GET /api/reports/dashboard
 */
async function getDashboardMetrics(req, res) {
  try {
    const { mini_grid_id, data_inicio, data_fim } = req.query;

    const mgFilter = mini_grid_id ? 'WHERE id = $1' : '';
    const mgParams = mini_grid_id ? [mini_grid_id] : [];

    // 1. Métricas Técnicas e Capacidade
    const mgSql = `
      SELECT 
        COUNT(*)::int AS total_mini_grids,
        COUNT(*) FILTER (WHERE estado_operacional = 'activa')::int AS activas,
        COUNT(*) FILTER (WHERE estado_operacional = 'instalacao')::int AS em_instalacao,
        COUNT(*) FILTER (WHERE estado_operacional = 'planeada')::int AS planeadas,
        COUNT(*) FILTER (WHERE estado_operacional = 'indisponivel')::int AS indisponiveis,
        COUNT(*) FILTER (WHERE estado_operacional = 'suspensa')::int AS suspensas,
        COALESCE(SUM(capacidade_kwp), 0)::numeric AS total_capacidade_kwp,
        COALESCE(SUM(capacidade_bateria_kwh), 0)::numeric AS total_bateria_kwh
      FROM mini_grids
      ${mgFilter}
    `;
    const mgRes = await query(mgSql, mgParams);
    const techStats = mgRes.rows[0];

    // Ativos
    const assetFilter = mini_grid_id ? 'WHERE mini_grid_id = $1' : '';
    const assetSql = `
      SELECT 
        COUNT(*)::int AS total_ativos,
        COUNT(*) FILTER (WHERE estado = 'operacional')::int AS operacionais,
        COUNT(*) FILTER (WHERE estado = 'degradado')::int AS degradados,
        COUNT(*) FILTER (WHERE estado = 'inoperante')::int AS inoperantes
      FROM assets
      ${assetFilter}
    `;
    const assetRes = await query(assetSql, mgParams);
    const assetStats = assetRes.rows[0];

    // Leituras de Energia
    let readingConditions = [];
    let readingParams = [];
    let rIdx = 1;

    if (mini_grid_id) {
      readingConditions.push(`m.mini_grid_id = $${rIdx++}`);
      readingParams.push(mini_grid_id);
    }
    if (data_inicio) {
      readingConditions.push(`r.data_leitura >= $${rIdx++}`);
      readingParams.push(data_inicio);
    }
    if (data_fim) {
      readingConditions.push(`r.data_leitura <= $${rIdx++}`);
      readingParams.push(data_fim);
    }

    const readingWhere = readingConditions.length > 0 ? `WHERE ${readingConditions.join(' AND ')}` : '';
    const readingSql = `
      SELECT 
        COUNT(r.id)::int AS total_leituras,
        COALESCE(SUM(r.valor_kwh), 0)::numeric AS total_kwh_consumido
      FROM readings r
      JOIN meters m ON r.meter_id = m.id
      ${readingWhere}
    `;
    const readingRes = await query(readingSql, readingParams);
    const energyStats = readingRes.rows[0];

    // Cálculo de perdas técnicas estimadas e geração estimada
    const kwhConsumido = parseFloat(energyStats.total_kwh_consumido) || 0;
    const taxaPerdasEstimadaPct = 10.5; // Padrão rural moçambicano de perdas na rede de baixa tensão
    const perdasTecnicasKwh = parseFloat((kwhConsumido * (taxaPerdasEstimadaPct / 100)).toFixed(2));
    const geracaoEstimadaKwh = parseFloat((kwhConsumido + perdasTecnicasKwh).toFixed(2));

    // 2. Métricas Comerciais e Clientes
    const clientFilter = mini_grid_id ? 'WHERE mini_grid_id = $1' : '';
    const clientSql = `
      SELECT 
        COUNT(*)::int AS total_clientes,
        COUNT(*) FILTER (WHERE estado = 'activo')::int AS activos,
        COUNT(*) FILTER (WHERE estado = 'suspenso')::int AS suspensos,
        COUNT(*) FILTER (WHERE estado = 'desligado')::int AS desligados,
        COUNT(*) FILTER (WHERE categoria = 'residencial')::int AS residenciais,
        COUNT(*) FILTER (WHERE categoria = 'comercial')::int AS comerciais,
        COUNT(*) FILTER (WHERE categoria = 'uso_produtivo')::int AS uso_produtivo,
        COUNT(*) FILTER (WHERE categoria = 'servico_publico')::int AS servico_publico,
        COUNT(*) FILTER (WHERE categoria = 'institucional')::int AS institucionais,
        COUNT(*) FILTER (WHERE categoria = 'telecomunicacoes')::int AS telecomunicacoes
      FROM clients
      ${clientFilter}
    `;
    const clientRes = await query(clientSql, mgParams);
    const clientStats = clientRes.rows[0];

    // 3. Métricas Financeiras e Pagamentos
    let payConditions = [];
    let payParams = [];
    let pIdx = 1;

    if (mini_grid_id) {
      payConditions.push(`c.mini_grid_id = $${pIdx++}`);
      payParams.push(mini_grid_id);
    }
    if (data_inicio) {
      payConditions.push(`p.data_pagamento >= $${pIdx++}`);
      payParams.push(data_inicio);
    }
    if (data_fim) {
      payConditions.push(`p.data_pagamento <= $${pIdx++}`);
      payParams.push(data_fim);
    }

    const payWhere = payConditions.length > 0 ? `WHERE ${payConditions.join(' AND ')}` : '';
    const paySql = `
      SELECT 
        COUNT(p.id)::int AS total_transacoes,
        COALESCE(SUM(p.valor) FILTER (WHERE p.estado = 'confirmado'), 0)::numeric AS receita_total_mzn,
        COALESCE(SUM(p.valor) FILTER (WHERE p.estado = 'confirmado' AND p.reconciliado = TRUE), 0)::numeric AS receita_reconciliada_mzn,
        COALESCE(SUM(p.valor) FILTER (WHERE p.estado = 'pendente'), 0)::numeric AS receita_pendente_mzn,
        COALESCE(SUM(p.valor) FILTER (WHERE p.canal = 'mpesa' AND p.estado = 'confirmado'), 0)::numeric AS receita_mpesa,
        COALESCE(SUM(p.valor) FILTER (WHERE p.canal = 'emola' AND p.estado = 'confirmado'), 0)::numeric AS receita_emola,
        COALESCE(SUM(p.valor) FILTER (WHERE p.canal = 'mkesh' AND p.estado = 'confirmado'), 0)::numeric AS receita_mkesh,
        COALESCE(SUM(p.valor) FILTER (WHERE p.canal = 'numerario' AND p.estado = 'confirmado'), 0)::numeric AS receita_numerario,
        COALESCE(SUM(p.valor) FILTER (WHERE p.canal = 'transferencia' AND p.estado = 'confirmado'), 0)::numeric AS receita_transferencia
      FROM payments p
      JOIN clients c ON p.client_id = c.id
      ${payWhere}
    `;
    const payRes = await query(paySql, payParams);
    const payStats = payRes.rows[0];

    const receitaTotal = parseFloat(payStats.receita_total_mzn) || 0;
    const receitaReconciliada = parseFloat(payStats.receita_reconciliada_mzn) || 0;
    const taxaCobrancaPct = receitaTotal > 0 ? parseFloat(((receitaReconciliada / receitaTotal) * 100).toFixed(1)) : 100.0;
    const clientesActivos = parseInt(clientStats.activos, 10) || 0;
    const arpuMzn = clientesActivos > 0 ? parseFloat((receitaTotal / clientesActivos).toFixed(2)) : 0;

    // 4. Métricas de Operação & Manutenção (O&M)
    let woConditions = [];
    let woParams = [];
    let wIdx = 1;

    if (mini_grid_id) {
      woConditions.push(`w.mini_grid_id = $${wIdx++}`);
      woParams.push(mini_grid_id);
    }
    if (data_inicio) {
      woConditions.push(`w.criado_em >= $${wIdx++}`);
      woParams.push(data_inicio);
    }
    if (data_fim) {
      woConditions.push(`w.criado_em <= $${wIdx++}`);
      woParams.push(data_fim);
    }

    const woWhere = woConditions.length > 0 ? `WHERE ${woConditions.join(' AND ')}` : '';
    const woSql = `
      SELECT 
        COUNT(*)::int AS total_ordens,
        COUNT(*) FILTER (WHERE estado = 'aberta')::int AS abertas,
        COUNT(*) FILTER (WHERE estado = 'atribuida')::int AS atribuidas,
        COUNT(*) FILTER (WHERE estado = 'em_execucao')::int AS em_execucao,
        COUNT(*) FILTER (WHERE estado = 'resolvida')::int AS resolvidas,
        COUNT(*) FILTER (WHERE estado = 'cancelada')::int AS canceladas,
        COUNT(*) FILTER (WHERE prioridade = 'urgente')::int AS urgentes,
        COUNT(*) FILTER (WHERE prioridade = 'alta')::int AS alta_prioridade,
        COALESCE(AVG(EXTRACT(EPOCH FROM (encerrado_em - criado_em)) / 3600) FILTER (WHERE estado = 'resolvida' AND encerrado_em IS NOT NULL), 0)::numeric AS mttr_horas
      FROM work_orders w
      ${woWhere}
    `;
    const woRes = await query(woSql, woParams);
    const woStats = woRes.rows[0];

    // 5. Indicadores de Impacto Social e Ambiental (Normas de Eletrificação Rural de Moçambique)
    const residenciais = parseInt(clientStats.residenciais, 10) || 0;
    const usoProdutivo = parseInt(clientStats.uso_produtivo, 10) || 0;
    const servicosPublicos = (parseInt(clientStats.servico_publico, 10) || 0) + (parseInt(clientStats.institucionais, 10) || 0);
    
    // Média de 5 pessoas por agregado familiar rural em Moçambique
    const pessoasBeneficiadas = residenciais * 5;
    // Estimativa conservadora de 35% de agregados chefiados por mulheres em zonas rurais
    const familiasChefiadasMulheres = Math.round(residenciais * 0.35);
    // 0.28 litros de diesel evitados por cada kWh solar fotovoltaico gerado
    const dieselEvitadoLitros = parseFloat((kwhConsumido * 0.28).toFixed(1));
    // 0.8 kg de CO2 evitado por kWh solar fotovoltaico (em toneladas)
    const co2EvitadoToneladas = parseFloat(((kwhConsumido * 0.8) / 1000).toFixed(2));

    return success(res, {
      filtros: {
        mini_grid_id: mini_grid_id || null,
        data_inicio: data_inicio || null,
        data_fim: data_fim || null
      },
      tecnico: {
        mini_redes: techStats,
        ativos: assetStats,
        energia: {
          total_kwh_consumido: kwhConsumido,
          perdas_tecnicas_kwh: perdasTecnicasKwh,
          perdas_tecnicas_pct: taxaPerdasEstimadaPct,
          geracao_estimada_kwh: geracaoEstimadaKwh,
          total_leituras: parseInt(energyStats.total_leituras, 10)
        }
      },
      comercial: {
        clientes: clientStats,
        financeiro: {
          receita_total_mzn: receitaTotal,
          receita_reconciliada_mzn: receitaReconciliada,
          receita_pendente_mzn: parseFloat(payStats.receita_pendente_mzn) || 0,
          taxa_cobranca_pct: taxaCobrancaPct,
          arpu_mzn: arpuMzn,
          por_canal: {
            mpesa: parseFloat(payStats.receita_mpesa) || 0,
            emola: parseFloat(payStats.receita_emola) || 0,
            mkesh: parseFloat(payStats.receita_mkesh) || 0,
            numerario: parseFloat(payStats.receita_numerario) || 0,
            transferencia: parseFloat(payStats.receita_transferencia) || 0
          }
        }
      },
      manutencao: {
        total_ordens: woStats.total_ordens,
        abertas: woStats.abertas,
        atribuidas: woStats.atribuidas,
        em_execucao: woStats.em_execucao,
        resolvidas: woStats.resolvidas,
        canceladas: woStats.canceladas,
        urgentes: woStats.urgentes,
        alta_prioridade: woStats.alta_prioridade,
        mttr_horas: parseFloat(parseFloat(woStats.mttr_horas).toFixed(1))
      },
      impacto_social_ambiental: {
        pessoas_beneficiadas: pessoasBeneficiadas,
        familias_chefiadas_mulheres: familiasChefiadasMulheres,
        negocios_pue_ativos: usoProdutivo,
        infraestruturas_comunitarias: servicosPublicos,
        diesel_evitado_litros: dieselEvitadoLitros,
        co2_evitado_toneladas: co2EvitadoToneladas
      }
    });

  } catch (err) {
    console.error('[reportController] Erro ao obter métricas do dashboard:', err);
    return error(res, 'Erro ao consolidar métricas e relatórios do sistema', 500);
  }
}

/**
 * Retorna relatório executivo estruturado com desagregação por mini-rede.
 * GET /api/reports/executive
 */
async function getExecutiveReport(req, res) {
  try {
    const { mini_grid_id, data_inicio, data_fim } = req.query;

    const mgFilter = mini_grid_id ? 'WHERE mg.id = $1' : '';
    const mgParams = mini_grid_id ? [mini_grid_id] : [];

    const sql = `
      SELECT 
        mg.id,
        mg.codigo,
        mg.nome,
        mg.provincia,
        mg.distrito,
        mg.localidade,
        mg.capacidade_kwp,
        mg.capacidade_bateria_kwh,
        mg.estado_operacional,
        mg.data_comissionamento,
        COUNT(DISTINCT c.id)::int AS total_clientes,
        COUNT(DISTINCT c.id) FILTER (WHERE c.estado = 'activo')::int AS clientes_activos,
        COUNT(DISTINCT c.id) FILTER (WHERE c.categoria = 'uso_produtivo' AND c.estado = 'activo')::int AS clientes_pue,
        COUNT(DISTINCT ast.id)::int AS total_ativos,
        COUNT(DISTINCT wo.id) FILTER (WHERE wo.estado IN ('aberta', 'atribuida', 'em_execucao'))::int AS ordens_abertas,
        COALESCE(SUM(p.valor) FILTER (WHERE p.estado = 'confirmado'), 0)::numeric AS receita_total_mzn,
        COALESCE(SUM(p.valor) FILTER (WHERE p.estado = 'confirmado' AND p.reconciliado = TRUE), 0)::numeric AS receita_reconciliada_mzn,
        COALESCE(SUM(r.valor_kwh), 0)::numeric AS energia_consumida_kwh
      FROM mini_grids mg
      LEFT JOIN clients c ON c.mini_grid_id = mg.id
      LEFT JOIN assets ast ON ast.mini_grid_id = mg.id
      LEFT JOIN work_orders wo ON wo.mini_grid_id = mg.id
      LEFT JOIN payments p ON p.client_id = c.id
      LEFT JOIN meters m ON m.mini_grid_id = mg.id
      LEFT JOIN readings r ON r.meter_id = m.id
      ${mgFilter}
      GROUP BY mg.id, mg.codigo, mg.nome, mg.provincia, mg.distrito, mg.localidade, mg.capacidade_kwp, mg.capacidade_bateria_kwh, mg.estado_operacional, mg.data_comissionamento
      ORDER BY mg.codigo ASC
    `;

    const result = await query(sql, mgParams);

    return success(res, {
      data_emissao: new Date().toISOString(),
      filtros: {
        mini_grid_id: mini_grid_id || null,
        data_inicio: data_inicio || null,
        data_fim: data_fim || null
      },
      total_mini_redes: result.rows.length,
      mini_redes: result.rows
    });
  } catch (err) {
    console.error('[reportController] Erro ao gerar relatório executivo:', err);
    return error(res, 'Erro interno ao gerar relatório executivo', 500);
  }
}

/**
 * Exporta dados de entidades para CSV compatível com Microsoft Excel (BOM UTF-8).
 * GET /api/reports/export/csv
 * Query: type = 'clients' | 'payments' | 'readings' | 'work_orders' | 'kpis'
 */
async function exportCSV(req, res) {
  try {
    const { type = 'clients', mini_grid_id, data_inicio, data_fim } = req.query;

    const todayStr = new Date().toISOString().slice(0, 10);
    let csvData = '';
    let filename = `lecasu_gridops_${type}_${todayStr}.csv`;

    switch (type.toLowerCase()) {
      case 'clients': {
        const conditions = [];
        const params = [];
        let idx = 1;
        if (mini_grid_id) {
          conditions.push(`c.mini_grid_id = $${idx++}`);
          params.push(mini_grid_id);
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const sql = `
          SELECT 
            c.codigo,
            c.nome_completo,
            c.categoria,
            c.documento_identificacao,
            c.contacto_principal,
            c.estado,
            c.latitude,
            c.longitude,
            mg.nome AS mini_rede_nome,
            mg.codigo AS mini_rede_codigo,
            to_char(c.criado_em, 'YYYY-MM-DD HH24:MI:SS') AS data_cadastro
          FROM clients c
          JOIN mini_grids mg ON c.mini_grid_id = mg.id
          ${where}
          ORDER BY c.codigo ASC
        `;
        const resDb = await query(sql, params);
        const headers = [
          { key: 'codigo', label: 'Código Cliente' },
          { key: 'nome_completo', label: 'Nome Completo' },
          { key: 'categoria', label: 'Categoria' },
          { key: 'documento_identificacao', label: 'Documento ID' },
          { key: 'contacto_principal', label: 'Contacto' },
          { key: 'estado', label: 'Estado' },
          { key: 'mini_rede_codigo', label: 'Cód. Mini-Rede' },
          { key: 'mini_rede_nome', label: 'Mini-Rede' },
          { key: 'latitude', label: 'Latitude' },
          { key: 'longitude', label: 'Longitude' },
          { key: 'data_cadastro', label: 'Data Cadastro' }
        ];
        csvData = jsonToCsv(headers, resDb.rows);
        break;
      }

      case 'payments': {
        const conditions = [];
        const params = [];
        let idx = 1;
        if (mini_grid_id) {
          conditions.push(`c.mini_grid_id = $${idx++}`);
          params.push(mini_grid_id);
        }
        if (data_inicio) {
          conditions.push(`p.data_pagamento >= $${idx++}`);
          params.push(data_inicio);
        }
        if (data_fim) {
          conditions.push(`p.data_pagamento <= $${idx++}`);
          params.push(data_fim);
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const sql = `
          SELECT 
            p.referencia_transacao,
            c.codigo AS cliente_codigo,
            c.nome_completo AS cliente_nome,
            mg.nome AS mini_rede_nome,
            p.valor,
            p.canal,
            p.estado,
            CASE WHEN p.reconciliado THEN 'SIM' ELSE 'NÃO' END AS reconciliado,
            to_char(p.data_pagamento, 'YYYY-MM-DD HH24:MI:SS') AS data_pagamento
          FROM payments p
          JOIN clients c ON p.client_id = c.id
          JOIN mini_grids mg ON c.mini_grid_id = mg.id
          ${where}
          ORDER BY p.data_pagamento DESC
        `;
        const resDb = await query(sql, params);
        const headers = [
          { key: 'referencia_transacao', label: 'Referência Transação' },
          { key: 'cliente_codigo', label: 'Cód. Cliente' },
          { key: 'cliente_nome', label: 'Nome Cliente' },
          { key: 'mini_rede_nome', label: 'Mini-Rede' },
          { key: 'valor', label: 'Valor (MZN)' },
          { key: 'canal', label: 'Canal' },
          { key: 'estado', label: 'Estado' },
          { key: 'reconciliado', label: 'Reconciliado' },
          { key: 'data_pagamento', label: 'Data Pagamento' }
        ];
        csvData = jsonToCsv(headers, resDb.rows);
        break;
      }

      case 'readings': {
        const conditions = [];
        const params = [];
        let idx = 1;
        if (mini_grid_id) {
          conditions.push(`m.mini_grid_id = $${idx++}`);
          params.push(mini_grid_id);
        }
        if (data_inicio) {
          conditions.push(`r.data_leitura >= $${idx++}`);
          params.push(data_inicio);
        }
        if (data_fim) {
          conditions.push(`r.data_leitura <= $${idx++}`);
          params.push(data_fim);
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const sql = `
          SELECT 
            m.numero_serie AS contador_serie,
            COALESCE(c.codigo, 'N/A') AS cliente_codigo,
            COALESCE(c.nome_completo, 'Sem cliente atribuído') AS cliente_nome,
            mg.nome AS mini_rede_nome,
            r.valor_kwh,
            r.tipo_origem,
            to_char(r.data_leitura, 'YYYY-MM-DD HH24:MI:SS') AS data_leitura,
            r.observacoes
          FROM readings r
          JOIN meters m ON r.meter_id = m.id
          JOIN mini_grids mg ON m.mini_grid_id = mg.id
          LEFT JOIN clients c ON m.client_id = c.id
          ${where}
          ORDER BY r.data_leitura DESC
        `;
        const resDb = await query(sql, params);
        const headers = [
          { key: 'contador_serie', label: 'Contador (Série)' },
          { key: 'cliente_codigo', label: 'Cód. Cliente' },
          { key: 'cliente_nome', label: 'Nome Cliente' },
          { key: 'mini_rede_nome', label: 'Mini-Rede' },
          { key: 'valor_kwh', label: 'Consumo (kWh)' },
          { key: 'tipo_origem', label: 'Origem Leitura' },
          { key: 'data_leitura', label: 'Data Leitura' },
          { key: 'observacoes', label: 'Observações' }
        ];
        csvData = jsonToCsv(headers, resDb.rows);
        break;
      }

      case 'work_orders':
      case 'work-orders': {
        const conditions = [];
        const params = [];
        let idx = 1;
        if (mini_grid_id) {
          conditions.push(`wo.mini_grid_id = $${idx++}`);
          params.push(mini_grid_id);
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const sql = `
          SELECT 
            wo.numero_ordem,
            mg.nome AS mini_rede_nome,
            wo.tipo,
            wo.prioridade,
            wo.estado,
            wo.descricao,
            COALESCE(u.nome, 'Não atribuído') AS tecnico_responsavel,
            wo.solucao,
            to_char(wo.criado_em, 'YYYY-MM-DD HH24:MI:SS') AS data_abertura,
            to_char(wo.encerrado_em, 'YYYY-MM-DD HH24:MI:SS') AS data_fecho
          FROM work_orders wo
          JOIN mini_grids mg ON wo.mini_grid_id = mg.id
          LEFT JOIN users u ON wo.tecnico_id = u.id
          ${where}
          ORDER BY wo.criado_em DESC
        `;
        const resDb = await query(sql, params);
        const headers = [
          { key: 'numero_ordem', label: 'Nº Ordem' },
          { key: 'mini_rede_nome', label: 'Mini-Rede' },
          { key: 'tipo', label: 'Tipo' },
          { key: 'prioridade', label: 'Prioridade' },
          { key: 'estado', label: 'Estado' },
          { key: 'descricao', label: 'Descrição' },
          { key: 'tecnico_responsavel', label: 'Técnico Responsável' },
          { key: 'solucao', label: 'Solução Registada' },
          { key: 'data_abertura', label: 'Data Abertura' },
          { key: 'data_fecho', label: 'Data Encerramento' }
        ];
        csvData = jsonToCsv(headers, resDb.rows);
        break;
      }

      case 'kpis': {
        const sql = `
          SELECT 
            mg.codigo,
            mg.nome,
            mg.provincia,
            mg.distrito,
            mg.capacidade_kwp,
            mg.capacidade_bateria_kwh,
            mg.estado_operacional,
            COUNT(DISTINCT c.id) FILTER (WHERE c.estado = 'activo')::int AS clientes_activos,
            COUNT(DISTINCT c.id) FILTER (WHERE c.categoria = 'uso_produtivo' AND c.estado = 'activo')::int AS clientes_pue,
            COALESCE(SUM(p.valor) FILTER (WHERE p.estado = 'confirmado'), 0)::numeric AS receita_total_mzn,
            COALESCE(SUM(r.valor_kwh), 0)::numeric AS energia_consumida_kwh
          FROM mini_grids mg
          LEFT JOIN clients c ON c.mini_grid_id = mg.id
          LEFT JOIN payments p ON p.client_id = c.id
          LEFT JOIN meters m ON m.mini_grid_id = mg.id
          LEFT JOIN readings r ON r.meter_id = m.id
          GROUP BY mg.id, mg.codigo, mg.nome, mg.provincia, mg.distrito, mg.capacidade_kwp, mg.capacidade_bateria_kwh, mg.estado_operacional
          ORDER BY mg.codigo ASC
        `;
        const resDb = await query(sql);
        const headers = [
          { key: 'codigo', label: 'Código' },
          { key: 'nome', label: 'Nome Mini-Rede' },
          { key: 'provincia', label: 'Província' },
          { key: 'distrito', label: 'Distrito' },
          { key: 'capacidade_kwp', label: 'Capacidade (kWp)' },
          { key: 'capacidade_bateria_kwh', label: 'Bateria (kWh)' },
          { key: 'estado_operacional', label: 'Estado' },
          { key: 'clientes_activos', label: 'Clientes Activos' },
          { key: 'clientes_pue', label: 'Negócios PUE' },
          { key: 'receita_total_mzn', label: 'Receita Total (MZN)' },
          { key: 'energia_consumida_kwh', label: 'Energia Vendida (kWh)' }
        ];
        csvData = jsonToCsv(headers, resDb.rows);
        break;
      }

      default:
        return error(res, `Tipo de exportação inválido. Opções: clients, payments, readings, work_orders, kpis`, 400);
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvData);

  } catch (err) {
    console.error('[reportController] Erro ao exportar CSV:', err);
    return error(res, 'Erro interno ao exportar relatório em CSV', 500);
  }
}

module.exports = {
  getDashboardMetrics,
  getExecutiveReport,
  exportCSV
};

