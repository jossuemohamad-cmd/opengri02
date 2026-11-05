# 02 — PRD Consolidada
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Requisitos Consolidados do Produto (PRD v1.0)  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Referências Centrais:** Nota Conceptual e Especificação Funcional v1.0 (`docs/PRD.md`), Relatório de Descoberta (`docs/01-RELATORIO-DE-DESCOBERTA-E-ANALISE-DO-PRODUTO.md`) e Diretrizes de Governação (`AGENTS.md`)  
**Responsável:** Arquitetura de Sistemas, Gestão de Produto e Engenharia Full-Stack  
**Data de Emissão:** 05 de Novembro de 2026  
**Estado:** Submetido para Validação e Aprovação Formal  

---

## 1. Visão, Missão e Posicionamento do Produto

### 1.1 Visão
Ser a plataforma tecnológica de referência em Moçambique e na África Austral para a gestão operacional, técnica e comercial sustentável de mini-redes solares fotovoltaicas com armazenamento em baterias (BESS), viabilizando o acesso universal à energia limpa e confiável em comunidades rurais e periurbanas isoladas.

### 1.2 Missão
Capacitar a **LECASU, Lda.** com uma ferramenta digital centralizada, resiliente e auditável, que unifique a monitorização de centrais de produção, o cadastro comercial de clientes, a medição e cobrança de energia (pré-pago STS e pós-pago), o combate a perdas não técnicas, a manutenção preventiva e corretiva de ativos elétricos, e a transparência regulatória perante as autoridades governamentais e investidores.

### 1.3 Posicionamento e Delimitação
O **LECASU GridOps** posiciona-se estritamente como a **camada de gestão operacional, inteligência de negócio e governação comercial**.
* **O que o GridOps É:** O cérebro corporativo e comercial que gere cadastros, clientes, contratos, faturas, ordens de trabalho, inventário, fluxos financeiros e relatórios regulatórios.
* **O que o GridOps NÃO É:** Não substitui os sistemas industriais SCADA/EMS de tempo real (controladores de inversores, sincronizadores de geradores e sistemas BMS de segurança elétrica intrínseca). Não efetua atuações elétricas de disparo em milissegundos nem substitui proteções físicas de rede.

---

## 2. Objetivos de Negócio e Indicadores-Chave (KPIs)

O GridOps foi desenhado para assegurar o cumprimento de cinco grandes objetivos estratégicos da LECASU:

| Objetivo Estratégico | Métrica / Indicador | Meta Operacional |
| :--- | :--- | :--- |
| **Continuidade de Serviço 24/7** | Disponibilidade Global da Mini-Rede (Uptime) | $\ge 98.5\%$ de fornecimento contínuo |
| **Sustentabilidade Financeira** | Taxa de Cobrança e Reconciliação de Receita | $\ge 95\%$ da energia faturada cobrada |
| **Mitigação de Perdas** | Perdas Não Técnicas (Fraudes / By-passes) | $\le 5\%$ de discrepância na baixa tensão |
| **Eficiência em Manutenção** | MTTR (*Mean Time to Repair*) em Avarias Críticas | $\le 4\text{ horas}$ para restabelecimento |
| **Impacto Comunitário** | Adesão de Usos Produtivos de Energia (PUE) | $\ge 25\%$ do consumo total alocado a PUE |
| **Conformidade Regulatória** | Relatórios Trimestrais ARENE / FUNAE no Prazo | $100\%$ de conformidade e rastreabilidade |

---

## 3. Perfis de Utilizador e Personas (RBAC)

O produto atende a 8 perfis funcionais com permissões granulares:

1. **Administrador do Sistema (`ADMIN`):** Parametrização geral, gestão de acessos, segurança, cópias de segurança e configuração de concessões.
2. **Gestor Operacional / Engenharia (`OPERATIONS_MANAGER`):** Monitorização da produção solar/BESS, análise de telemetria, aprovação e despacho de Ordens de Trabalho (OTs) de alta complexidade.
3. **Gestor Comercial (`COMMERCIAL_MANAGER`):** Gestão da carteira de clientes, contratos, tarifários, campanhas de novas ligações e apoio a clientes empresariais (PUE).
4. **Responsável Financeiro (`FINANCE`):** Reconciliação bancária, validação de transações M-Pesa/e-Mola, emissão de faturas institucionais e aprovação de estornos/reversões.
5. **Técnico de Campo (`FIELD_TECHNICIAN`):** Instalação de contadores, vistorias técnicas, execução de OTs em campo, leituras manuais e manutenção preventiva com app offline (PWA).
6. **Agente Comunitário (`COMMUNITY_AGENT`):** Ponto de contacto local na aldeia, registo de candidaturas a ligações, venda presencial de tokens STS em numerário e registo de queixas.
7. **Auditor Externo / Parceiros (`AUDITOR_PARTNER`):** Acesso estritamente de consulta a relatórios operacionais, mapas de cobertura, taxas de eletrificação e balanços energéticos.
8. **Consumidor Final (`CUSTOMER`):** Consulta de consumo próprio, histórico de tokens STS adquiridos, faturas pós-pagas em dívida e abertura de pedidos de assistência.

---

## 4. Escopo do Produto: MVP Obrigatório vs Fases Futuras

### 4.1 Escopo Obrigatório do MVP (Fase Atual)
* **M01 — Cadastro de Mini-Redes & SIG:** Georreferenciação da central, traçado de cablagem BT/MT, circuitos e postos de transformação.
* **M02 — Clientes & Contratos:** Cadastro de particulares e PUE, documentação (BI/NUIT ou atestado local), tarifário associado, caução e estado contratual.
* **M03 — Contadores & Medição:** Inventário metrológico, associação biunívoca a contrato, leituras manuais por lote, upload de ficheiros e deteção de consumos anómalos.
* **M04 — Tarifas, Faturação & Pagamentos:** Tarifas escalonadas ARENE, pós-pago e pré-pago STS com geração de token de 20 dígitos, pagamentos móveis (M-Pesa/e-Mola/mKesh), conta corrente e reconciliação.
* **M05 — Gestão Patrimonial de Ativos:** Cadastro de painéis solares, inversores, controladores, baterias BESS e cablagem com número de série, garantia e histórico de intervenções.
* **M06 — O&M e Ordens de Trabalho:** Abertura, despacho, execução offline com fotos e fecho de OTs para cortes, religações, vistorias de fraude e manutenções preventivas calendarizadas.
* **M07 — Indicadores & Relatórios:** Painéis visuais consolidados, cálculo de Performance Ratio (PR), balanço de perdas e exportação de relatórios regulatórios para Excel e PDF.
* **M08 — Comunicação & Alertas:** Notificações operacionais por SMS e WhatsApp (lembretes de vencimento, emissão de tokens STS e avisos de corte).

### 4.2 Funcionalidades Futuras (Fase 2 — Roadmap)
* **Gateways IoT Inteligentes em Tempo Real:** Conexão direta bidirecional com inversores via MQTT/Modbus TCP para telemetria segundo a segundo.
* **Medição Inteligente Avançada (AMI / Smart Meters):** Teleleitura contínua automática e corte/religação remoto teleguiado via GSM/LoRaWAN sem necessidade de deslocação de técnicos.
* **Integração Bancária Direta via Webhook:** Liquidação automatizada por API instantânea com bancos comerciais de Moçambique e operadores móveis.
* **App Nativa iOS e Android:** Aplicações nativas publicadas nas lojas digitais para clientes e técnicos de campo.

---

## 5. Arquitetura Funcional dos Módulos

### 5.1 M01 — Cadastro de Mini-Redes e Cartografia Espacial (GIS)
* **Entidades:** Mini-Rede, Subestação/Central, Linhas de Distribuição, Postes, Circuitos, Caixas de Derivação.
* **Funcionalidades:**
  - Registo das características técnicas da central: potência solar de pico (kWp), capacidade útil do BESS (kWh), tensão de distribuição e fabricante dos equipamentos.
  - Cartografia interativa em mapa satélite com camadas comutáveis (Central, Linhas, Postes e Clientes).
  - Desenho do polígono de concessão geográfica para cálculo de densidade populacional e taxa de penetração energética.

