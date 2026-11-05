# 01 — Relatório de Descoberta e Análise do Produto
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Entregável Oficial da Etapa 01 — Análise e Descoberta do Produto  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Referências Centrais:** Nota Conceptual e Especificação Funcional v1.0 (`docs/PRD.md`) e Diretrizes de Governação (`AGENTS.md`)  
**Responsável:** Arquitetura de Sistemas, Gestão de Produto e Engenharia Full-Stack  
**Data de Emissão:** 05 de Novembro de 2026  
**Estado:** Submetido para Validação e Aprovação Formal  

---

## 1. Visão Geral do Negócio da LECASU

A **LECASU, Lda.** é uma entidade dinamizadora do setor energético em Moçambique, focada na implementação e exploração de mini-redes solares fotovoltaicas com sistemas de armazenamento de energia em baterias (BESS) em zonas rurais e periurbanas isoladas.

A eletrificação descentralizada em Moçambique constitui um imperativo económico e social. Grande parte das populações beneficiadas reside em localidades com acesso viário difícil, fracas infraestruturas de telecomunicações e sem cobertura da rede elétrica nacional. Operar estas mini-redes com sucesso comercial e técnico exige coordenar em simultâneo:
1. **Engenharia de Geração e Distribuição:** Assegurar a continuidade de serviço 24/7, monitorizar a saúde dos bancos de baterias e manter as linhas de baixa e média tensão.
2. **Ciclo Comercial Sustentável:** Faturar a energia consumida, garantir a cobrança em regimes pré-pago STS e pós-pago, minimizar perdas comerciais e combater a inadimplência.
3. **Fomento Socioeconómico:** Apoiar Usos Produtivos de Energia (PUE) — como moageiras, câmaras frigoríficas comunitárias, carpintarias e sistemas de bombagem de água — que alavancam a economia local e elevam a capacidade de pagamento das famílias.
4. **Governação e Reporte Regulatório:** Prestar contas com rigor e transparência ao regulador do setor (**ARENE**), aos fundos estatais de eletrificação rural (**FUNAE**) e aos parceiros financeiros internacionais.

O **LECASU GridOps** nasce para ser a espinha dorsal desta operação, integrando dados dispersos numa plataforma tecnológica centralizada, robusta e auditável.

---

## 2. Problemas Identificados na Operação Atual

A ausência de uma plataforma digital unificada no setor origina estrangulamentos operacionais severos:

* **Fragmentação e Dispersão de Dados:** A informação operacional das centrais encontra-se dividida entre folhas de cálculo desarticuladas, mensagens informais de WhatsApp, registos manuais em cadernos de campo e relatórios isolados em papel.
* **Inconsistência na Reconciliação Financeira:** Dificuldade em cruzar os relatórios de venda de eletricidade pré-paga com os saldos das carteiras móveis (M-Pesa, e-Mola) e transferências bancárias, gerando desfasamentos e risco de receitas não identificadas.
* **Atrasos Críticos no Diagnóstico e Resolução de Avarias:** Falhas de fornecimento ou disparos de disjuntores só chegam ao conhecimento da equipa técnica através de queixas tardias das comunidades, elevando o tempo de indisponibilidade e o MTTR (*Mean Time to Repair*).
* **Vulnerabilidade a Perdas Não Técnicas e Fraude:** Sem fiscalização sistemática e sem balanço de energia na baixa tensão, conexões clandestinas (by-pass ao medidor) e manipulações de cablagem passam despercebidas durante semanas.
* **Barreira da Conectividade Rural Intermitente:** As equipas técnicas e agentes de campo ficam impedidos de registar dados quando estão em aldeias com sombra de sinal GSM, acumulando papelada que é transcrita com erros após dias.
* **Falta de Trilha de Auditoria e Conformidade:** Inexistência de um histórico cronológico e imutável que registe quem alterou um cadastro, quem autorizou uma tarifa ou quem validou uma ordem de corte, expondo a organização a riscos em auditorias externas.

---

