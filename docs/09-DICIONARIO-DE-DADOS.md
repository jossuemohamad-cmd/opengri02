# 09 — Dicionário de Dados
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Dicionário Físico de Dados e Especificação de Esquema Relacional (PostgreSQL)  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Referências Centrais:** PRD Consolidada (`docs/02-PRD-CONSOLIDADA.md`), Modelo ERD (`docs/08-MODELO-ENTIDADE-RELACIONAMENTO.md`) e Regras de Negócio (`docs/05-REGRAS-DE-NEGOCIO.md`)  
**Responsável:** Modelação de Dados e Administração de Base de Dados (DBA)  
**Data de Emissão:** 05 de Novembro de 2026  
**Estado:** Submetido para Validação e Aprovação Formal  

---

## 1. Convenções de Nomenclatura e Tipos de Dados

* **Nomes de Tabelas e Colunas:** Minúsculas em estilo *snake_case* no plural para tabelas (ex: `mini_grids`, `meter_readings`) e singular para colunas.
* **Chaves Primárias:** Todas as tabelas utilizam identificadores universais `UUID` (`uuid_generate_v4()` ou nativo `gen_random_uuid()` do PostgreSQL 16+), garantindo segurança contra enumeração sequencial e suporte à criação offline em clientes móveis.
* **Valores Monetários e Energia:** Armazenados como `NUMERIC(14, 2)` para valores monetários em Meticais (MT) e `NUMERIC(12, 3)` para valores de energia em kWh e potência em kWp. É estritamente vedado o uso de tipos de ponto flutuante (`FLOAT` ou `DOUBLE PRECISION`) para cálculo financeiro ou metrológico.
* **Carimbos Temporais:** Todos os campos de data/hora utilizam `TIMESTAMPTZ` (*timestamp with time zone*), armazenados internamente em UTC.
* **Eliminação Segura (*Soft-Delete*):** Entidades de negócio possuem as colunas `is_deleted BOOLEAN DEFAULT FALSE` e `deleted_at TIMESTAMPTZ`.

---

## 2. Tabelas do Núcleo Organizacional e Geográfico

### 2.1 Tabela: `organizations`
Entidade de topo institucional proprietária das concessões.
| Campo | Tipo | Chave | Nulo | Default | Descrição / Restrições |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | Não | `gen_random_uuid()` | Identificador universal da organização. |
| `code` | VARCHAR(20) | UK | Não | — | Código mnemónico único (ex: 'LECASU-MOZ'). |
| `name` | VARCHAR(150) | — | Não | — | Razão social completa. |
| `tax_id` | VARCHAR(30) | UK | Sim | — | NUIT da organização em Moçambique. |
| `is_active` | BOOLEAN | — | Não | `TRUE` | Estado operacional da organização. |
| `created_at` | TIMESTAMPTZ | — | Não | `NOW()` | Data/hora de registo no sistema. |

### 2.2 Tabela: `regions`
Subdivisão geográfica e administrativa.
| Campo | Tipo | Chave | Nulo | Default | Descrição / Restrições |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | Não | `gen_random_uuid()` | Identificador único da região. |
| `organization_id`| UUID | FK | Não | — | Referência a `organizations(id)` ON DELETE RESTRICT. |
| `province` | VARCHAR(80) | — | Não | — | Província (ex: 'Inhambane', 'Gaza', 'Zambézia'). |
| `district` | VARCHAR(80) | — | Não | — | Distrito oficial. |
| `administrative_post` | VARCHAR(100) | — | Sim | — | Posto administrativo / Localidade sede. |

