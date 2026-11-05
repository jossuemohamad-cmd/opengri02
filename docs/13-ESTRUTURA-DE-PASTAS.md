# 13 — Estrutura de Pastas e Organização do Código
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Padrão Arquitetural de Diretórios, Organização de Módulos e Convenções de Código  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Referências Centrais:** Arquitectura de Software (`docs/07-ARQUITECTURA-DE-SOFTWARE.md`), Dicionário de Dados (`docs/09-DICIONARIO-DE-DADOS.md`) e Diretrizes de Governação (`AGENTS.md`)  
**Responsável:** Arquitetura de Software e Engenharia Full-Stack  
**Data de Emissão:** 05 de Novembro de 2026  
**Estado:** Submetido para Validação e Aprovação Formal  

---

## 1. Princípios de Organização do Código

A base de código do **LECASU GridOps** estrutura-se sob os seguintes pilares:
1. **Separação Rígida de Camadas:** Separação inequívoca entre a interface pública do cliente (`public/`), a API e lógica de negócio (`server/`), a base de dados (`database/`) e a documentação técnica oficial (`docs/`).
2. **Modularidade por Domínio:** O backend agrupa rotas, controladores e serviços por módulo funcional da PRD (Mini-Redes, Clientes, Contadores, Faturação, Ativos, O&M, Relatórios e Notificações).
3. **Padrão Controller-Service-Repository:**
   - *Controllers:* Interceção e validação de requisições HTTP.
   - *Services:* Regras de negócio, cálculos tarifários e geração de tokens.
   - *Repositories:* Acesso a dados via consultas SQL parametrizadas.
4. **Sem Dependências Ocultas:** Todo o código é rastreável, sem ferramentas de build complexas que quebrem em ambientes de produção com conectividade restrita.

---

## 2. Árvore de Diretórios do Projeto