## 3. Objectivos do Produto (LECASU GridOps)

### 3.1 Objectivo Geral
Construir uma plataforma digital integrada para registar, georreferenciar, monitorizar e gerir de ponta a ponta as mini-redes da LECASU, os seus clientes, contratos, consumos, faturação, pagamentos, ativos patrimoniais, manutenção preventiva e corretiva, e indicadores de impacto comunitário.

### 3.2 Objectivos Específicos
* **Georreferenciação Espacial Completa:** Mapear em ambiente GIS o perímetro de cada concessão, o traçado físico da rede aérea/subterrânea, os ativos e a localização exata de cada cliente com foto.
* **Cadastro Comercial Único:** Eliminar cadastros redundantes atribuindo um código estruturado e legível a cada entidade, contador e contrato.
* **Rigor Metrológico e Financeiro:** Automatizar o processamento de leituras (manuais, ficheiro ou telemetria IoT), a aplicação de regras tarifárias escalonadas e o cálculo transparente de saldos e dívidas.
* **Padronização de O&M:** Instituir ordens de trabalho digitais com registo de peças, cálculo de SLA e recolha obrigatória de evidências fotográficas e assinaturas.
* **Governação e Reporte Instantâneo:** Gerar relatórios auditáveis em Excel e PDF para a direção executiva, ARENE e FUNAE com um clique.

### 3.3 Delimitação Rígida do MVP (O que NÃO é o GridOps)
Conforme consagrado no PRD:
* O GridOps **não substitui** o controlo industrial de tempo real (SCADA/EMS) de inversores e disjuntores de alta/média potência.
* O GridOps **não executa** despacho dinâmico automatizado de baterias nem atuações elétricas de proteção crítica.
* O MVP **não depende** de exclusividade de hardware ou de contratos proprietários com fabricantes de inversores ou medidores.

---

## 4. Mapa dos Módulos Funcionais e Interconexões

O sistema estrutura-se em 8 módulos integrados em torno de uma base de dados centralizada:

```
                                 +--------------------------------+
                                 |  07. INDICADORES & RELATÓRIOS  |
                                 +---------------+----------------+
                                                 |
         +---------------------------------------+---------------------------------------+
         |                                       |                                       |
+--------v----------------------+  +-------------v------------------+  +-----------------v--------------+
| 01. CADASTRO MINI-REDES & GIS |  | 02. CLIENTES & CONTRATOS       |  | 05. GESTÃO DE ACTIVOS         |
| • Localização & Coordenadas   |  | • Identificação Pessoas / PUE  |  | • Centrais, Inversores, BESS  |
| • Capacidade Solar & BESS     |  | • Potência, Tarifa e Caução    |  | • Série, Garantia e Custos    |
| • Perímetro & Traçado de Rede |  | • Associação Rede e Contador   |  | • Fichas Técnicas e Manuais   |
+--------+----------------------+  +-------------+------------------+  +-----------------+--------------+
         |                                       |                                       |
         |         +-----------------------------+                                       |
         |         |                             |                                       |
+--------v---------v------------+  +-------------v------------------+  +-----------------v--------------+
| 03. CONTADORES & CONSUMO      |  | 04. TARIFAS & PAGAMENTOS       |  | 06. OPERAÇÃO E MANUTENÇÃO (O&M)|
| • Inventário STS / IoT        |  | • Pré/Pós-Pago e Escalões      |  | • Incidentes & Reclamações     |
| • Leituras Manual / Ficheiro  |  | • M-Pesa / e-Mola / mKesh      |  | • OTs, Evidências Fotográficas |
| • Deteção Consumos Anómalos   |  | • Recibos, Dívidas e Saldos    |  | • Preventivas Calendarizadas   |
+-------------------------------+  +-------------+------------------+  +--------------------------------+
                                                 |
                                 +---------------v----------------+
                                 | 08. COMUNICAÇÃO & ATENDIMENTO  |
                                 | • Avisos SMS / Email / WhatsApp|
                                 | • Notificações Corte/Religação |
                                 +--------------------------------+
```

