# 02 — RELATÓRIO DE AUDITORIA DO FRONTEND E PROPOSTA DE REDESIGN GLOBAL
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Auditoria Visual, Estrutural, Ergonómica e Proposta de Redesign  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Fontes de Requisitos:** `AGENTS.md`, `docs/PRD.md`, `docs/01-DISCOVERY-REPORT.md`, `docs/14-DOCUMENTO-UX-UI.md`, `docs/15-DESIGN-SYSTEM.md`  
**Responsável:** Arquitecto de Software Sénior & Lead UX/UI Designer  
**Data:** 05 de Novembro de 2026  
**Fase Atual:** Fase A — Auditoria e Diagnóstico Pré-Redesign  
**Classificação:** Confidencial / Revisão Estratégica  

---

## 1. Introdução e Objetivo da Auditoria

Este documento estabelece o diagnóstico rigoroso do estado atual da interface gráfica (*frontend*) do **LECASU GridOps**, cobrindo arquitetura de componentes, layout estrutural, consistência visual, ergonomia operacional e conformidade com os requisitos de negócio definidos no **PRD**.

O objetivo primordial desta auditoria é fundamentar a **reformulação visual completa, profissional e unificada** de toda a plataforma, garantindo que o LECASU GridOps atinja o patamar de um produto SaaS empresarial moderno, robusto, intuitivo e com identidade própria, **sem quebrar qualquer regra de negócio, integração com backend ou modelo de dados PostgreSQL**.

---

## 2. Diagnóstico do Estado Atual do Frontend

### 2.1 Visão Geral da Arquitetura do Frontend
O frontend atual do LECASU GridOps é estruturado como uma **Single Page Application (SPA)** de alto desempenho baseada em:
- **Tecnologia:** HTML5 semântico, CSS3 corporativo e Vanilla JavaScript modular (ES2022).
- **Roteamento:** Baseado em fragmentos de URL (*Hash Router*: `#dashboard`, `#mini-redes`, `#clientes`, `#contratos`, `#contadores`, `#faturacao`, `#activos`, `#ordens-trabalho`, `#relatorios`, `#auditoria`, `#configuracoes`, `#mapa-rede`).
- **Cartografia e GIS:** Biblioteca Leaflet 1.9 com ficheiros locais e suporte a camadas GeoJSON.
- **Suporte Offline / PWA:** Service Worker (`public/sw.js`), Manifesto PWA (`public/manifest.json`) e biblioteca de sincronização local (`public/js/offline-sync.js`).

---

## 3. Inventário e Problemas Identificados por Dimensão

### 3.1 Estrutura Global e Layout Base
* **Fragmentação de Classes CSS no Ficheiro Principal (`public/css/style.css`):**
  - O ficheiro CSS atingiu mais de 4.400 linhas de código com acumulação de regras sobrepostas oriundas de diferentes fases do desenvolvimento.
  - Existem múltiplos sistemas paralelos de classes para a mesma finalidade:
    - Cartões KPI: `.saas-kpi-card` (Dashboard) vs `.kpi-card` (Módulos de gestão) vs `.metric-card` vs `.plant-status-subcard`.
    - Tabelas de Dados: `.saas-table` vs `.table-modern` vs `.table` vs tabelas com estilos inline.
    - Botões: `.btn-primary` com gradiente `linear-gradient(135deg, #ff7a00, #ea580c)` em certas vistas e cor plana `background: #ff7a00` noutras.
* **Duplicação de Variáveis de Cores em `:root`:**
  - O `:root` declara variáveis redundantes: `--color-solarman-blue`, `--color-primary`, `--color-solar`, todas mapeadas para `#ff7a00`, gerando ruído e inconsistência de manutenção.

### 3.2 Barra Lateral de Navegação (Sidebar)
* **Pontos Positivos:**
  - Presença da marca oficial da LECASU, agrupamento temático dos módulos e estado recolhível funcional (`.sidebar-collapsed`).
* **Problemas Identificados:**
  - **Hierarquia Visual Pesada:** Os títulos dos 4 grupos de navegação (`PAINEL & MAPAS`, `INFRAESTRUTURA & O&M`, `GESTÃO COMERCIAL`, `GOVERNANÇA & SISTEMA`) estão em maiúsculas com espaçamento visual que compete com os links de navegação.
  - **Indicador de Ativação Desalinhado:** O link ativo utiliza borda esquerda e fundo laranja suave, mas no modo recolhido (`68px`) o ícone por vezes não fica perfeitamente centrado.
  - **Duplicação do Perfil do Utilizador:** O widget de perfil (avatar, nome, função e logout) está presente tanto no rodapé da sidebar quanto no cabeçalho superior (*topbar*), gerando redundância e ocupação inútil de espaço.

