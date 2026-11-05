# 03 — Catálogo de Requisitos Funcionais e Não Funcionais
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Catálogo Formal de Requisitos e Histórias de Utilizador  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Referências Centrais:** Nota Conceptual e Especificação Funcional v1.0 (`docs/PRD.md`) e PRD Consolidada (`docs/02-PRD-CONSOLIDADA.md`)  
**Responsável:** Engenharia de Requisitos e Arquitetura de Software  
**Data de Emissão:** 05 de Novembro de 2026  
**Estado:** Submetido para Validação e Aprovação Formal  

---

## 1. Introdução e Metodologia

Este catálogo define com precisão atómica os requisitos funcionais, não funcionais e as histórias de utilizador do **LECASU GridOps**.
Cada requisito funcional possui:
* **Identificador Único:** Código estruturado por módulo (ex: `RF-M01-001`).
* **Priorização MoSCoW:**
  - **Must Have (M):** Obrigatório e inegociável para a entrada em produção do MVP.
  - **Should Have (S):** Altamente prioritário, com impacto significativo na eficiência operacional.
  - **Could Have (C):** Desejável, a implementar se houver folga de cronograma.
  - **Won't Have (W):** Fora do escopo do MVP (reservado para Fases Futuras).

---

## 2. Catálogo de Requisitos Funcionais (RF)

### 2.1 Módulo 01 — Cadastro de Mini-Redes e Georreferenciação (GIS)

| ID | Requisito Funcional | Prioridade | Descrição / Regra de Aceitação |
| :--- | :--- | :---: | :--- |
| **RF-M01-001** | Cadastro de Mini-Rede | **M** | O sistema deve permitir o registo de uma nova mini-rede com: Nome, Província, Distrito, Localidade, Coordenadas GPS da Central, Potência Solar de Pico (kWp) e Capacidade BESS (kWh). |
| **RF-M01-002** | Perímetro de Concessão GIS | **M** | O sistema deve permitir desenhar ou importar (GeoJSON/KML) o polígono georreferenciado da concessão da mini-rede. |
| **RF-M01-003** | Mapeamento do Traçado da Rede | **M** | O sistema deve permitir o registo georreferenciado dos circuitos de distribuição, linhas de BT e MT, postes e transformadores. |
| **RF-M01-004** | Visualização em Mapa Satélite | **M** | O sistema deve exibir um mapa interativo com camadas comutáveis (Central, Linhas de Rede, Postes, Clientes Ligados e Clientes em Potencial). |
| **RF-M01-005** | Estado Operacional da Mini-Rede | **M** | O sistema deve manter o estado operacional da mini-rede (*Ativa*, *Em Manutenção*, *Interrupção Total*, *Comissionamento*). |
| **RF-M01-006** | Segmentação por Circuitos | **S** | O sistema deve permitir associar clientes e contadores a ramais e circuitos específicos da rede para cálculo de balanço de carga. |

---

### 2.2 Módulo 02 — Gestão Comercial de Clientes e Contratos

| ID | Requisito Funcional | Prioridade | Descrição / Regra de Aceitação |
| :--- | :--- | :---: | :--- |
| **RF-M02-001** | Cadastro de Clientes | **M** | O sistema deve registar clientes individuais e coletivos com: Nome Completo, Género, Contacto Móvel, Localização Georreferenciada e Categoria de Uso. |
| **RF-M02-002** | Categorização de Consumidores | **M** | O sistema deve categorizar os clientes em: *Doméstico*, *Comercial*, *Usos Produtivos (PUE)* e *Institucional / Serviços Públicos*. |
| **RF-M02-003** | Registo Documental e PII | **M** | O sistema deve registar o número de identificação legal (BI ou NUIT) ou atestado de residência comunitário com upload de fotografia do documento. |
| **RF-M02-004** | Criação de Contrato de Fornecimento | **M** | O sistema deve gerar contratos associando cliente, mini-rede, potência contratada (kVA), disjuntor limitador, tarifa aplicável e valor de caução. |
| **RF-M02-005** | Ciclo de Vida do Contrato | **M** | O sistema deve gerir os estados contratuais: *Pendente de Ligação*, *Ativo*, *Suspenso por Dívida*, *Desligado por Avaria*, *Rescindido*. |
| **RF-M02-006** | Histórico de Ligações e Transferências | **S** | O sistema deve manter o histórico imutável de todas as alterações contratuais, mudanças de titularidade e transferências de contador. |

