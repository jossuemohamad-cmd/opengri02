# 08 — Modelo Entidade-Relacionamento (ERD)
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Desenho do Modelo Conceitual e Lógico de Base de Dados  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Referências Centrais:** PRD Consolidada (`docs/02-PRD-CONSOLIDADA.md`), Regras de Negócio (`docs/05-REGRAS-DE-NEGOCIO.md`) e Arquitectura de Software (`docs/07-ARQUITECTURA-DE-SOFTWARE.md`)  
**Responsável:** Modelação de Dados e Arquitectura de Base de Dados  
**Data de Emissão:** 05 de Novembro de 2026  
**Estado:** Submetido para Validação e Aprovação Formal  

---

## 1. Visão Geral da Modelação

O modelo de dados do **LECASU GridOps** foi projetado para assegurar estrita integridade referencial, rastreabilidade completa e suporte multi-concessão.

A estrutura nuclear obedece à hierarquia operacional mandatória:
$$\text{Organizações} \longrightarrow \text{Regiões} \longrightarrow \text{Mini-Redes} \longrightarrow \text{Circuitos} \longrightarrow \text{Clientes} \longrightarrow \text{Contratos} \longrightarrow \text{Contadores} \longrightarrow \text{Leituras} \longrightarrow \text{Faturação} \longrightarrow \text{Pagamentos}$$

Em paralelo, articulam-se os submódulos de **Gestão Patrimonial de Ativos**, **Ocorrências & Ordens de Trabalho (O&M)**, **Governação de Utilizadores (RBAC)** e **Trilha de Auditoria Imutável**.

---

## 2. Diagrama Entidade-Relacionamento Completo (Mermaid ERD)

```mermaid
erDiagram
    ORGANIZATIONS ||--o{ REGIONS : "possui"
    ORGANIZATIONS ||--o{ USERS : "emprega"
    REGIONS ||--o{ MINI_GRIDS : "engloba"
    
    MINI_GRIDS ||--o{ GRID_CIRCUITS : "distribui_por"
    MINI_GRIDS ||--o{ ASSETS : "possui_ativos"
    MINI_GRIDS ||--o{ CUSTOMERS : "atende"
    MINI_GRIDS ||--o{ WORK_ORDERS : "localiza_ots"
    MINI_GRIDS ||--o{ USER_ASSIGNMENTS : "tem_tecnicos"

    USERS ||--o{ USER_ASSIGNMENTS : "alocado_a"
    USERS ||--o{ WORK_ORDERS : "responsavel_ou_executor"
    USERS ||--o{ AUDIT_LOGS : "origina_acao"
    USERS ||--o{ PAYMENTS : "recolhe_ou_aprova"

    GRID_CIRCUITS ||--o{ METERS : "alimenta"
    
    CUSTOMERS ||--o{ CUSTOMER_DOCUMENTS : "identificado_por"
    CUSTOMERS ||--o{ CONTRACTS : "celebra"
    CUSTOMERS ||--o{ INCIDENTS : "reporta"
    CUSTOMERS ||--o{ CUSTOMER_ACCOUNTS : "possui_saldo"

    CONTRACTS ||--o{ METERS : "vincula_medidor"
    CONTRACTS ||--o{ INVOICES : "origina_cobranca"
    CONTRACTS ||--o{ STS_TOKENS : "recebe_recargas"
    
    TARIFF_SCHEDULES ||--o{ TARIFF_TIERS : "contem_escaloes"
    TARIFF_SCHEDULES ||--o{ CONTRACTS : "taxa_aplicavel"

    METERS ||--o{ METER_READINGS : "regista_consumo"
    METER_READINGS ||--o{ INVOICES : "base_de_calculo"

    INVOICES ||--o{ PAYMENTS : "liquidada_por"
    CUSTOMER_ACCOUNTS ||--o{ ACCOUNT_TRANSACTIONS : "historico_movimentos"
    PAYMENTS ||--o{ ACCOUNT_TRANSACTIONS : "gera_credito"
    PAYMENTS ||--o{ STS_TOKENS : "emite_token"

    ASSETS ||--o{ INCIDENTS : "sofre_avaria"
    INCIDENTS ||--o{ WORK_ORDERS : "origina_manutencao"
    WORK_ORDERS ||--o{ WORK_ORDER_ITEMS : "detalha_tarefas"
    WORK_ORDERS ||--o{ WORK_ORDER_EVIDENCES : "comprova_fotos"
    WORK_ORDERS ||--o{ WORK_ORDER_PARTS : "consome_materiais"

    ORGANIZATIONS {
        uuid id PK
        string code UK
        string name
        string tax_id
        boolean is_active
        timestamp created_at
    }

    REGIONS {
        uuid id PK
        uuid organization_id FK
        string province
        string district
        string administrative_post
    }

    MINI_GRIDS {
        uuid id PK
        uuid region_id FK
        string code UK
        string name
        numeric solar_power_kwp
        numeric bess_capacity_kwh
        numeric latitude
        numeric longitude
        jsonb boundary_polygon
        string operational_status
        timestamp commissioned_at
    }

    GRID_CIRCUITS {
        uuid id PK
        uuid mini_grid_id FK
        string code UK
        string name
        string voltage_level
        numeric max_current_capacity_a
    }

    CUSTOMERS {
        uuid id PK
        uuid mini_grid_id FK
        string code UK
        string full_name
        string gender
        string phone_primary
        string customer_type
        numeric latitude
        numeric longitude
        string status
        boolean is_deleted
    }

    CONTRACTS {
        uuid id PK
        uuid customer_id FK
        uuid tariff_schedule_id FK
        string contract_number UK
        numeric contracted_power_kva
        numeric breaker_amperage_a
        numeric security_deposit_mt
        string billing_type
        string status
        timestamp signed_at
    }

    METERS {
        uuid id PK
        uuid circuit_id FK
        uuid current_contract_id FK
        string serial_number UK
        string manufacturer
        string model
        string meter_type
        string seal_number
        string status
        timestamp installed_at
    }

    METER_READINGS {
        uuid id PK
        uuid meter_id FK
        uuid recorded_by_user_id FK
        numeric reading_value_kwh
        timestamp reading_date
        string reading_source
        string validation_status
        string photo_url
        boolean is_rollover
    }

    TARIFF_SCHEDULES {
        uuid id PK
        string name
        string target_class
        date valid_from
        date valid_to
        numeric standing_charge_mt
        numeric connection_fee_mt
        boolean is_active
    }

    TARIFF_TIERS {
        uuid id PK
        uuid tariff_schedule_id FK
        integer tier_order
        numeric min_kwh
        numeric max_kwh
        numeric price_per_kwh_mt
    }

    INVOICES {
        uuid id PK
        uuid contract_id FK
        string invoice_number UK
        date billing_period_start
        date billing_period_end
        numeric consumption_kwh
        numeric energy_amount_mt
        numeric fixed_charges_mt
        numeric tax_amount_mt
        numeric total_amount_mt
        date due_date
        string status
    }

    PAYMENTS {
        uuid id PK
        uuid invoice_id FK
        uuid received_by_user_id FK
        string payment_reference UK
        numeric amount_paid_mt
        string payment_channel
        string mobile_provider_tx_id UK
        string reconciliation_status
        timestamp payment_timestamp
    }

    STS_TOKENS {
        uuid id PK
        uuid meter_id FK
        uuid payment_id FK
        string token_digits UK
        numeric kwh_credited
        numeric gross_amount_mt
        numeric debt_deduction_mt
        numeric net_energy_amount_mt
        timestamp generated_at
    }

    CUSTOMER_ACCOUNTS {
        uuid id PK
        uuid customer_id FK
        numeric current_balance_mt
        numeric total_debt_mt
        timestamp updated_at
    }

    ASSETS {
        uuid id PK
        uuid mini_grid_id FK
        string asset_code UK
        string asset_type
        string serial_number
        string manufacturer
        date purchase_date
        date warranty_expiry
        string status
    }

    INCIDENTS {
        uuid id PK
        uuid mini_grid_id FK
        uuid reported_by_customer_id FK
        string incident_code UK
        string title
        string severity
        string status
        timestamp reported_at
    }

    WORK_ORDERS {
        uuid id PK
        uuid incident_id FK
        uuid mini_grid_id FK
        uuid assigned_technician_id FK
        string order_number UK
        string order_type
        string priority
        string status
        timestamp scheduled_for
        timestamp closed_at
    }

    WORK_ORDER_EVIDENCES {
        uuid id PK
        uuid work_order_id FK
        string evidence_type
        string photo_url
        numeric latitude
        numeric longitude
        timestamp captured_at
    }

    USERS {
        uuid id PK
        uuid organization_id FK
        string email UK
        string full_name
        string role
        string password_hash
        boolean is_active
        timestamp last_login_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        string entity_name
        uuid entity_id
        string action_type
        jsonb old_values
        jsonb new_values
        string ip_address
        timestamp performed_at
    }
```