```
lecasu-gridops/
├── .git/                                 # Controlo de versões Git
├── docs/                                 # Documentação Técnica e Normativa
│   ├── 01-DISCOVERY-REPORT.md            # Relatório de descoberta e análise
│   ├── 01-RELATORIO-DE-DESCOBERTA-E-ANALISE-DO-PRODUTO.md
│   ├── 02-PRD-CONSOLIDADA.md             # Requisitos consolidados do produto
│   ├── 03-CATALOGO-DE-REQUISITOS.md      # Catálogo de RFs, RNFs e User Stories
│   ├── 04-MATRIZ-DE-PERMISSOES.md        # Matriz RBAC e regras SoD
│   ├── 05-REGRAS-DE-NEGOCIO.md           # Regras aprofundadas e decisões pendentes
│   ├── 06-CRITERIOS-DE-ACEITACAO.md      # Cenários de teste em formato BDD/Gherkin
│   ├── 07-ARQUITECTURA-DE-SOFTWARE.md    # Arquitetura global e justificação técnica
│   ├── 08-MODELO-ENTIDADE-RELACIONAMENTO.md # Diagrama ERD conceitual e lógico
│   ├── 09-DICIONARIO-DE-DADOS.md         # Dicionário exaustivo de tabelas e tipos
│   ├── 10-ESPECIFICACAO-DE-APIS.md       # Contratos de rotas RESTful
│   ├── 11-ARQUITECTURA-DE-SEGURANCA.md   # RBAC, auditoria e plano de backups
│   ├── 12-ESTRATEGIA-OFFLINE-E-SINCRONIZACAO.md # Arquitetura PWA e motor de sincronização
│   ├── 13-ESTRUTURA-DE-PASTAS.md         # Padrão de diretórios e convenções
│   └── PRD.md                            # Documento de referência original
│
├── database/                             # Gestão e Migrações de Base de Dados
│   ├── migrations/                       # Scripts SQL versionados e sequenciais
│   │   ├── 001_initial_schema.sql        # Criação de extensões e tabelas nucleares
│   │   ├── 002_meters_and_readings.sql   # Parque de contadores e leituras
│   │   ├── 003_billing_and_payments.sql  # Tarifas, faturas, pagamentos e tokens
│   │   ├── 004_assets_and_work_orders.sql# Ativos patrimoniais e OTs
│   │   └── 005_audit_and_triggers.sql    # Trilha de auditoria append-only
│   ├── seeds/                            # Dados iniciais e de parametrização
│   │   ├── 01_organizations_seed.sql     # Organização LECASU e utilizador admin inicial
│   │   └── 02_tariffs_seed.sql           # Tabelas tarifárias aprovadas pela ARENE
│   └── db.js                             # Pool de conexões PostgreSQL otimizado
│
├── server/                               # Camada de Aplicação Backend (Node.js/Express)
│   ├── config/                           # Configurações de ambiente e constantes
│   │   ├── env.js                        # Leitura validada de variáveis de ambiente
│   │   └── constants.js                  # Prazos de SLA, limites de caixa e tarifas
│   ├── middleware/                       # Middlewares de interceptação HTTP
│   │   ├── auth.js                       # Validação de tokens JWT
│   │   ├── rbac.js                       # Autorização baseada em papéis
│   │   ├── scope.js                      # Validação de escopo concessional por mini-rede
│   │   ├── rateLimiter.js                # Proteção contra ataques de força bruta
│   │   ├── validator.js                  # Validação sintática de esquemas JSON
│   │   └── errorHandler.js               # Captura global de exceções sem vazamento
│   ├── controllers/                      # Controladores de Rotas HTTP
│   │   ├── authController.js
│   │   ├── miniGridController.js
│   │   ├── customerController.js
│   │   ├── contractController.js
│   │   ├── meterController.js
│   │   ├── readingController.js
│   │   ├── billingController.js
│   │   ├── paymentController.js
│   │   ├── vendingController.js          # Emissão de tokens pré-pagos STS
│   │   ├── assetController.js
│   │   ├── workOrderController.js
│   │   ├── reportController.js
│   │   └── syncController.js             # Motor de sincronização offline
│   ├── services/                         # Serviços de Domínio e Lógica de Negócio
│   │   ├── tariffEngine.js               # Motor de cálculo tarifário progressivo
│   │   ├── stsVendingService.js          # Implementação da norma IEC 62055-41
│   │   ├── reconciliationService.js      # Cruzamento de extratos bancários/móveis
│   │   ├── workOrderService.js           # Gestão de ciclo de vida e cálculo de SLAs
│   │   ├── notificationService.js        # Disparo assíncrono de SMS e alertas
│   │   └── auditService.js               # Gravação imutável na tabela audit_logs
│   ├── repositories/                     # Camada de Acesso a Dados (SQL Parametrizado)
│   │   ├── customerRepository.js
│   │   ├── meterRepository.js
│   │   ├── invoiceRepository.js
│   │   ├── paymentRepository.js
│   │   └── workOrderRepository.js
│   ├── routes/                           # Definição e Mapeamento de Rotas da API
│   │   ├── authRoutes.js
│   │   ├── miniGridRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── meterRoutes.js
│   │   ├── billingRoutes.js
│   │   ├── workOrderRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── syncRoutes.js
│   │   └── index.js                      # Agregador central sob /api/v1
│   └── app.js                            # Inicialização da aplicação Express
│
├── public/                               # Aplicação Frontend PWA (Single Page Application)
│   ├── css/                              # Folhas de Estilo Corporativas (Vanilla CSS3)
│   │   ├── style.css                     # Estilos gerais, layout e tokens de design
│   │   ├── components.css                # Estilização de botões, modais, tabelas e cards
│   │   └── pwa.css                       # Layout específico para telemóveis e modo offline
│   ├── js/                               # Lógica de Interface (Vanilla JavaScript Modular)
│   │   ├── state.js                      # Estado reativo global da aplicação (AppState)
│   │   ├── api.js                        # Cliente HTTP com injeção automática de token JWT
│   │   ├── offlineStore.js               # Abstração de armazenamento local IndexedDB
│   │   ├── syncEngine.js                 # Motor de sincronização em segundo plano no cliente
│   │   ├── icons.js                      # Biblioteca interna de ícones vetoriais SVG
│   │   ├── views/                        # Módulos de Interface com renderização dinâmica
│   │   │   ├── dashboardView.js          # Cockpit executivo e telemetria
│   │   │   ├── miniGridsView.js          # Gestão de centrais e visualizador SIG
│   │   │   ├── customersView.js          # Clientes, documentos e contratos
│   │   │   ├── metersView.js             # Contadores, rotas de leitura e anomalias
│   │   │   ├── billingView.js            # Faturas, pagamentos e emissor STS
│   │   │   ├── assetsView.js             # Inventário de painéis, inversores e BESS
│   │   │   ├── workOrdersView.js         # OTs de corte, religação e manutenção
│   │   │   ├── reportsView.js            # Relatórios oficiais ARENE e exportações
│   │   │   └── settingsView.js           # Utilizadores, permissões e auditoria
│   │   └── app.js                        # Ponto de entrada, roteador SPA e listeners
│   ├── vendor/                           # Bibliotecas Locais (Sem Dependência de CDN Externa)
│   │   ├── leaflet/                      # Biblioteca de mapas SIG offline
│   │   └── chart/                        # Biblioteca de gráficos estatísticos
│   ├── service-worker.js                 # Service Worker corporativo (Cache & Background Sync)
│   ├── manifest.json                     # Manifesto PWA com metadados para instalação
│   ├── index.html                        # Casca HTML principal (SPA container)
│   └── favicon.ico                       # Favicon oficial LECASU
│
├── storage/                              # Armazenamento Seguro de Ficheiros
│   └── uploads/                          # Diretório de ficheiros (fora da raiz web pública)
│       ├── documents/                    # Documentos de identificação de clientes
│       ├── evidences/                    # Fotografias probatórias de OTs
│       ├── manuals/                      # Manuais técnicos de equipamentos
│       └── exports/                      # Relatórios gerados em PDF e Excel
│
├── tests/                                # Testes Automatizados de Qualidade
│   ├── unit/                             # Testes unitários de regras de negócio puras
│   │   ├── tariffCalculation.test.js     # Validação de escalões tarifários
│   │   └── stsTokenGeneration.test.js    # Validação do algoritmo IEC 62055-41
│   ├── integration/                      # Testes de integração de APIs
│   │   ├── authEndpoints.test.js         # Testes de autenticação e proteção RBAC
│   │   └── syncProtocol.test.js          # Testes de envio em lote e idempotência
│   └── e2e/                              # Testes de ponta a ponta de fluxos de campo
│
├── .env.example                          # Modelo padronizado de variáveis de ambiente
├── .gitignore                            # Ficheiros ignorados pelo controlo de versões
├── AGENTS.md                             # Regras gerais de governação do projeto
├── package.json                          # Metadados e dependências do projeto Node.js
├── README.md                             # Manual de instalação e execução rápida
└── server.js                             # Ponto de entrada do processo de servidor
```

