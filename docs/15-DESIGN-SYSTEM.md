# 15 — Design System Corporativo (v2.1 Consolidada & Aplicada)
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Guia de Estilo, Tokens de Design, Arquitetura de Layout e Biblioteca de Componentes Canónicos  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Referências Centrais:** `docs/PRD.md`, `docs/14-DOCUMENTO-UX-UI.md`, `public/css/style.css`, `public/js/components.js`  
**Versão:** 2.1 (Sistema Unificado de Tokens, Layout Responsivo e Cobertura Total de Módulos)  
**Data:** Novembro de 2026  
**Estado:** Aplicado em Produção (`100% Light Mode` + `Bootstrap 5.3` + `Leaflet GIS`)

---

## 1. Filosofia Visual e Princípios de Design

O **LECASU GridOps** é uma plataforma crítica de operação técnica, comercial, financeira e social de mini-redes fotovoltaicas rurais em Moçambique. A linguagem visual combina a sobriedade de ferramentas de engenharia industrial e *utilities* com a clareza de plataformas SaaS corporativas modernas:

- **100% Light Mode de Alto Contraste:** Superfície base ardósia ultraclara (`#F8FAFC`), cartões branco puro (`#FFFFFF`) e texto ardósia profundo (`#0F172A`), garantindo legibilidade sob luz solar intensa no terreno e zero fadiga visual em salas de controlo.
- **Identidade Corporativa LECASU:** Laranja Solar Oficial (`#FF7A00`) reservado para ações primárias, estados ativos de navegação e destaques de geração fotovoltaica, evitando poluição cromática.
- **Alinhamento Numérico Tabular:** Todos os valores de energia (`kW`, `kWp`, `kWh`), percentagens (`SoC`, `Uptime`), coordenadas GPS, tokens STS e montantes em Meticais (`MZN` / `MT`) utilizam `font-variant-numeric: tabular-nums`.
- **Autonomia Offline-First:** Tipografia de sistema com fallback elegante para `Inter`, ícones vetoriais SVG inline (`Icons` em `app.js`) + `Bootstrap Icons` locais e `Bootstrap 5.3` + `Leaflet 1.9` servidos localmente em `/vendor/`.

---

## 2. Tokens de Design (Variáveis CSS em `:root`)

### 2.1 Paleta de Cores Corporativas e Semânticas

| Categoria | Token Canónico | Aliases Compatíveis | Hex / Valor | Aplicação Principal |
|---|---|---|---|---|
| **Marca Solar** | `--color-primary` | — | `#FF7A00` | Botões primários, item ativo da sidebar, geração solar, foco |
| **Marca Hover** | `--color-primary-hover` | — | `#EA580C` | Estado hover/active de botões e callouts de potência |
| **Marca Subtil** | `--color-primary-subtle` | — | `#FFF7ED` | Fundo de badges solares, seleção ativa na sidebar e callouts |
| **Marca Borda** | `--color-primary-border` | — | `#FED7AA` | Delimitação de elementos institucionais e caixas de destaque |
| **Anel de Foco** | `--color-primary-glow` | — | `rgba(255, 122, 0, 0.18)` | `box-shadow` de foco acessível em inputs e controlos |
| **Superfície Base** | `--color-slate-50` | `--color-bg-light`, `--color-bg-subtle` | `#F8FAFC` | Canvas principal da aplicação, cabeçalhos de tabela e fundos subtis |
| **Superfície Cartão** | `--color-surface` | — | `#FFFFFF` | Cartões, sidebar, topbar, modais e células de tabela |
| **Superfície Atenuada** | `--color-slate-100` | — | `#F1F5F9` | Toolbars, inputs readonly, badges neutros |
| **Divisores / Bordas** | `--color-slate-200` | `--color-border` | `#E2E8F0` | Contornos de cartões, divisores de secção e grelhas |
| **Borda Input** | `--color-slate-300` | — | `#CBD5E1` | Contorno de inputs, selects e textareas |
| **Texto Primário** | `--color-slate-900` | `--color-text-main` | `#0F172A` | Títulos de página, KPIs, cabeçalhos e nomes de entidade |
| **Texto Corpo** | `--color-slate-800` | — | `#1E293B` | Texto normal de leitura e conteúdo de células |
| **Texto Secundário** | `--color-slate-600` | `--color-text-secondary` | `#475569` | Labels de formulário, navegação e botões secundários |
| **Texto Mudo** | `--color-slate-500` | `--color-text-muted` | `#64748B` | Metadados, subtítulos, timestamps e rodapés |
| **Sucesso / Activo** | `--color-success` | `--color-success-bg` (`#DCFCE7`) | `#16A34A` | Estados operacionais, pagamentos confirmados, BESS saudável |
| **Informação / Rede** | `--color-info` | `--color-info-bg` (`#EFF6FF`) | `#2563EB` | Contratos, contadores, dados de rede e ligação |
| **Atenção / Pendente** | `--color-warning` | `--color-warning-bg` (`#FEF3C7`) | `#D97706` | Em construção, alertas de consumo e OTs em curso |
| **Perigo / Crítico** | `--color-danger` | `--color-danger-bg` (`#FEE2E2`) | `#DC2626` | Avarias críticas, cortes, erros e reset de dados |
| **Uso Produtivo (PUE)**| `--color-pue` | `--color-pue-bg` (`#FAF5FF`) | `#9333EA` | Clientes PUE e indicadores de impacto socioeconómico |

