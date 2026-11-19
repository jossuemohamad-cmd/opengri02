/**
 * LECASU GridOps - Controlador de Telemetria de Inversores & Integração SolarMAN Pro
 *
 * Centraliza:
 * - Configuração de integração Cloud-to-Cloud (SolarMAN Open API & SolarMAN Pro Business)
 * - Cadastro e vinculação de Inversores / Dataloggers (Collectors) a Mini-Redes e Clientes
 * - Ingestão de telemetria em tempo real via Webhook IoT (POST /api/telemetry/ingest)
 * - Sincronização ativa com a nuvem SolarMAN (POST /api/telemetry/solarman/sync)
 * - Geração automática de Ordem de Trabalho (O&M) quando há alarme crítico ou SoC < 20%
 */

const crypto = require('crypto');
const { query, getClient } = require('../config/db');
const { success, error } = require('../utils/response');
const { logAudit } = require('../utils/auditLogger');
const { generateNextWorkOrderCode } = require('../utils/codeGenerator');

const DEFAULT_SOLARMAN_CONFIG = {
  orgName: 'Joswil',
  orgId: '10955391',
  accountEmail: 'jossuemohamad@gmail.com',
  apiBaseUrl: 'https://api.solarmanpv.com',
  proBaseUrl: 'https://globalpro.solarmanpv.com',
  appId: '',
  appSecret: '',
  bearerToken: '',
  webhookKey: 'LECASU-IOT-2026-KEY',
  autoSyncMinutes: 5,
  lastSyncAt: null
};

let initPromise = null;

/**
 * Garante de forma idempotente que a tabela inverter_telemetry, a configuração padrão
 * solarman_config em system_settings e o mapeamento inicial de inversores das mini-redes existem.
 */