---

## 3. Convenções de Código e Boas Práticas

### 3.1 Nomenclatura de Ficheiros e Variáveis
* **Ficheiros JavaScript:** Padrão *camelCase* para utilitários e serviços (`tariffEngine.js`, `stsVendingService.js`) e sufixo de papel nos controladores (`customerController.js`).
* **Funções e Variáveis:** Padrão *camelCase* expressivo e em língua inglesa ou termos oficiais do negócio em português de Moçambique (`calculateTieredTariff`, `amortizeCustomerDebt`, `generateStsToken`).
* **Constantes Globais:** Padrão *UPPER_SNAKE_CASE* (`DEFAULT_SLA_HOURS_HIGH = 4`, `MAX_CASH_AGENT_LIMIT = 50000`).

### 3.2 Tratamento de Exceções e Erros
* O backend **nunca** deixa exceções não tratadas derrubarem o processo Node.js.
* Todas as operações assíncronas são encapsuladas em blocos `try/catch` estruturados.
* Erros de base de dados são capturados pelo middleware central `errorHandler.js`, que converte códigos internos do PostgreSQL (ex: `23505` para violação de unicidade) em mensagens funcionais compreensíveis, sem expor comandos SQL na resposta HTTP.

### 3.3 Regras de Controlo de Versões (Git)
* **Formato de Mensagens de Commit:** Adoção rigorosa do padrão *Conventional Commits*:
  - `feat(modulo): nova funcionalidade de negócio`
  - `fix(modulo): correção de bug ou anomalia visual`
  - `docs(etapa): documentação técnica ou de requisitos`
  - `refactor(modulo): melhoria interna de código sem alteração funcional`
  - `test(modulo): adição ou ajuste de cenários de teste`
* **Integridade da Ramo Principal:** A ramo `main` é mantida sempre em estado funcional e compilável, com sincronização regular com o repositório oficial da organização.