### 2.2 Tipografia e Escala Modular

- **Família Sans-Serif:** `'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (`--font-family`).
- **Família Monospace (`--font-mono`):** `'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` para códigos (`MR-INH-001`), números de série STS, tokens de 20 dígitos, coordenadas GPS e previews JSON de auditoria.
- **Hierarquia de Tamanhos:**
  - **KPI / Callout Numérico:** `22px`–`32px`, peso `700`/`800`, `tabular-nums`, `letter-spacing: -0.02em`.
  - **Título de Página (Canvas):** `20px`, peso `600` (`line-height: 1.25`).
  - **Título de Secção / Painel:** `17px`–`18px`, peso `600` (`line-height: 1.30`).
  - **Título no Topbar:** `15px`, peso `600`.
  - **Título de Card / Modal:** `14px`–`16px`, peso `600`–`700`.
  - **Texto Base / Formulários:** `14px`, peso `400` (`line-height: 1.50`).
  - **Células de Tabela / Botões / Subtítulos:** `13px`, peso `400`–`600`.
  - **Labels / Cabeçalhos de Tabela / Breadcrumbs / Badges:** `11px`–`12px`, peso `500`–`600`.

### 2.3 Espaçamento (Base 4px), Raios e Elevações

- **Escala de Espaçamento:** `--space-4` (`4px`), `--space-8` (`8px`), `--space-12` (`12px`), `--space-16` (`16px`), `--space-20` (`20px`), `--space-24` (`24px`), `--space-32` (`32px`).
- **Dimensões Estruturais:**
  - `--sidebar-width: 248px` (`--sidebar-collapsed-width: 68px`)
  - `--header-height: 58px`
  - `--content-max-width: 1440px`
  - `--main-padding: 20px 24px`
  - `--gap-section: 20px`, `--gap-cards: 16px`, `--card-padding: 16px`
  - `--height-input: 38px`, `--height-button: 36px`, `--height-table-row: 46px`
- **Raios (`Border Radius`):**
  - `--radius-sm: 6px` (badges, botões compactos de linha, inputs pequenos)
  - `--radius-md: 8px` / `--radius-input: 8px` / `--radius-button: 8px`
  - `--radius-card: 12px` / `--radius-lg: 12px`
  - `--radius-pill: 9999px` (pills de estado, pesquisa global, chips de telemetria)
- **Sombras (`Elevation`):**
  - Nível 1 (`--shadow-subtle`): `0 1px 2px 0 rgba(15, 23, 42, 0.04)`
  - Nível 2 (`--shadow-card`): `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`
  - Nível 3 (`--shadow-hover`): `0 8px 20px -4px rgba(15, 23, 42, 0.08)`
  - Nível 4 (`--shadow-modal`): `0 24px 48px -12px rgba(15, 23, 42, 0.22)`

---

## 3. Arquitetura de Layout Global (AppShell)

1. **Barra Lateral (`#app-sidebar.app-sidebar`):**
   - Fixa à esquerda (`248px` expandida, `68px` recolhida via `body.sidebar-collapsed`), superfície `#FFFFFF` com borda direita `1px solid #E2E8F0`.
   - Cabeçalho `.sidebar-brand` com logotipo oficial LECASU (`/images/lecasu-logo.png`), marca compacta `.brand-compact-mark` no estado recolhido e botão `#btn-collapse-sidebar`.
   - Secções agrupadas com separadores subtis e itens `.nav-link` com estado ativo destacado (`#FFF7ED`, borda/texto `#FF7A00`, barra indicadora esquerda de `3px`).
   - Rodapé `.sidebar-footer` com `.user-profile-box`, `.user-avatar`, `.user-details` e botão `#btn-logout.btn-icon-logout`.
2. **Cabeçalho Superior (`.main-topbar`):**
   - Sticky (`top: 0`, `58px`), com botão mobile `#sidebar-toggle-btn`, breadcrumb e título contextual (`#page-heading-title`), pesquisa global (`.topbar-search-box`), relógio em tempo real UTC+2 (`.topbar-clock-badge`), estado da rede (`.topbar-status-badge` com ponto pulsante), sino de alertas (`.topbar-bell-btn`) e perfil do utilizador (`.topbar-user-badge`).
3. **Área de Trabalho Principal (`main.main-body.app-content-wrapper`):**
   - Centrada até `1440px`, com `padding: 20px 24px` e `gap: 20px` entre secções (`.lecasu-page-workspace`, `.saas-dashboard-container`).
4. **Rodapé Institucional (`.app-institutional-footer`):**
   - Fixado na base do fluxo vertical (`margin-top: auto`), apresentando entidade promotora, versão e âmbito operacional.