### 2.3 Tabela: `mini_grids`
Centrais de geração fotovoltaica com armazenamento e rede associada.
| Campo | Tipo | Chave | Nulo | Default | Descrição / Restrições |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | Não | `gen_random_uuid()` | Identificador único da mini-rede. |
| `region_id` | UUID | FK | Não | — | Referência a `regions(id)` ON DELETE RESTRICT. |
| `code` | VARCHAR(30) | UK | Não | — | Código oficial (ex: 'MG-MAVUME-01'). |
| `name` | VARCHAR(120) | — | Não | — | Nome da localidade / Central. |
| `solar_power_kwp`| NUMERIC(10,2) | — | Não | `0.00` | Potência solar instalada de pico ($>0$). |
| `bess_capacity_kwh`| NUMERIC(10,2) | — | Não | `0.00` | Capacidade útil de armazenamento BESS ($>0$). |
| `latitude` | NUMERIC(10,7) | — | Não | — | Coordenada de latitude (-90 a 90). |
| `longitude` | NUMERIC(10,7) | — | Não | — | Coordenada de longitude (-180 a 180). |
| `boundary_polygon`| JSONB | — | Sim | — | GeoJSON do polígono de concessão. |
| `operational_status`| VARCHAR(25) | — | Não | 'ACTIVE' | CHECK in ('ACTIVE', 'MAINTENANCE', 'DOWN', 'COMMISSIONING'). |
| `commissioned_at` | DATE | — | Sim | — | Data oficial de entrada em exploração comercial. |
| `created_at` | TIMESTAMPTZ | — | Não | `NOW()` | Registo de auditoria. |
* **Índices:** `CREATE UNIQUE INDEX idx_mini_grids_code ON mini_grids(code);`, `CREATE INDEX idx_mini_grids_region ON mini_grids(region_id);`.

### 2.4 Tabela: `grid_circuits`
Circuitos e ramais elétricos de distribuição em baixa e média tensão.
| Campo | Tipo | Chave | Nulo | Default | Descrição / Restrições |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | Não | `gen_random_uuid()` | Identificador único do circuito. |
| `mini_grid_id` | UUID | FK | Não | — | Referência a `mini_grids(id)` ON DELETE RESTRICT. |
| `code` | VARCHAR(30) | UK | Não | — | Código do circuito (ex: 'CIR-MAV-NORTE'). |
| `name` | VARCHAR(100) | — | Não | — | Descrição do ramal de distribuição. |
| `voltage_level` | VARCHAR(20) | — | Não | '400V_BT' | CHECK in ('230V_BT', '400V_BT', '11KV_MT', '33KV_MT'). |
| `max_current_capacity_a`| NUMERIC(8,2) | — | Sim | — | Capacidade de corrente limite dos condutores (Amperes). |

---

## 3. Tabelas de Clientes e Contratos

### 3.1 Tabela: `customers`
Cadastro individual de consumidores e entidades beneficiárias.
| Campo | Tipo | Chave | Nulo | Default | Descrição / Restrições |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | Não | `gen_random_uuid()` | Identificador universal do cliente. |
| `mini_grid_id` | UUID | FK | Não | — | Referência a `mini_grids(id)` ON DELETE RESTRICT. |
| `code` | VARCHAR(30) | UK | Não | — | Código comercial único (ex: 'CLI-MAV-0001'). |
| `full_name` | VARCHAR(150) | — | Não | — | Nome completo do titular ou designação da empresa. |
| `gender` | VARCHAR(15) | — | Sim | 'UNSPECIFIED' | CHECK in ('MALE', 'FEMALE', 'OTHER', 'ENTITY', 'UNSPECIFIED'). |
| `phone_primary` | VARCHAR(25) | — | Não | — | Número principal (usado para envio de SMS do token STS). |
| `phone_secondary`| VARCHAR(25) | — | Sim | — | Contacto alternativo ou de familiar. |
| `customer_type` | VARCHAR(25) | — | Não | 'DOMESTIC' | CHECK in ('DOMESTIC', 'COMMERCIAL', 'PUE', 'INSTITUTIONAL'). |
| `pue_activity` | VARCHAR(80) | — | Sim | — | Tipo de PUE (ex: 'Moageira', 'Carpintaria', 'Frio Comercial'). |
| `latitude` | NUMERIC(10,7) | — | Sim | — | Coordenadas GPS da habitação/estabelecimento. |
| `longitude` | NUMERIC(10,7) | — | Sim | — | Coordenadas GPS da habitação/estabelecimento. |
| `address_notes` | TEXT | — | Sim | — | Pontos de referência na aldeia. |
| `status` | VARCHAR(20) | — | Não | 'ACTIVE' | CHECK in ('ACTIVE', 'SUSPENDED', 'TERMINATED'). |
| `is_deleted` | BOOLEAN | — | Não | `FALSE` | Controlo de soft-delete. |
| `created_at` | TIMESTAMPTZ | — | Não | `NOW()` | Carimbo de criação. |
* **Índices:** `CREATE INDEX idx_customers_mini_grid ON customers(mini_grid_id);`, `CREATE INDEX idx_customers_phone ON customers(phone_primary);`.