---

## 3. Descrição das Principais Relações e Integridade

1. **Organização $\rightarrow$ Regiões $\rightarrow$ Mini-Redes:**
   * Uma Organização possui múltiplas Regiões geográficas; cada Região agrega uma ou mais Mini-Redes solares.
   * Não é permitida a existência de uma Mini-Rede órfã sem vinculação geográfica e organizacional.
2. **Mini-Rede $\rightarrow$ Circuitos $\rightarrow$ Contadores:**
   * Cada Mini-Rede divide-se em circuitos elétricos de distribuição. Cada contador metrológico está eletricamente conectado a um circuito específico para apuramento de balanços energéticos setoriais.
3. **Cliente $\rightarrow$ Contrato $\rightarrow$ Contador:**
   * A relação entre Cliente e Contador é sempre intermediada pelo **Contrato**.
   * Um contrato possui exatamente um contador ativo no momento. Ao substituir um contador danificado, o contador antigo tem o vínculo encerrado com carimbo temporal e o novo contador é associado mantendo o número do contrato.
4. **Leituras $\rightarrow$ Faturação / Vending STS:**
   * Em regime pós-pago, a leitura validada alimenta o cálculo da Fatura.
   * Em regime pré-pago, o pagamento direto dispara a geração de registo na entidade `STS_TOKENS`, que registra de forma auditável os 20 dígitos gerados e o rateio financeiro (energia vs amortização de dívida).
5. **Auditoria Geral Imutável (`AUDIT_LOGS`):**
   * Tabela em modo *append-only*. Não admite comandos `UPDATE` ou `DELETE`. Todas as mutações em clientes, contratos, faturas, pagamentos e utilizadores disparam triggers relacionais que inserem uma nova linha nesta tabela com o payload anterior e atual.