async function ensureTelemetryInitialized() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    await query(`
      CREATE TABLE IF NOT EXISTS inverter_telemetry (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_sn VARCHAR(100) NOT NULL UNIQUE,
        logger_sn VARCHAR(100),
        provider VARCHAR(50) NOT NULL DEFAULT 'solarman',
        external_station_id VARCHAR(100),
        mini_grid_id UUID NOT NULL REFERENCES mini_grids(id) ON DELETE CASCADE,
        client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
        asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
        modelo_inversor VARCHAR(150),
        potencia_nominal_kw NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
        potencia_activa_kw NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        energia_hoje_kwh NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        energia_mes_kwh NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        energia_ano_kwh NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
        energia_total_kwh NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
        bateria_soc_pct NUMERIC(5, 2) NOT NULL DEFAULT 88.00,
        tensao_ac_v NUMERIC(6, 2) NOT NULL DEFAULT 230.00,
        corrente_ac_a NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
        frequencia_hz NUMERIC(5, 2) NOT NULL DEFAULT 50.00,
        tensao_dc_v NUMERIC(6, 2) NOT NULL DEFAULT 620.00,
        temperatura_c NUMERIC(5, 2) NOT NULL DEFAULT 38.50,
        estado_comunicacao VARCHAR(30) NOT NULL DEFAULT 'online',
        alerta_activo BOOLEAN NOT NULL DEFAULT FALSE,
        payload_bruto JSONB DEFAULT '{}'::jsonb,
        ultima_leitura TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(
      `
      INSERT INTO system_settings (chave, valor, descricao)
      VALUES ($1, $2::jsonb, $3)
      ON CONFLICT (chave) DO NOTHING;
      `,
      [
        'solarman_config',
        JSON.stringify(DEFAULT_SOLARMAN_CONFIG),
        'Configuração de integração Cloud-to-Cloud SolarMAN Pro / Open API e Webhook IoT de inversores'
      ]
    );

    const countRes = await query('SELECT COUNT(*)::int AS total FROM inverter_telemetry;');
    if (countRes.rows[0].total === 0) {
      await seedDefaultInvertersForMiniGrids();
    }
  })().catch((err) => {
    initPromise = null;
    throw err;
  });

  return initPromise;
}

/**
 * Semeia 1 inversor/datalogger por cada mini-rede existente na base de dados
 * quando inverter_telemetry estiver vazia.
 */
async function seedDefaultInvertersForMiniGrids() {
  const mgRes = await query(`
    SELECT id, codigo, nome, capacidade_kwp, capacidade_bateria_kwh, estado_operacional
    FROM mini_grids
    ORDER BY codigo ASC;
  `);

  const inverterCatalog = [
    'Deye SUN-80K-SG02HP3-EU (SolarMAN)',
    'Huawei SUN2000-100KTL-M2',
    'Deye SUN-50K-SG01HP3-EU (SolarMAN)',
    'SMA Sunny Tripower CORE1',
    'Sofar HYD 20KTL-3PH (SolarMAN)',
    'Growatt MAX 80KTL3 LV',
    'Solis S6-EH3P50K-H (SolarMAN)',
    'Huawei SUN2000-50KTL-M3'
  ];

  for (let i = 0; i < mgRes.rows.length; i++) {
    const mg = mgRes.rows[i];
    const cap = parseFloat(mg.capacidade_kwp) || 60;
    const isActiva = mg.estado_operacional === 'activa';
    const factor = isActiva ? 0.78 - ((i % 4) * 0.04) : 0.0;
    const activeKw = Number((cap * factor).toFixed(2));
    const dailyKwh = isActiva ? Number((cap * (4.9 - (i % 4) * 0.2)).toFixed(2)) : 0;
    const monthlyKwh = Number((dailyKwh * 28.5).toFixed(2));
    const annualKwh = Number((dailyKwh * 335).toFixed(2));
    const totalKwh = Number((annualKwh * 1.8).toFixed(2));
    const socPct = isActiva ? Math.min(98, 84 + (i * 2) % 14) : 48;
    const currentAc = Number((activeKw > 0 ? (activeKw * 1000) / (400 * 1.732) : 0).toFixed(2));

    const cleanCode = mg.codigo.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const deviceSn = `INV-${cleanCode}-${String(i + 1).padStart(2, '0')}`;
    const loggerSn = `LS4G-MZ-${String(202601 + i)}`;
    const model = inverterCatalog[i % inverterCatalog.length];

    const clientRes = await query(
      `SELECT id FROM clients WHERE mini_grid_id = $1 ORDER BY criado_em ASC LIMIT 1;`,
      [mg.id]
    );
    const assetRes = await query(
      `SELECT id FROM assets WHERE mini_grid_id = $1 AND classe = 'inversor' ORDER BY criado_em ASC LIMIT 1;`,
      [mg.id]
    );

    await query(
      `
      INSERT INTO inverter_telemetry (
        device_sn, logger_sn, provider, external_station_id,
        mini_grid_id, client_id, asset_id, modelo_inversor,
        potencia_nominal_kw, potencia_activa_kw,
        energia_hoje_kwh, energia_mes_kwh, energia_ano_kwh, energia_total_kwh,
        bateria_soc_pct, tensao_ac_v, corrente_ac_a, frequencia_hz, tensao_dc_v, temperatura_c,
        estado_comunicacao, alerta_activo, payload_bruto
      ) VALUES (
        $1, $2, 'solarman', $3,
        $4, $5, $6, $7,
        $8, $9,
        $10, $11, $12, $13,
        $14, $15, $16, 50.00, 625.00, $17,
        $18, FALSE, $19::jsonb
      )
      ON CONFLICT (device_sn) DO NOTHING;
      `,
      [
        deviceSn,
        loggerSn,
        `STN-${10955391 + i}`,
        mg.id,
        clientRes.rows[0]?.id || null,
        assetRes.rows[0]?.id || null,
        model,
        cap,
        activeKw,
        dailyKwh,
        monthlyKwh,
        annualKwh,
        totalKwh,
        socPct,
        230.2,
        currentAc,
        Number((37.5 + (i % 5) * 0.9).toFixed(1)),
        isActiva ? 'online' : 'acessando',
        JSON.stringify({ source: 'initial_seed', stationCode: mg.codigo })
      ]
    );
  }
}

/**
 * Lê o objeto solarman_config da tabela system_settings.
 */
async function readSolarmanConfig() {
  const res = await query("SELECT valor, atualizado_em FROM system_settings WHERE chave = 'solarman_config';");
  if (res.rowCount === 0) {
    return { ...DEFAULT_SOLARMAN_CONFIG };
  }
  return {
    ...DEFAULT_SOLARMAN_CONFIG,
    ...(res.rows[0].valor || {}),
    updatedAt: res.rows[0].atualizado_em
  };
}

/**
 * Mascara um segredo preservando os últimos 4 caracteres quando longo.
 */
function maskSecret(val) {
  if (!val || typeof val !== 'string') return '';
  if (val.length <= 6) return '••••••';
  return `${'•'.repeat(Math.min(12, val.length - 4))}${val.slice(-4)}`;
}

/**
 * Constrói o resumo no formato exato do SolarMAN Pro (v4.5.8).
 */
function buildSolarmanSummary(devices) {
  let generationPower = 0;
  let installedCapacity = 0;
  let generationDay = 0;
  let generationMonth = 0;
  let generationYear = 0;
  let generationTotal = 0;
  let lastUpdateTime = null;

  let communicationNormal = 0;
  let communicationNoDevice = 0;
  let communicationAllOffline = 0;
  let communicationPartialOffline = 0;
  let alertNormal = 0;
  let alertAlerting = 0;

  const peakHoursRanking = [];
  const normalizedPowerRanking = [];

  for (const d of devices) {
    const nom = parseFloat(d.potencia_nominal_kw) || 0;
    const act = parseFloat(d.potencia_activa_kw) || 0;
    const day = parseFloat(d.energia_hoje_kwh) || 0;
    const month = parseFloat(d.energia_mes_kwh) || 0;
    const year = parseFloat(d.energia_ano_kwh) || 0;
    const total = parseFloat(d.energia_total_kwh) || 0;

    installedCapacity += nom;
    generationPower += act;
    generationDay += day;
    generationMonth += month;
    generationYear += year;
    generationTotal += total;

    if (d.ultima_leitura && (!lastUpdateTime || new Date(d.ultima_leitura) > new Date(lastUpdateTime))) {
      lastUpdateTime = d.ultima_leitura;
    }

    const comm = (d.estado_comunicacao || 'online').toLowerCase();
    if (comm === 'online') communicationNormal++;
    else if (comm === 'acessando') communicationNoDevice++;
    else if (comm === 'parcial') communicationPartialOffline++;
    else communicationAllOffline++;

    if (d.alerta_activo || comm === 'alarme') alertAlerting++;
    else alertNormal++;

    const fullPowerHoursDay = nom > 0 ? Number((day / nom).toFixed(2)) : 0;
    const normalizedPowerPct = nom > 0 ? Number(Math.min(100, (act / nom) * 100).toFixed(1)) : 0;

    const baseItem = {
      id: d.id,
      device_sn: d.device_sn,
      logger_sn: d.logger_sn,
      mini_grid_id: d.mini_grid_id,
      mini_grid_codigo: d.mini_grid_codigo,
      mini_grid_nome: d.mini_grid_nome,
      provincia: d.provincia,
      client_nome: d.client_nome || null,
      potencia_nominal_kw: nom,
      potencia_activa_kw: act,
      energia_hoje_kwh: day
    };

    peakHoursRanking.push({ ...baseItem, fullPowerHoursDay });
    normalizedPowerRanking.push({ ...baseItem, normalizedPowerPct });
  }

  peakHoursRanking.sort((a, b) => b.fullPowerHoursDay - a.fullPowerHoursDay);
  normalizedPowerRanking.sort((a, b) => b.normalizedPowerPct - a.normalizedPowerPct);

  return {
    generationSummary: {
      generationPower: Number(generationPower.toFixed(2)),
      installedCapacity: Number(installedCapacity.toFixed(2)),
      generationDay: Number(generationDay.toFixed(2)),
      generationMonth: Number(generationMonth.toFixed(2)),
      generationYear: Number(generationYear.toFixed(2)),
      generationTotal: Number(generationTotal.toFixed(2)),
      lastUpdateTime
    },
    statusCounting: {
      total: devices.length,
      communicationNormal,
      communicationNoDevice,
      communicationAllOffline,
      communicationPartialOffline,
      alertNormal,
      alertAlerting
    },
    peakHoursRanking,
    normalizedPowerRanking
  };
}

/**
 * GET /api/telemetry/config
 */
async function getTelemetryConfig(req, res) {
  try {
    await ensureTelemetryInitialized();
    const cfg = await readSolarmanConfig();
    const statsRes = await query(`
      SELECT
        COUNT(*)::int AS total_devices,
        COUNT(*) FILTER (WHERE estado_comunicacao = 'online')::int AS online_devices,
        COUNT(*) FILTER (WHERE alerta_activo = TRUE OR estado_comunicacao = 'alarme')::int AS alerting_devices
      FROM inverter_telemetry;
    `);

    return success(
      res,
      {
        config: {
          orgName: cfg.orgName,
          orgId: cfg.orgId,
          accountEmail: cfg.accountEmail,
          apiBaseUrl: cfg.apiBaseUrl,
          proBaseUrl: cfg.proBaseUrl,
          appId: cfg.appId,
          appSecretMasked: maskSecret(cfg.appSecret),
          hasAppSecret: Boolean(cfg.appSecret),
          bearerTokenMasked: maskSecret(cfg.bearerToken),
          hasBearerToken: Boolean(cfg.bearerToken),
          webhookKey: cfg.webhookKey,
          autoSyncMinutes: cfg.autoSyncMinutes,
          lastSyncAt: cfg.lastSyncAt,
          updatedAt: cfg.updatedAt
        },
        stats: statsRes.rows[0]
      },
      'Configuração de telemetria obtida com sucesso.'
    );
  } catch (err) {
    console.error('[TELEMETRY CONFIG GET ERROR]:', err);
    return error(res, 'Erro ao obter configuração de telemetria.', 500);
  }
}

/**
 * PUT /api/telemetry/config
 */
async function updateTelemetryConfig(req, res) {
  try {
    await ensureTelemetryInitialized();
    const current = await readSolarmanConfig();
    const body = req.body || {};

    const updated = {
      ...current,
      orgName: body.orgName !== undefined ? String(body.orgName).trim() : current.orgName,
      orgId: body.orgId !== undefined ? String(body.orgId).trim() : current.orgId,
      accountEmail: body.accountEmail !== undefined ? String(body.accountEmail).trim() : current.accountEmail,
      apiBaseUrl: body.apiBaseUrl !== undefined ? String(body.apiBaseUrl).trim() : current.apiBaseUrl,
      proBaseUrl: body.proBaseUrl !== undefined ? String(body.proBaseUrl).trim() : current.proBaseUrl,
      appId: body.appId !== undefined ? String(body.appId).trim() : current.appId,
      webhookKey: body.webhookKey !== undefined && String(body.webhookKey).trim()
        ? String(body.webhookKey).trim()
        : current.webhookKey,
      autoSyncMinutes: body.autoSyncMinutes !== undefined
        ? Math.max(1, Math.min(120, parseInt(body.autoSyncMinutes, 10) || 5))
        : current.autoSyncMinutes
    };

    if (body.appSecret !== undefined && String(body.appSecret).trim() !== '' && !String(body.appSecret).includes('••')) {
      updated.appSecret = String(body.appSecret).trim();
    }
    if (body.clearAppSecret === true) {
      updated.appSecret = '';
    }

    if (body.bearerToken !== undefined && String(body.bearerToken).trim() !== '' && !String(body.bearerToken).includes('••')) {
      updated.bearerToken = String(body.bearerToken).trim();
    }
    if (body.clearBearerToken === true) {
      updated.bearerToken = '';
    }

    await query(
      `
      INSERT INTO system_settings (chave, valor, descricao)
      VALUES ('solarman_config', $1::jsonb, 'Configuração de integração Cloud-to-Cloud SolarMAN Pro / Open API')
      ON CONFLICT (chave) DO UPDATE
      SET valor = EXCLUDED.valor, atualizado_em = CURRENT_TIMESTAMP;
      `,
      [JSON.stringify(updated)]
    );

    await logAudit({
      userId: req.user?.id || null,
      tabelaAfetada: 'system_settings',
      accao: 'UPDATE',
      registoId: 'solarman_config',
      dadosAntigos: { ...current, appSecret: maskSecret(current.appSecret), bearerToken: maskSecret(current.bearerToken) },
      dadosNovos: { ...updated, appSecret: maskSecret(updated.appSecret), bearerToken: maskSecret(updated.bearerToken) }
    });

    return success(
      res,
      {
        orgName: updated.orgName,
        orgId: updated.orgId,
        accountEmail: updated.accountEmail,
        apiBaseUrl: updated.apiBaseUrl,
        proBaseUrl: updated.proBaseUrl,
        appId: updated.appId,
        hasAppSecret: Boolean(updated.appSecret),
        hasBearerToken: Boolean(updated.bearerToken),
        webhookKey: updated.webhookKey,
        autoSyncMinutes: updated.autoSyncMinutes,
        lastSyncAt: updated.lastSyncAt
      },
      'Configuração SolarMAN Pro atualizada com sucesso.'
    );
  } catch (err) {
    console.error('[TELEMETRY CONFIG PUT ERROR]:', err);
    return error(res, 'Erro ao atualizar configuração de telemetria.', 500);
  }
}

/**
 * GET /api/telemetry/devices
 */
async function listTelemetryDevices(req, res) {
  try {
    await ensureTelemetryInitialized();
    const { mini_grid_id, client_id, provider, estado_comunicacao } = req.query;

    const conditions = [];
    const params = [];
    let pIdx = 1;

    if (mini_grid_id) {
      conditions.push(`t.mini_grid_id = $${pIdx++}`);
      params.push(mini_grid_id);
    }
    if (client_id) {
      conditions.push(`t.client_id = $${pIdx++}`);
      params.push(client_id);
    }
    if (provider) {
      conditions.push(`t.provider = $${pIdx++}`);
      params.push(String(provider).toLowerCase().trim());
    }
    if (estado_comunicacao) {
      conditions.push(`t.estado_comunicacao = $${pIdx++}`);
      params.push(String(estado_comunicacao).toLowerCase().trim());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        t.*,
        mg.codigo AS mini_grid_codigo,
        mg.nome AS mini_grid_nome,
        mg.provincia,
        mg.distrito,
        mg.capacidade_kwp,
        mg.capacidade_bateria_kwh,
        c.codigo AS client_codigo,
        c.nome_completo AS client_nome,
        c.categoria AS client_categoria,
        a.codigo AS asset_codigo
      FROM inverter_telemetry t
      JOIN mini_grids mg ON t.mini_grid_id = mg.id
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN assets a ON t.asset_id = a.id
      ${whereClause}
      ORDER BY mg.codigo ASC, t.device_sn ASC;
    `;

    const result = await query(sql, params);
    const devices = result.rows;
    const solarmanSummary = buildSolarmanSummary(devices);

    return success(
      res,
      {
        devices,
        solarmanSummary
      },
      'Dispositivos de telemetria carregados com sucesso.'
    );
  } catch (err) {
    console.error('[TELEMETRY LIST DEVICES ERROR]:', err);
    return error(res, 'Erro ao listar dispositivos de telemetria.', 500);
  }
}