### 3.2 Tabela: `customer_documents`
Documentos de identificação e autorizações comunitárias.
| Campo | Tipo | Chave | Nulo | Default | Descrição / Restrições |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | Não | `gen_random_uuid()` | Identificador único do documento. |
| `customer_id` | UUID | FK | Não | — | Referência a `customers(id)` ON DELETE CASCADE. |
| `document_type` | VARCHAR(30) | — | Não | — | CHECK in ('BI', 'PASSPORT', 'DIRE', 'NUIT', 'COMMUNITY_DECLARATION'). |
| `document_number`| VARCHAR(50) | — | Não | — | Número impresso no documento. |
| `file_url` | VARCHAR(255) | — | Sim | — | Caminho do arquivo fotográfico armazenado. |
| `verified_by_user_id`| UUID | FK | Sim | — | Referência a `users(id)` que validou o documento. |

### 3.3 Tabela: `contracts`
Contrato de fornecimento de energia elétrica.
| Campo | Tipo | Chave | Nulo | Default | Descrição / Restrições |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | Não | `gen_random_uuid()` | Identificador único do contrato. |
| `customer_id` | UUID | FK | Não | — | Referência a `customers(id)` ON DELETE RESTRICT. |
| `tariff_schedule_id`| UUID | FK | Não | — | Tabela tarifária aplicável `tariff_schedules(id)`. |
| `contract_number`| VARCHAR(40) | UK | Não | — | Número oficial do contrato (ex: 'CTR-2026-0001'). |
| `contracted_power_kva`| NUMERIC(6,2)| — | Não | `1.10` | Potência contratada em kVA. |
| `breaker_amperage_a` | NUMERIC(5,1)| — | Não | `10.0` | Calibre do disjuntor de corte/limitação (Amperes). |
| `security_deposit_mt`| NUMERIC(10,2)| — | Não | `0.00` | Caução de ligação em Meticais. |
| `billing_type` | VARCHAR(20) | — | Não | 'PREPAID_STS'| CHECK in ('PREPAID_STS', 'POSTPAID_MONTHLY'). |
| `status` | VARCHAR(25) | — | Não | 'PENDING_CONNECTION'| CHECK in ('PENDING_CONNECTION', 'ACTIVE', 'SUSPENDED_DEBT', 'DISCONNECTED_FAULT', 'TERMINATED'). |
| `signed_at` | DATE | — | Não | — | Data de celebração do contrato. |
| `connected_at` | TIMESTAMPTZ | — | Sim | — | Data/hora de ligação física efetiva. |

---

## 4. Tabelas de Parque de Contadores e Medição

