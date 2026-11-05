# 15 — Design System Corporativo
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Guia de Estilo, Tokens de Design e Biblioteca de Componentes Canónicos  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Referências Centrais:** Filosofia UX/UI (`docs/14-DOCUMENTO-UX-UI.md`) e Folha de Estilos Oficial (`public/css/style.css`)  
**Responsável:** Engenharia de Design System e Frontend  
**Data de Emissão:** 05 de Novembro de 2026  
**Estado:** Submetido para Validação e Aprovação Formal  

---

## 1. Tokens de Design (Variáveis Centrais)

### 1.1 Paleta de Cores Corporativas e Funcionais

| Nome do Token | Valor Hex | Utilização Primária |
| :--- | :---: | :--- |
| `--color-primary` | `#FF7A00` | Laranja Oficial LECASU. Ações primárias, acentos e destaques de produção solar. |
| `--color-primary-hover` | `#EA580C` | Estado de foco/ativação dos botões principais. |
| `--color-primary-light` | `#FFF7ED` | Fundo de badges solares e seleções ativas de menu. |
| `--color-primary-border`| `#FED7AA` | Borda delimitadora de componentes da marca. |
| `--color-slate-900` | `#0F172A` | Cor de texto principal (títulos, valores de métricas e cabeçalhos). |
| `--color-slate-800` | `#1E293B` | Cor de texto de leitura em tabelas e parágrafos densos. |
| `--color-slate-600` | `#475569` | Rótulos de formulário e subtítulos de apoio. |
| `--color-slate-500` | `#64748B` | Textos secundários, contadores e legendas. |
| `--color-slate-200` | `#E2E8F0` | Linhas de divisão, bordas de cartões e grelhas de tabelas. |
| `--color-slate-100` | `#F1F5F9` | Fundos de caixas de entrada desativadas e cabeçalhos de tabela. |
| `--color-bg-base` | `#F8FAFC` | Cor de fundo geral da aplicação (tela de trabalho). |
| `--color-surface` | `#FFFFFF` | Fundo de cartões, modais, cabeçalho e tabelas (branco corporativo). |
| `--color-success` | `#16A34A` | Verde Esmeralda. Sucesso, pagamentos recebidos e contadores ativos. |
| `--color-info` | `#2563EB` | Azul Real. Contratos, dados de rede e conexões convencionais. |
| `--color-warning` | `#D97706` | Âmbar. Alertas de desvio, faturas a vencer e manutenções pendentes. |
| `--color-danger` | `#DC2626` | Vermelho Carmesim. Faturas vencidas, cortes de linha e avarias críticas. |
| `--color-pue` | `#9333EA` | Roxo Ametista. Usos Produtivos de Energia (PUE) e fomento comunitário. |

### 1.2 Tipografia e Escala de Texto
* **Família Tipográfica Oficial:** `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
* **Escala Modular de Tamanhos:**
  - `0.68rem (11px)`: Legendas de metadados, carimbos temporais de auditoria e rodapés de tabela.
  - `0.74rem (12px)`: Textos de mini-medidores percentuais (`.kpi-mini-gauge-text`) e badges compactos.
  - `0.82rem (13px)`: Conteúdo de células de tabelas e textos auxiliares de formulário.
  - `0.88rem (14px)`: Tamanho base (`body`), texto de botões e campos de entrada de formulário.
  - `1.00rem (16px)`: Títulos de secções secundárias e cabeçalhos de cartões.
  - `1.15rem (18px)`: Títulos de páginas principais (`h2.workspace-title`).
  - `1.35rem (22px)`: Números de destaque em cartões KPI (`.kpi-number`).
* **Pesos Tipográficos Utilizados:** `400 (Regular)`, `500 (Medium)`, `600 (Semi-Bold)` e `700 (Bold)`.

### 1.3 Espaçamentos, Gaps e Margens
* **Escala Base de 4px:**
  - `4px (0.25rem)`: Espaçamento mínimo entre ícone e texto (`gap: 0.25rem`).
  - `8px (0.50rem)`: Padding interno de botões compactos e campos de input.
  - `12px (0.75rem)`: Espaçamento entre campos de formulário e células de grelhas compactas.
  - `16px (1.00rem)`: Padding interno padrão de cartões estruturais e modais.
  - `24px (1.50rem)`: Margem inferior entre secções da área de trabalho.

### 1.4 Bordas, Raios e Elevações
* **Raios de Arredondamento (*Border Radius*):**
  - `4px`: Badges pequenos e botões de paginação.
  - `6px`: Campos de input, selects e botões padrão.
  - `8px`: Caixas de ícones e modais compactos.
  - `12px`: Cartões principais de trabalho (`.workspace-card`) e contentores estruturais.
  - `50% (Pill / Circle)`: Medidores circulares de percentagem e avatares.
* **Sombras Sutis (*Box Shadow*):**
  - Nível 1 (Cartões e Botões): `0 1px 2px rgba(0, 0, 0, 0.04)`.
  - Nível 2 (Popups e Menus Suspensos): `0 4px 6px -1px rgba(0, 0, 0, 0.08)`.
  - Nível 3 (Modais Centrais): `0 20px 25px -5px rgba(0, 0, 0, 0.12)`.

---

## 2. Biblioteca de Componentes Canónicos

### 2.1 Botões
* **Botão Primário (`.btn-primary`):** Fundo Laranja `#FF7A00`, texto branco, altura mínima de 38px (desktop) e 44px (mobile), cantos 6px, peso 600.
* **Botão Secundário / Contorno (`.btn-outline`):** Fundo transparente, borda de 1px em `#E2E8F0`, texto ardósia `#475569`, hover sutil `#F8FAFC`.
* **Botão de Perigo (`.btn-danger`):** Fundo vermelho `#DC2626`, texto branco. Utilizado exclusivamente em ações de corte ou revogação formal.
* **Botão Ícone Compacto (`.btn-icon`):** 32x32px com ícone centrado, utilizado para ações rápidas em linhas de tabela (ver ficha, editar, desativar).