### Interdependências Críticas entre Módulos:
1. **Contratos (02) dependem de Clientes (02), Mini-Redes (01) e Tarifas (04).**
2. **Contadores (03) vinculam-se unicamente a um Contrato ativo (02) num circuito de uma Mini-Rede (01).**
3. **Faturação (04) consome as Leituras do módulo de Contadores (03) e as Regras Tarifárias (04).**
4. **Ordens de Trabalho (06) podem ter como origem um Ativo (05) avariado ou uma Reclamação de Cliente (02/08).**
5. **Relatórios (07) agregam dados de todos os módulos de forma transversal e imutável.**

---

## 5. Perfis de Utilizadores e Matriz de Responsabilidades (RBAC)

O sistema implementa o princípio do menor privilégio através de 8 perfis perfeitamente delimitados:

| Perfil (`role`) | Responsabilidades Principais | Permissões no Sistema |
| :--- | :--- | :--- |
| **Administrador Geral** | Parametrização global, segurança, gestão de contas de utilizador, perfis RBAC, auditoria e manutenção de dados. | **Acesso Total (CRUD irrestrito)** em todos os módulos e parâmetros. |
| **Gestor de Operações (O&M)** | Acompanhamento técnico de centrais, triagem de ocorrências, atribuição de OTs, monitorização de MTTR e conformidade técnica. | Escrita em Mini-Redes, Activos, Ocorrências e Ordens de Trabalho. Consulta a mapas e painéis operacionais. |
| **Gestor Comercial** | Supervisão de ligações, celebração de contratos, atualização tarifária, controlo de cobrança, faturas e dívidas. | Escrita em Clientes, Contratos, Tarifas, Contadores e Validação de Pagamentos. Consulta comercial. |
| **Técnico de Campo** | Vistorias, montagem de ramais, instalação de medidores, execução de intervenções em campo e envio de fotos/evidências. | Acesso móvel offline-first. Leitura nas OTs atribuídas; Escrita em Leituras, Execução de OTs e Evidências. |
| **Agente Comunitário** | Relação de proximidade, pré-cadastro de famílias e negócios, recolha de leituras locais e suporte básico comunitário. | Acesso móvel; Criação de pré-cadastros de clientes e registo de leituras da sua área geográfica. |
| **Gestor Financeiro** | Reconciliação bancária e de canais digitais (M-Pesa/e-Mola), controlo de tesouraria, custódia de cauções e relatórios fiscais. | Escrita em Pagamentos, Reconciliações e Acordos de Dívida. Emissão e consulta de relatórios financeiros. |
| **Parceiro ou Auditor (FUNAE/ARENE)** | Fiscalização regulatória, auditoria de transparência, confirmação de metas de acesso rural e impacto socioambiental. | **Acesso Estritamente de Leitura (Read-Only)** a painéis executivos, relatórios de impacto e auditoria autorizada. |
| **Cliente Rural** *(Fase Futura)* | Consulta individual de consumo pessoal, saldo pré-pago disponível, segunda via de recibos e submissão de pedidos. | Portal do consumidor com acesso estritamente restrito aos dados do seu próprio contrato. |

---

## 6. Mapeamento Exaustivo dos 13 Processos Operacionais

Para cada um dos 13 processos obrigatórios especificados pela LECASU, realizou-se a análise de entradas, fluxo de trabalho, regras de controlo e saídas:

### 6.1 Cadastro de Mini-redes
* **Objetivo:** Estabelecer a identidade geográfica, técnica e jurídica de cada concessão.
* **Fluxo:** Introdução de dados cadastrais (código unívoco `MR-XXX-NNN`, nome da central, província, distrito, localidade) -> Registo da capacidade de geração (kWp) e armazenamento BESS (kWh) -> Marcação do ponto GPS central -> Desenho do polígono do perímetro de concessão -> Carregamento de esquemas elétricos e contactos locais -> Ativação do estado operacional.
* **Saída:** Mini-rede registada, visível no mapa GIS e disponível para receber clientes e ativos.

