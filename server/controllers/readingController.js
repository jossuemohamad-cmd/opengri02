/**
 * LECASU GridOps - Controlador de Leituras e Consumos de Energia
 * 
 * Implementa o registo individual de leituras, detecção de anomalias (leituras decrescentes
 * e desvios anormais de consumo), histórico de consumo e importação em lote via Streams.
 */

const readline = require('readline');
const { Readable } = require('stream');
const { query, getClient } = require('../config/db');
const { success, error } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');

const VALID_ORIGINS = ['manual', 'ficheiro', 'api'];

/**
 * Listagem paginada e filtrada de leituras de contadores.
 * GET /api/readings
 */
async function listReadings(req, res) {
  try {
    const {
      meter_id,
      client_id,
      mini_grid_id,
      tipo_origem,
      data_inicio,
      data_fim,
      page = 1,
      limit = 25
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];
    let pIdx = 1;

    if (meter_id) {
      conditions.push(`r.meter_id = $${pIdx++}`);
      params.push(meter_id);
    }

    if (client_id) {
      conditions.push(`m.client_id = $${pIdx++}`);
      params.push(client_id);
    }

    if (mini_grid_id) {
      conditions.push(`m.mini_grid_id = $${pIdx++}`);
      params.push(mini_grid_id);
    }

    if (tipo_origem) {
      conditions.push(`r.tipo_origem = $${pIdx++}`);
      params.push(tipo_origem.toLowerCase().trim());
    }

    if (data_inicio) {
      conditions.push(`r.data_leitura >= $${pIdx++}`);
      params.push(new Date(data_inicio));
    }

    if (data_fim) {
      conditions.push(`r.data_leitura <= $${pIdx++}`);
      params.push(new Date(data_fim));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) AS total 
      FROM readings r
      JOIN meters m ON r.meter_id = m.id
      ${whereClause};
    `;
    const countRes = await query(countSql, params);
    const totalRecords = parseInt(countRes.rows[0].total, 10);

    const selectParams = [...params, limitNum, offset];
    const sql = `
      SELECT 
        r.*,
        m.numero_serie AS meter_numero_serie,
        m.tecnologia AS meter_tecnologia,
        c.id AS client_id,
        c.codigo AS client_codigo,
        c.nome_completo AS client_nome,
        u.nome AS registado_por_nome
      FROM readings r
      JOIN meters m ON r.meter_id = m.id
      LEFT JOIN clients c ON m.client_id = c.id
      LEFT JOIN users u ON r.utilizador_id = u.id
      ${whereClause}
      ORDER BY r.data_leitura DESC
      LIMIT $${pIdx++} OFFSET $${pIdx++};
    `;

    const result = await query(sql, selectParams);

    return success(res, result.rows, {
      total: totalRecords,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalRecords / limitNum)
    });
  } catch (err) {
    return error(res, 'Erro ao consultar leituras.', 500, err.message);
  }
}

/**
 * Consulta de detalhe de uma leitura específica.
 * GET /api/readings/:id
 */
async function getReadingById(req, res) {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        r.*,
        m.numero_serie AS meter_numero_serie,
        m.tecnologia AS meter_tecnologia,
        m.estado AS meter_estado,
        c.id AS client_id,
        c.codigo AS client_codigo,
        c.nome_completo AS client_nome,
        u.nome AS registado_por_nome,
        u.email AS registado_por_email
      FROM readings r
      JOIN meters m ON r.meter_id = m.id
      LEFT JOIN clients c ON m.client_id = c.id
      LEFT JOIN users u ON r.utilizador_id = u.id
      WHERE r.id = $1;
    `;

    const result = await query(sql, [id]);
    if (result.rowCount === 0) {
      return error(res, 'Leitura não encontrada.', 404);
    }

    return success(res, result.rows[0]);
  } catch (err) {
    return error(res, 'Erro ao consultar leitura.', 500, err.message);
  }
}

/**
 * Registo unitário de leitura com detecção de anomalias e cálculo de consumo delta.
 * POST /api/readings
 */