5. **Modo Autenticação Fullscreen (`body.is-login-page`):**
   - Oculta completamente sidebar, topbar e rodapé institucional, renderizando `.solarman-login-wrapper` centrado sobre fundo claro técnico para `.solarman-login-card`.

---

## 4. Biblioteca de Componentes Canónicos

### 4.1 Cartões KPI & Medidores Circulares (`.kpi-card` / `.saas-kpi-card` / `.ui-stat-card`)
- Grelha responsiva de 4 colunas (`repeat(4, minmax(0, 1fr))`), reduzindo para 2 colunas em `<= 1200px` e 1 coluna em `<= 640px`.
- Estrutura interna uniforme:
  - Topo: Caixa de ícone temática `36x36px` (`.orange`, `.blue`, `.green`, `.purple`) + valor numérico principal (`22px` bold tabular) + badge de tendência (`.kpi-trend-pill` / `.saas-kpi-trend`).
  - Rótulo descritivo (`13px`–`14px` semibold).
  - Rodapé separado por borda superior sutil (`#F1F5F9`) com texto auxiliar à esquerda e **Medidor Circular Conic Gradient (`.kpi-mini-gauge`)** de `38x38px` à direita (`--gauge-pct` e `--gauge-color`).

### 4.2 Cartões de Área de Trabalho & Toolbars (`.workspace-card`, `.saas-card`, `.card`)
- Cabeçalho `.workspace-header` / `.saas-card-header` / `.card-header` com título, badge de contagem e grupo de ações alinhado à direita.
- Barra de filtros `.workspace-toolbar` com fundo `#F8FAFC`, abas segmentadas (`.segmented-filter-tabs` / `.seg-tab`), barra de pesquisa (`.search-box-pill`) e botão de filtro (`.btn-filter-dropdown`).
- Rodapé de paginação `.workspace-pagination` com resumo de registos e botões `.btn-page`.

### 4.3 Tabelas Corporativas (`.rich-data-table`, `.saas-table`, `.data-table`, `.ui-data-table`)
- Cabeçalhos fixos visuais em `#F8FAFC` com texto `11.5px` uppercase `#64748B`.
- Linhas com altura mínima de `46px`, separadores horizontais `1px solid #F1F5F9`, células de identidade com avatar/ícone (`.item-identity-cell`), barras de progresso (`.metric-progress-cell`), pílulas de código (`.code-pill`), tags de categoria (`.badge-cat`, `.tag-pill`) e coluna final de ações (`.table-row-actions`, `.btn-row-action`) sem colisão.

### 4.4 Modais, Fichas Técnicas (Dossiers) & Wizards
- `.modal-backdrop` em overlay flex centrado com `backdrop-filter: blur(3px)`.
- `.modal-dialog` com larguras padronizadas (`560px` padrão, `440px` `.modal-sm`, `860px` `.modal-lg` / `.modal-dialog-lg`) e altura máxima segura `90vh` com scroll interno em `.modal-body`.
- **Fichas Tabuladas (Dossiers):** `.ficha-tab-strip`, `.ficha-tab-btn`, `.ficha-dossier-grid` e `.dossier-grid` com blocos `.ficha-field-block` / `.dossier-item`.
- **Assistente Guiado (Wizard 5 Etapas):** `.stepper-progress-bar`, `.step-indicator` e `.step-num` conectados aos formulários `.form-grid-2` e `.form-grid-3`.
- **Recibo STS & Cockpit SCADA:** `.receipt-card`, `.receipt-sts-box` (destaque monospace de 20 dígitos) e `.inverter-cockpit` / `.inverter-stat-box`.

### 4.5 Cartografia GIS & Impressão A4
- **Marcadores GIS Pulsantes (`.map-pulse-marker`):** Núcleo circular laranja solar (`.marker-core`) com anel pulsante animado (`.pulse-ring`), variantes `.warning` e `.alert`, e popups estruturados (`.popup-title`, `.popup-row`).
- **Impressão Oficial (`.print-only-header` + `@media print`):** Oculto no ecrã (`display: none`) e apresentado exclusivamente ao imprimir/exportar PDF, ocultando sidebar, topbar, toolbars e botões de ação.

---

## 5. Breakpoints de Responsividade Validados

- **Desktop XL (`>= 1440px`):** Canvas centrado `1440px`, 4 colunas KPI, mapa GIS + cockpit SCADA lado a lado (`1.55fr 1fr`).
- **Portátil (`<= 1366px`):** Padding otimizado (`16px 20px`), topbar adaptada com pesquisa compacta.
- **Tablet (`<= 1024px`):** Grade KPI em 2x2, layout GIS + SCADA empilhado em 1 coluna, ocultação progressiva de elementos secundários da topbar.
- **Mobile (`<= 768px` e `390px`):** Sidebar transformada em gaveta deslizante off-canvas (`.app-sidebar.open` / `body.sidebar-open`) com `.sidebar-overlay.active`, botões empilhados, pesquisa em largura total e alvos de toque `>= 40px`.
