-- ==============================================================================
-- LECASU GridOps - Migração 004: Telemetria Real de Inversores & SolarMAN Pro
-- Suporta integração Cloud-to-Cloud (SolarMAN Open API / Pro) e Webhook IoT
-- ==============================================================================

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

DROP TRIGGER IF EXISTS set_timestamp_inverter_telemetry ON inverter_telemetry;
CREATE TRIGGER set_timestamp_inverter_telemetry
BEFORE UPDATE ON inverter_telemetry
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE INDEX IF NOT EXISTS idx_inverter_telemetry_mini_grid ON inverter_telemetry(mini_grid_id);
CREATE INDEX IF NOT EXISTS idx_inverter_telemetry_client ON inverter_telemetry(client_id);
CREATE INDEX IF NOT EXISTS idx_inverter_telemetry_provider ON inverter_telemetry(provider);
CREATE INDEX IF NOT EXISTS idx_inverter_telemetry_estado ON inverter_telemetry(estado_comunicacao);

INSERT INTO system_settings (chave, valor, descricao)
VALUES (
    'solarman_config',
    '{
      "orgName": "Joswil",
      "orgId": "10955391",
      "accountEmail": "jossuemohamad@gmail.com",
      "apiBaseUrl": "https://api.solarmanpv.com",
      "proBaseUrl": "https://globalpro.solarmanpv.com",
      "appId": "",
      "appSecret": "",
      "bearerToken": "",
      "webhookKey": "LECASU-IOT-2026-KEY",
      "autoSyncMinutes": 5,
      "lastSyncAt": null
    }'::jsonb,
    'Configuração de integração Cloud-to-Cloud SolarMAN Pro / Open API e Webhook IoT de inversores'
)
ON CONFLICT (chave) DO NOTHING;
