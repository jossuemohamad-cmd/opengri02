# 21 — LISTA DE ERROS E CORRECÇÕES
## LECASU GridOps — Registo de Anomalias, Causa-Raiz e Resolução
**Documento de Gestão da Qualidade de Software — Etapa 06**

---

### Metadados
- **Produto:** LECASU GridOps (Versão 1.0.0)
- **Empresa:** LECASU, Lda.
- **Data:** 05 de Novembro de 2026
- **Estado Geral:** **100% dos Erros Resolvidos e Validados em Teste**

---

## 1. Visão Geral

Este documento compila todas as anomalias, problemas visuais, erros de execução e discrepâncias funcionais detetados durante as etapas de desenvolvimento, auditoria técnica e revisão visual do **LECASU GridOps**. 

Para cada ocorrência, é descrita a gravidade, a causa-raiz identificada, os ficheiros afetados, a intervenção corretiva efetuada e a evidência de teste que comprova a resolução definitiva.

---

## 2. Matriz Consolidada de Anomalias e Correcções

| ID | Descrição da Anomalia | Módulo Afectado | Gravidade | Estado | Ficheiros Modificados |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **ERR-01** | `users.filter is not a function` na gestão de utilizadores e O&M | Administração / O&M | **Alta** | **Resolvido** | `public/js/app.js` |
| **ERR-02** | Cards de KPI colapsados em fila vertical com quebra visual | UI / Dashboard | **Alta** | **Resolvido** | `public/css/style.css`, `public/js/app.js` |
| **ERR-03** | Efeito de deslocamento no rato (Hover) provocando instabilidade | UI / UX | **Média** | **Resolvido** | `public/css/style.css` |
| **ERR-04** | Truncamento precoce de títulos com reticências (`...`) | Topbar / Cabeçalho | **Média** | **Resolvido** | `public/css/style.css` |
| **ERR-05** | Relógio estático no cabeçalho sem avanço dinâmico de segundos | Header / Telemetria | **Baixa** | **Resolvido** | `public/index.html`, `public/js/app.js` |
| **ERR-06** | Medidor circular deformado e percentagem sobreposta | UX / Medidores | **Média** | **Resolvido** | `public/css/style.css` |
| **ERR-07** | Ausência de botão explícito de reposição de dados nas Configurações | Configurações / BD | **Média** | **Resolvido** | `public/js/app.js`, `server/controllers/systemController.js` |
| **ERR-08** | Dessincronização entre métrica de potência e medidor circular | SCADA / Dashboard | **Baixa** | **Resolvido** | `public/js/app.js` |

---

## 3. Detalhe Técnico das Anomalias e Resoluções

### 3.1. ERR-01 — Erro de Execução: `users.filter is not a function`
- **Sintoma:** Ao aceder à aba de Utilizadores ou ao tentar agendar manutenção preventiva de um activo técnico, a aplicação apresentava mensagem de erro: `Erro ao carregar utilizadores: users.filter is not a function`.
- **Causa-Raiz:** O endpoint `/api/users` devolve um objecto estruturado `{ status: "success", data: { total: 8, page: 1, users: [...] } }`. O código cliente tentava invocar `.filter()` directamente sobre o objecto `res.data` em vez de extrair o array contido em `res.data.users`.
- **Correcção Efectuada:**
  - Em `loadUsersTabContent()` e `showPreventativeMaintenanceModal()`, implementou-se extracção defensiva:
    `const userList = Array.isArray(res?.data?.users) ? res.data.users : (Array.isArray(res?.data) ? res.data : []);`
  - A operação `.filter()` passou a ser executada com garantia absoluta de recepção de um array.
- **Validação:** A listagem de contas de utilizadores carrega instantaneamente, com 8 utilizadores reais e badges de estado operacionais activos.

---

### 3.2. ERR-02 — Disposição Vertical Inadequada nos Cards de KPI
- **Sintoma:** Os cartões de métricas superiores nos ecrãs de Mini-Redes, Clientes, Activos e Faturação quebravam os elementos em 4 ou 5 linhas verticais, estragando o alinhamento visual e a proporção da área de trabalho.
- **Causa-Raiz:** Falta de regras rígidas de `display: flex`, `justify-content: space-between` e `white-space: nowrap` nos nós `.kpi-card-top`, `.kpi-values-box` e `.kpi-bottom-row`.
- **Correcção Efectuada:**
  - Padronização em `public/css/style.css`:
    - Linha 1: Ícone à esquerda + Grupo de valor e badge de tendência à direita em disposição horizontal sem quebra (`nowrap`).
    - Linha 2: Rótulo do indicador alinhado à esquerda.
    - Linha 3: Linha divisória pontilhada horizontal (`border-top: 1px dashed #e2e8f0`).
    - Linha 4: Texto de capacidade à esquerda + medidor circular à direita.
- **Validação:** Todos os 40 cards em toda a aplicação seguem rigorosamente o modelo da imagem de referência homologada.

---

