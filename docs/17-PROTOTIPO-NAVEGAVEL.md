# 17 — Guia do Protótipo Navegável
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Manual de Navegação, Roteiro de Testes e Simulação de Ecrãs  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Referências Centrais:** Mapa de Navegação (`docs/16-MAPA-DE-NAVEGACAO.md`) e Design System (`docs/15-DESIGN-SYSTEM.md`)  
**Responsável:** Garantia de Qualidade de Interação e Engenharia de Frontend  
**Data de Emissão:** 05 de Novembro de 2026  
**Estado:** Submetido para Validação e Aprovação Formal  

---

## 1. Acesso ao Protótipo Navegável

O protótipo navegável do **LECASU GridOps** encontra-se em execução contínua e conectado à base de dados relacional PostgreSQL local, permitindo a interação real com todas as interfaces, formulários, mapas e fluxos de negócio.

* **URL Local de Acesso:** `http://localhost:3000`
* **Ambiente de Execução:** Node.js v20+ / Express com motor PostgreSQL 18.6 ativo.
* **Repositório Oficial Sincronizado:** `https://github.com/jossuemohamad-cmd/opengri02.git` (ramo `main`).

---

## 2. Perfis Homologados para Simulação de Acesso

Para validar os comportamentos visuais e restrições de cada perfil da matriz RBAC, o protótipo disponibiliza contas de teste pré-configuradas:

| Perfil Simulado | Utilizador / E-mail | Palavra-Passe | Foco de Validação no Protótipo |
| :--- | :--- | :---: | :--- |
| **Administrador (`ADMIN`)** | `admin@lecasu.co.mz` | `Admin123!` | Visão total, configurações de sistema e auditoria imutável. |
| **Gestor Operacional (`OPERATIONS_MANAGER`)** | `operacoes@lecasu.co.mz` | `Operacoes123!` | Cockpit SCADA, telemetria, mapa SIG e gestão de OTs. |
| **Gestor Comercial (`COMMERCIAL_MANAGER`)** | `comercial@lecasu.co.mz` | `Comercial123!` | Cadastro de clientes, contratos PUE e solicitação de estornos. |
| **Responsável Financeiro (`FINANCE`)** | `financas@lecasu.co.mz` | `Financas123!` | Faturação, reconciliação de extratos e autorização de estornos. |
| **Técnico de Campo (`FIELD_TECHNICIAN`)** | `tecnico@lecasu.co.mz` | `Tecnico123!` | Execução de OTs em campo, leituras de medidores e modo offline. |
| **Agente Comunitário (`COMMUNITY_AGENT`)** | `agente@lecasu.co.mz` | `Agente123!` | Venda de tokens STS em dinheiro vivo e registo de candidaturas. |
| **Auditor Externo (`AUDITOR_PARTNER`)** | `auditor@lecasu.co.mz` | `Auditor123!` | Relatórios regulatórios ARENE/FUNAE e dados com PII mascarado. |

---

## 3. Roteiro Passo a Passo de Demonstração e Validação

O utilizador e a equipa de validação da LECASU podem executar o seguinte roteiro linear de testes na interface:

### Passo 1: Autenticação e Entrada no Sistema
1. Aceder a `http://localhost:3000`.
2. O sistema exibe o ecrã corporativo de autenticação oficial com fundo ardósia/branco e acentos laranja da LECASU.
3. Introduzir as credenciais de `admin@lecasu.co.mz` (ou qualquer perfil pretendido) e submeter.
4. O sistema valida o token JWT e transita de forma fluida para a área de trabalho do Dashboard.

### Passo 2: Cockpit Executivo e Telemetria em Tempo Real
1. Observar a faixa superior com 4 cartões métricos alinhados em linha (*row layout* sem quebras desnecessárias):
   - *Potência Solar Ativa* com medidor circular percentual proporcional de 44x44px em laranja (`77%`).
   - *Produção Solar Diária* com medidor circular em verde (`92%`).
   - *Clientes & Ligações Rurais* com medidor circular em roxo (`85%`).
   - *Disponibilidade da Rede & BESS* com medidor circular em laranja-âmbar (`99%`).