---

### 2.3 Módulo 03 — Parque de Contadores, Medição e Balanço Energético

| ID | Requisito Funcional | Prioridade | Descrição / Regra de Aceitação |
| :--- | :--- | :---: | :--- |
| **RF-M03-001** | Inventário Metrológico de Contadores | **M** | O sistema deve registar contadores com: Número de Série único, Fabricante, Modelo, Ano, Tipo (*STS Pré-Pago*, *Eletromecânico*, *Smart*) e Selo. |
| **RF-M03-002** | Associação Biunívoca Contador-Contrato | **M** | Um contador ativo só pode estar associado a um único contrato ativo em determinado momento. Não é permitida duplicidade de número de série. |
| **RF-M03-003** | Registo de Leituras Individuais | **M** | O sistema deve permitir registar leituras de consumo em campo indicando a data/hora, valor numérico do mostrador e fotografia do contador. |
| **RF-M03-004** | Importação de Leituras em Lote | **M** | O sistema deve suportar a importação em lote de leituras via ficheiro padronizado (CSV/Excel) com validação sintática antes da persistência. |
| **RF-M03-005** | Validação Automática de Leituras | **M** | O sistema deve rejeitar leituras inferiores à anterior (exceto rotação completa de escala documentada) e sinalizar leituras com desvio >300% da média. |
| **RF-M03-006** | Balanço Energético por Mini-Rede | **S** | O sistema deve confrontar a energia total injetada no barramento da central com o somatório de energia faturada aos clientes para apurar perdas. |

---

### 2.4 Módulo 04 — Tarifários, Faturação, Tokens STS e Reconciliação

| ID | Requisito Funcional | Prioridade | Descrição / Regra de Aceitação |
| :--- | :--- | :---: | :--- |
| **RF-M04-001** | Parametrização Tarifária Escalonada | **M** | O sistema deve suportar tabelas tarifárias com múltiplos escalões de consumo por kWh, taxas de disponibilidade e taxas de ligação aprovadas pela ARENE. |
| **RF-M04-002** | Geração de Tokens Pré-Pagos STS | **M** | O sistema deve gerar tokens de 20 dígitos no padrão internacional STS (IEC 62055-41) com base no número de série do contador e valor monetário líquido. |
| **RF-M04-003** | Emissão de Faturas Pós-Pagas | **M** | O sistema deve processar mensalmente as faturas pós-pagas aplicando a tarifa ao consumo medido, apurando o saldo anterior e calculando a data limite. |
| **RF-M04-004** | Registo de Pagamentos Multicanal | **M** | O sistema deve registar pagamentos efetuados via M-Pesa, e-Mola, mKesh, transferência bancária e numerário recebido por agente autorizado. |
| **RF-M04-005** | Gestão de Conta Corrente e Dívidas | **M** | O sistema deve manter o saldo corrente do cliente atualizado em tempo real, gerindo créditos pré-pagos e débitos acumulados. |
| **RF-M04-006** | Amortização Automática de Dívidas | **M** | Ao efetuar uma compra de energia pré-paga STS, se o cliente possuir dívida em carteira, o sistema deve abater automaticamente uma % pré-definida. |
| **RF-M04-007** | Reconciliação Financeira de Extratos | **M** | O sistema deve permitir a importação de extratos dos operadores móveis e bancos, confrontando cada transação com os registos de venda do GridOps. |
| **RF-M04-008** | Regra de Reversão de Transações | **M** | A reversão ou anulação de faturas/pagamentos exige pedido fundamentado pelo Gestor Comercial e aprovação obrigatória do Responsável Financeiro. |

---

### 2.5 Módulo 05 — Gestão Patrimonial de Ativos Técnicos