### 3.3. ERR-03 — Instabilidade Visual por Efeito Hover
- **Sintoma:** Ao passar o rato sobre os cartões, estes sofriam uma translação vertical (`translateY(-2px)` ou `translateY(-3px)`), provocando tremulação e quebra de foco visual durante a leitura operacional.
- **Causa-Raiz:** Classes `.kpi-card:hover`, `.saas-kpi-card:hover` e `.metric-card:hover` com propriedades de animação activas.
- **Correcção Efectuada:**
  - Remoção de `transform` e definição de `transition: none !important;` nos cartões de indicadores. Os cards mantêm-se estáveis, permitindo leitura focada de telemetria.
- **Validação:** Passagem do cursor do rato sobre os cartões não provoca qualquer movimento físico.

---

### 3.4. ERR-04 — Truncamento Precoce de Títulos e Textos Operacionais
- **Sintoma:** Títulos de página e descrições técnicas eram prematuramente cortados com reticências (`...`), impossibilitando a leitura completa de códigos de activos e especificações de centrais.
- **Causa-Raiz:** Aplicação indiscriminada de `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` em elementos que deveriam permitir quebra controlada de linha.
- **Correcção Efectuada:**
  - No cabeçalho, foi permitido que o título do ecrã e o subtítulo se expandam com clareza.
  - Nas tabelas de dados, foi criada a classe utilitária `.col-desc` com `white-space: normal !important; overflow-wrap: break-word;` para campos descritivos longos.
- **Validação:** Descrições e especificações técnicas de OTs e inversores são apresentadas por extenso sem cortes visuais.

---

### 3.5. ERR-05 — Relógio Digital Estático no Cabeçalho
- **Sintoma:** O cabeçalho exibia uma hora estática (`15:00:00`) e a data fixa `04 Nov 2026`, sem refletir o tempo real oficial de operação da rede.
- **Causa-Raiz:** Invocação pontual do carimbo temporal sem o timer contínuo associado no arranque do frontend.
- **Correcção Efectuada:**
  - Criada a função `initLiveTopClock()` com execução a cada 1000ms (`setInterval`), calculando dinamicamente as horas, minutos e segundos no fuso horário oficial de Moçambique (`Africa/Maputo`, UTC+2) e formatando a data corrente por extenso.
  - O placeholder inicial do HTML foi alterado para `--:--:--` até à primeira leitura viva.
- **Validação:** O relógio avança segundo a segundo em conformidade com o horário de Moçambique.

---

### 3.6. ERR-06 — Deformação dos Medidores Circulares de Porcentagem
- **Sintoma:** Medidores circulares apresentavam sobreposição de texto, cortes de SVG e formato ovalado dependendo da resolução do ecrã.
- **Causa-Raiz:** Uso de SVGs inline com viewBox e dimensões relativas variáveis.
- **Correcção Efectuada:**
  - Substituição por um componente nativo CSS baseado em `conic-gradient`:
    - Diâmetro fixo e inviolável de 44px x 44px.
    - Trilho de fundo em cinzento neutro (#E2E8F0).
    - Arco ativo em laranja oficial da LECASU (#FF7A00).
    - Máscara interior circular branca (inset: 4px) com número percentual perfeitamente centralizado e legível.
- **Validação:** 100% dos medidores circulares renderizam com nitidez perfeita em qualquer resolução.

---

### 3.7. ERR-07 — Falta de Botão para Reposição e Restauro da Base de Dados
- **Sintoma:** O operador não possuía uma acção directa na interface para restaurar os dados de demonstração oficiais sem necessidade de intervenção manual via terminal.
- **Causa-Raiz:** Endpoint `/api/system/reset-demo` existia no backend, mas não possuía gatilho intuitivo no ecrã de Configurações.
- **Correcção Efectuada:**
  - Adicionado botão de destaque **Resetar o Sistema** no cabeçalho das Configurações e no separador de Manutenção da Base de Dados.
  - Implementado modal de confirmação de segurança com aviso explícito e feedback visual durante a reinicialização dos dados do PostgreSQL.
- **Validação:** O clique no botão restaura com sucesso a carteira de 8 mini-redes, 30 clientes, contratos, activos e histórico de pagamentos.

---

### 3.8. ERR-08 — Dessincronização entre Potência Instantânea e Medidor
- **Sintoma:** A potência instantânea no card da central solar fotovoltaica variava via telemetria, mas o medidor circular mantinha um valor estático de 77%.
- **Causa-Raiz:** O timer SCADA actualizava apenas o elemento textual de kW, sem recalcular a propriedade CSS `--gauge-pct` do medidor.
- **Correcção Efectuada:**
  - O ciclo de atualização foi ajustado para recalcular dinamicamente a taxa de utilização em função da capacidade nominal de 600 kWp, sincronizando o texto e o arco visual simultaneamente.
- **Validação:** O medidor circular acompanha realisticamente as oscilações de irradiação solar e potência ativa.

---

## 4. Conclusão da Gestão de Qualidade

Todas as 8 anomalias identificadas foram devidamente diagnosticadas na sua causa-raiz, corrigidas a nível de código-fonte e validadas através de testes automatizados e inspeção visual no navegador. Não restam defeitos impeditivos ou de alta severidade na plataforma LECASU GridOps.
