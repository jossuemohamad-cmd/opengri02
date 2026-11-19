# 30 — Integração SolarMAN Pro & Telemetria Real de Inversores
## LECASU GridOps — Arquitetura de Recolha de Dados em Tempo Real

**Documento:** Especificação de Integração IoT, Cloud-to-Cloud (SolarMAN Pro / Open API) e Webhook Local  
**Referências:** `docs/PRD.md` (Secções 1.3, 4.5, 4.6 e 9)  
**Data:** Novembro de 2026

---

## 1. Diagnóstico da Conta SolarMAN Pro (`globalpro.solarmanpv.com`)

A inspeção direta à sessão autenticada da **SOLARMAN Business / Pro (v4.5.8)** revelou:

- **Organização Ativa:** `Joswil` (`orgId: 10955391`, `topGroupId: 10593525`, Região `MZ`)
- **Utilizador:** `Josué Mahomad Emael` (`jossuemohamad@gmail.com`, `userId: 17390064`)
- **Estado Atual na SolarMAN Pro:** `0` instalações (`Total: 0`) e `0` dispositivos registados (`INVERTER`, `COLLECTOR`, `BATTERY`, `METER`), razão pela qual os cartões apresentam `0 W` e `Sem dados`.

### Mapeamento dos 6 Painéis do SolarMAN Pro para o LECASU GridOps

| Painel SolarMAN Pro | Endpoint SolarMAN Observado | Dados / Métricas | Equivalente no GridOps |
|---|---|---|---|
| **1. Produção Total** | `POST /maintain-s/operating/station/generation/summary` | `generationPower`, `installedCapacity`, `generationDay`, `generationMonth`, `generationYear`, `generationTotal` | KPIs do Painel Executivo + `solarmanSummary.generationSummary` |
| **2. Histórico de Produção** | `POST /maintain-s/history/power/stats/month` | Curva diária/mensal em `kWh` | Gráficos de produção e relatórios (`GET /api/telemetry/devices`) |
| **3. Status da Planta** | `POST /maintain-s/operating/station/status/counting` | `communicationNormal`, `communicationNoDevice`, `communicationAllOffline`, `communicationPartialOffline`, `alertAlerting` | `solarmanSummary.statusCounting` |
| **4. Distribuição da Planta** | `GET /maintain-s/operating/station/screen/search` | Coordenadas GPS das centrais e instalações | Mapa GIS Satélite (`#dashboard` e `#mapa-rede`) |
| **5. Funcionamento em Pico** | `POST /maintain-s/history/power/rank?sortBy=fullPowerHoursDay` | Horas de Sol a Pico (`h` = `energia_hoje_kwh / potencia_nominal_kw`) | `solarmanSummary.peakHoursRanking` |
| **6. Normalização de Potência** | `POST /maintain-s/operating/station/capacity/ranking` | Percentagem da potência nominal (`potencia_activa_kw / potencia_nominal_kw * 100`) | `solarmanSummary.normalizedPowerRanking` |

---

## 2. Ligação Física no Terreno (Instalação do Cliente / Central)

Para que o inversor instalado no cliente envie dados reais para a internet e para o **LECASU GridOps**:

1. **Conexão do Datalogger (Collector):**
   - Ligue o **Stick Logger SolarMAN** (ex.: `LSW-3` para Wi-Fi local ou `LS4G-3` com cartão SIM Vodacom/Movitel 4G para zonas rurais) à porta **RS-485 / COM** do inversor (Deye, Sofar, Solis, Huawei, Growatt, etc.).
2. **Registo na SolarMAN Pro (`Joswil`):**
   - Em `globalpro.solarmanpv.com/business/maintain/plant`, clique em **Adicionar nova instalação**, associe o **Número de Série do Datalogger (`logger_sn`)** e o sistema detetará automaticamente o **Número de Série do Inversor (`device_sn`)**.
3. **Vinculação no LECASU GridOps:**
   - No GridOps, associe o `device_sn` e `logger_sn` à **Mini-Rede** e/ou **Cliente** correspondente através de **Configurações → SolarMAN Pro & Telemetria IoT** ou diretamente na **Ficha do Cliente**.

---

## 3. Os Dois Modos de Integração no LECASU GridOps

### Modo 1: Sincronização Cloud-to-Cloud (`POST /api/telemetry/solarman/sync`)
- O GridOps utiliza as credenciais configuradas em `system_settings` (`chave = 'solarman_config'`) para consultar a API da SolarMAN (`appId` + `appSecret` na `api.solarmanpv.com` ou `bearerToken` na `globalpro.solarmanpv.com`).
- Atualiza a tabela PostgreSQL `inverter_telemetry` e guarda o timestamp em `lastSyncAt`.

### Modo 2: Webhook IoT Direto (`POST /api/telemetry/ingest`)
- Permite que um gateway local (Raspberry Pi / Teltonika / script Solarman V5 na porta TCP `8899`), simulador ou integrador envie pacotes JSON diretamente para o GridOps, autenticados por token JWT ou chave de webhook (`x-webhook-key` / `webhookKey` configurado em `solarman_config`).
- **Exemplo de Payload JSON:**
  ```json
  {
    "device_sn": "INV-DYE-MR001-01",
    "logger_sn": "LS4G-2026-0001",
    "potencia_activa_kw": 68.4,
    "energia_hoje_kwh": 392.5,
    "bateria_soc_pct": 86,
    "tensao_ac_v": 230.2,
    "corrente_ac_a": 98.4,
    "frequencia_hz": 50.01,
    "tensao_dc_v": 625.0,
    "temperatura_c": 39.2,
    "estado_comunicacao": "online",
    "alerta_activo": false
  }
  ```
- **Geração Automática de Ordem de Trabalho (O&M):** Se `alerta_activo` for `true`, `estado_comunicacao === 'alarme'` ou `bateria_soc_pct < 20`, o controlador abre automaticamente uma **Ordem de Trabalho (`work_orders`)** do tipo `avaria` com prioridade `urgente` associada à mini-rede e ao cliente.