### 4.1 Tabela: `meters`
Inventário físico de instrumentos de medição.
| Campo | Tipo | Chave | Nulo | Default | Descrição / Restrições |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | Não | `gen_random_uuid()` | Identificador único do medidor. |
| `circuit_id` | UUID | FK | Não | — | Referência a `grid_circuits(id)`. |
| `current_contract_id`| UUID | FK | Sim | — | Referência ao contrato ativo `contracts(id)`. |
| `serial_number` | VARCHAR(50) | UK | Não | — | Número de série único do contador. |
| `manufacturer` | VARCHAR(60) | — | Não | — | Fabricante (ex: 'Hexing', 'Inhemeter', 'Landis+Gyr'). |
| `model` | VARCHAR(60) | — | Não | — | Modelo do equipamento. |
| `meter_type` | VARCHAR(25) | — | Não | 'STS_PREPAID' | CHECK in ('STS_PREPAID', 'POSTPAID_ELECTROMECHANICAL', 'SMART_AMI'). |
| `sts_tariff_index`| VARCHAR(10) | — | Sim | '01' | Índice de tarifa STS para o gerador de tokens. |
| `seal_number` | VARCHAR(40) | — | Sim | — | Número do selo de inviolabilidade física. |
| `status` | VARCHAR(20) | — | Não | 'IN_STOCK' | CHECK in ('IN_STOCK', 'INSTALLED', 'FAULTY', 'RETIRED'). |
| `installed_at` | TIMESTAMPTZ | — | Sim | — | Data/hora da instalação no cliente. |
* **Índices:** `CREATE UNIQUE INDEX idx_meters_serial ON meters(serial_number);`.

### 4.2 Tabela: `meter_readings`
Leituras periódicas de contadores para medição e auditoria.
| Campo | Tipo | Chave | Nulo | Default | Descrição / Restrições |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | Não | `gen_random_uuid()` | Identificador único da leitura. |
| `meter_id` | UUID | FK | Não | — | Referência a `meters(id)` ON DELETE RESTRICT. |
| `recorded_by_user_id`| UUID | FK | Não | — | Técnico/agente que recolheu a leitura `users(id)`. |
| `reading_value_kwh`| NUMERIC(12,3)| — | Não | — | Valor numérico lido no mostrador ($ \ge 0 $). |
| `reading_date` | TIMESTAMPTZ | — | Não | `NOW()` | Data/hora exata da leitura. |
| `reading_source` | VARCHAR(20) | — | Não | 'MOBILE_APP' | CHECK in ('MANUAL_INPUT', 'MOBILE_APP', 'BATCH_FILE', 'IOT_TELEMETRY'). |
| `validation_status`| VARCHAR(20) | — | Não | 'VALID' | CHECK in ('VALID', 'SUSPECT_ANOMALY', 'ROLLOVER_VERIFIED', 'REJECTED'). |
| `photo_url` | VARCHAR(255) | — | Sim | — | Fotografia do mostrador como evidência metrológica. |
| `is_rollover` | BOOLEAN | — | Não | `FALSE` | Sinalização de rotação completa do contador. |
| `notes` | TEXT | — | Sim | — | Observações de campo (ex: 'Mostrador com poeira'). |
* **Índices:** `CREATE INDEX idx_meter_readings_meter_date ON meter_readings(meter_id, reading_date DESC);`.

---

## 5. Tabelas de Tarifas, Faturação e Pagamentos

### 5.1 Tabela: `tariff_schedules` e `tariff_tiers`
Tabelas e escalões homologados de cobrança.
* **`tariff_schedules`:**
  - `id` (UUID PK), `name` (VARCHAR), `target_class` (VARCHAR: 'DOMESTIC', 'PUE', 'COMMERCIAL'), `standing_charge_mt` (NUMERIC: Taxa fixa mensal), `connection_fee_mt` (NUMERIC: Taxa de ligação), `reconnection_fee_mt` (NUMERIC: Taxa de religação pós-corte), `valid_from` (DATE), `valid_to` (DATE), `is_active` (BOOLEAN).