/**
 * POST /api/telemetry/devices
 * Regista ou atualiza vinculação de um Inversor / Datalogger a uma Mini-Rede ou Cliente.
 */
async function registerTelemetryDevice(req, res) {
  try {
    await ensureTelemetryInitialized();
    const {
      device_sn,
      logger_sn,
      provider = 'solarman',
      external_station_id,
      mini_grid_id,
      client_id,
      asset_id,
      modelo_inversor,
      potencia_nominal_kw = 50
    } = req.body || {};

    if (!device_sn || !String(device_sn).trim()) {
      return error(res, 'O número de série do inversor (device_sn) é obrigatório.', 400);
    }
    if (!mini_grid_id) {
      return error(res, 'A mini-rede associada (mini_grid_id) é obrigatória.', 400);
    }

    const mgCheck = await query('SELECT id, codigo, nome FROM mini_grids WHERE id = $1;', [mini_grid_id]);
    if (mgCheck.rowCount === 0) {
      return error(res, 'Mini-rede indicada não encontrada.', 404);
    }

    if (client_id) {
      const cliCheck = await query('SELECT id FROM clients WHERE id = $1;', [client_id]);
      if (cliCheck.rowCount === 0) {
        return error(res, 'Cliente indicado não encontrado.', 404);
      }
    }

    if (asset_id) {
      const assetCheck = await query('SELECT id FROM assets WHERE id = $1;', [asset_id]);
      if (assetCheck.rowCount === 0) {
        return error(res, 'Activo técnico indicado não encontrado.', 404);
      }
    }

    const cleanSn = String(device_sn).trim();
    const nomKw = Math.max(0.1, parseFloat(potencia_nominal_kw) || 50);

    const upsertSql = `
      INSERT INTO inverter_telemetry (
        device_sn, logger_sn, provider, external_station_id,
        mini_grid_id, client_id, asset_id, modelo_inversor, potencia_nominal_kw,
        estado_comunicacao, ultima_leitura
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'acessando', CURRENT_TIMESTAMP)
      ON CONFLICT (device_sn) DO UPDATE SET
        logger_sn = COALESCE(EXCLUDED.logger_sn, inverter_telemetry.logger_sn),
        provider = EXCLUDED.provider,
        external_station_id = COALESCE(EXCLUDED.external_station_id, inverter_telemetry.external_station_id),
        mini_grid_id = EXCLUDED.mini_grid_id,
        client_id = EXCLUDED.client_id,
        asset_id = EXCLUDED.asset_id,
        modelo_inversor = COALESCE(EXCLUDED.modelo_inversor, inverter_telemetry.modelo_inversor),
        potencia_nominal_kw = EXCLUDED.potencia_nominal_kw,
        atualizado_em = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const resUpsert = await query(upsertSql, [
      cleanSn,
      logger_sn ? String(logger_sn).trim() : null,
      String(provider).toLowerCase().trim(),
      external_station_id ? String(external_station_id).trim() : null,
      mini_grid_id,
      client_id || null,
      asset_id || null,
      modelo_inversor ? String(modelo_inversor).trim() : 'Deye Hybrid Inverter (SolarMAN)',
      nomKw
    ]);

    const saved = resUpsert.rows[0];

    await logAudit({
      userId: req.user?.id || null,
      tabelaAfetada: 'inverter_telemetry',
      accao: 'INSERT',
      registoId: saved.id,
      dadosNovos: saved
    });

    return success(res, saved, `Inversor ${cleanSn} vinculado com sucesso.`, 201);
  } catch (err) {
    console.error('[TELEMETRY REGISTER DEVICE ERROR]:', err);
    return error(res, 'Erro ao vincular inversor de telemetria.', 500);
  }
}

/**
 * Cria automaticamente uma Ordem de Trabalho de avaria urgente se ainda não houver
 * uma OT aberta recente para o mesmo dispositivo.
 */
async function maybeCreateAlertWorkOrder(device, alertDescription, reqUserId) {
  const existing = await query(
    `
    SELECT id, numero_ordem
    FROM work_orders
    WHERE mini_grid_id = $1
      AND estado IN ('aberta', 'atribuida', 'em_execucao')
      AND descricao ILIKE $2
      AND criado_em >= NOW() - INTERVAL '24 hours'
    LIMIT 1;
    `,
    [device.mini_grid_id, `%${device.device_sn}%`]
  );

  if (existing.rowCount > 0) {
    return { created: false, workOrder: existing.rows[0] };
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');
    const numeroOrdem = await generateNextWorkOrderCode(new Date().getFullYear(), client);
    const desc = `[TELEMETRIA AUTOMÁTICA] Alarme no Inversor ${device.device_sn} (${device.logger_sn || 'S/Logger'}): ${alertDescription}`;

    const woRes = await client.query(
      `
      INSERT INTO work_orders (
        numero_ordem, mini_grid_id, asset_id, client_id, tipo, prioridade, descricao, estado
      ) VALUES ($1, $2, $3, $4, 'avaria', 'urgente', $5, 'aberta')
      RETURNING *;
      `,
      [numeroOrdem, device.mini_grid_id, device.asset_id || null, device.client_id || null, desc]
    );

    await client.query('COMMIT');

    await logAudit({
      userId: reqUserId || null,
      tabelaAfetada: 'work_orders',
      accao: 'INSERT',
      registoId: woRes.rows[0].id,
      dadosNovos: woRes.rows[0]
    });

    return { created: true, workOrder: woRes.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[TELEMETRY AUTO WO ERROR]:', err);
    return { created: false, error: err.message };
  } finally {
    client.release();
  }
}

/**
 * POST /api/telemetry/ingest
 * Endpoint Webhook IoT para receção de leituras reais de dataloggers/gateways ou simulador.
 */
async function ingestTelemetryWebhook(req, res) {
  try {
    await ensureTelemetryInitialized();
    const body = req.body || {};
    const { device_sn, logger_sn } = body;

    if (!device_sn && !logger_sn) {
      return error(res, 'É obrigatório informar device_sn ou logger_sn.', 400);
    }

    const findSql = device_sn
      ? 'SELECT * FROM inverter_telemetry WHERE device_sn = $1 LIMIT 1;'
      : 'SELECT * FROM inverter_telemetry WHERE logger_sn = $1 LIMIT 1;';
    const findRes = await query(findSql, [String(device_sn || logger_sn).trim()]);

    if (findRes.rowCount === 0) {
      return error(res, `Dispositivo '${device_sn || logger_sn}' não registado no inventário de telemetria.`, 404);
    }

    const current = findRes.rows[0];
    const potenciaActiva = body.potencia_activa_kw !== undefined
      ? Math.max(0, parseFloat(body.potencia_activa_kw) || 0)
      : parseFloat(current.potencia_activa_kw);
    const energiaHoje = body.energia_hoje_kwh !== undefined
      ? Math.max(0, parseFloat(body.energia_hoje_kwh) || 0)
      : parseFloat(current.energia_hoje_kwh);
    const energiaMes = body.energia_mes_kwh !== undefined
      ? Math.max(0, parseFloat(body.energia_mes_kwh) || 0)
      : parseFloat(current.energia_mes_kwh);
    const energiaAno = body.energia_ano_kwh !== undefined
      ? Math.max(0, parseFloat(body.energia_ano_kwh) || 0)
      : parseFloat(current.energia_ano_kwh);
    const energiaTotal = body.energia_total_kwh !== undefined
      ? Math.max(0, parseFloat(body.energia_total_kwh) || 0)
      : parseFloat(current.energia_total_kwh);
    const socPct = body.bateria_soc_pct !== undefined
      ? Math.min(100, Math.max(0, parseFloat(body.bateria_soc_pct)))
      : parseFloat(current.bateria_soc_pct);
    const tensaoAc = body.tensao_ac_v !== undefined
      ? Math.max(0, parseFloat(body.tensao_ac_v) || 0)
      : parseFloat(current.tensao_ac_v);
    const correnteAc = body.corrente_ac_a !== undefined
      ? Math.max(0, parseFloat(body.corrente_ac_a) || 0)
      : Number(((potenciaActiva * 1000) / (400 * 1.732)).toFixed(2));
    const freqHz = body.frequencia_hz !== undefined
      ? Math.max(0, parseFloat(body.frequencia_hz) || 50)
      : parseFloat(current.frequencia_hz);
    const tensaoDc = body.tensao_dc_v !== undefined
      ? Math.max(0, parseFloat(body.tensao_dc_v) || 0)
      : parseFloat(current.tensao_dc_v);
    const tempC = body.temperatura_c !== undefined
      ? parseFloat(body.temperatura_c)
      : parseFloat(current.temperatura_c);

    const lowBattery = socPct < 20;
    const isAlert = Boolean(body.alerta_activo) || body.estado_comunicacao === 'alarme' || lowBattery;
    const estadoCom = body.estado_comunicacao
      ? String(body.estado_comunicacao).toLowerCase().trim()
      : (isAlert ? 'alarme' : 'online');

    const updateRes = await query(
      `
      UPDATE inverter_telemetry
      SET
        logger_sn = COALESCE($1, logger_sn),
        potencia_activa_kw = $2,
        energia_hoje_kwh = $3,
        energia_mes_kwh = $4,
        energia_ano_kwh = $5,
        energia_total_kwh = $6,
        bateria_soc_pct = $7,
        tensao_ac_v = $8,
        corrente_ac_a = $9,
        frequencia_hz = $10,
        tensao_dc_v = $11,
        temperatura_c = $12,
        estado_comunicacao = $13,
        alerta_activo = $14,
        payload_bruto = $15::jsonb,
        ultima_leitura = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *;
      `,
      [
        logger_sn ? String(logger_sn).trim() : null,
        potenciaActiva,
        energiaHoje,
        energiaMes,
        energiaAno,
        energiaTotal,
        socPct,
        tensaoAc,
        correnteAc,
        freqHz,
        tensaoDc,
        tempC,
        estadoCom,
        isAlert,
        JSON.stringify(body),
        current.id
      ]
    );

    const updatedDevice = updateRes.rows[0];
    let autoWorkOrder = null;

    if (isAlert) {
      const alertReason = body.alerta_descricao || (lowBattery
        ? `Bateria BESS crítica em ${socPct}% SoC (abaixo de 20%).`
        : 'Falha crítica reportada pelo inversor/datalogger.');
      autoWorkOrder = await maybeCreateAlertWorkOrder(updatedDevice, alertReason, req.user?.id || null);
    }

    await logAudit({
      userId: req.user?.id || null,
      tabelaAfetada: 'inverter_telemetry',
      accao: 'UPDATE',
      registoId: updatedDevice.id,
      dadosAntigos: { potencia_activa_kw: current.potencia_activa_kw, bateria_soc_pct: current.bateria_soc_pct, estado_comunicacao: current.estado_comunicacao },
      dadosNovos: { potencia_activa_kw: updatedDevice.potencia_activa_kw, bateria_soc_pct: updatedDevice.bateria_soc_pct, estado_comunicacao: updatedDevice.estado_comunicacao, autoWorkOrder: autoWorkOrder?.workOrder?.numero_ordem || null }
    });

    return success(
      res,
      {
        device: updatedDevice,
        autoWorkOrder
      },
      isAlert
        ? 'Telemetria recebida com alarme ativo! Ordem de Trabalho O&M gerada automaticamente.'
        : 'Pacote de telemetria ingerido e gravado com sucesso.'
    );
  } catch (err) {
    console.error('[TELEMETRY INGEST ERROR]:', err);
    return error(res, 'Erro ao processar pacote de telemetria IoT.', 500);
  }
}

let autoSyncInterval = null;
let isAutoSyncInFlight = false;

/**
 * Atualiza registos locais de `inverter_telemetry` com dados retornados pelas estações
 * da SolarMAN Pro / Open API quando correspondem a `external_station_id` ou `device_sn`.
 */
async function applyRemoteStationsToTelemetry(remoteStations = []) {
  if (!Array.isArray(remoteStations) || remoteStations.length === 0) {
    return 0;
  }

  let updatedCount = 0;
  for (const st of remoteStations) {
    const stationId = st.id !== undefined && st.id !== null
      ? String(st.id)
      : (st.stationId !== undefined && st.stationId !== null ? String(st.stationId) : '');
    const deviceSn = st.deviceSn || st.sn ? String(st.deviceSn || st.sn).trim() : '';

    if (!stationId && !deviceSn) continue;

    const matchRes = await query(
      `
      SELECT id, potencia_activa_kw, potencia_nominal_kw, estado_comunicacao
      FROM inverter_telemetry
      WHERE ($1 <> '' AND external_station_id = $1)
         OR ($2 <> '' AND device_sn = $2);
      `,
      [stationId, deviceSn]
    );

    if (matchRes.rowCount === 0) continue;

    const netStatus = String(st.networkStatus || st.connectionStatus || '').toUpperCase();
    const isAlerting = Boolean(st.alerting || st.alarmStatus === 1 || netStatus.includes('ALARM') || netStatus.includes('ALERT'));
    const isOffline = netStatus === 'ALL_OFFLINE' || netStatus === 'OFFLINE';
    const isPartial = netStatus === 'PARTIAL_OFFLINE';
    const commState = isAlerting ? 'alarme' : (isOffline ? 'offline' : (isPartial ? 'parcial' : 'online'));

    const genPowerNum = st.generationPower !== undefined && st.generationPower !== null
      ? Number(st.generationPower)
      : null;
    const capNum = st.generationCapacity !== undefined && st.generationCapacity !== null
      ? Number(st.generationCapacity)
      : (st.installedCapacity !== undefined && st.installedCapacity !== null ? Number(st.installedCapacity) : null);

    for (const row of matchRes.rows) {
      const nextActiveKw = Number.isFinite(genPowerNum) ? genPowerNum : Number(row.potencia_activa_kw);
      const nextNomKw = Number.isFinite(capNum) && capNum > 0 ? capNum : Number(row.potencia_nominal_kw);

      await query(
        `
        UPDATE inverter_telemetry
        SET
          potencia_activa_kw = $1,
          potencia_nominal_kw = $2,
          estado_comunicacao = $3,
          alerta_activo = $4,
          payload_bruto = COALESCE(payload_bruto, '{}'::jsonb) || $5::jsonb,
          ultima_leitura = CURRENT_TIMESTAMP
        WHERE id = $6;
        `,
        [
          nextActiveKw,
          nextNomKw,
          commState,
          isAlerting,
          JSON.stringify({ solarmanStation: st }),
          row.id
        ]
      );
      updatedCount++;
    }
  }

  return updatedCount;
}

/**
 * Executa um ciclo completo de sincronização com a nuvem SolarMAN (Pro Bearer ou Open API)
 * e atualiza `lastSyncAt` e `inverter_telemetry` locais.
 */
async function runSolarmanSyncCycle({ userId = null, accountPassword = null } = {}) {
  if (isAutoSyncInFlight) {
    return { skipped: true, reason: 'Ciclo de sincronização já em execução.' };
  }

  isAutoSyncInFlight = true;
  try {
    await ensureTelemetryInitialized();
    const cfg = await readSolarmanConfig();
    const nowIso = new Date().toISOString();

    let cloudMode = 'local_cached';
    let cloudConnected = false;
    let remoteStationsCount = 0;
    let remoteStations = [];
    let remoteSummary = null;
    let cloudError = null;

    // 1. Tenta consultar SolarMAN Pro API se bearerToken estiver preenchido
    if (cfg.bearerToken) {
      cloudMode = 'solarman_pro_bearer';
      try {
        const resp = await fetch(`${cfg.proBaseUrl.replace(/\/$/, '')}/maintain-s/operating/station/generation/summary`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cfg.bearerToken}`
          },
          body: '{}',
          signal: AbortSignal.timeout(6000)
        });
        if (resp.ok) {
          remoteSummary = await resp.json();
          cloudConnected = true;
          const stResp = await fetch(`${cfg.proBaseUrl.replace(/\/$/, '')}/maintain-s/operating/station/v2/search?page=1&size=50`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cfg.bearerToken}`
            },
            body: '{}',
            signal: AbortSignal.timeout(6000)
          });
          if (stResp.ok) {
            const stData = await stResp.json();
            if (Array.isArray(stData?.data)) {
              remoteStations = stData.data;
            }
            remoteStationsCount = stData?.total ?? remoteStations.length;
          }
        } else {
          cloudError = `SolarMAN Pro respondeu HTTP ${resp.status}`;
        }
      } catch (netErr) {
        cloudError = netErr.message;
      }
    } else if (cfg.appId && cfg.appSecret) {
      // 2. Tenta SolarMAN Open API v1.0 se appId + appSecret estiverem configurados
      cloudMode = 'solarman_open_api';
      try {
        const passHash = accountPassword
          ? crypto.createHash('sha256').update(String(accountPassword)).digest('hex')
          : '';
        const tokenResp = await fetch(
          `${cfg.apiBaseUrl.replace(/\/$/, '')}/account/v1.0/token?appId=${encodeURIComponent(cfg.appId)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appSecret: cfg.appSecret,
              email: cfg.accountEmail,
              ...(passHash ? { password: passHash } : {})
            }),
            signal: AbortSignal.timeout(6000)
          }
        );
        if (tokenResp.ok) {
          const tokenJson = await tokenResp.json();
          if (tokenJson?.access_token) {
            cloudConnected = true;
            const listResp = await fetch(`${cfg.apiBaseUrl.replace(/\/$/, '')}/station/v1.0/list`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `bearer ${tokenJson.access_token}`
              },
              body: JSON.stringify({ page: 1, size: 50 }),
              signal: AbortSignal.timeout(6000)
            });
            if (listResp.ok) {
              const listJson = await listResp.json();
              if (Array.isArray(listJson?.stationList)) {
                remoteStations = listJson.stationList;
              }
              remoteStationsCount = listJson?.total ?? remoteStations.length;
            }
          } else {
            cloudError = tokenJson?.msg || 'Token OAuth2 não emitido pela SolarMAN Open API.';
          }
        } else {
          cloudError = `SolarMAN Open API respondeu HTTP ${tokenResp.status}`;
        }
      } catch (netErr) {
        cloudError = netErr.message;
      }
    }

    const remoteMatchedUpdated = await applyRemoteStationsToTelemetry(remoteStations);

    // Atualiza heartbeat dos dispositivos locais online e grava lastSyncAt
    await query(`
      UPDATE inverter_telemetry
      SET ultima_leitura = CURRENT_TIMESTAMP
      WHERE estado_comunicacao = 'online';
    `);

    const updatedCfg = { ...cfg, lastSyncAt: nowIso };
    delete updatedCfg.updatedAt;
    await query(
      `
      UPDATE system_settings
      SET valor = $1::jsonb, atualizado_em = CURRENT_TIMESTAMP
      WHERE chave = 'solarman_config';
      `,
      [JSON.stringify(updatedCfg)]
    );

    const devRes = await query(`
      SELECT t.*, mg.codigo AS mini_grid_codigo, mg.nome AS mini_grid_nome, mg.provincia,
             c.nome_completo AS client_nome
      FROM inverter_telemetry t
      JOIN mini_grids mg ON t.mini_grid_id = mg.id
      LEFT JOIN clients c ON t.client_id = c.id
      ORDER BY mg.codigo ASC;
    `);

    await logAudit({
      userId,
      tabelaAfetada: 'inverter_telemetry',
      accao: 'UPDATE',
      registoId: 'solarman_sync',
      dadosNovos: {
        cloudMode,
        cloudConnected,
        remoteStationsCount,
        remoteMatchedUpdated,
        devicesCount: devRes.rowCount,
        cloudError
      }
    });

    return {
      syncedAt: nowIso,
      cloudMode,
      cloudConnected,
      remoteStationsCount,
      remoteSummary,
      cloudError,
      localDevicesCount: devRes.rowCount,
      solarmanSummary: buildSolarmanSummary(devRes.rows),
      _cfgOrgName: cfg.orgName
    };
  } finally {
    isAutoSyncInFlight = false;
  }
}

