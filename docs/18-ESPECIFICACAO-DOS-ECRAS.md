# 18 — Especificação Detalhada dos Ecrãs Prioritários
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Especificação Anatómica, Comportamental e Funcional dos Ecrãs do Sistema  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Referências Centrais:** PRD Consolidada (`docs/02-PRD-CONSOLIDADA.md`), Design System (`docs/15-DESIGN-SYSTEM.md`) e Mapa de Navegação (`docs/16-MAPA-DE-NAVEGACAO.md`)  
**Responsável:** Arquitetura de Informação e Design de Interação  
**Data de Emissão:** 05 de Novembro de 2026  
**Estado:** Submetido para Validação e Aprovação Formal  

---

## 1. Visão Geral das Especificações de Interface

Este documento descreve detalhadamente os **13 ecrãs prioritários** do LECASU GridOps, definindo a sua anatomia, zonamento de informação, controlos interativos, validações em tempo real e adaptações responsivas (Desktop, Tablet e Mobile).

---

## 2. Anatomia e Especificação dos 13 Ecrãs

### Ecrã 01: Autenticação e Recuperação de Acesso
* **Objetivo:** Ponto de entrada de operadores, autenticação segura com suporte a PIN rápido em telemóveis e recuperação de acesso.
* **Componentes Visuais:**
  - Painel centralizado em cartão branco com sombra suave (`#FFFFFF` sobre fundo ardósia/base).
  - Logótipo oficial da LECASU com selo de versão da plataforma.
  - Campos de entrada: *E-mail / Utilizador* e *Palavra-Passe* (com botão de alternância de visibilidade "olho").
  - Opção "Lembrar este dispositivo" (ativa sessão estendida para técnicos de campo).
  - Botão de ação primária "Entrar no GridOps" (`.btn-primary`, largura total, 44px de altura).
  - Link de texto "Esqueceu a palavra-passe? Solicitar ao Administrador".
* **Comportamento Responsivo:**
  - *Desktop:* Caixa centralizada com largura fixa de 420px.
  - *Mobile:* Ocupa a largura total com margens laterais de 16px, teclado numérico otimizado para PIN.

---

### Ecrã 02: Dashboard Executivo e Cockpit Operacional
* **Objetivo:** Visão consolidada da operação de geração fotovoltaica, saúde das baterias BESS e receita em tempo real.
* **Zonamento da Interface:**
  1. *Faixa de 4 Cartões Métricos Superiores:*
     - Cartão 1: Potência Solar Ativa (kW) com medidor circular de 44px em laranja (`77%`).
     - Cartão 2: Produção Solar Diária (kWh) com medidor circular em verde (`92%`).
     - Cartão 3: Clientes & Conexões Ativas com medidor circular em roxo (`85%`).
     - Cartão 4: Disponibilidade da Rede & BESS SoC com medidor circular em laranja-âmbar (`99%`).
  2. *Grelha Dividida em Duas Colunas:*
     - *Coluna Esquerda (55% da largura):* Mini-mapa satélite interativo exibindo a localização das centrais, estado de operação (marcador verde ativo / âmbar alerta) e botão de alternância para expansão em ecrã inteiro.
     - *Coluna Direita (45% da largura):* Cockpit de telemetria dos inversores solares (tensão AC/DC, frequência de rede em 50Hz, temperatura dos módulos BESS e gráfico de barras de produção horária).
* **Comportamento Responsivo:**
  - *Desktop:* 4 cartões alinhados em linha horizontal; duas colunas na secção principal.
  - *Tablet:* 4 cartões em grelha 2x2; mapa e cockpit empilhados verticalmente.
  - *Mobile:* 4 cartões empilhados ou em carrossel horizontal deslizante suave; mapa recolhido com botão para expandir.

---