* **`tariff_tiers`:**
  - `id` (UUID PK), `tariff_schedule_id` (UUID FK), `tier_order` (INT: 1, 2, 3), `min_kwh` (NUMERIC), `max_kwh` (NUMERIC: NULL se for sem limite superior), `price_per_kwh_mt` (NUMERIC: Preço em Meticais por kWh).

### 5.2 Tabela: `invoices`
Faturas mensais em regime pós-pago.
| Campo | Tipo | Chave | Nulo | Default | Descrição / Restrições |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | Não | `gen_random_uuid()` | Identificador universal da fatura. |
| `contract_id` | UUID | FK | Não | — | Referência a `contracts(id)`. |
| `invoice_number`| VARCHAR(50) | UK | Não | — | Número fiscal único (ex: 'FT-2026-000456'). |
| `billing_period_start`| DATE | — | Não | — | Início do ciclo de consumo. |
| `billing_period_end` | DATE | — | Não | — | Fim do ciclo de consumo. |
| `consumption_kwh` | NUMERIC(10,3)| — | Não | — | Consumo líquido apurado no período. |
| `energy_amount_mt` | NUMERIC(12,2)| — | Não | — | Valor relativo aos kWh consumidos. |
| `fixed_charges_mt` | NUMERIC(10,2)| — | Não | `0.00` | Taxa de disponibilidade somada. |
| `tax_amount_mt` | NUMERIC(10,2)| — | Não | `0.00` | Valor apurado de IVA (16%). |
| `total_amount_mt` | NUMERIC(12,2)| — | Não | — | Total a liquidar pelo cliente. |
| `due_date` | DATE | — | Não | — | Data limite de pagamento. |
| `status` | VARCHAR(20) | — | Não | 'ISSUED' | CHECK in ('ISSUED', 'PAID', 'OVERDUE', 'CANCELLED_REVERSED'). |

### 5.3 Tabela: `payments`
Registo de recebimentos financeiros e canais de liquidação.
| Campo | Tipo | Chave | Nulo | Default | Descrição / Restrições |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | Não | `gen_random_uuid()` | Identificador universal do pagamento. |
| `invoice_id` | UUID | FK | Sim | — | Vinculação opcional a fatura pós-paga `invoices(id)`. |
| `customer_id` | UUID | FK | Não | — | Referência a `customers(id)`. |
| `received_by_user_id`| UUID | FK | Sim | — | Agente/Caixa responsável pelo recebimento `users(id)`. |
| `payment_reference` | VARCHAR(60) | UK | Não | — | Referência interna gerada pelo GridOps. |
| `amount_paid_mt` | NUMERIC(12,2)| — | Não | — | Montante em Meticais pago ($ > 0 $). |
| `payment_channel` | VARCHAR(30) | — | Não | — | CHECK in ('M_PESA', 'E_MOLA', 'M_KESH', 'BANK_TRANSFER', 'CASH_AGENT'). |
| `mobile_provider_tx_id`| VARCHAR(80)| UK | Sim | — | ID de transação da operadora móvel (ex: Vodacom M-Pesa ID). |
| `reconciliation_status`| VARCHAR(25)| — | Não | 'PENDING' | CHECK in ('PENDING', 'RECONCILED', 'DISCREPANCY_FLAGGED'). |
| `payment_timestamp` | TIMESTAMPTZ | — | Não | `NOW()` | Data/hora oficial da realização do pagamento. |

### 5.4 Tabela: `sts_tokens`
Tokens pré-pagos gerados segundo a norma IEC 62055-41.
| Campo | Tipo | Chave | Nulo | Default | Descrição / Restrições |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | Não | `gen_random_uuid()` | Identificador do token. |
| `meter_id` | UUID | FK | Não | — | Contador de destino `meters(id)`. |
| `payment_id` | UUID | FK | Não | — | Pagamento originador `payments(id)`. |
| `token_digits` | VARCHAR(25) | UK | Não | — | Dígitos encriptados formatados (20 dígitos). |
| `kwh_credited` | NUMERIC(10,3)| — | Não | — | Energia útil gerada em quilowatt-hora. |
| `gross_amount_mt` | NUMERIC(10,2)| — | Não | — | Montante bruto introduzido pelo cliente. |
| `debt_deduction_mt`| NUMERIC(10,2)| — | Não | `0.00` | Parcela retida para amortização de dívidas. |
| `net_energy_amount_mt`| NUMERIC(10,2)| — | Não | — | Parcela líquida convertida em eletricidade. |
| `generated_at` | TIMESTAMPTZ | — | Não | `NOW()` | Carimbo temporal imutável de emissão. |