### 5.2 M02 — Gestão Comercial de Clientes e Contratos
* **Entidades:** Cliente, Documento de Identificação, Local de Consumo (Edifício/Casa), Contrato.
* **Funcionalidades:**
  - Cadastro completo com diferenciação entre Consumidor Doméstico, Comercial, Usos Produtivos (PUE) e Serviços Públicos (escolas, centros de saúde, postos policiais).
  - Registo de contactos (contacto telefónico principal para SMS de tokens STS).
  - Contrato único por ligação: potência contratada (kVA), disjuntor de controlo, tarifa contratual e caução de ligação depositada.
  - Histórico de estados contratuais: *Pendente de Ligação*, *Ativo*, *Suspenso por Dívida*, *Interrompido por Avaria*, *Rescindido*.

### 5.3 M03 — Parque de Contadores, Medição e Balanço Energético
* **Entidades:** Contador, Tipo de Medição (STS Pré-Pago / Eletromecânico Pós-Pago / Smart), Associação Contador-Contrato, Registo de Leitura.
* **Funcionalidades:**
  - Controlo metrológico rigoroso: número de série, marca, modelo, ano de fabrico, classe de precisão e data da última aferição.
  - Registo de leituras por três vias: (1) Leitura individual em campo via app móvel; (2) Leitura em lote por rota; (3) Importação de ficheiro CSV/Excel recolhido de coletores óticos.
  - Algoritmo de deteção de anomalias: sinalização automática se a leitura atual for inferior à anterior (exceto rotação completa de escala) ou se o consumo for 300% superior à média histórica do cliente.
  - Balanço de energia por circuito: confronto entre energia injetada no barramento e a soma das leituras a jusante para identificação de perdas comerciais.

### 5.4 M04 — Tarifários, Faturação, Tokens STS e Reconciliação
* **Entidades:** Estrutura Tarifária, Escalão de Consumo, Fatura Pós-Paga, Token Pré-Pago STS, Transação Financeira, Conta Corrente.
* **Funcionalidades:**
  - Motor de cálculo tarifário escalonado conforme tabela oficial aprovada pela ARENE (e.g., Escalão Social 0-30 kWh, Escalão Doméstico Geral >30 kWh, Tarifas PUE bonificadas).
  - Módulo de Venda STS: conversão de montante financeiro em crédito de kWh deduzindo taxas fixas legais e dívidas amortizáveis, com geração do código de 20 dígitos (IEC 62055-41).
  - Faturação mensal pós-paga: cálculo de consumo, taxa de disponibilidade, aplicação de IVA (se aplicável), emissão de fatura em PDF com referência de pagamento.
  - Integração de canais de recebimento: M-Pesa, e-Mola, mKesh, depósitos bancários e numerário recolhido por agentes autorizados.
  - Conta Corrente de Cliente: saldo atualizado em tempo real, gestão de créditos por adiantamento e dívidas pendentes.
  - Reconciliação bancária: importação de extratos e cruzamento automático com os pagamentos registados no sistema.

### 5.5 M05 — Gestão Patrimonial de Ativos e Equipamentos
* **Entidades:** Ativo Patrimonial, Categoria, Localização, Fornecedor, Garantia, Histórico de Intervenções.
* **Funcionalidades:**
  - Inventário completo dos componentes críticos de geração, conversão, acumulação e distribuição.
  - Registo de custo de aquisição, data de entrada em serviço, expectativa de vida útil e plano de amortização contabilística.
  - Associação direta de documentos técnicos, manuais de operação e certificados de conformidade do fabricante a cada ativo.
  - Alerta preventivo de expiração de prazos de garantia e fim de vida útil de bancos de baterias e módulos solares.

### 5.6 M06 — Operações e Manutenção (O&M) e Ordens de Trabalho
* **Entidades:** Incidente / Avaria, Ordem de Trabalho (OT), Checklist de Tarefas, Material Utilizado, Registo Fotográfico.
* **Funcionalidades:**
  - Fluxo completo de OTs: *Aberta $\rightarrow$ Atribuída a Técnico $\rightarrow$ Em Deslocação $\rightarrow$ Em Execução $\rightarrow$ Concluída em Campo $\rightarrow$ Validada por Supervisor*.
  - Classificação por criticidade com SLA associado: Alta (4h), Média (24h), Baixa (72h).
  - Tipos de OT: Vistoria Prévia de Ligação, Instalação de Novo Contador, Desligação por Inadimplência, Religação, Fiscalização de Fraude, Manutenção Preventiva Periódica e Reparação de Rede.
  - Requisitos de fecho obrigatório: coordenadas GPS do fecho, foto antes e depois da intervenção, assinatura digitalizada do técnico e peças do armazém consumidas.