### Ecrã 03: Lista e Ficha de Mini-Redes
* **Objetivo:** Gestão das centrais de produção de energia, concessões e equipamentos associados.
* **Zonamento da Interface:**
  - Barra superior de ferramentas: campo de pesquisa textual, filtro por província e botão "+ Nova Mini-Rede".
  - Tabela principal com: Código, Nome da Central, Província/Distrito, Potência Solar (kWp), BESS (kWh), Clientes Ativos, Estado Operacional e Ações.
  - *Ficha Detalhada da Mini-Rede (Gaveta Lateral ou Página Dedicada):* Abas para (1) Características Técnicas da Central; (2) Circuitos e Ramais Elétricos; (3) Ativos Patrimoniais Vinculados; (4) Histórico de Interrupções e Manutenções.

---

### Ecrã 04: Cartografia Interativa e Mapa SIG
* **Objetivo:** Mapeamento geográfico de alta precisão da rede elétrica e infraestrutura instalada.
* **Componentes Visuais:**
  - Área de mapa em ecrã expandido consumindo Leaflet GIS com azulejos satélite abertos e dados cacheados localmente.
  - Painel flutuante de controlo de camadas (*Layer Control*):
    * [x] Centrais e Subestações (ícones solares laranjas)
    * [x] Linhas de Distribuição BT/MT (traçado azul/vermelho com espessura proporcional à tensão)
    * [x] Postes e Caixas de Derivação (marcadores pontuais cinzentos)
    * [x] Clientes Ligados (círculos verdes com nome do cliente em tooltip)
  - Barra de pesquisa geográfica rápida por cliente ou código de contador.

---

### Ecrã 05: Gestão Comercial de Clientes e PUE
* **Objetivo:** Cadastro, acompanhamento e histórico de consumidores particulares e negócios produtivos.
* **Zonamento da Interface:**
  - Abas superiores de segmentação: *Todos os Clientes*, *Domésticos*, *Usos Produtivos (PUE)* e *Institucionais*.
  - Tabela densa: Código Cliente, Nome, Contacto Telefónico, Mini-Rede, Tipo de Atividade PUE, Saldo em Conta Corrente, Estado e Botão de Ação.
  - *Ficha do Cliente:*
    - Cartão de identificação com foto do titular e cópia do documento de identificação (BI/NUIT).
    - Resumo contratual: número do contrato, potência contratada e número de série do contador associado.
    - Extrato financeiro: histórico cronológico de faturas, recibos e recargas STS adquiridas.

---

### Ecrã 06: Contratos e Ligações Elétricas
* **Objetivo:** Celebração, ativação, alteração de potência e rescisão de contratos de fornecimento.
* **Componentes e Filtros:**
  - Tabela de contratos com filtros por estado: *Pendente de Ligação*, *Ativo*, *Suspenso por Dívida*, *Rescindido*.
  - Modal de Criação de Contrato: seleção do cliente pré-cadastrado, definição da potência contratada (kVA), disjuntor de corte (A), cálculo automático da taxa de caução e seleção do tarifário ARENE aplicável.
  - Ação de emissão de Ordem de Trabalho de ligação para equipa de campo logo após aprovação contratual.

---

### Ecrã 07: Parque de Contadores, Leituras e Consumo
* **Objetivo:** Controlo metrológico de contadores, rotas de recolha de leituras e auditoria de fraudes.
* **Componentes e Funcionalidades:**
  - Tabela de contadores: Número de Série, Fabricante, Tipo (STS Pré-Pago / Eletromecânico), Número do Selo, Última Leitura Registada e Alertas de Consumo.
  - Botão "Registar Leitura": abre formulário com leitura anterior pré-carregada, campo para inserção da nova leitura e botão para capturar fotografia do mostrador com a câmara do telemóvel.
  - Sistema de Alerta Visual: linha de tabela destacada em amarelo-âmbar caso o consumo apurado exceda $300\%$ da média histórica do cliente.

---

### Ecrã 08: Pagamentos, Vending STS e Reconciliação
* **Objetivo:** Emissão de créditos pré-pagos STS, registo de pagamentos e reconciliação com operadoras móveis.
* **Zonamento da Interface:**
  - *Caixa de Emissão Rápida STS:* Campo largo para digitar ou ler por código de barras o número do contador, campo de montante em Meticais, exibição do cálculo automático de amortização de dívida e botão de destaque "Emitir Token STS".
  - *Cartão de Token Gerado:* Mostrador com os 20 dígitos formatados em blocos de 4 (`XXXX - XXXX - XXXX - XXXX - XXXX`), botão de cópia instantânea e botão para disparar SMS direto ao cliente.
  - *Aba de Reconciliação:* Ferramenta de upload de ficheiro CSV de extrato bancário/M-Pesa com exibição imediata do rácio de correspondência automática e divergências pendentes.