async function createReading(req, res) {
  const dbClient = await getClient();

  try {
    const {
      meter_id,
      valor_kwh,
      data_leitura = new Date().toISOString(),
      tipo_origem = 'manual',
      observacoes,
      ignorar_aviso_decrescente = false
    } = req.body;

    if (!meter_id || valor_kwh === undefined || valor_kwh === null) {
      return error(res, 'Os campos meter_id e valor_kwh são obrigatórios.', 400);
    }

    const nValor = parseFloat(valor_kwh);
    if (isNaN(nValor) || nValor < 0) {
      return error(res, 'O valor da leitura deve ser um número positivo ou zero.', 400);
    }

    const cleanOrigin = tipo_origem.toLowerCase().trim();
    if (!VALID_ORIGINS.includes(cleanOrigin)) {
      return error(res, `Origem inválida. Origens aceites: ${VALID_ORIGINS.join(', ')}.`, 400);
    }

    await dbClient.query('BEGIN');

    // 1. Verifica se o contador existe
    const meterRes = await dbClient.query('SELECT * FROM meters WHERE id = $1;', [meter_id]);
    if (meterRes.rowCount === 0) {
      await dbClient.query('ROLLBACK');
      return error(res, 'Contador não encontrado.', 404);
    }
    const meter = meterRes.rows[0];

    // 2. Consulta a leitura imediatamente anterior do mesmo contador
    const lastReadingRes = await dbClient.query(`
      SELECT valor_kwh, data_leitura
      FROM readings
      WHERE meter_id = $1
      ORDER BY data_leitura DESC
      LIMIT 1;
    `, [meter_id]);

    let deltaKwh = 0;
    const anomalias = [];

    if (lastReadingRes.rowCount > 0) {
      const lastValor = parseFloat(lastReadingRes.rows[0].valor_kwh);

      // Verificação de leitura decrescente (possível fraude, troca física ou erro de inserção)
      if (nValor < lastValor) {
        if (!ignorar_aviso_decrescente) {
          await dbClient.query('ROLLBACK');
          return error(res, `Aviso de inconsistência: Leitura actual (${nValor} kWh) é inferior à anterior (${lastValor} kWh). Caso seja intencional (ex: substituição de contador), confirme com 'ignorar_aviso_decrescente: true'.`, 400, {
            tipo_alerta: 'leitura_decrescente',
            leitura_anterior: lastValor,
            leitura_submetida: nValor
          });
        }
        anomalias.push(`Leitura decrescente registada com aprovação (Anterior: ${lastValor} kWh)`);
      } else {
        deltaKwh = nValor - lastValor;
      }

      // Verificação de pico anormal (3x acima da média histórica)
      const avgRes = await dbClient.query(`
        SELECT AVG(valor_kwh) as media_kwh
        FROM readings
        WHERE meter_id = $1;
      `, [meter_id]);

      const mediaHistorica = parseFloat(avgRes.rows[0].media_kwh || '0');
      if (mediaHistorica > 0 && deltaKwh > (mediaHistorica * 3)) {
        anomalias.push(`Consumo anormal detectado: Delta de ${deltaKwh.toFixed(2)} kWh excede 3x a média histórica.`);
      }
    } else {
      deltaKwh = nValor; // Primeira leitura comissionada
    }

    // 3. Insere o registo de leitura
    const insertSql = `
      INSERT INTO readings (
        meter_id,
        valor_kwh,
        data_leitura,
        tipo_origem,
        utilizador_id,
        observacoes
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const finalObs = observacoes
      ? (anomalias.length > 0 ? `${observacoes} | Alertas: ${anomalias.join('; ')}` : observacoes)
      : (anomalias.length > 0 ? `Alertas: ${anomalias.join('; ')}` : null);

    const insertParams = [
      meter_id,
      nValor,
      new Date(data_leitura),
      cleanOrigin,
      req.user ? req.user.id : null,
      finalObs
    ];

    const result = await dbClient.query(insertSql, insertParams);
    const newReading = result.rows[0];

    // 4. Atualiza o contador com a última comunicação
    await dbClient.query(`
      UPDATE meters
      SET ultima_comunicacao = CURRENT_TIMESTAMP
      WHERE id = $1;
    `, [meter_id]);

    // 5. Registo na auditoria
    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'INSERT',
      entity: 'readings',
      entityId: newReading.id,
      newValues: { ...newReading, delta_kwh: deltaKwh, anomalias },
      req
    });

    await dbClient.query('COMMIT');

    return success(res, {
      ...newReading,
      delta_kwh: deltaKwh,
      anomalias
    }, 'Leitura registada com sucesso.', 201);
  } catch (err) {
    await dbClient.query('ROLLBACK');
    return error(res, 'Erro ao registar leitura.', 500, err.message);
  } finally {
    dbClient.release();
  }
}

/**
 * Importação em lote de leituras via CSV utilizando Node.js Streams (readline).
 * Processa linha a linha de forma eficiente sem sobrecarregar a memória.
 * POST /api/readings/import-csv
 * 
 * Formato esperado no body (payload JSON com conteúdo CSV ou string direta):
 * numero_serie,valor_kwh,data_leitura,observacoes
 */
async function importReadingsCSV(req, res) {
  const { csv_content } = req.body;

  if (!csv_content || typeof csv_content !== 'string') {
    return error(res, 'O campo csv_content contendo os dados CSV em texto é obrigatório.', 400);
  }

  const dbClient = await getClient();

  const relatorio = {
    total_linhas: 0,
    inseridas: 0,
    ignoradas: 0,
    erros: []
  };

  try {
    const stream = Readable.from(csv_content);
    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity
    });

    let lineNumber = 0;
    let isFirstLine = true;

    await dbClient.query('BEGIN');

    for await (const line of rl) {
      lineNumber++;
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Detecta e ignora cabeçalho
      if (isFirstLine && (trimmed.toLowerCase().includes('numero_serie') || trimmed.toLowerCase().includes('serial'))) {
        isFirstLine = false;
        continue;
      }
      isFirstLine = false;

      relatorio.total_linhas++;

      // Divide por vírgula ou ponto-e-vírgula
      const parts = trimmed.split(/[,;]/).map(p => p.trim());
      if (parts.length < 2) {
        relatorio.erros.push({ linha: lineNumber, motivo: 'Linha com campos insuficientes.' });
        relatorio.ignoradas++;
        continue;
      }

      const [numeroSerie, valorStr, dataStr, obsStr] = parts;
      const valorKwh = parseFloat(valorStr);

      if (isNaN(valorKwh) || valorKwh < 0) {
        relatorio.erros.push({ linha: lineNumber, motivo: `Valor inválido: ${valorStr}` });
        relatorio.ignoradas++;
        continue;
      }

      // Consulta o contador pelo número de série
      const meterRes = await dbClient.query(
        'SELECT id FROM meters WHERE numero_serie = $1 LIMIT 1;',
        [numeroSerie]
      );

      if (meterRes.rowCount === 0) {
        relatorio.erros.push({ linha: lineNumber, motivo: `Contador não encontrado: ${numeroSerie}` });
        relatorio.ignoradas++;
        continue;
      }

      const meterId = meterRes.rows[0].id;
      const dataLeitura = dataStr ? new Date(dataStr) : new Date();

      const insertSql = `
        INSERT INTO readings (
          meter_id,
          valor_kwh,
          data_leitura,
          tipo_origem,
          utilizador_id,
          observacoes
        ) VALUES ($1, $2, $3, 'ficheiro', $4, $5);
      `;

      await dbClient.query(insertSql, [
        meterId,
        valorKwh,
        dataLeitura,
        req.user ? req.user.id : null,
        obsStr || 'Importação em lote CSV'
      ]);

      relatorio.inseridas++;
    }

    await dbClient.query('COMMIT');

    // Registo de auditoria da importação
    await logAudit({
      userId: req.user ? req.user.id : null,
      action: 'BATCH_IMPORT',
      entity: 'readings',
      entityId: `csv-batch-${Date.now()}`,
      newValues: { inseridas: relatorio.inseridas, erros_contagem: relatorio.erros.length },
      req
    });

    return success(res, relatorio, `Importação concluída: ${relatorio.inseridas} leituras inseridas com sucesso.`);
  } catch (err) {
    await dbClient.query('ROLLBACK');
    return error(res, 'Falha durante o processamento do ficheiro CSV.', 500, err.message);
  } finally {
    dbClient.release();
  }
}

module.exports = {
  listReadings,
  getReadingById,
  createReading,
  importReadingsCSV
};