| ID | Requisito Funcional | Prioridade | Descrição / Regra de Aceitação |
| :--- | :--- | :---: | :--- |
| **RF-M05-001** | Cadastro de Equipamentos da Central | **M** | O sistema deve registar módulos fotovoltaicos, inversores solares, controladores de carga, bancos de baterias (BESS) e geradores de emergência. |
| **RF-M05-002** | Rastreio de Garantias e Fornecedores | **M** | O sistema deve registar data de aquisição, data de comissionamento, prazo de garantia do fabricante e fornecedor de cada equipamento. |
| **RF-M05-003** | Associação de Fichas Técnicas e Manuais | **S** | O sistema deve permitir o upload e consulta de PDFs de manuais técnicos de serviço e esquemas elétricos associados a cada classe de ativo. |
| **RF-M05-004** | Histórico de Manutenções do Ativo | **M** | O sistema deve listar cronologicamente todas as intervenções corretivas e preventivas realizadas em cada ativo patrimonial. |

---

### 2.6 Módulo 06 — Operações e Manutenção (O&M) e Ordens de Trabalho

| ID | Requisito Funcional | Prioridade | Descrição / Regra de Aceitação |
| :--- | :--- | :---: | :--- |
| **RF-M06-001** | Emissão e Tipificação de OTs | **M** | O sistema deve emitir OTs com classificação de tipo: *Nova Ligação*, *Vistoria*, *Desligação*, *Religação*, *Avaria de Rede*, *Manutenção Preventiva*. |
| **RF-M06-002** | Ciclo de Vida da Ordem de Trabalho | **M** | A OT deve transitar pelos estados: *Aberta*, *Atribuída*, *Em Deslocação*, *Em Execução*, *Concluída em Campo*, *Auditada/Encerrada*, *Cancelada*. |
| **RF-M06-003** | Gestão de Níveis de Criticidade e SLA | **M** | Cada OT deve possuir prioridade associada a SLA: Crítica (4h), Média (24h) e Baixa (72h), com cálculo de tempo de resolução decorrido. |
| **RF-M06-004** | Recolha de Evidências Fotográficas | **M** | O encerramento de qualquer OT em campo exige o upload obrigatório de pelo menos duas fotografias (antes e depois da intervenção técnica). |
| **RF-M06-005** | Registo de Peças Consumidas | **M** | A conclusão da OT deve registar os materiais e peças sobresselentes aplicados, abatendo-os virtualmente do inventário da mini-rede. |
| **RF-M06-006** | Manutenção Preventiva Calendarizada | **S** | O sistema deve gerar OTs preventivas automáticas com periodicidade semanal, mensal e semestral conforme plano de manutenção aprovado. |
| **RF-M06-007** | Processo Automatizado de Desligação | **M** | O sistema deve gerar ordens de desligação automática para clientes com mais de 30 dias de incumprimento após aviso formal de 48 horas. |
| **RF-M06-008** | Processo de Religação após Pagamento | **M** | Após a liquidação integral da dívida e pagamento da taxa de religação, o sistema deve gerar imediatamente uma OT de religação prioritária (SLA < 12h). |

---

### 2.7 Módulo 07 — Indicadores, Inteligência Operacional e Relatórios

| ID | Requisito Funcional | Prioridade | Descrição / Regra de Aceitação |
| :--- | :--- | :---: | :--- |
| **RF-M07-001** | Painel Executivo Consolidado | **M** | O sistema deve disponibilizar um painel principal com: Potência Solar instantânea, Disponibilidade da Rede, Energia Diária e Receita Coletada. |
| **RF-M07-002** | Indicadores de Confiabilidade da Rede | **M** | O sistema deve calcular os índices de continuidade de serviço: SAIDI (duração de interrupção) e SAIFI (frequência de interrupção) por mini-rede. |
| **RF-M07-003** | Balanço de Energia e Perdas Globais | **M** | O sistema deve computar a percentagem de perdas técnicas e comerciais mensalmente: $[(\text{Injeção} - \text{Faturação}) / \text{Injeção}] \times 100\%$. |
| **RF-M07-004** | Relatório Oficial Regulatório ARENE | **M** | O sistema deve gerar relatório trimestral oficial em PDF e Excel pré-formatado nos modelos exigidos pelo regulador ARENE e FUNAE. |
| **RF-M07-005** | Exportação de Dados em CSV / Excel | **M** | Todas as tabelas de listagem (Clientes, Faturas, Pagamentos, Contadores, OTs) devem permitir exportação direta para CSV e Excel. |