### 5.5 Tabela: `customer_accounts` e `account_transactions`
Conta corrente e registo de movimentos de saldo/dívida.
* **`customer_accounts`:** `id` (UUID PK), `customer_id` (UUID FK UK), `current_balance_mt` (NUMERIC: Saldo credor por adiantamentos), `total_debt_mt` (NUMERIC: Saldo devedor total acumulado), `updated_at` (TIMESTAMPTZ).
* **`account_transactions`:** `id` (UUID PK), `account_id` (UUID FK), `transaction_type` (VARCHAR: 'PAYMENT_CREDIT', 'INVOICE_DEBIT', 'DEBT_AMORTIZATION', 'MANUAL_REVERSAL'), `amount_mt` (NUMERIC), `balance_after_mt` (NUMERIC), `debt_after_mt` (NUMERIC), `reference_entity` (VARCHAR), `reference_id` (UUID), `created_at` (TIMESTAMPTZ).

---

## 6. Tabelas de Ativos, Ocorrências e Ordens de Trabalho (O&M)

### 6.1 Tabela: `assets`
Inventário de ativos patrimoniais da central e da rede de distribuição.
| Campo | Tipo | Chave | Nulo | Default | Descrição / Restrições |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | Não | `gen_random_uuid()` | Identificador universal do ativo. |
| `mini_grid_id` | UUID | FK | Não | — | Central à qual pertence `mini_grids(id)`. |
| `asset_code` | VARCHAR(40) | UK | Não | — | Código patrimonial (ex: 'ATV-INV-001'). |
| `asset_type` | VARCHAR(30) | — | Não | — | CHECK in ('PV_MODULE', 'INVERTER', 'BESS_BATTERY', 'CHARGE_CONTROLLER', 'TRANSFORMER', 'GENERATOR'). |
| `serial_number` | VARCHAR(60) | — | Sim | — | Número de série de fábrica do equipamento. |
| `manufacturer` | VARCHAR(80) | — | Não | — | Nome do fabricante. |
| `model` | VARCHAR(80) | — | Não | — | Modelo de catálogo. |
| `purchase_date` | DATE | — | Sim | — | Data de aquisição pelo projeto. |
| `warranty_expiry`| DATE | — | Sim | — | Data de termo da garantia de fábrica. |
| `status` | VARCHAR(25) | — | Não | 'OPERATIONAL' | CHECK in ('OPERATIONAL', 'DEGRADED', 'UNDER_MAINTENANCE', 'FAULTY', 'RETIRED'). |

### 6.2 Tabela: `work_orders` e `work_order_evidences`
Ordens de trabalho técnicas e registo probatório fotográfico.
* **`work_orders`:**
  - `id` (UUID PK), `order_number` (VARCHAR UK: ex: 'OT-2026-00123'), `mini_grid_id` (UUID FK), `incident_id` (UUID FK opcional), `assigned_technician_id` (UUID FK: técnico responsável), `order_type` (VARCHAR: 'NEW_CONNECTION', 'INSPECTION', 'DISCONNECTION', 'RECONNECTION', 'CORRECTIVE_REPAIR', 'PREVENTIVE_MAINTENANCE'), `priority` (VARCHAR: 'HIGH_4H', 'MEDIUM_24H', 'LOW_72H'), `status` (VARCHAR: 'OPEN', 'ASSIGNED', 'IN_TRANSIT', 'IN_PROGRESS', 'FIELD_COMPLETED', 'AUDITED_CLOSED', 'CANCELLED'), `scheduled_for` (DATE), `sla_deadline` (TIMESTAMPTZ), `closed_at` (TIMESTAMPTZ), `created_at` (TIMESTAMPTZ).
