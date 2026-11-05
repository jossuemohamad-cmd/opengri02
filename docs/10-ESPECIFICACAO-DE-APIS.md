# 10 — Especificação de APIs RESTful
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Contratos de Interface de Programação de Aplicações (REST API v1.0)  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Referências Centrais:** PRD Consolidada (`docs/02-PRD-CONSOLIDADA.md`), Catálogo de Requisitos (`docs/03-CATALOGO-DE-REQUISITOS.md`) e Dicionário de Dados (`docs/09-DICIONARIO-DE-DADOS.md`)  
**Responsável:** Arquitectura de APIs e Engenharia de Integração  
**Data de Emissão:** 05 de Novembro de 2026  
**Estado:** Submetido para Validação e Aprovação Formal  

---

## 1. Padrões Globais da API

* **Protocolo e Versão:** Todas as chamadas operam exclusivamente sobre HTTPS (TLS 1.3), sob o prefixo de rota `/api/v1/`.
* **Formato de Carga Útil (*Payload*):** `application/json; charset=utf-8`.
* **Cabeçalhos HTTP Obrigatórios:**
  - `Authorization: Bearer <JWT_TOKEN>` (obrigatório em todas as rotas protegidas).
  - `Content-Type: application/json` (em requisições com corpo).
  - `X-Client-UUID: <UUID>` (identificador do dispositivo PWA para rastreio e reconciliação offline).
  - `X-Request-ID: <UUID>` (identificador único da requisição para rastreabilidade nos logs).

### 1.1 Códigos de Resposta HTTP Padronizados
* **`200 OK`:** Requisição processada com sucesso com retorno de dados.
* **`201 Created`:** Novo recurso persistido com sucesso na base de dados.
* **`204 No Content`:** Ação executada com sucesso sem conteúdo no corpo de resposta.
* **`400 Bad Request`:** Erro de sintaxe, parâmetros inválidos ou falha de validação de esquema.
* **`401 Unauthorized`:** Token JWT ausente, expirado ou com assinatura inválida.
* **`403 Forbidden`:** Utilizador autenticado não possui privilégios no perfil RBAC para a rota.
* **`404 Not Found`:** Recurso não localizado na base de dados ou fora do escopo da concessão.
* **`409 Conflict`:** Conflito de integridade (ex: número de série de contador ou transação duplicada).
* **`422 Unprocessable Entity`:** Violação de regra de negócio (ex: leitura atual menor que a anterior).
* **`500 Internal Server Error`:** Falha inesperada do servidor (sem vazamento de stack-trace sensível).

---

## 2. Especificação dos Endpoints por Módulo

### 2.1 Módulo 00 — Autenticação e Sessão (`/api/v1/auth`)

#### `POST /api/v1/auth/login`
Autenticação de operador e emissão de token JWT.
* **Acesso:** Público (com proteção de taxa de requisições - *Rate Limit* de 5 tentativas por minuto).
* **Corpo da Requisição (Request Body):**
  ```json
  {
    "email": "tecnico.mavume@lecasu.co.mz",
    "password": "SenhaSegura123!"
  }
  ```
