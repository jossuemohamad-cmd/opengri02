# LECASU GRIDOPS — MANUAL DO UTILIZADOR
**Documento:** 24 — Manual do Utilizador  
**Versão:** 1.0.0 (Produção)  
**Proprietário:** LECASU, Lda.  
**Data:** 05 de Novembro de 2026  
**Classificação:** Uso Geral / Operacional  

---

## 1. Introdução e Acesso à Plataforma

O **LECASU GridOps** é a ferramenta central da LECASU para gestão integrada de mini-redes solares rurais. Este manual orienta os colaboradores no uso quotidiano das funcionalidades de campo e escritório.

### 1.1 Iniciar Sessão (Login)
1. Abrir o navegador no endereço oficial: `https://gridops.lecasu.co.mz`.
2. Introduzir o seu **Email Institucional** e **Senha**.
3. Clicar em **Entrar no Sistema**.
4. O sistema valida as suas permissões e apresenta os módulos correspondentes à sua função.

### 1.2 Instalação no Telemóvel ou Tablet (PWA)
Para técnicos e agentes em campo:
1. No navegador do dispositivo móvel (Chrome, Edge ou Safari), abrir o endereço da plataforma.
2. Clicar no menu do navegador e selecionar **Instalar Aplicação** ou **Adicionar ao Ecrã Principal**.
3. O ícone da LECASU será adicionado ao telemóvel, funcionando como uma aplicação nativa com suporte para funcionamento sem internet (offline).

---

## 2. Dashboard Executivo e Supervisão em Tempo Real

O Dashboard é o centro de comando operacional do LECASU GridOps.

### 2.1 Faixa Superior de Indicadores (KPIs)
O topo da página apresenta 4 cartões com layout lado a lado e medidores circulares com atualização em tempo real:
- **Potência Solar Ativa:** Potência instantânea gerada em quilowatts (kW), comparada com a capacidade de pico (kWp) e medidor percentual.
- **Produção Solar Diária:** Energia acumulada no dia corrente em quilowatt-hora (kWh), com indicação da média mensal.
- **Clientes & Ligações:** Total de consumidores ligados à rede, com destaque para clientes com Usos Produtivos de Energia (PUE).
- **Disponibilidade da Rede:** Índice de continuidade do serviço (uptime %) e nível de carga do banco de baterias (BESS SoC).

### 2.2 Mapa Satélite e Cockpit do Inversor
- **Mapa Satélite GIS:** Mostra a distribuição geográfica de todas as mini-redes operadas pela LECASU, com indicadores de estado (Verde = Normal, Amarelo = Atenção, Vermelho = Alarme).
- **Cockpit do Inversor:** Apresenta a telemetria ao segundo do inversor central da central selecionada, incluindo tensão, frequência da rede (50 Hz), corrente e temperatura de operação.

---

## 3. Módulo de Mini-Redes e Ativos Técnicos

### 3.1 Consulta e Cadastro de Mini-Redes
1. Aceder ao menu **Mini-Redes** no painel lateral.
2. A lista apresenta as centrais fotovoltaicas ativas com o respetivo código único (ex.: `MG-CAB-01`).
3. Para cadastrar uma nova central, clicar em **Nova Mini-Rede** e preencher:
   - Nome e Província (Cabo Delgado, Nampula, Niassa, Zambézia, Tete, Manica, Sofala, Inhambane, Gaza, Maputo).
   - Coordenadas GPS (Latitude e Longitude decimais).
   - Potência Solar Instalada (kWp) e Capacidade de Armazenamento BESS (kWh).
   - Tipo de Geração (100% Solar Fotovoltaica ou Híbrida com Gerador Diesel).

### 3.2 Gestão de Ativos Patrimoniais
No menu **Ativos & O&M**, é mantido o inventário detalhado de equipamentos de cada central:
- Módulos Solares (marca, modelo, potência unitária e número de série).
- Inversores de Rede e Carregadores Bidirecionais de Baterias.
- Bancos de Baterias LiFePO4 (química de lítio) com número de ciclos registados.
- Transformadores de MT/BT e Postes de Distribuição.

---

## 4. Módulo Comercial: Clientes e Contratos