### 6.2 Cadastro de Clientes
* **Objetivo:** Identificar com precisão o titular do fornecimento e localizar a sua infraestrutura.
* **Fluxo:** Recolha de dados de identificação (nome, documento/NUIT, telefone) -> Registo da categoria (Residencial, Comercial, Institucional, Telecomunicações ou PUE) -> Captação das coordenadas geográficas GPS da residência/estabelecimento -> Captação da fotografia da fachada/localização -> Confirmação de consentimento de proteção de dados.
* **Saída:** Cliente cadastrado no sistema no estado `pendente de vistoria/ligação`.

### 6.3 Criação e Gestão de Contratos
* **Objetivo:** Formalizar a relação jurídica, económica e técnica de fornecimento elétrico.
* **Fluxo:** Associação do cliente à mini-rede de abastecimento -> Seleção da tarifa homologada aprovada -> Definição da potência contratada (kVA) e modelo de fornecimento (pré-pago STS ou pós-pago) -> Registo do depósito de caução em garantia -> Emissão do contrato sequencial -> Ativação comercial.
* **Regras:** Alterações contratuais (aumento de potência, mudança de titular ou rescisão) mantêm histórico auditável inviolável.

### 6.4 Associação de Contadores
* **Objetivo:** Garantir a correspondência física e lógica inquestionável entre o cliente e o seu ponto de consumo.
* **Fluxo:** Seleção de um medidor livre no inventário da mini-rede -> Verificação metrológica e tecnologia (STS, IoT, convencional) -> Vinculação ao contrato do cliente -> Registo da fase elétrica de ligação (R, S, T) e ramal/poste de origem -> Parametrização da leitura inicial (0 kWh).
* **Regras:** Um contador só pode estar ativo num único contrato de cada vez; trocas de medidor avariado exigem registo de leitura final e inicial.

### 6.5 Registo de Leituras
* **Objetivo:** Captar periodicamente a energia consumida para controlo comercial e balanço técnico.
* **Fluxo:** Recolha da leitura (por agente comunitário via app móvel offline, por importação em lote via ficheiro CSV ou por telemetria remota IoT) -> Registo com carimbo de data/hora inviolável e utilizador de origem -> Validação metrológica automática.
* **Regras:** O sistema bloqueia leituras inferiores à anterior (salvo reposição devidamente justificada de ciclo) e sinaliza valores anómalos.

### 6.6 Cálculo de Consumo
* **Objetivo:** Determinar a energia ativa efetivamente consumida no período de faturação.
* **Fluxo:** Obtenção do diferencial $\Delta kWh = Leitura_{Atual} - Leitura_{Anterior}$ -> Aplicação do multiplicador do transformador de corrente (TC), quando aplicável -> Confrontação com a média histórica do cliente -> Geração de alerta caso o consumo desvie mais de 300% ou seja nulo em instalação ativa.
* **Saída:** Consumo apurado e certificado para liquidação financeira ou monitorização pré-paga.

### 6.7 Facturação e Pagamentos
* **Objetivo:** Liquidar o consumo de energia e converter o serviço em receita financeira auditada.
* **Fluxo:**
  * *Em Pós-pagamento:* Aplicação das taxas por escalão tarifário aprovado + taxa fixa de disponibilidade -> Emissão de fatura com data de vencimento -> Pagamento por carteira móvel (M-Pesa, e-Mola) ou numerário -> Emissão de recibo digital -> Reconciliação do lançamento.
  * *Em Pré-pagamento (STS):* Cliente compra crédito -> Sistema valida tarifa -> Gera o token STS de 20 dígitos -> Credita o saldo financeiro -> Reconcilia o pagamento.
* **Saída:** Posição financeira do cliente atualizada (saldo remanescente ou dívida amortizada) e recibo inviolável.