### 5.7 M07 — Inteligência Operacional, Indicadores e Relatórios
* **Entidades:** Snapshot de Métricas, Log de Telemetria, Registo de Auditoria, Relatório Consolidado.
* **Funcionalidades:**
  - Painéis executivos com indicadores ao vivo: potência solar instantânea, estado de carga das baterias (SoC), energia diária produzida e consumida.
  - Indicadores de Desempenho Técnico: Performance Ratio (PR), horas de autonomia das baterias, índice SAIDI e SAIFI da mini-rede.
  - Indicadores Comerciais: receita diária/mensal por canal, saldo pendente em carteira, tarifa média realizada por kWh e volume de vendas STS.
  - Gerador de relatórios regulatórios oficiais em PDF e Excel pré-formatados nos padrões exigidos pela ARENE e pelo FUNAE.

### 5.8 M08 — Atendimento ao Cliente e Comunicação
* **Entidades:** Mensagem de Notificação, Canal (SMS / WhatsApp / Email), Registo de Envio, Reclamação de Cliente.
* **Funcionalidades:**
  - Envio automático de SMS transacional com o código do Token STS de 20 dígitos logo após a confirmação do pagamento.
  - Disparo de aviso prévio de corte por dívida (aviso de 48 horas de tolerância).
  - Notificação de cortes programados para manutenção preventiva da rede elétrica.
  - Registo e acompanhamento de tickets de reclamação de clientes com rastreio de resolução.

---

## 6. Fluxos de Utilização Ponta a Ponta

### Fluxo 1: Onboarding de Nova Mini-Rede e Ativos Técnicos
1. Gestor Operacional acede ao Módulo 01 e cria uma nova Mini-Rede (Nome, Província, Distrito, Localidade, Coordenadas GPS da Central).
2. Define a potência solar fotovoltaica instalada (kWp) e a capacidade útil do banco de baterias BESS (kWh).
3. Importa o perímetro georreferenciado da concessão (ficheiro GeoJSON/KML) ou desenha diretamente na interface SIG.
4. Regista os circuitos de distribuição e associa os postos de transformação e quadros gerais de baixa tensão.
5. Regista os ativos no Módulo 05 (inversores, bancos de baterias, grupos geradores de emergência) vinculando-os à central criada.
6. A mini-rede fica disponível para associação de novos clientes e contadores.

### Fluxo 2: Angariação, Contrato e Ligação de Cliente
1. Agente Comunitário ou Gestor Comercial regista a candidatura do novo cliente no Módulo 02 com dados pessoais e coordenadas da habitação/negócio.
2. É gerada uma Ordem de Trabalho de **Vistoria Técnica de Viabilidade**.
3. Técnico de campo desloca-se ao local, valida a distância à linha de baixa tensão, confirma a viabilidade e fotografa o quadro interno do cliente.
4. Com a vistoria aprovada, o Gestor Comercial gera o Contrato com a tarifa aplicável (Doméstica ou PUE) e regista a caução de ligação.
5. É gerada uma Ordem de Trabalho de **Instalação e Ligação**.
6. Técnico instala o contador metrológico (STS ou Smart), lê o selo de inviolabilidade, fotografa a ligação concluída e ativa o contrato no sistema.

### Fluxo 3: Ciclo Comercial Pré-Pago (STS Token e Recarga)
1. Cliente necessita de energia e escolhe o canal de pagamento: carteira móvel (M-Pesa / e-Mola) ou agente comunitário presencial com dinheiro vivo.
2. O montante pago dá entrada no sistema com a referência do número de série do contador ou código do cliente.
3. O motor de faturação (Módulo 04) verifica se existem dívidas amortizáveis (e.g. plano de pagamento de taxa de ligação em prestações). Caso existam, deduz a percentagem regulamentada (e.g. 20%) e aloca o restante saldo líquido à compra de energia.
4. O sistema gera o **Token STS de 20 dígitos** em conformidade com a chave do contador do cliente.
5. O cliente recebe o token instantaneamente por SMS no telemóvel e o recibo digital é arquivado na sua conta corrente.
6. O cliente introduz o token no teclado do contador doméstico e o saldo de kWh é creditado no equipamento.