### 3.3 Cabeçalho Superior (Header / Topbar)
* **Pontos Positivos:**
  - Altura compacta (52px), relógio ao vivo com hora de Maputo (UTC+2), indicador de status da rede e sino de notificações.
* **Problemas Identificados:**
  - **Sobrecarga Horizontal no Desktop e Quebra no Tablet:** O cabeçalho tenta acomodar simultaneamente: Breadcrumb + Título + Subtítulo + Caixa de Busca Global + Relógio com segundos e data + Badge de Uptime da Rede + Sino de Alertas + Perfil do Utilizador com dois níveis de texto. Em ecrãs com largura inferior a 1280px, estes elementos colidem ou provocam quebras verticais indesejadas.
  - **Subtítulo Redundante:** O texto *"Gestão centralizada de energia rural em Moçambique"* consome espaço valioso do cabeçalho que deveria ser dedicado a ações contextuais da página ativa.

### 3.4 Dashboard Executivo
* **Pontos Positivos:**
  - 4 cartões superiores alinhados lado a lado com medidores circulares de percentagem (`.kpi-mini-gauge`), mapa satélite integrado e cockpit SCADA do inversor.
* **Problemas Identificados:**
  - **Cockpit do Inversor Complexo Demais:** O painel SCADA da direita mistura medidores elétricos, diagramas de fluxo e curvas horárias que geram densidade excessiva e reduzem o foco nas decisões operacionais da rede.
  - **Renderização de Gráficos em Canvas 2D:** O gráfico de barras solar usa Canvas manual com escala fixa, o que provoca perda de nitidez em ecrãs de alta densidade (Retina/High-DPI).
  - **Tabela Inferior de Centrais:** A tabela abaixo do mapa satélite apresenta colunas apertadas com tipografia reduzida e paginação visualmente desconectada do restante padrão de tabelas.

### 3.5 Páginas dos Módulos Operacionais e Comerciais
A análise individual das páginas revelou variações que prejudicam a percepção de unidade da plataforma:
1. **Mini-Redes (`#mini-redes`):** Cartões superiores padronizados, mas a barra de filtros segmentados possui abas com cantos muito arredondados que destoam dos inputs de pesquisa retangulares.
2. **Clientes & Contratos (`#clientes`):** A tabela é rica em dados (BI, NUIT, Saldo, Categoria), mas os botões de ação na linha (*Ver*, *Editar*, *Cortar*) não possuem espaçamento uniforme.
3. **Contratos & Ligações (`#contratos`):** Os dados de caução e tarifa poderiam ter formatação tabular mais nítida com alinhamento numérico à direita.
4. **Contadores & Consumo (`#contadores`):** O modal de registo de leitura manual possui alertas visuais adequados, mas os campos de entrada utilizam larguras variáveis.
5. **Facturação & Pagamentos (`#faturacao`):** O token STS de 20 dígitos é gerado corretamente, porém a caixa de destaque do token varia de cor entre o modal e a listagem da tabela.
6. **Activos & Manutenção (`#activos`):** A filtragem por tipo de ativo (Módulos, Inversores, BESS) utiliza botões secundários com borda cinzenta fraca.
7. **Ocorrências & Ordens de Trabalho (`#ordens-trabalho`):** A badge de prioridade (*Crítica*, *Alta*, *Média*, *Baixa*) precisa de uniformidade cromática estrita.
8. **Relatórios & Exportações (`#relatorios`):** Os botões de exportação CSV e Impressão estão posicionados no canto superior sem alinhamento com a barra de filtros temporais.
9. **Utilizadores & Auditoria (`#auditoria`):** As abas internas alternam entre utilizadores e logs, mas a tabela de auditoria tem texto de payload JSON que precisa de visualização colapsável mais elegante.
10. **Configurações & Tarifas (`#configuracoes`):** Boa organização, mas os formulários de edição de tarifas precisam de máscaras de moeda automáticas.
11. **Mapa de Activos & Rede (`#mapa-rede`):** A barra de camadas flutuante sobre o mapa cobre parte dos controlos de zoom padrão do Leaflet.

