# 14 — Documento de UX/UI e Experiência do Utilizador
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Filosofia de Experiência do Utilizador, Ergonomia e Usabilidade Operacional  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Referências Centrais:** PRD Consolidada (`docs/02-PRD-CONSOLIDADA.md`), Catálogo de Requisitos (`docs/03-CATALOGO-DE-REQUISITOS.md`) e Diretrizes de Governação (`AGENTS.md`)  
**Responsável:** Direção de Design de Interação (UX/UI) e Ergonomia de Sistemas  
**Data de Emissão:** 05 de Novembro de 2026  
**Estado:** Submetido para Validação e Aprovação Formal  

---

## 1. Filosofia de Design e Princípios Fundamentais

O **LECASU GridOps** é uma ferramenta de trabalho operacional e crítica de engenharia e finanças. O design da plataforma recusa categoricamente layouts genéricos, elementos puramente cosméticos ou cartões desnecessários gerados por modelos de inteligência artificial.

Cada elemento em ecrã existe para cumprir uma função operacional concreta, sustentado em cinco pilares fundamentais:

```
[ 1. Densidade & Clareza ]      -> Máxima visibilidade de dados relevantes sem ruído visual
[ 2. Sobriedade Corporativa ]   -> Identidade oficial LECASU (#FF7A00 e Ardósia) com alto contraste
[ 3. Resiliência de Campo ]     -> Alvos de toque largos (>= 44px) e legibilidade sob sol intenso
[ 4. Eficiência de Cliques ]    -> Ações críticas (emitir token, fechar OT) em no máximo 3 passos
[ 5. Prevenção de Falhas ]      -> Confirmação em duas etapas para ações financeiras irreversíveis
```

---

## 2. Personas Operacionais e Ambientes de Utilização

A experiência de utilização divide-se em dois grandes contextos físicos e operacionais:

### Persona A: O Gestor / Analista de Escritório (Desktop Corporativo)
* **Perfil:** Diretores Operacionais, Gestores Comerciais, Responsáveis Financeiros e Auditores.
* **Ambiente de Trabalho:** Escritórios centrais em Maputo ou capitais provinciais, monitores desktop (1920x1080px ou laptops de 1366x768px), ligação de fibra ótica estável e uso intensivo de rato e teclado.
* **Necessidades Primárias:** Tabelas densas de consulta rápida, filtros avançados multivariáveis, atalhos de teclado, exportação imediata para Excel/PDF e dashboards consolidados com telemetria em tempo real.
* **Solução UX:** Layout estruturado com barra lateral retrátil (*Sidebar*), grelhas ordenáveis com paginação compacta, cabeçalho com contexto de concessão e visualização ampla de mapas SIG.

### Persona B: O Técnico de Campo e Agente Comunitário (Mobile PWA)
* **Perfil:** Eletricistas, Técnicos de Manutenção de Linhas e Agentes de Ponto de Venda.
* **Ambiente de Trabalho:** Comunidades rurais isoladas (ex: aldeias de Inhambane e Gaza), smartphones Android de gama de entrada (ecrãs de 5.5 a 6.5 polegadas, resolução HD), forte luz solar direta, mãos com luvas de trabalho e sinal GSM intermitente ou ausente.
* **Necessidades Primárias:** Operação em modo offline, botões grandes e espaçados, formulários curtos passo a passo (*Wizards*), captura rápida de fotos com a câmara integrada e indicador visual transparente do estado de sincronização.
* **Solução UX:** Interface simplificada em coluna única, botões de ação primária de toque largo ($\ge 44\text{px}$ de altura), contraste visual reforçado (fundo branco puro e texto ardósia escuro) e ausência de efeitos de sobreposição (*hover*) que não funcionam em ecrãs táteis.

---

## 3. Diretrizes de Ergonomia e Prevenção de Erros

1. **Hierarquia Visual Estrita:**
   * Nível 1: Informação crítica de topo (estado da mini-rede, potência solar ativa, alertas de corte de emergência).
   * Nível 2: Tabela de trabalho e dados da operação (clientes, contadores, faturas).
   * Nível 3: Detalhes secundários, metadados de auditoria e parâmetros de sistema.
2. **Prevenção de Erros Humanos em Valores e Dígitos:**
   * Formatação automática em tempo real para moeda moçambicana (`1.250,00 MT`), números de telefone (`+258 84 ...`) e números de contadores com espaçamento a cada 4 dígitos (`0123 4567 890`).
   * Tokens STS exibidos em caixas individuais destacadas com separadores a cada 4 dígitos (`XXXX - XXXX - XXXX - XXXX - XXXX`) e botão de cópia com um clique para SMS.
3. **Confirmação e Reversibilidade:**
   * Ações com impacto financeiro ou corte físico de energia exigem modal de confirmação com resumo dos impactos (ex: *"Tem a certeza de que pretende emitir ordem de corte para o cliente Alberto Chissano com dívida de 1.500 MT?"*).
   * É estritamente vedada a existência de botões de exclusão física permanente (`DELETE`).

---

## 4. Conformidade e Acessibilidade (WCAG 2.1 AA)

* **Rácio de Contraste Cromático:** Todos os textos de leitura têm contraste superior a $4.5:1$ em relação ao fundo (o texto oficial `#0F172A` sobre fundo `#FFFFFF` atinge rácio superior a $15:1$).
* **Navegação por Teclado:** Foco visual nítido (`outline: 2px solid var(--color-primary)`) em todos os campos de formulário, botões e links navegáveis através da tecla `Tab`.
* **Sem Dependência Exclusiva de Cor:** Todo e qualquer estado (ex: *Ativo*, *Pendente*, *Em Dívida*, *Avaria*) combina a cor do badge com um ícone representativo e um texto explícito, garantindo plena acessibilidade a operadores com daltonismo.