### Fluxo 4: Ciclo Comercial Pós-Pago (Medição, Faturação e Cobrança)
1. No final do ciclo de consumo (dia 25 de cada mês), a equipa de campo recolhe as leituras dos contadores eletromecânicos via app offline.
2. As leituras sincronizam com a base de dados central e são validadas contra inconsistências.
3. O motor de faturação calcula o consumo ($C = \text{Leitura Atual} - \text{Leitura Anterior}$), aplica a tabela tarifária escalonada e apura a taxa de disponibilidade.
4. É emitida a Fatura Eletrónica mensal com data de vencimento a 10 dias.
5. O cliente é notificado por SMS do valor a pagar e da referência de pagamento móvel.
6. Se o pagamento for efetuado dentro do prazo, a fatura transita para o estado *Paga*.
7. Caso não seja pago após a data de vencimento e esgotada a tolerância regulamentar de 48 horas após aviso formal, o sistema emite automaticamente uma **Ordem de Desligação por Inadimplência**.

### Fluxo 5: Gestão de Incidentes e Manutenção Preventiva/Corretiva
1. Alarme automático de telemetria ou queixa registada pelo cliente gera um Incidente no Módulo 06.
2. O Gestor Operacional avalia o impacto e gera uma Ordem de Trabalho com criticidade definida.
3. A OT é atribuída ao técnico de campo geograficamente mais próximo.
4. O técnico recebe a ordem no telemóvel (mesmo em modo offline), desloca-se ao local e executa a intervenção segundo o checklist técnico obrigatório.
5. Registam-se as peças substituídas do armazém, recolhem-se as fotos comprovativas e assina-se digitalmente o encerramento da OT.
6. O supervisor revê os dados e encerra formalmente o incidente, recalculando as métricas de tempo de resposta (MTTR).

---

## 7. Matriz de Dependências entre Funcionalidades

| Funcionalidade Dependente | Pré-Requisitos Obrigatórios | Impacto de Bloqueio |
| :--- | :--- | :--- |
| **Geração de Token STS** | Contrato Ativo + Contador STS Vinculado + Estrutura Tarifária Parametrizada | Impossibilidade de venda de energia |
| **Emissão de Fatura Pós-Paga** | Leitura Validada no Ciclo + Contrato Ativo + Tabela Tarifária Vigente | Retardo na faturação mensal |
| **Atribuição de Contador** | Inventário de Ativos (M05) com contador aferido e não associado | Atraso na ligação de novos clientes |
| **Despacho de OT de Campo** | Mini-Rede Ativa + Técnico com Conta Válida e Concessão Atribuída | Impossibilidade de executar O&M |
| **Relatório Oficial ARENE** | Mês Fechado + Leituras e Faturas Reconciliadas + Balanço de Injeção | Bloqueio de reporte regulatório |
| **Sincronização Offline** | Utilizador autenticado previamente online + Cache local de tabelas | Rejeição de registos em campo |

---

## 8. Secção de Decisões Pendentes (Aguardando Aprovação da LECASU)

Conforme a diretriz de não assumir regras de negócio não confirmadas pela administração da LECASU, as seguintes definições encontram-se isoladas para validação final:

1. **Identificação Alternativa para Clientes Rurais:** Definição da hierarquia de documentos aceites na ausência de BI/NUIT (e.g., Atestado de Residência emitido pelo Chefe do Posto/Régulo vs Registo com Testemunhas Comunitárias).
2. **Tabela Tarifária Oficial ARENE:** Confirmação dos limites exatos em kWh e preços em Meticais (MT) para o Escalão Social, Doméstico Geral e Usos Produtivos (PUE) aplicáveis à mini-rede piloto.
3. **Prazo de Tolerância de Desligação:** Confirmação se o prazo legal de corte por falta de pagamento é de 30 dias após vencimento com aviso prévio de 48 horas ou regime específico de concessão.
4. **Governação de Estornos e Reversões:** Aprovação da política de dupla assinatura obrigatória (`COMMERCIAL_MANAGER` solicita e `FINANCE` autoriza) para reversão de qualquer pagamento ou anulação de fatura.
5. **Especificação do Módulo Gerador STS:** Confirmação do fornecedor do gerador STS (software/hardware vending key management) e fabricantes dos contadores piloto (e.g., Hexing, Inhemeter, Landis+Gyr) para alinhamento dos algoritmos de encriptação de token.