### 3.6 Formulários e Modais Dinâmicos
* **Estilos Inline Injetados via JavaScript:** Vários modais gerados em `app.js` utilizam estilos inline (`style="margin-bottom: 12px; display: flex; gap: 8px;"`), dificultando a aplicação consistente de temas e regras de responsividade.
* **Falta de Estados de Foco Visível Padronizado:** Alguns inputs utilizam anel de foco azul genérico do navegador em vez do anel oficial em Laranja LECASU (`rgba(255, 122, 0, 0.2)`).

### 3.7 Responsividade em Dispositivos Móveis (Tablets e Smartphones)
* **Pontos Positivos:** O Service Worker e o Manifesto PWA funcionam perfeitamente para instalação e cache.
* **Problemas Identificados:**
  - Tabelas largas causam necessidade de rolagem horizontal desajeitada em ecrãs de telemóvel sem indicação visual de que a tabela pode ser deslizada.
  - Modais ocupam largura quase total sem margens seguras e, em ecrãs verticais curtos, o botão de submeter pode ficar fora da área visível sem scroll dedicado.
  - No mobile, a gaveta lateral (*drawer*) necessita de animação de entrada mais suave e fecho imediato ao tocar fora ou ao selecionar uma rota.

---

## 4. Proposta do Novo Design System Global (LECASU GridOps 2.0)

Para assegurar uma identidade moderna, sóbria, corporativa e livre de aspetos genéricos de IA, propõe-se a unificação rigorosa de tokens e componentes:

### 4.1 Paleta Cromática Institucional e Funcional
A paleta baseia-se na cor corporativa da **LECASU** (Laranja Energia) combinada com neutros frios (Ardósia/Slate) para conferir densidade e maturidade executiva:

| Categoria | Nome do Token | Valor Hex | Finalidade |
|---|---|:---:|---|
| **Marca Principal** | `--brand-primary` | `#FF7A00` | Laranja Oficial LECASU. Ações primárias, botões mestres, estados ativos. |
| **Marca Hover** | `--brand-primary-hover` | `#EA580C` | Estado de interação (*hover* e foco) em botões principais. |
| **Marca Suave** | `--brand-primary-subtle` | `#FFF7ED` | Fundo de destaque, badges da marca e seleções. |
| **Marca Borda** | `--brand-primary-border` | `#FED7AA` | Delimitação de componentes institucionais. |
| **Superfície Base** | `--surface-canvas` | `#F8FAFC` | Fundo geral da aplicação (cinza ardósia ultraclaro, descanso visual). |
| **Superfície Cartão** | `--surface-card` | `#FFFFFF` | Branco puro para cartões, modais, cabeçalho e tabelas. |
| **Superfície Barra** | `--surface-sidebar` | `#0F172A` / `#FFFFFF` | Opção Aprovada: Branco puro corporativo com linha divisória sutil `#E2E8F0`. |
| **Texto Primário** | `--text-primary` | `#0F172A` | Ardósia Escuro Profundo (contraste máximo, WCAG AAA). |
| **Texto Secundário**| `--text-secondary` | `#475569` | Rótulos, títulos de colunas e textos informativos. |
| **Texto Mudo** | `--text-muted` | `#64748B` | Metadados, carimbos de data/hora e legendas auxiliares. |
| **Bordas Gerais** | `--border-default` | `#E2E8F0` | Linhas divisórias, contornos de cartões e inputs. |
| **Bordas Sutis** | `--border-subtle` | `#F1F5F9` | Separadores de linhas de tabelas. |
| **Estado: Sucesso** | `--color-success` | `#16A34A` | Verde Esmeralda (operações normais, pagamentos confirmados). |
| **Estado: Atenção** | `--color-warning` | `#D97706` | Âmbar Ouro (alertas preventivos, faturas a vencer). |
| **Estado: Perigo** | `--color-danger` | `#DC2626` | Carmesim (avarias críticas, cortes, erros). |
| **Estado: Info/STS**| `--color-info` | `#2563EB` | Azul Royal (redes, dados técnicos, contratos). |
| **Estado: PUE** | `--color-pue` | `#9333EA` | Roxo Ametista (Usos Produtivos de Energia). |

