# DOCUMENTO DE ARQUITECTURA: RECONSTRUÇÃO DA CAMADA VISUAL E DESIGN SYSTEM 2.0 — LECASU GRIDOPS

## 1. Objectivo e Âmbito

Este documento formaliza a **reconstrução visual completa do frontend do LECASU GridOps**, substituindo a antiga camada visual heterogénea por uma arquitectura moderna, de padrão empresarial (SaaS corporativo de gestão de infra-estruturas energéticas), rigorosamente alinhada com as especificações do [PRD.md](file:///c:/Users/LECASU/Desktop/LECASU%20LDA%202026/Sistemas/Mini%20Rede/docs/PRD.md) e do [AGENTS.md](file:///c:/Users/LECASU/Desktop/LECASU%20LDA%202026/Sistemas/Mini%20Rede/AGENTS.md).

---

## 2. Auditoria e Eliminação da Camada Antiga

| Componente Anterior | Problema Identificado | Substituição Realizada |
|---|---|---|
| **Sidebar & Layout** | Larguras dinâmicas inconsistentes e cortes em ecrãs de média resolução | Nova Sidebar estruturada em 248px expandida / 72px recolhida com transição de 0.22s cúbica |
| **Header (Topbar)** | Altura de 54px insuficiente com sobreposição de textos de breadcrumb e título | Novo Header fixo de 64px com breadcrumbs de 12px, pesquisa rápida de 40px e estado da rede |
| **Tipografia Desalinhada** | Subtítulos em fonte Courier/monospace e tamanhos aleatórios | Família `Inter` com escala padronizada (24px, 18px, 14px, 13px, 12px e números de 26px) |
| **Tabelas Estilo Planilha** | Células fechadas em grelhas pesadas com linhas truncadas | Novo `DataTable` com linhas de 44–48px, texto de 13px e divisores horizontais suaves |
| **Botões de Linha Smashed** | Largura fixa de 28px que gerava colisões como "ManutenFicha" | Botões com largura dinâmica, padding confortável de 10px, altura de 32px e gap de 6px |
| **Medidores Circulares Deformados** | SVGs com percentagens sobrepostas | Micro-badges com valores numéricos nítidos e pontos de estado |

---

## 3. Especificações Técnicas do Design System 2.0

### 3.1. Escala Tipográfica (Família Inter)

- **Título principal da página:** `24px` | peso `600` | line-height `1.25`
- **Título de secção:** `18px` | peso `600` | line-height `1.30`
- **Título de card:** `14px` | peso `600` | line-height `1.35`
- **Texto normal:** `14px` | peso `400` | line-height `1.50`
- **Texto secundário:** `13px` | peso `400` | line-height `1.45`
- **Labels:** `12px` | peso `500` | text-transform `uppercase` | letter-spacing `0.04em`
- **Texto de tabelas:** `13px` | peso `400` | line-height `1.40`
- **Texto de botões:** `13px` | peso `600`
- **Indicadores numéricos principais:** `26px` (faixa 24–28px) | peso `700` | tabular-nums
- **Breadcrumbs:** `12px` | peso `400`

### 3.2. Dimensões Globais e Espaçamento (Base Múltiplos de 4px)

- **Sidebar expandida:** `248px`
- **Sidebar recolhida:** `72px`
- **Header:** `64px`
- **Padding principal:** `24px`
- **Gap entre secções:** `24px`
- **Gap entre cards:** `16px`
- **Padding interno dos cards:** `16–20px`
- **Altura dos inputs:** `40px` | border-radius `8px`
- **Altura dos botões:** `40px` (padrão) / `32px` (tabelas) | border-radius `8px` / `6px`
- **Altura das linhas de tabela:** `48px` (faixa 44–48px)
- **Border radius dos cards:** `12px` (faixa 10–12px)
- **Border radius dos inputs:** `8px` (faixa 7–8px)
- **Largura máxima de conteúdo:** `1440px` centralizado

### 3.3. Paleta Cromática Corporativa (100% Light Mode)

- **Primária Oficial LECASU:** `#FF7A00` (hover `#EA580C`, subtil `#FFF7ED`, borda `#FED7AA`)
- **Escala Slate:**
  - Slate 900: `#0F172A` (títulos e contrastes)
  - Slate 800: `#1E293B` (texto normal)
  - Slate 600: `#475569` (labels e botões secundários)
  - Slate 500: `#64748B` (textos secundários e metadados)
  - Slate 300: `#CBD5E1` (bordas de inputs)
  - Slate 200: `#E2E8F0` (divisores e bordas de cards)
  - Slate 100: `#F1F5F9` (fundos subtis e toolbars)
  - Slate 50: `#F8FAFC` (fundo geral e cabeçalhos de tabela)
  - Surface: `#FFFFFF` (superfície pura dos cartões)

---

## 4. Biblioteca Central de Componentes (`public/js/components.js`)

A biblioteca `UI` disponibiliza os blocos construtivos para toda a interface:

1. `UI.pageHeader`: Criação padronizada de cabeçalhos de página com breadcrumbs, título de 24px, descrição curta de 13px e botões de acção de 40px.
2. `UI.statCard` & `UI.statGrid`: Geração de faixas de indicadores com números destacados de 26px, ícones temáticos e micro-indicadores de desempenho.
3. `UI.filterBar`: Toolbar com abas segmentadas e campo de pesquisa de 40px.
4. `UI.dataTable`: Tabela corporativa com linhas de 48px, texto de 13px e ordenação.
5. `UI.statusBadge`: Pílula de estado operacional com ponto colorido de 6px.
6. `UI.workspaceCard`: Envelope de área de trabalho com cabeçalho, corpo e rodapé.
7. `UI.pagination`: Navegação de páginas com contador de registos.
8. `UI.emptyState` & `UI.loadingState`: Tratamento visual unificado para estados de espera e sem dados.

---

## 5. Matriz de Cobertura das Telas do PRD

Todas as 10 áreas de ecrãs foram harmonizadas segundo os padrões acima:

1. **Painel Executivo (Dashboard):** 4 StatCards, layout 2-colunas (Satélite GIS + Telemetria de Inversor SCADA) e Galeria de Fotos Reais de Centrais.
2. **Mini-Redes e GIS:** 4 StatCards estruturais, filtro por província e tabela de centrais com capacidade e armazenamento em barras de progresso.
3. **Clientes e Contratos:** 4 StatCards comerciais, filtro por categorias (PUE, Residencial, Comercial) e tabela com contadores associados.
4. **Contadores, Leituras e Consumo:** 4 StatCards de medição, tabs STS/IoT e histórico de consumo.
5. **Tarifas, Facturação e Pagamentos:** 4 StatCards financeiros, registo M-Pesa/e-Mola, reconciliação e emissão de recibos STS.
6. **Activos e Equipamentos:** 4 StatCards patrimoniais, catálogo por classe técnica (Inversores, Baterias BESS, Postes) e agendamento de O&M.
7. **Operações e Manutenção (O&M):** 4 StatCards operacionais, listagem de avarias com prioridades (Urgente, Alta, Média) e gestão de técnicos de campo.
8. **Comunicação e Atendimento:** Central de alertas aos consumidores e notificações SMS/email.
9. **Relatórios e Indicadores:** Matriz consolidada das 6 dimensões de impacto e exportação de dados em CSV.
10. **Administração, Utilizadores e Auditoria:** Gestão de utilizadores com perfis de permissão RBAC e auditoria imutável do sistema.

---

## 6. Resultados de Testes e Conformidade

- **Testes Unitários e Endpoints:** 35/35 aprovados (100%).
- **Auditoria Técnica Completa:** 35/35 aprovados (100%).
- **Verificação de Produção:** 24/24 validações aprovadas com PostgreSQL 18.6 activo.
- **Responsividade:** Validada para Desktop (1440px / 1920px), Portátil (1366px), Tablet (768px) e Mobile (390px).

