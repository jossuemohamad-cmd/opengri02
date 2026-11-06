/**
 * LECASU GridOps - Biblioteca Central de Componentes Reutilizáveis (UIComponents)
 * Design System 2.0 • 100% Light Mode • Escala Modular 4px • Padrão Corporativo
 */

const UI = {
  /**
   * Cabeçalho Padrão de Página (PageHeader)
   * Título: 24px (600), Subtítulo: 13px (400), Breadcrumbs: 12px (400)
   */
  pageHeader({ title, subtitle = '', breadcrumbs = [], actions = [] }) {
    const breadcrumbHtml = breadcrumbs && breadcrumbs.length > 0 
      ? `<nav class="ui-breadcrumbs" aria-label="Navegação">${breadcrumbs.map((b, i) => {
          const isLast = i === breadcrumbs.length - 1;
          return isLast 
            ? `<span class="ui-breadcrumb-active">${b.label}</span>`
            : `<a href="${b.href || '#'}" class="ui-breadcrumb-link">${b.label}</a><span class="ui-breadcrumb-separator">/</span>`;
        }).join('')}</nav>`
      : '';

    const actionsHtml = actions && actions.length > 0
      ? `<div class="ui-page-header-actions">${actions.map(act => act.html || `
          <button type="button" class="${act.class || 'ui-btn-primary'}" id="${act.id || ''}" ${act.attr || ''}>
            ${act.icon || ''}<span>${act.label || ''}</span>
          </button>
        `).join('')}</div>`
      : '';

    return `
      <header class="ui-page-header">
        <div class="ui-page-header-title-box">
          ${breadcrumbHtml}
          <h1 class="ui-page-title">${title}</h1>
          ${subtitle ? `<p class="ui-page-subtitle">${subtitle}</p>` : ''}
        </div>
        ${actionsHtml}
      </header>
    `;
  },

  /**
   * Cartão Indicador / Métrica (StatCard)
   * Indicador numérico principal: 24–28px (700), Label: 12px (500), Texto secundário: 13px (400)
   */
  statCard({ id, label, value, trend = '', trendType = 'positive', icon = '', subtext = '', gaugePct = null, color = 'blue' }) {
    const trendHtml = trend
      ? `<span class="ui-trend-badge ${trendType}">${trend}</span>`
      : '';

    const gaugeHtml = gaugePct !== null
      ? `<div class="kpi-mini-gauge"><span class="kpi-mini-gauge-text">${gaugePct}%</span></div>`
      : '';

    return `
      <div class="ui-stat-card kpi-card saas-kpi-card" data-color="${color}">
        <div class="ui-stat-card-top kpi-card-top">
          <div class="ui-stat-icon-box kpi-icon-box ${color}">
            ${icon}
          </div>
          ${trendHtml}
        </div>
        <div class="ui-stat-card-body">
          <div class="ui-stat-value kpi-number" ${id ? `id="${id}"` : ''}>${value}</div>
          <div class="ui-stat-label kpi-label">${label}</div>
        </div>
        ${(subtext || gaugeHtml) ? `
          <div class="ui-stat-card-footer kpi-bottom-row">
            <span class="ui-stat-subtext kpi-bottom-text">${subtext}</span>
            ${gaugeHtml}
          </div>
        ` : ''}
      </div>
    `;
  },

  /**
   * Faixa de 4 Cartões de Métricas (StatGrid)
   */
  statGrid(cards = []) {
    return `
      <section class="ui-stat-grid kpi-metrics-row saas-kpi-grid" aria-label="Indicadores Chave">
        ${cards.map(c => this.statCard(c)).join('')}
      </section>
    `;
  },

  /**
   * Barra de Ferramentas, Abas e Filtros (FilterBar)
   */
  filterBar({ tabs = [], activeTab = 'all', tabsId = '', searchId = '', searchPlaceholder = 'Pesquisar...', extraFiltersHtml = '' }) {
    const tabsHtml = tabs && tabs.length > 0
      ? `<div class="ui-filter-tabs segmented-filter-tabs workspace-tabs" ${tabsId ? `id="${tabsId}"` : ''}>
          ${tabs.map(t => `
            <button type="button" class="ui-tab-btn seg-tab tab-pill ${t.key === activeTab ? 'active' : ''}" data-filter="${t.key}" data-key="${t.key}">
              ${t.icon || ''}<span>${t.label}</span>${t.count !== undefined ? `<span class="ui-tab-count">${t.count}</span>` : ''}
            </button>
          `).join('')}
        </div>`
      : '';

    const searchHtml = searchId
      ? `<div class="ui-search-input-box search-box-pill">
          <svg class="ui-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" class="ui-search-input saas-search-input" id="${searchId}" placeholder="${searchPlaceholder}" autocomplete="off" />
        </div>`
      : '';

    return `
      <div class="ui-filter-bar workspace-toolbar">
        <div class="ui-filter-bar-left">
          ${tabsHtml}
        </div>
        <div class="ui-filter-bar-right toolbar-controls-right">
          ${searchHtml}
          ${extraFiltersHtml}
        </div>
      </div>
    `;
  },

  /**
   * Tabela de Dados Corporativa (DataTable Container)
   * Linhas: 44–48px, Texto: 13px, Cabeçalhos: 12px uppercase
   */
  dataTable({ id = '', tableClass = '', headers = [], rowsHtml = '', emptyMessage = 'Nenhum registo encontrado.' }) {
    const theadHtml = headers && headers.length > 0
      ? `<thead><tr>${headers.map(h => {
          const style = h.width ? `style="width:${h.width};${h.align ? ` text-align:${h.align};` : ''}"` : (h.align ? `style="text-align:${h.align};"` : '');
          return `<th ${style} class="${h.class || ''}">${h.label}</th>`;
        }).join('')}</tr></thead>`
      : '';

    return `
      <div class="ui-table-frame table-scroll-frame table-responsive">
        <table class="ui-data-table rich-data-table saas-table data-table ${tableClass}" ${id ? `id="${id}"` : ''}>
          ${theadHtml}
          <tbody>
            ${rowsHtml || `<tr><td colspan="${headers.length || 6}" class="ui-table-empty">${emptyMessage}</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
  },

  /**
   * Cartão / Painel da Área de Trabalho (WorkspaceCard)
   */
  workspaceCard({ id = '', title = '', subtitle = '', badge = '', actions = [], headerExtra = '', bodyHtml = '', footerHtml = '' }) {
    const actionsHtml = actions && actions.length > 0
      ? `<div class="ui-workspace-actions workspace-actions">${actions.map(act => act.html || `
          <button type="button" class="${act.class || 'ui-btn-primary'}" id="${act.id || ''}" ${act.attr || ''}>
            ${act.icon || ''}<span>${act.label || ''}</span>
          </button>
        `).join('')}</div>`
      : '';

    return `
      <article class="ui-workspace-card workspace-card saas-card" ${id ? `id="${id}"` : ''}>
        ${(title || actionsHtml) ? `
          <header class="ui-workspace-header workspace-header">
            <div class="ui-workspace-title-group workspace-title-box">
              <div class="ui-workspace-title-line">
                <h2 class="ui-workspace-title workspace-title">${title}</h2>
                ${badge ? `<span class="ui-workspace-badge workspace-count-badge">${badge}</span>` : ''}
              </div>
              ${subtitle ? `<p class="ui-workspace-subtitle workspace-subtitle">${subtitle}</p>` : ''}
            </div>
            ${headerExtra}
            ${actionsHtml}
          </header>
        ` : ''}
        <div class="ui-workspace-body">
          ${bodyHtml}
        </div>
        ${footerHtml ? `<footer class="ui-workspace-footer workspace-pagination">${footerHtml}</footer>` : ''}
      </article>
    `;
  },

  /**
   * Badge de Estado (StatusBadge)
   */
  statusBadge(type, label) {
    const dotMap = {
      'active': 'active',
      'activa': 'active',
      'operacional': 'active',
      'resolvida': 'active',
      'concluida': 'active',
      'warning': 'warning',
      'alerta': 'warning',
      'em_curso': 'warning',
      'atribuida': 'warning',
      'construcao': 'warning',
      'danger': 'danger',
      'erro': 'danger',
      'critica': 'danger',
      'aberta': 'danger',
      'falha': 'danger',
      'neutral': 'neutral',
      'pendente': 'neutral',
      'suspensa': 'neutral'
    };
    const cls = dotMap[String(type).toLowerCase()] || 'neutral';
    return `<span class="ui-status-badge status-dot-badge saas-status-pill ${cls}"><span class="status-dot"></span>${label}</span>`;
  },

  /**
   * Rodapé de Paginação
   */
  pagination({ infoId = '', prevId = '', nextId = '', infoText = 'A carregar registos...' }) {
    return `
      <span class="ui-pagination-info page-info-text" ${infoId ? `id="${infoId}"` : ''}>${infoText}</span>
      <div class="ui-pagination-controls page-nav-btns">
        <button type="button" class="ui-btn-page btn-page" ${prevId ? `id="${prevId}"` : ''} disabled>Anterior</button>
        <button type="button" class="ui-btn-page btn-page" ${nextId ? `id="${nextId}"` : ''}>Seguinte</button>
      </div>
    `;
  },

  /**
   * Estado Vazio (EmptyState)
   */
  emptyState({ icon = '', title = 'Sem registos', message = 'Não foram encontrados dados para esta secção.', actionHtml = '' }) {
    return `
      <div class="ui-empty-state">
        <div class="ui-empty-state-icon">${icon}</div>
        <h3 class="ui-empty-state-title">${title}</h3>
        <p class="ui-empty-state-message">${message}</p>
        ${actionHtml ? `<div class="ui-empty-state-action">${actionHtml}</div>` : ''}
      </div>
    `;
  },

  /**
   * Estado de Carregamento (LoadingState)
   */
  loadingState(message = 'A carregar dados...') {
    return `
      <div class="ui-loading-state">
        <div class="ui-spinner"></div>
        <p class="ui-loading-text">${message}</p>
      </div>
    `;
  }
};

window.UI = UI;