/**
 * POST /api/telemetry/solarman/sync
 * Executa sincronização com SolarMAN Pro API / Open API (quando credenciais configuradas)
 * e atualiza o estado e timestamp de telemetria local.
 */
async function syncSolarmanCloud(req, res) {
  try {
    const syncResult = await runSolarmanSyncCycle({
      userId: req.user?.id || null,
      accountPassword: req.body?.accountPassword || null
    });

    if (syncResult.skipped) {
      return success(res, syncResult, syncResult.reason);
    }

    const { _cfgOrgName, ...payload } = syncResult;
    return success(
      res,
      payload,
      payload.cloudConnected
        ? `Sincronização com SolarMAN (${_cfgOrgName || 'Joswil'}) concluída (${payload.remoteStationsCount} plantas remotas).`
        : 'Sincronização local concluída. Configure App ID/Secret ou Bearer Token para puxar dados da nuvem SolarMAN.'
    );
  } catch (err) {
    console.error('[TELEMETRY SYNC ERROR]:', err);
    return error(res, 'Erro ao executar sincronização SolarMAN Pro.', 500);
  }
}

/**
 * Inicia agendador periódico (60s check) para sincronização automática SolarMAN
 * quando credenciais Cloud estão configuradas em system_settings.
 */
function startTelemetryAutoSyncScheduler() {
  if (process.env.NODE_ENV === 'test' || autoSyncInterval) {
    return;
  }

  autoSyncInterval = setInterval(async () => {
    try {
      await ensureTelemetryInitialized();
      const cfg = await readSolarmanConfig();
      const minutes = parseInt(cfg.autoSyncMinutes, 10) || 0;
      const hasCredentials = Boolean(cfg.bearerToken || (cfg.appId && cfg.appSecret));

      if (minutes <= 0 || !hasCredentials) {
        return;
      }

      const lastMs = cfg.lastSyncAt ? new Date(cfg.lastSyncAt).getTime() : 0;
      const due = !lastMs || Number.isNaN(lastMs) || (Date.now() - lastMs >= minutes * 60 * 1000);
      if (due) {
        await runSolarmanSyncCycle({ userId: null });
      }
    } catch (err) {
      console.error('[TELEMETRY AUTO-SYNC ERROR]:', err.message);
    }
  }, 60 * 1000);

  if (typeof autoSyncInterval.unref === 'function') {
    autoSyncInterval.unref();
  }
}

/**
 * Encerra o agendador automático de telemetria durante graceful shutdown.
 */
function stopTelemetryAutoSyncScheduler() {
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval);
    autoSyncInterval = null;
  }
}

module.exports = {
  ensureTelemetryInitialized,
  readSolarmanConfig,
  getTelemetryConfig,
  updateTelemetryConfig,
  listTelemetryDevices,
  registerTelemetryDevice,
  ingestTelemetryWebhook,
  syncSolarmanCloud,
  runSolarmanSyncCycle,
  startTelemetryAutoSyncScheduler,
  stopTelemetryAutoSyncScheduler
};
