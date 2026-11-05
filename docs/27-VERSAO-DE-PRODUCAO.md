# LECASU GRIDOPS — VERSÃO DE PRODUÇÃO DO SISTEMA
**Documento:** 27 — Versão de Produção do LECASU GridOps  
**Versão Oficial:** v1.0.0 (Release de Produção)  
**Proprietário:** LECASU, Lda.  
**Data de Lançamento:** 05 de Novembro de 2026  
**Classificação:** Ficha Técnica de Distribuição  

---

## 1. Ficha Técnica da Release v1.0.0

| Parâmetro | Especificação Oficial |
|---|---|
| **Nome da Plataforma** | LECASU GridOps |
| **Versão** | `v1.0.0-production` |
| **Tipo de Arquitetura** | Web SPA Vanilla JavaScript (Frontend) + REST API Node.js Express (Backend) |
| **Motor de Base de Dados** | PostgreSQL 15 / 16 / 18 Relacional |
| **PWA / Suporte Offline** | Service Worker Cache + IndexedDB para Sincronização de Campo |
| **Motor GIS / Mapas** | Leaflet 1.9 Local com Suporte a Camadas GeoJSON de Mini-Redes e Clientes |
| **Fuso Horário Padrão** | África/Maputo (UTC+2) com Relógio Dinâmico no Cabeçalho |
| **Moeda de Faturação** | Metical Moçambicano (MZN) |
| **Repositório Git Oficial** | `https://github.com/jossuemohamad-cmd/opengri02.git` |
| **Branch de Produção** | `main` |

---

## 2. Componentes e Módulos Entregues

A versão `v1.0.0` inclui os seguintes módulos completamente funcionais e integrados:

1. **Módulo 01 — Autenticação e Gestão de Utilizadores:**
   - Início de sessão seguro por JWT.
   - 6 perfis funcionais com permissões restritas (RBAC).
   - Bloqueio de acessos indevidos e histórico de acessos.
2. **Módulo 02 — Mini-Redes e GIS em Tempo Real:**
   - Cadastro detalhado de centrais fotovoltaicas e capacidade de baterias BESS.
   - Visualização cartográfica com filtros por província e estado operacional.
   - Cockpit SCADA de telemetria instantânea do inversor central.
3. **Módulo 03 — Clientes e Gestão Contratual:**
   - Cadastro de consumidores (Domésticos, Comerciais, Usos Produtivos PUE e Institucionais).
   - Celebração de contratos, vinculação de tarifas e custódia de cauções.
4. **Módulo 04 — Parque de Contadores, Leituras e Consumo:**
   - Inventário de contadores STS com números de série únicos.
   - Registo de leituras manuais ou por lote com cálculo de consumo automático.
   - Deteção e alerta preventivo de fraudes ou consumos anormais.
5. **Módulo 05 — Facturação, Pagamentos e Tokens STS:**
   - Registo de transações financeiras em Meticais.
   - Geração de tokens de recarga STS de 20 dígitos.
   - Reconciliação com carteiras móveis (M-Pesa, e-Mola, M-Kesh).
6. **Módulo 06 — Gestão Patrimonial de Ativos:**
   - Inventário de painéis solares, inversores, bancos de baterias e transformadores.
   - Rastreio de números de série, garantias e datas de manutenção preventiva.
7. **Módulo 07 — Ocorrências e Ordens de Manutenção (O&M):**
   - Registo de tickets de avarias técnicas e agendamento de intervenções preventivas.
   - Gestão do ciclo de vida das ordens de trabalho (`aberta` → `atribuida` → `em_resolucao` → `concluida`).
8. **Módulo 08 — Relatórios Gerenciais e Indicadores de Sustentabilidade:**
   - Painéis de geração solar acumulada, consumo comunitário e desempenho de receita.
   - Métricas ambientais de diesel substituído e emissões de CO₂ evitadas.
   - Exportação integral para ficheiros CSV compatíveis com Excel.
9. **Módulo 09 — Trilha de Auditoria e Segurança:**
   - Registo imutável de todas as ações de utilizadores em `audit_logs`.
   - Consulta filtrada por período, utilizador e entidade de negócio.
10. **Módulo 10 — Modo de Operação Offline e Sincronização PWA:**
    - Armazenamento temporário de leituras e ordens de trabalho no telemóvel quando sem sinal GSM.
    - Sincronização automática em segundo plano ao recuperar ligação à rede móvel.

---

## 3. Configurações Ativas de Segurança em Produção

- **Criptografia de Senhas:** Hash irreversível gerado com algoritmo **bcryptjs** (salt factor de 10).
- **Proteção de Sessão:** Tokens **JWT (JSON Web Token)** assinados com segredo de 256 bits e validade padrão de 8 horas.
- **Cabeçalhos de Segurança HTTP:**
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (HSTS).
  - `X-Frame-Options: DENY` (Prevenção de Clickjacking).
  - `X-Content-Type-Options: nosniff` (Prevenção de MIME-Sniffing).
  - `X-XSS-Protection: 1; mode=block` (Proteção contra Cross-Site Scripting).
  - `Content-Security-Policy` restrito a ativos autorizados.
- **Isolamento de Funções:** Bloqueio rígido no backend contra escalonamento de privilégios.

---

## 4. Guia Rápido de Lançamento em Produção

### Opção A: Execução Nativa com PM2 e Nginx (Recomendada para Desempenho)
```bash
# 1. No servidor de produção com Node.js 20 e PostgreSQL 15 activos
cd /var/www/lecasu-gridops

# 2. Configurar variáveis de produção
cp .env.production.example .env
# Editar .env com as credenciais reais da base de dados e JWT seguro

# 3. Executar as migrações da base de dados
node scripts/migrate.js

# 4. Validar pré-voo
node scripts/verify_production.js

# 5. Iniciar cluster com o PM2
pm2 start ecosystem.config.js --env production
pm2 save
```

### Opção B: Execução com Docker e Docker-Compose
```bash
cd /var/www/lecasu-gridops
docker-compose up -d --build
```

---

## 5. Rotinas de Manutenção e Suporte Contínuo

- **Cópias de Segurança Diárias:** Executadas automaticamente através do utilitário `scripts/backup_db.js`.
- **Monitorização Contínua:** Verificação automática da saúde da API através do endpoint `GET /api/health`.
- **Rotação de Registos (Logs):** Gestão centralizada de logs através do PM2 na pasta `logs/` com rotação periódica.