---

### Ecrã 09: Gestão Patrimonial de Ativos
* **Objetivo:** Inventário e ciclo de vida de equipamentos de geração, conversão e acumulação.
* **Componentes Visuais:**
  - Listagem com filtros por classe de equipamento: *Painéis Solares*, *Inversores*, *Baterias BESS*, *Transformadores*.
  - Colunas informativas: Código do Ativo, Número de Série, Fabricante, Data de Instalação, Fim de Garantia e Estado Técnico (*Operacional*, *Degradado*, *Em Manutenção*).
  - Visualizador de Documentos: link direto para abrir PDFs de manuais técnicos e certificados de calibração do fabricante.

---

### Ecrã 10: Ocorrências e Ordens de Trabalho (O&M)
* **Objetivo:** Gestão, despacho e execução de ordens de serviço preventivas e corretivas em campo.
* **Zonamento da Interface:**
  - Cartões resumo de SLA no topo: *Alta Prioridade (4h)*, *Média Prioridade (24h)*, *Baixa Prioridade (72h)*.
  - Tabela operacional: Número da OT, Tipo (Nova Ligação, Corte, Religação, Avaria), Mini-Rede, Técnico Atribuído, Data Limite SLA e Estado.
  - *Modal de Conclusão Técnica em Campo:* Checklist de verificação com caixas de seleção, seleção de peças sobresselentes consumidas no armazém e zona obrigatória de upload de duas fotografias (antes e depois da intervenção).

---

### Ecrã 11: Relatórios e Indicadores Regulatórios
* **Objetivo:** Prestação de contas e geração de relatórios oficiais exigidos pela ARENE e pelo FUNAE.
* **Componentes Visuais:**
  - Seletor de período de reporte: Trimestre (Q1, Q2, Q3, Q4) e Ano.
  - Seletor de abrangência: Concessão específica ou consolidado nacional de mini-redes da LECASU.
  - Pré-visualização dos indicadores calculados: Disponibilidade Global (%), Índice SAIDI e SAIFI, Total de Energia Injetada vs Faturada (Balanço de Perdas) e Quantidade de Ligações PUE ativas.
  - Botões de exportação formal: "Descarregar em Excel Oficial (.xlsx)" e "Emitir Certificado em PDF (.pdf)".

---

### Ecrã 12: Utilizadores e Matriz de Permissões (RBAC)
* **Objetivo:** Gestão de operadores, credenciais, perfis funcionais e alocação geográfica.
* **Componentes Visuais:**
  - Tabela de utilizadores: Nome Completo, E-mail, Perfil RBAC (badge colorido), Mini-Redes Autorizadas, Último Acesso e Estado da Conta.
  - Modal de Edição de Utilizador: definição de perfil, seleção das concessões geográficas autorizadas e botão de segurança "Encerrar Sessões Ativas Remotamente" (em caso de telemóvel roubado).

---

### Ecrã 13: Configurações Gerais e Trilha de Auditoria
* **Objetivo:** Parametrização global da plataforma e inspeção de logs de auditoria imutáveis.
* **Zonamento da Interface:**
  - *Separador 1: Estrutura Tarifária:* Tabela com as faixas de consumo em kWh e preços por escalão homologados pela ARENE.
  - *Separador 2: Parâmetros Comerciais:* Taxa de religação, percentagem padrão de amortização de dívida e limites de caixa para agentes comunitários.
  - *Separador 3: Trilha de Auditoria (Audit Logs):* Tabela cronológica em modo estritamente de leitura exibindo: Carimbo Temporal (UTC+2), Operador, Ação Realizada, Entidade Modificada, IP de Origem e botão para inspecionar os valores anteriores e novos em formato JSON limpo.