### 4.2 Escala Tipográfica Padronizada (Inter)
Adota-se a família `'Inter'` com proporções harmoniosas e alinhamento tabular para valores numéricos:
- `Display / KPI`: **24px (1.60rem)**, Peso 800, `font-variant-numeric: tabular-nums`.
- `Título de Página`: **18px (1.20rem)**, Peso 700, cor `#0F172A`.
- `Título de Seção / Cartão`: **15px (1.00rem)**, Peso 600, cor `#1E293B`.
- `Texto Base / Formulários`: **14px (0.93rem)**, Peso 500, cor `#334155`.
- `Células de Tabelas`: **13px (0.87rem)**, Peso 500, cor `#334155`.
- `Rótulos / Badges / Medidores`: **11px a 12px (0.75rem - 0.80rem)**, Peso 700.

### 4.3 Sistema de Espaçamentos Base 4px
- `4px (0.25rem)`: Micro-espaçamento (gap entre ícone e texto de botão).
- `8px (0.50rem)`: Espaçamento pequeno (padding de botões compactos e gaps de tags).
- `12px (0.75rem)`: Espaçamento de formulários (distância entre campos e labels).
- `16px (1.00rem)`: Padding padrão de cartões estruturais e modais.
- `20px (1.25rem)`: Margem entre grelhas de dados e cabeçalhos de páginas.
- `24px (1.50rem)`: Distância vertical entre blocos principais de conteúdo.

---

## 5. Proposta de Reorganização do Layout Global

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO LECASU]   [Título Dinâmico]           [Busca Rápida] [Relógio UTC+2] [Rede] [User]│ <- TOPBAR (52px)
├──────────────┬─────────────────────────────────────────────────────────────────────────┤
│              │ [4 Cartões KPI Padronizados Lado a Lado com Medidores Circulares]       │
│ SIDEBAR      ├─────────────────────────────────────────────────────────────────────────┤
│ (250px)      │ [Área de Trabalho Principal: Cartão Unificado com Toolbar & Tabela]      │
│              │  • Abas Segmentadas  • Filtros  • Pesquisa  • Ações Principais (Botões)  │
│ • Dashboard  │  • Tabela de Alta Densidade com Alinhamento Numérico e Ações Claras     │
│ • Mini-Redes │  • Rodapé de Paginação Compacto                                         │
│ • Clientes   │                                                                         │
│ • Contadores │                                                                         │
│ • Pagamentos │                                                                         │
│ • Activos    │                                                                         │
│ • O&M        │                                                                         │
│ • Relatórios │                                                                         │
│ • Sistema    │                                                                         │
├──────────────┼─────────────────────────────────────────────────────────────────────────┤
│ [User Compact]│ LECASU, Lda. • GridOps v1.0 • Operação de Mini-Redes Rurais em Moçambique│ <- FOOTER (36px)
└──────────────┴─────────────────────────────────────────────────────────────────────────┘
```

### 5.1 Otimização da Sidebar
- **Hierarquia:** Limpar o peso excessivo dos títulos de grupo, utilizando divisores finos com legendas sutis em 11px ardósia.
- **Link Ativo:** Fundo laranja suave (`#FFF7ED`), texto laranja `#FF7A00`, ícone com destaque e indicador vertical de 3px na esquerda.
- **Rodapé da Sidebar:** Compactar para uma versão limpa focada em identificação do perfil e botão de encerrar sessão com confirmação.

### 5.2 Otimização do Cabeçalho (Topbar)
- Remover o subtítulo estático e transformar a área esquerda num **Breadcrumb Contextual Vivo** com o nome da mini-rede ou módulo selecionado.
- Reorganizar o lado direito em grupos lógicos:
  1. Caixa de Pesquisa rápida com atalho visual.
  2. Telemetria e Relógio de Moçambique compactos e nítidos.
  3. Notificações de ocorrências ativas.
  4. Avatar do utilizador com dropdown de opções de conta.

---

## 6. Lista de Módulos e Páginas Afetadas

Todas as páginas da plataforma serão harmonizadas sob o mesmo modelo visual canónico:

| ID | Página / Módulo | Estado Atual | Proposta de Melhoria |
|---|---|---|---|
| **M-01** | **Painel Executivo (`#dashboard`)** | Denso / SCADA complexo | Reorganização limpa: 4 KPIs de referência no topo, Mapa Satélite de tela cheia com alternador de central e resumo operacional compacto. |
| **M-02** | **Mapa de Activos (`#mapa-rede`)** | Funcional, controles sobrepostos | Layout limpo de cartografia com barra lateral retrátil de camadas GIS. |
| **M-03** | **Mini-Redes (`#mini-redes`)** | Cartões + Tabela com abas | Cartão de trabalho unificado, badges de capacidade kWp/BESS destacados e ficha técnica clara. |
| **M-04** | **Activos & O&M (`#activos`)** | Filtros fracos | Grelha moderna com ícones por tipo de ativo (Solar, Inversor, BESS, PT) e alertas de garantia. |
| **M-05** | **Ocorrências & Ordens (`#ordens-trabalho`)** | Tabelas funcionais | Fluxo visual claro dos 4 estados da OS, prioridades com contraste acessível e modal de fecho com checklist técnico. |
| **M-06** | **Clientes & Comunidades (`#clientes`)** | Tabela rica, botões apertados | Badges temáticos para Usos Produtivos (PUE), ações de linha com dropdown ou botões de ícone limpos. |
| **M-07** | **Contratos & Ligações (`#contratos`)** | Funcional | Formatação financeira rigorosa (Meticais MZN), exibição de cauções em custódia e potências kVA. |
| **M-08** | **Contadores & Consumo (`#contadores`)** | Abas e tabelas | Destaque para número STS, formulário de leitura com verificação visual imediata de desvio de consumo. |
| **M-09** | **Facturação & Pagamentos (`#faturacao`)** | Tabela densa | Visualização de Token STS em caixa de cópia rápida destacada, filtros por canal (M-Pesa, e-Mola, Caixa). |
| **M-10** | **Relatórios & Exportações (`#relatorios`)** | Botões desalinhados | Barra de ferramentas temporal consolidada, exportação CSV com um clique e impressão limpa para PDF. |
| **M-11** | **Utilizadores & Auditoria (`#auditoria`)** | Payload JSON cru | Tabela RBAC profissional com cores por função e gaveta expansível para detalhes dos logs de auditoria. |
| **M-12** | **Configurações & Tarifas (`#configuracoes`)** | Formulários dispersos | Painel dividido em cartões elegantes: Tarifas ARENE, Parâmetros, Rotina de Backup e Restauro Seguro. |

---

## 7. Garantias de Não-Regressão e Integridade Operacional

Em estrito cumprimento das instruções do projeto:
1. **Zero Impacto no Backend:** Todas as rotas `/api/*` existentes serão mantidas intactas.
2. **Zero Alteração na Base de Dados:** O schema relacional do PostgreSQL 15, chaves primárias, estrangeiras e migrações permanecem rigorosamente inalteradas.
3. **Preservação de IDs de Elementos:** Todos os IDs de elementos utilizados em JavaScript para escuta de eventos, preenchimento de dados e relógios em tempo real (ex.: `solarman-power-now`, `mg-kpi-total`, `cli-kpi-total`, `pay-kpi-revenue`, etc.) serão rigorosamente preservados.
4. **Sincronização Offline e PWA:** Os mecanismos de Service Worker, cache de ativos e armazenamento IndexedDB permanecerão 100% operacionais.

---

## 8. Plano de Implementação em Fases Controladas

Para execução segura, organizada e auditável, o trabalho é estruturado nas seguintes fases:

```
[ Fase A: Auditoria & Diagnóstico ] ---------> (CONCLUÍDA - A Apresentar para Aprovação)
                    │
                    ▼
[ Fase B: Consolidação do Design System ] ----> (Tokens CSS, Paleta Unificada, Componentes Canónicos)
                    │
                    ▼
[ Fase C: Redesign da Estrutura Global ] -----> (Sidebar Profissional, Topbar Compacta, Footer)
                    │
                    ▼
[ Fase D: Redesign do Dashboard Executivo ] --> (KPIs Oficiais, Mapa GIS Satélite, Cockpit SCADA Limpo)
                    │
                    ▼
[ Fase E: Redesign Padronizado dos Módulos ] -> (Mini-Redes, Clientes, Contadores, Finanças, O&M, etc.)
                    │
                    ▼
[ Fase F: Responsividade Total & Mobile ] ----> (Ajustes de Ecrã, Gaveta Mobile, Tabelas Adaptativas)
                    │
                    ▼
[ Fase G: Testes, Auditoria e Validação ] ----> (Suíte de 94 Testes, Verificação de Não-Regressão)
```

---

## 9. Próximo Passo Proposto

Apresentar este relatório formal de auditoria à liderança do projeto e **aguardar aprovação explícita** antes de avançar para a **Fase B (Design System)** e **Fase C (Estrutura Global)**.