* **`work_order_evidences`:**
  - `id` (UUID PK), `work_order_id` (UUID FK ON DELETE CASCADE), `evidence_type` (VARCHAR: 'BEFORE_WORK', 'AFTER_WORK', 'METER_SEAL', 'DEFECT_DETAIL'), `photo_url` (VARCHAR: caminho do ficheiro), `latitude` (NUMERIC), `longitude` (NUMERIC), `captured_at` (TIMESTAMPTZ).

---

## 7. Tabelas de Utilizadores e Trilha de Auditoria

### 7.1 Tabela: `users`
Contas de acesso e autenticação no sistema.
| Campo | Tipo | Chave | Nulo | Default | Descrição / Restrições |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | Não | `gen_random_uuid()` | Identificador do utilizador. |
| `organization_id`| UUID | FK | Não | — | Organização patronal `organizations(id)`. |
| `email` | VARCHAR(120) | UK | Não | — | Correio eletrónico para login e notificações. |
| `full_name` | VARCHAR(120) | — | Não | — | Nome e apelido do operador. |
| `role` | VARCHAR(30) | — | Não | — | CHECK in ('ADMIN', 'OPERATIONS_MANAGER', 'COMMERCIAL_MANAGER', 'FINANCE', 'FIELD_TECHNICIAN', 'COMMUNITY_AGENT', 'AUDITOR_PARTNER', 'CUSTOMER'). |
| `password_hash` | VARCHAR(255) | — | Não | — | Hash encriptado com algoritmo bcrypt (custo $\ge 10$). |
| `phone_number` | VARCHAR(25) | — | Sim | — | Contacto móvel do operador. |
| `is_active` | BOOLEAN | — | Não | `TRUE` | Estado de ativação de conta. |
| `last_login_at` | TIMESTAMPTZ | — | Sim | — | Carimbo do último login com sucesso. |
| `created_at` | TIMESTAMPTZ | — | Não | `NOW()` | Registo de criação. |

### 7.2 Tabela: `audit_logs`
Trilha cronológica imutável (*Append-Only*) de eventos e mutações de dados.
| Campo | Tipo | Chave | Nulo | Default | Descrição / Restrições |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `id` | UUID | PK | Não | `gen_random_uuid()` | Identificador único do evento. |
| `user_id` | UUID | FK | Sim | — | Utilizador que realizou a ação (NULL se sistema/cron). |
| `entity_name` | VARCHAR(50) | — | Não | — | Nome da tabela afetada (ex: 'contracts', 'payments'). |
| `entity_id` | UUID | — | Não | — | ID do registo alvo modificado. |
| `action_type` | VARCHAR(20) | — | Não | — | CHECK in ('INSERT', 'UPDATE', 'SOFT_DELETE', 'APPROVE', 'REVERSE'). |
| `old_values` | JSONB | — | Sim | — | Snapshot dos valores anteriores à mutação. |
| `new_values` | JSONB | — | Sim | — | Snapshot dos valores gravados após a mutação. |
| `ip_address` | VARCHAR(45) | — | Sim | — | Endereço IP de origem da requisição. |
| `user_agent` | VARCHAR(255) | — | Sim | — | Navegador ou dispositivo de origem. |
| `performed_at` | TIMESTAMPTZ | — | Não | `NOW()` | Carimbo temporal UTC imutável. |
* **Restrição de Segurança:** Proibido qualquer comando `UPDATE` ou `DELETE` nesta tabela via permissões de base de dados (regra *Revoke Update/Delete* aplicada no PostgreSQL).