### 6.8 Gestão de Activos
* **Objetivo:** Monitorizar o património técnico instalado e o seu ciclo de vida.
* **Fluxo:** Registo hierárquico do ativo (Central -> Inversores -> Baterias -> Postes/Cabos) -> Atribuição de código patrimonial único (`AST-XXX`), modelo, marca e número de série -> Registo da data de comissionamento e garantia -> Registo de custos de aquisição e manutenções acumuladas.
* **Saída:** Ficha técnica do ativo com histórico completo de custos e intervenções.

### 6.9 Gestão de Avarias
* **Objetivo:** Captar e triar qualquer anomalia técnica que ameace o fornecimento de energia.
* **Fluxo:** Registo de incidente (comunicação de cliente, alerta de agente comunitário ou alarme de sistema) -> Classificação de prioridade (Baixa, Média, Alta, Crítica) -> Avaliação do impacto (central parada, ramal sem tensão ou cliente individual isolado) -> Abertura de ocorrência técnica e encaminhamento para O&M.
* **Saída:** Ocorrência classificada aguardando emissão e despacho de Ordem de Trabalho.

### 6.10 Ordens de Trabalho (OT)
* **Objetivo:** Coordenar e comprovar a execução de serviços técnicos em campo.
* **Fluxo:** Criação da OT vinculada à avaria ou manutenção -> Despacho para o Técnico de Campo responsável com definição de SLA -> Execução no terreno (acessível offline na app) -> Registo de materiais/peças substituídas -> Carregamento obrigatório de fotos comprobatórias do antes e depois -> Assinatura técnica/comunitária -> Fecho e cálculo do MTTR.
* **Saída:** Ordem de trabalho concluída, arquivada na trilha de auditoria e avaria encerrada.

### 6.11 Manutenção Preventiva
* **Objetivo:** Assegurar a longevidade dos equipamentos e prevenir quebras catastróficas.
* **Fluxo:** Definição de planos periódicos por tipologia de ativo (ex: lavagem de módulos solares quinzenal, reaperto de quadros semestral, teste de capacidade de baterias anual) -> Notificação prévia dos operadores e aviso de corte programado à comunidade -> Geração automática de OTs preventivas -> Execução de checklist técnico -> Atualização do calendário para o ciclo seguinte.
* **Saída:** Central mantida em conformidade operacional e índice de disponibilidade técnica preservado.

### 6.12 Desligação e Religação
* **Objetivo:** Gerir o corte e reposição de fornecimento de forma justa, legal e técnica.
* **Fluxo:**
  * *Desligação:* Deteção de inadimplência superior ao prazo regulamentar ou deteção de fraude -> Emissão de notificação prévia de aviso ao cliente -> Autorização pelo Gestor Comercial -> Emissão de OT de corte -> Técnico desliga no contador/poste e lacra o ponto -> Estado passa a `suspenso por dívida/fraude`.
  * *Religação:* Cliente liquida o valor em dívida e taxa de religação -> Sistema confirma liquidação -> Emissão de ordem de religação prioritária (SLA curto) -> Técnico remove o lacre e religa -> Estado retorna a `activo`.
* **Saída:** Controlo comercial estrito e reconciliação financeira regularizada.

### 6.13 Relatórios e Indicadores
* **Objetivo:** Transformar dados brutos em inteligência estratégica, operacional e de conformidade.
* **Fluxo:** O motor de relatórios agrega dados de consumo, geração, faturação, avarias e intervenções -> Aplicação de filtros por mini-rede, região e intervalo temporal -> Consolidação de indicadores (Performance Ratio, Disponibilidade, MTTR, Taxa de Cobrança, tCO₂ evitado, Empregos e PUE apoiados) -> Exportação estruturada para Excel (dados analíticos) e PDF (relatórios executivos assinados).
* **Saída:** Relatórios oficiais disponíveis para reuniões de direção, envio ao regulador ARENE e fiscalização FUNAE.

---

## 7. Entidades Principais e Modelo de Dados Relacional

A arquitetura de dados obedece às relações físicas e lógicas do sistema, garantindo integridade referencial estrita:

```
+------------------+         +-------------------+         +--------------------+
|    mini_grids    |1       *|      assets       |         |      tariffs       |
+------------------+---------+-------------------+         +--------------------+
| id (PK)          |         | id (PK)           |         | id (PK)            |
| codigo           |         | mini_grid_id (FK) |         | codigo             |
| nome             |         | codigo            |         | tipo (pre/pos)     |
| provincia        |         | classe            |         | preco_kwh          |
| distrito         |         | modelo / serie    |         | taxa_fixa          |
| capacidade_kwp   |         | garantia / estado |         +---------+----------+
| capacidade_bess  |         +---------+---------+                   |1
| geom_gps         |                   |1                            |
+--------+---------+                   |                             |
         |1                            |                             |
         |                             |*                            |
         |*                  +---------v---------+                   |
+--------v---------+         |     incidents     |                   |
|     clients      |1       *+-------------------+                   |
+------------------+---------+ id (PK)           |                   |
| id (PK)          |         | mini_grid_id (FK) |                   |
| mini_grid_id (FK)|         | client_id (FK)    |                   |
| codigo           |         | asset_id (FK)     |                   |
| nome             |         | prioridade/estado |                   |
| categoria (PUE)  |         +---------+---------+                   |
| telefone / bi    |                   |1                            |
| geom_gps / foto  |                   |                             |
+--------+---------+                   |1                            |
         |1                  +---------v---------+                   |
         |                   |   work_orders     |                   |
         |*                  +-------------------+                   |
+--------v---------+         | id (PK)           |                   |
|    contracts     |1       1| incident_id (FK)  |                   |
+------------------+---------+ tecnico_id (FK)   |                   |
| id (PK)          |         | materiais / fotos |                   |
| client_id (FK)   |         | assinaturas/fecho |                   |
| tariff_id (FK)   |         +-------------------+                   |
| potencia_kva     |                                                 |
| caucao / estado  |                                                 |
+--------+---------+                                                 |
         |1                                                          |
         |1                                                          |
+--------v---------+         +-------------------+         +---------v----------+
|     meters       |1       *|     readings      |         |     payments       |
+------------------+---------+-------------------+         +--------------------+
| id (PK)          |         | id (PK)           |         | id (PK)            |
| contract_id (FK) |         | meter_id (FK)     |         | client_id (FK)     |
| numero_serie     |         | data_leitura      |         | valor / referencia |
| tecnologia       |         | valor_kwh         |         | canal (M-Pesa)     |
| estado           |         | fonte / qualidade |         | reconciliado       |
+------------------+         +-------------------+         +--------------------+
```

> **Regra Mandatória de Integridade:**  
> A eliminação física de registos operacionais (`DELETE` em base de dados) é expressamente proibida. O sistema utiliza exclusão lógica (`soft-delete` via `activo = false` ou `removido_em`) e regista todas as alterações numa tabela imutável `audit_logs` para assegurar rastreabilidade pericial.

---

## 8. Dependências Técnicas e Operacionais

### 8.1 Dependências Funcionais Internas
* A criação de um **Contrato** depende da existência prévia da **Mini-Rede**, do **Cliente** e da tabela de **Tarifas**.
* A emissão de uma **Fatura** ou venda de **Token STS** depende de um **Contrato** ativo associado a um **Contador** físico.
* O encerramento de uma **Ordem de Trabalho** depende da validação de evidências fotográficas e materiais associados.

### 8.2 Dependências Externas (Terceiros)
* **APIs de Carteiras Móveis (Fintechs Locais):** Integração para liquidação e confirmação de pagamentos com Vodacom M-Pesa, Movitel e-Mola e Tmcel mKesh.
* **Provedores de Telecomunicações / SMS Gateway:** Dependência de operadoras móveis para disparo de SMS de cobrança, confirmação de recarga e avisos de corte.
* **Fabricantes de Hardware (Contadores e Inversores):** Disponibilização de chaves de cifra STS (IEC 62055) e protocolos abertos de comunicação (DLMS/COSEM, Modbus-TCP) para telemetria automatizada.
* **Fornecedores de Cartografia Satélite:** Disponibilidade de camadas de mapa base (OpenStreetMap / Google Maps) para suporte ao módulo GIS.