### 2.2 Campos de Entrada de Formulário (Inputs & Selects)
* **Formatação:** Altura padrão de 38px, borda de 1px em `#CBD5E1`, fundo branco puro, texto `#1E293B` e padding horizontal de 12px.
* **Estados Visuais:**
  - *Foco:* Borda destacada em `#FF7A00` com anel de foco suave `0 0 0 3px rgba(255, 122, 0, 0.15)`.
  - *Erro de Validação:* Borda vermelha `#DC2626` acompanhada de mensagem textual inferior em 12px vermelho.
  - *Desativado / Leitura:* Fundo cinzento `#F1F5F9`, borda atenuada e cursor `not-allowed`.

### 2.3 Tabelas de Alta Densidade (`.saas-table`)
* **Estrutura:** Cabeçalho com fundo `#F8FAFC`, texto em maiúsculas de 11px em negrito 600 e cor `#64748B`.
* **Linhas de Dados:** Altura de 48px por linha, borda inferior de 1px em `#F1F5F9`, números com alinhamento tabular (`font-variant-numeric: tabular-nums`) e efeito sutil de linha ativa ao passar o rato em desktop.
* **Ações por Linha:** Grupo compacto de botões de ícone na última coluna alinhados à direita.

### 2.4 Medidores Circulares de Percentagem (`.kpi-mini-gauge`)
* **Anatomia Padronizada:** Diâmetro exato de 44x44px, aro contínuo de 4px renderizado por `conic-gradient` nativo na cor do indicador, máscara interna em branco puro com sombra concêntrica e algarismos centrados em Inter Bold 0.74rem tabular (`#0F172A`).
* **Proteção:** Atributos de proteção `user-select: none` e `pointer-events: none` impedindo distorções visuais por arrasto de cursor.

### 2.5 Badges e Etiquetas de Estado (`.status-badge`)
* Formato pílula (*Pill*), altura de 22px, padding horizontal de 8px, texto em 11px negrito 600:
  - *Ativo / Sucesso:* Fundo `#DCFCE7`, texto `#15803D`, ícone de verificação.
  - *Pendente / Atenção:* Fundo `#FEF3C7`, texto `#B45309`, ícone de relógio.
  - *Inativo / Erro:* Fundo `#FEE2E2`, texto `#B91C1C`, ícone de alerta.
  - *Pós-Pago / Conexão:* Fundo `#DBEAFE`, texto `#1D4ED8`.
  - *Uso Produtivo (PUE):* Fundo `#F3E8FF`, texto `#7E22CE`.

### 2.6 Estados Vazios (*Empty States*)
* Quando uma listagem ou pesquisa não devolve registos:
  - Ilustração ou ícone contextualizado em cinzento neutro (`#94A3B8`) de 48px de diâmetro.
  - Título objetivo em 15px semi-bold (ex: *"Nenhum contador localizado"*).
  - Texto de orientação em 13px (ex: *"Verifique os termos da pesquisa ou cadastre um novo equipamento"*).
  - Botão de ação primária direta (ex: `+ Registar Contador`).

### 2.7 Estados de Carregamento (*Loading & Feedback*)
* Indicadores de progresso visual discretos sem bloquear desnecessariamente a área de trabalho.
* Utilização de barras de esqueleto animadas (*skeleton loaders*) nas células das tabelas enquanto a API responde, evitando saltos bruscos de layout (*Cumulative Layout Shift - CLS = 0*).