2. Notar o cabeçalho superior com o relógio digital ao vivo em hora oficial de Moçambique (`UTC+2`) e indicador de sincronização.
3. Observar a secção dividida: à esquerda o mapa satélite operacional e à direita o cockpit técnico de telemetria dos inversores.

### Passo 3: Gestão de Mini-Redes e Visualizador SIG
1. Na barra lateral, clicar em **Mini-Redes**.
2. O sistema carrega a tabela com as centrais ativas, potências fotovoltaicas instaladas (kWp), capacidades BESS (kWh) e números de postos de transformação.
3. Clicar no botão do mapa SIG para expandir a cartografia interativa com as camadas de linhas de baixa tensão e clientes georreferenciados.

### Passo 4: Clientes e Usos Produtivos de Energia (PUE)
1. Clicar em **Clientes** no menu lateral.
2. Filtrar por categoria (ex: selecionar a aba "Usos Produtivos (PUE)" para visualizar moageiras e câmaras de refrigeração comunitárias).
3. Clicar no botão "+ Novo Cliente" para abrir o modal de cadastro comercial, verificando a validação em tempo real de contactos móveis e documentos de identificação.

### Passo 5: Emissor de Tokens Pré-Pagos STS
1. No menu lateral, navegar até **Venda STS / Pagamentos**.
2. Introduzir o número de um contador de teste (ex: `01234567890`) e um montante em Meticais (ex: `200 MT`).
3. O simulador processa a dedução automática de dívida acumulada ($25\%$) e calcula a energia líquida em kWh.
4. Clicar em "Emitir Token STS": o sistema gera instantaneamente o token internacional de 20 dígitos no formato canónico `XXXX - XXXX - XXXX - XXXX - XXXX` acompanhado de recibo digital imprimível.

### Passo 6: Ordens de Trabalho (O&M) e Evidências
1. Navegar até **Ordens de Trabalho**.
2. Visualizar a divisão por níveis de SLA (Crítica 4h, Média 24h, Baixa 72h).
3. Abrir uma ordem atribuída ao técnico de campo e simular o fecho: observar os campos de inserção de peças sobresselentes e a zona de upload obrigatório de duas fotografias (antes e depois da intervenção técnica).

### Passo 7: Relatórios Oficiais ARENE e Auditoria
1. Clicar em **Relatórios** na barra lateral.
2. Selecionar o trimestre de reporte pretendido e clicar em "Exportar Relatório ARENE": o protótipo prepara o documento pré-formatado em conformidade com as exigências do regulador moçambicano.
3. Navegar até **Configurações / Auditoria** para inspecionar a trilha cronológica imutável que registou todas as ações efetuadas nos passos anteriores.

---

## 4. Instruções para Verificação da Responsividade Móvel (Mobile PWA)

Para simular o comportamento da aplicação no telemóvel de um técnico de campo ou agente comunitário:
1. No navegador Google Chrome ou Microsoft Edge em `http://localhost:3000`, pressionar `F12` para abrir as Ferramentas de Desenvolvedor (*DevTools*).
2. Pressionar `Ctrl + Shift + M` para ativar o **Modo de Dispositivo Móvel** (*Toggle Device Toolbar*).
3. Selecionar a resolução de um smartphone comum em Moçambique (ex: *Samsung Galaxy A12* ou largura fixa de `375px` a `412px`).
4. Observar a adaptação ergonómica:
   - A barra lateral recolhe automaticamente para um menu deslizante acionado por botão hambúrguer.
   - Os cartões de métricas organizam-se de forma fluida sem transbordamento horizontal.
   - Os botões de ação passam a ter altura mínima de 44px para facilitar o toque com os dedos.
   - A tabela permite navegação com scroll horizontal suave mantendo os cabeçalhos alinhados.