---

### 2.8 Módulo 08 — Comunicação, Notificações e Atendimento

| ID | Requisito Funcional | Prioridade | Descrição / Regra de Aceitação |
| :--- | :--- | :---: | :--- |
| **RF-M08-001** | Envio de SMS Transacional de Token STS | **M** | O sistema deve enviar automaticamente um SMS com o código do token de 20 dígitos logo após a confirmação do pagamento pelo cliente. |
| **RF-M08-002** | Aviso Prévio de Interrupção por Dívida | **M** | O sistema deve enviar SMS de aviso formal 48 horas antes da emissão de qualquer ordem de corte por incumprimento contratual. |
| **RF-M08-003** | Registo e Tramitação de Queixas | **S** | O sistema deve registar queixas de consumidores (ex: falta de energia, contador danificado) e convertê-las em incidentes operacionais rastreáveis. |

---

## 3. Catálogo de Requisitos Não Funcionais (RNF)

### 3.1 Segurança e Controlo de Acesso (RNF-SEG)
* **RNF-SEG-001:** O sistema deve implementar controlo de acesso rigoroso baseado em funções (RBAC) com suporte exclusivo aos 8 perfis homologados.
* **RNF-SEG-002:** Todas as palavras-passe devem ser cifradas utilizando o algoritmo `bcrypt` com fator de custo mínimo de 10.
* **RNF-SEG-003:** Todas as comunicações cliente-servidor devem trafegar exclusivamente sobre HTTPS com TLS 1.3 obrigatório.
* **RNF-SEG-004:** O sistema deve proteger os dados contra vulnerabilidades comuns (injeção de SQL, Cross-Site Scripting - XSS, CSRF e manipulação de parâmetros).
* **RNF-SEG-005:** Acesso da API deve ser autenticado por tokens JWT com expiração configurável e assinatura assimétrica segura.

### 3.2 Operação em Ambientes Remotos e Offline (RNF-OFFLINE)
* **RNF-OFFLINE-001:** A aplicação para técnicos de campo e agentes comunitários deve operar como Progressive Web App (PWA) instalável.
* **RNF-OFFLINE-002:** A PWA deve armazenar em cache local (IndexedDB) as rotas de leitura, formulários de OT e dados essenciais da mini-rede.
* **RNF-OFFLINE-003:** Registos efetuados sem rede GSM devem ser enfileirados localmente com identificadores UUID gerados no cliente e sincronizados automaticamente quando a conectividade for restabelecida.
* **RNF-OFFLINE-004:** O mecanismo de sincronização deve garantir idempotência estrita, impedindo duplicação de transações ou leituras repetidas em retransmissões.

### 3.3 Desempenho e Escalabilidade (RNF-PERF)
* **RNF-PERF-001:** O tempo de resposta para operações de consulta simples de interface deve ser inferior a 800 milissegundos sob rede estável.
* **RNF-PERF-002:** O motor de geração de tokens STS deve responder em menos de 1,5 segundos após a receção da notificação de pagamento.
* **RNF-PERF-003:** O sistema deve suportar a gestão simultânea de até 50 mini-redes e 50.000 clientes sem degradação arquitetural.

### 3.4 Integridade, Auditoria e Trilha Imutável (RNF-AUD)
* **RNF-AUD-001:** É estritamente proibida a eliminação física (`DELETE`) de registos de clientes, contratos, faturas, pagamentos ou ativos. Deve ser adotado *soft-delete* (`is_deleted = true`).
* **RNF-AUD-002:** Todas as operações de criação, modificação de estado, aprovação financeira e anulação devem gerar um registo imutável de auditoria contendo: Identificador do Utilizador, Endereço IP, Carimbo de Data/Hora UTC, Ação Realizada e Valores Anteriores/Novos (payload JSON).