---

## 9. Requisitos Obrigatórios (MVP) vs. Requisitos Futuros (Roadmap)

Conforme a Seção 12 do PRD e o catálogo de Histórias de Utilizador (Anexo A):

| Domínio | Escopo Obrigatório do MVP (Fase 1) | Escopo Futuro (Fases 2, 3 e 4) |
| :--- | :--- | :--- |
| **Mini-redes & GIS** | Cadastro completo, mapa cartográfico interativo, perímetro de concessão e traçado de linhas. | Modelação tridimensional (BIM), importação CAD de projetos e cálculo automático de perdas elétricas na rede. |
| **Clientes & Contratos** | Cadastro com coordenadas GPS, foto, documentos, contratos com potência e caução. | Assinatura biométrica de contratos em tablet e self-onboarding digital do cliente. |
| **Medição & Consumo** | Inventário de medidores, registo de leituras manuais na app móvel e importação em ficheiro. | Telemetria contínua AMI/AMR com recolha remota a cada 15 minutos via 4G/GPRS. |
| **Faturação & Cobrança** | Cálculo tarifário homologado, registo manual e por importação de pagamentos móveis, reconciliação. | Integração por API direta com webhooks de liquidação instantânea M-Pesa / e-Mola. |
| **Operação & Manutenção** | Registo de avarias, emissão e fecho de OTs com fotos de evidência, cálculo de MTTR e preventivas básicas. | Algoritmos de manutenção preditiva baseados em inteligência artificial e degradação de baterias. |
| **Atendimento ao Cliente** | Registo centralizado de pedidos e reclamações na ficha do cliente. | Chatbot inteligente por WhatsApp e Portal Web do Cliente com acesso restrito a saldo e faturas. |
| **Arquitetura & Acessos** | Aplicação web responsiva com funcionamento offline nas tarefas móveis de campo, RBAC e auditoria. | Suporte multi-organização para licenciamento *SaaS* a outros operadores de mini-redes em África. |

---

## 10. Lacunas de Informação e Ambiguidades Identificadas

Para garantir rigor de engenharia e evitar suposições, identificaram-se as seguintes lacunas de negócio no PRD que requerem decisão formal da LECASU:

1. **Lacuna 1 — Validação de Identidade Rural:**  
   *Muitos clientes rurais em aldeias recônditas não possuem Bilhete de Identidade nacional ou NUIT. Qual o procedimento documental oficial de substituição? Recomenda-se aceitar o Número do Cartão de Eleitor ou uma Declaração do Secretário do Bairro/Líder Tradicional.*
2. **Lacuna 2 — Estrutura de Escalões Tarifários e Subsídios:**  
   *O PRD menciona tarifas por escalão e taxa de disponibilidade, mas não define os valores de corte de cada escalão (ex: Tarifa Social de 0 a 30 kWh, Tarifa Normal de 31 a 100 kWh). Quais as tabelas homologadas pela ARENE a configurar na parametrização inicial?*
3. **Lacuna 3 — Prazos Legais e Tolerância para Corte de Energia:**  
   *Em contratos pós-pagos com faturas não liquidadas, quantos dias decorrem entre o envio do aviso prévio de corte e a emissão automática da Ordem de Trabalho de desligação física?*
4. **Lacuna 4 — Política de Reversões e Cancelamentos Financeiros:**  
   *Em situações de erro no preenchimento de recibos ou duplicação de transações, o cancelamento pode ser efetuado unicamente pelo Gestor Financeiro ou requer aprovação dupla (Administrador Geral + Financeiro) com registo fundamentado?*
5. **Lacuna 5 — Modelos e Protocolos de Contadores para o Piloto:**  
   *Quais são as marcas específicas de medidores (Hexing, Inhemeter, Landis+Gyr) e o modelo de gerador de tokens STS (software de vending da LECASU ou integração externa) que estarão presentes no primeiro piloto de campo?*