### 4.1 Cadastro de Clientes
1. No menu **Clientes**, clicar em **Novo Cliente**.
2. Registar os dados pessoais ou empresariais:
   - Nome do Titular e Número de Identificação (BI ou NUIT).
   - Contacto telefónico (utilizado para envio de tokens de recarga).
   - Mini-rede de ligação e coordenadas da residência/estabelecimento.
   - Categoria de Consumo:
     - **Doméstico:** Residências familiares.
     - **Comercial:** Lojas, mercearias, tabacarias.
     - **Uso Produtivo (PUE):** Moageiras, soldaduras, bombas de água, carpintarias.
     - **Institucional:** Escolas comunitárias, postos de saúde, centros de culto.

### 4.2 Emissão de Contrato de Fornecimento
1. Na ficha do cliente, clicar em **Novo Contrato**.
2. Selecionar o tipo de tarifa aplicável e a potência contratada (kVA).
3. Definir o modelo de cobrança: **Pré-Pagamento (STS)** ou **Pós-Pagamento**.
4. Registar o valor da caução de ligação (garantia em custódia).
5. O contrato é gerado no estado `vigente`, atribuindo código estruturado (ex.: `CTR-2026-0042`).

---

## 5. Módulo de Medição: Contadores e Leituras

### 5.1 Associação de Contadores STS
1. No menu **Contadores & Leituras**, clicar em **Novo Contador**.
2. Inserir o **Número de Série STS** (código de 11 a 13 dígitos do contador).
3. Associar o contador ao cliente e contrato correspondente.
4. O contador passa do estado `em_estoque` para `instalado`.

### 5.2 Registo de Leituras no Terreno (Online e Offline)
Para o Técnico de Campo:
1. Ao visitar a instalação do consumidor, abrir o ecrã **Registar Leitura**.
2. Digitar a leitura atual exibida no visor do contador (kWh).
3. O sistema calcula automaticamente o consumo acumulado desde a leitura anterior.
4. **Validação de Fraude / Anomalia:** Se o consumo diferir significativamente da média histórica do cliente, o sistema emite um alerta para confirmação antes de gravar.
5. **Modo Offline:** Na ausência de sinal de rede móvel, a leitura é guardada com segurança na memória local do dispositivo. Assim que o técnico recuperar cobertura GSM ou WiFi, a sincronização é efetuada automaticamente.

---

## 6. Módulo Financeiro: Faturação e Pagamentos

### 6.1 Emissão de Recibos e Tokens STS
1. Aceder ao menu **Facturação & Pagamentos**.
2. Clicar em **Novo Pagamento**.
3. Selecionar o cliente e indicar o montante em Meticais (MZN).
4. Escolher o canal de pagamento:
   - **M-Pesa** (Vodacom)
   - **e-Mola** (Movitel)
   - **M-Kesh** (Tmcel)
   - **Numerário / Agente Local**
5. O sistema deduz as taxas contratuais, calcula a quantidade de energia em kWh correspondente à tarifa do cliente e gera o **Token STS de 20 dígitos**.
6. O cliente recebe o token por SMS para digitação no teclado do contador.

### 6.2 Reconciliação Financeira
- O perfil Financeiro pode filtrar pagamentos pelo estado `pendente` ou `confirmado`.
- Ao confirmar o extrato da carteira móvel, o operador clica em **Reconciliar**, registando o ID bancário da transação.

---

## 7. Módulo de O&M: Avarias e Manutenções

### 7.1 Abertura de Ocorrência (Ticket de Avaria)
1. No menu **Ocorrências & Manutenção**, clicar em **Registar Ocorrência**.
2. Identificar a mini-rede ou cliente afetado.
3. Descrever a anomalia (ex.: corte de linha por intempérie, queda de disjuntor, falha de comunicação do inversor).
4. Classificar a prioridade: **Baixa**, **Média**, **Alta** ou **Crítica (Urgência)**.

### 7.2 Emissão de Ordem de Serviço (OS)
1. O Gestor de Operações analisa a ocorrência e clica em **Emitir Ordem de Trabalho**.
2. Atribui a OS a um Técnico de Campo qualificado.
3. O fluxo de trabalho segue os estados formais:
   - `aberta` → `atribuida` → `em_resolucao` → `concluida` (ou `cancelada`).
4. Ao concluir o serviço, o técnico insere o relatório de reparação, peças substituídas e confirma a reposição do fornecimento de energia.

---

## 8. Relatórios Gerenciais e Exportação de Dados

No menu **Relatórios**:
- Visualização de curvas de geração solar contra a procura da comunidade.
- Desempenho de arrecadação de receita mensal por mini-rede.
- Estimativa ambiental de poupança de combustível diesel e emissões evitadas de CO₂.
- **Exportação CSV:** Todos os relatórios podem ser descarregados em formato de folha de cálculo CSV para análise no Excel.