* **Resposta de Sucesso (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expires_in": 28800,
      "user": {
        "id": "7b8f9e21-0000-4000-a000-111111111111",
        "full_name": "Mateus Mondlane",
        "email": "tecnico.mavume@lecasu.co.mz",
        "role": "FIELD_TECHNICIAN",
        "assigned_mini_grids": ["MG-MAVUME-01"]
      }
    }
  }
  ```

#### `GET /api/v1/auth/me`
Recuperação do perfil do utilizador autenticado e concessões autorizadas.
* **Acesso:** Autenticado (`Qualquer Perfil`).
* **Resposta (`200 OK`):** Retorna os dados cadastrais do operador ativo.

---

### 2.2 Módulo 01 — Mini-Redes e Cartografia SIG (`/api/v1/mini-grids`)

#### `GET /api/v1/mini-grids`
Listagem de mini-redes operadas pela organização (com filtro geográfico).
* **Acesso:** `ADMIN`, `OPERATIONS_MANAGER`, `COMMERCIAL_MANAGER`, `FINANCE`, `AUDITOR_PARTNER`.
* **Parâmetros de Consulta (Query Params):** `province`, `district`, `status`, `page`, `limit`.

#### `POST /api/v1/mini-grids`
Cadastro de nova central de geração fotovoltaica com BESS.
* **Acesso:** `ADMIN`, `OPERATIONS_MANAGER`.
* **Request Body:**
  ```json
  {
    "region_id": "9a1f2c3d-0000-4000-a000-222222222222",
    "code": "MG-MAVUME-01",
    "name": "Central Solar Fotovoltaica de Mavume",
    "solar_power_kwp": 120.00,
    "bess_capacity_kwh": 240.00,
    "latitude": -23.7541234,
    "longitude": 35.1234567,
    "operational_status": "ACTIVE"
  }
  ```

#### `GET /api/v1/mini-grids/:id/gis`
Extração de camadas geoespaciais (GeoJSON) da concessão (Central, Linhas BT/MT, Postes e Clientes).
* **Acesso:** `ADMIN`, `OPERATIONS_MANAGER`, `FIELD_TECHNICIAN`.

---

### 2.3 Módulo 02 — Gestão Comercial de Clientes e Contratos (`/api/v1/customers` & `/api/v1/contracts`)

#### `POST /api/v1/customers`
Cadastro de novo consumidor rural ou empresa comunitária (PUE).
* **Acesso:** `COMMERCIAL_MANAGER`, `COMMUNITY_AGENT`, `ADMIN`.
* **Request Body:**
  ```json
  {
    "mini_grid_id": "11111111-2222-3333-4444-555555555555",
    "full_name": "Alberto Chissano",
    "gender": "MALE",
    "phone_primary": "+258841234567",
    "customer_type": "PUE",
    "pue_activity": "Moageira Comunitária",
    "latitude": -23.7550111,
    "longitude": 35.1245888
  }
  ```

#### `POST /api/v1/contracts`
Celebração de contrato de fornecimento e vinculação tarifária.
* **Acesso:** `COMMERCIAL_MANAGER`, `ADMIN`.
* **Request Body:**
  ```json
  {
    "customer_id": "aaaa1111-bbbb-2222-cccc-333333333333",
    "tariff_schedule_id": "tttt1111-2222-3333-4444-555555555555",
    "contracted_power_kva": 3.30,
    "breaker_amperage_a": 15.0,
    "security_deposit_mt": 1500.00,
    "billing_type": "PREPAID_STS"
  }
  ```

---

### 2.4 Módulo 03 — Parque de Contadores e Medição (`/api/v1/meters` & `/api/v1/readings`)

#### `POST /api/v1/meters/:id/assign`
Associação biunívoca de contador a um contrato aprovado.
* **Acesso:** `FIELD_TECHNICIAN`, `COMMERCIAL_MANAGER`, `ADMIN`.
* **Request Body:**
  ```json
  {
    "contract_id": "cccc1111-2222-3333-4444-555555555555",
    "circuit_id": "cir11111-2222-3333-4444-555555555555",
    "seal_number": "SEL-2026-9876",
    "initial_reading_kwh": 0.000
  }
  ```

#### `POST /api/v1/readings`
Registo de leitura de consumo em campo.
* **Acesso:** `FIELD_TECHNICIAN`, `COMMUNITY_AGENT`, `ADMIN`.
* **Request Body:**
  ```json
  {
    "meter_id": "mmmm1111-2222-3333-4444-555555555555",
    "reading_value_kwh": 1450.320,
    "reading_source": "MOBILE_APP",
    "reading_date": "2026-11-05T10:30:00Z",
    "photo_url": "storage/uploads/readings/2026/11/photo_123.jpg",
    "is_rollover": false
  }
  ```

---

### 2.5 Módulo 04 — Faturação, Pagamentos e Vending STS (`/api/v1/vending` & `/api/v1/payments`)

#### `POST /api/v1/vending/sts-token`
Venda de energia pré-paga STS e emissão do token criptografado de 20 dígitos.
* **Acesso:** `COMMUNITY_AGENT`, `FINANCE`, `ADMIN`.
* **Request Body:**
  ```json
  {
    "meter_serial_number": "01234567890",
    "amount_mt": 200.00,
    "payment_channel": "CASH_AGENT",
    "client_transaction_uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
  }
  ```
* **Resposta de Sucesso (`201 Created`):**
  ```json
  {
    "success": true,
    "data": {
      "token_digits": "4820-1928-3746-5829-1029",
      "meter_serial": "01234567890",
      "customer_name": "Alberto Chissano",
      "kwh_credited": 15.000,
      "gross_amount_mt": 200.00,
      "debt_deduction_mt": 50.00,
      "net_energy_amount_mt": 150.00,
      "remaining_debt_mt": 450.00,
      "receipt_number": "REC-STS-2026-000456",
      "generated_at": "2026-11-05T10:45:00Z"
    }
  }
  ```

#### `POST /api/v1/payments/reverse`
Iniciação e aprovação de estorno de transação financeira em regime de quatro olhos.
* **Acesso:** `COMMERCIAL_MANAGER` (iniciar pedido) / `FINANCE` (autorizar efetivação).
* **Request Body:**
  ```json
  {
    "payment_id": "pay11111-2222-3333-4444-555555555555",
    "action": "AUTHORIZE",
    "justification": "Correção de lançamento manual por erro de digitação do agente comunitário."
  }
  ```

---

### 2.6 Módulo 06 — Ordens de Trabalho e Manutenção O&M (`/api/v1/work-orders`)

#### `POST /api/v1/work-orders`
Abertura e despacho de Ordem de Trabalho para equipa de campo.
* **Acesso:** `OPERATIONS_MANAGER`, `COMMERCIAL_MANAGER`, `ADMIN`.
* **Request Body:**
  ```json
  {
    "mini_grid_id": "11111111-2222-3333-4444-555555555555",
    "assigned_technician_id": "7b8f9e21-0000-4000-a000-111111111111",
    "order_type": "DISCONNECTION",
    "priority": "MEDIUM_24H",
    "target_contract_id": "cccc1111-2222-3333-4444-555555555555",
    "scheduled_for": "2026-11-06",
    "instructions": "Executar corte de ramal por dívida superior a 30 dias após aviso de 48h."
  }
  ```

#### `PUT /api/v1/work-orders/:id/complete`
Fecho de OT em campo pelo técnico com submissão de evidências.
* **Acesso:** `FIELD_TECHNICIAN`, `ADMIN`.
* **Request Body:**
  ```json
  {
    "latitude": -23.7549999,
    "longitude": 35.1246000,
    "materials_used": [
      { "part_name": "Selo de Segurança Plástico", "quantity": 1 }
    ],
    "evidences": [
      { "type": "BEFORE_WORK", "photo_url": "storage/uploads/ots/ot123_before.jpg" },
      { "type": "AFTER_WORK", "photo_url": "storage/uploads/ots/ot123_after.jpg" }
    ],
    "completion_notes": "Disjuntor de ramal desligado e caixa selada conforme norma."
  }
  ```

---

### 2.7 Módulo 07 — Indicadores e Relatórios Regulatórios (`/api/v1/reports`)

#### `GET /api/v1/reports/arene/export`
Geração do relatório regulatório oficial trimestral em Excel ou PDF.
* **Acesso:** `ADMIN`, `OPERATIONS_MANAGER`, `FINANCE`, `AUDITOR_PARTNER`.
* **Query Params:** `mini_grid_id`, `quarter` (ex: 'Q3-2026'), `format` ('XLSX' ou 'PDF').

---

### 2.8 Sincronização em Lote Offline-First (`/api/v1/sync`)

#### `POST /api/v1/sync/push`
Recebimento do pacote de eventos acumulados em campo sem sinal GSM.
* **Acesso:** `FIELD_TECHNICIAN`, `COMMUNITY_AGENT`.
* **Request Body:**
  ```json
  {
    "client_device_id": "DEV-SAMSUNG-A12-004",
    "batch_timestamp": "2026-11-05T11:00:00Z",
    "events": [
      {
        "event_uuid": "e1-uuid-v4",
        "type": "METER_READING",
        "payload": { "meter_id": "...", "value_kwh": 1420.5, "photo_base64": "..." }
      },
      {
        "event_uuid": "e2-uuid-v4",
        "type": "WORK_ORDER_STATUS_UPDATE",
        "payload": { "work_order_id": "...", "status": "FIELD_COMPLETED", "evidences": [...] }
      }
    ]
  }
  ```
* **Resposta de Sucesso (`200 OK`):**
  ```json
  {
    "success": true,
    "processed_count": 2,
    "failed_count": 0,
    "results": [
      { "event_uuid": "e1-uuid-v4", "status": "APPLIED", "server_id": "..." },
      { "event_uuid": "e2-uuid-v4", "status": "APPLIED", "server_id": "..." }
    ]
  }
  ```