---

## 11. Riscos de Implementação e Medidas de Controlo

| Risco Técnico ou Operacional | Gravidade | Medida de Mitigação Proposta |
| :--- | :---: | :--- |
| **Risco 1: Perda de Dados por Falha de Rede no Terreno** | Alta | Adoção estrita de arquitetura PWA (*Progressive Web App*) com armazenamento local seguro (*IndexedDB*) e sincronização idempotente baseada em carimbos de tempo. |
| **Risco 2: Subfaturação por Adulteração ou Avaria de Medidores** | Alta | Implementação de algoritmo automático de deteção de anomalias (alerta imediato para desvios de consumo superiores a 300% ou queda abrupta para zero kWh). |
| **Risco 3: Falta de Evidências em Reparações Técnicas** | Média | O sistema bloqueia informaticamente a conclusão de qualquer Ordem de Trabalho se não forem carregadas pelo menos duas fotografias nítidas (antes e depois da reparação). |
| **Risco 4: Incompatibilidade com Dispositivos Móveis de Baixo Custo** | Média | Desenvolvimento de interface limpa, sem frameworks frontend pesadas, garantindo execução fluida em smartphones Android de gama de entrada utilizados pelos agentes comunitários. |
| **Risco 5: Violação de Segurança e Exposição de Dados Financeiros** | Alta | Aplicação rigorosa de tokens JWT com expiração controlada, controlo estrito de papéis (RBAC) validado em todas as rotas da API e sanitização completa de dados contra SQL Injection. |

---

## 12. Recomendações Técnicas e Arquiteturais do Especialista

Em cumprimento das regras do projeto, apresenta-se a clara distinção entre as obrigações do PRD e as recomendações técnicas da equipa de arquitetura:

* **Recomendação de Arquitetura de Software:**  
  Adoptar uma arquitetura modular desacoplada: **Frontend Vanilla (HTML5/CSS3/JavaScript ES6+)** para máxima leveza, rapidez de resposta e independência de bibliotecas transitórias; e **Backend RESTful em Node.js** organizado em camadas estritas (Rotas -> Middlewares de Autenticação e RBAC -> Controladores de Negócio -> Camada de Dados).
* **Recomendação para a Base de Dados Relacional:**  
  Implementar **PostgreSQL 15+** com a extensão espacial **PostGIS**, permitindo consultas geográficas nativas de elevada precisão (ex: cálculo de distâncias entre postes e clientes, geração automática de raios de cobertura e exportação para formatos GeoJSON universais).
* **Recomendação para Pagamentos Móveis no MVP:**  
  Iniciar o piloto com registo estruturado de referências de transação M-Pesa/e-Mola e reconciliação assistida com exportação bancária, mantendo já arquitetados os *endpoints webhook* padronizados para quando as APIs diretas das operadoras estiverem formalmente contratadas.

---

## 13. Conclusão e Próximos Passos

O presente **01 — Relatório de Descoberta e Análise do Produto** comprova a viabilidade técnica e a maturidade dos requisitos funcionais do **LECASU GridOps**. O produto responde de forma cirúrgica às dores operacionais e comerciais das mini-redes rurais em Moçambique, assentando em bases realistas e auditáveis.

Conforme as regras de desenvolvimento do projeto:
* **Nenhum código ou componente visual foi gerado nesta etapa.**
* O relatório foi integralmente documentado no repositório oficial em `docs/01-RELATORIO-DE-DESCOBERTA-E-ANALISE-DO-PRODUTO.md`.

### Submissão para Aprovação:
Solicita-se a apreciação da equipa de gestão da LECASU para:
1. Validar e aprovar o presente relatório da **Etapa 01**.
2. Prestar os esclarecimentos pretendidos sobre as lacunas identificadas na Seção 10.
3. Emitir autorização formal para avançar para a **Etapa 02 — Especificação de Requisitos do Produto (PRD Consolidada, Catálogo de Requisitos, Matriz RBAC e Regras de Negócio)**.