### 3.5 Usabilidade, Consistência e Idioma (RNF-USA)
* **RNF-USA-001:** O sistema deve ser integralmente apresentado em língua portuguesa (variante oficial de Moçambique), com notação numérica no padrão oficial (ex: `1.250,50 MT`).
* **RNF-USA-002:** As interfaces devem adotar a identidade corporativa da LECASU (Laranja Oficial `#FF7A00` e Branco/Ardósia corporativo), garantindo legibilidade e alto contraste.
* **RNF-USA-003:** As páginas devem ser responsivas, ajustando-se a ecrãs de computadores (desktop), tablets e telemóveis de campo.

---

## 4. Histórias de Utilizador (User Stories) e Priorização MoSCoW

### US-01: Registo de Nova Mini-Rede (Gestor Operacional)
* **Como:** Gestor Operacional (`OPERATIONS_MANAGER`).
* **Quero:** Registar as características técnicas e geográficas de uma nova mini-rede solar fotovoltaica.
* **Para que:** A infraestrutura fique disponível no sistema para associação de equipamentos e ligação de novos consumidores.
* **Prioridade:** **Must Have (M)**.
* **Critérios de Aceitação:** Coordenadas GPS válidas; polígono desenhável no mapa; capacidade solar (kWp) e de armazenamento (kWh) numéricas positivas obrigatórias.

### US-02: Venda Presencial de Energia STS (Agente Comunitário)
* **Como:** Agente Comunitário (`COMMUNITY_AGENT`).
* **Quero:** Introduzir o montante recebido em dinheiro vivo e o número de série do contador do cliente para emitir um token STS.
* **Para que:** O cliente rural sem conta bancária possa adquirir eletricidade diretamente na aldeia.
* **Prioridade:** **Must Have (M)**.
* **Critérios de Aceitação:** Validação do número de série do contador; verificação e dedução de eventual dívida acumulada; geração do token de 20 dígitos na interface; impressão ou envio de SMS com o código gerado.

### US-03: Execução de Ordem de Trabalho em Campo (Técnico de Campo)
* **Como:** Técnico de Campo (`FIELD_TECHNICIAN`).
* **Quero:** Aceder às minhas Ordens de Trabalho no telemóvel mesmo sem sinal GSM, registar tarefas e fotografar a intervenção.
* **Para que:** O trabalho de campo seja executado com rigor e sincronizado assim que houver cobertura de rede.
* **Prioridade:** **Must Have (M)**.
* **Critérios de Aceitação:** Operação fluida em modo offline; bloqueio de encerramento de OT se faltarem as fotografias obrigatórias; sincronização segura e sem duplicação quando online.

### US-04: Reconciliação Financeira Diária (Responsável Financeiro)
* **Como:** Responsável Financeiro (`FINANCE`).
* **Quero:** Importar os extratos das carteiras móveis (M-Pesa e e-Mola) e cruzar automaticamente com as vendas de tokens STS.
* **Para que:** A receita recolhida seja auditada, identificando eventuais desfasamentos de caixa ou fraudes em tempo hábil.
* **Prioridade:** **Must Have (M)**.
* **Critérios de Aceitação:** Deteção automática de correspondência por ID de transação e montante; sinalização de transações pendentes de correspondência; geração de relatório de divergências.

### US-05: Emissão de Relatório Trimestral ARENE (Administrador / Gestor)
* **Como:** Gestor Geral ou Administrador (`ADMIN`).
* **Quero:** Gerar o relatório consolidado de produção, consumo, clientes e continuidade de serviço em formato Excel/PDF oficial.
* **Para que:** A LECASU cumpra rigorosamente os deveres de reporte e conformidade exigidos pelas entidades reguladoras em Moçambique.
* **Prioridade:** **Must Have (M)**.
* **Critérios de Aceitação:** Cálculo automatizado de SAIDI/SAIFI e balanço de perdas; formatação fiel às tabelas exigidas pela ARENE; dados imutáveis baseados em registos auditados.

