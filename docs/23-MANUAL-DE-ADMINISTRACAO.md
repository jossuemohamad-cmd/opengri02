# LECASU GRIDOPS — MANUAL DE ADMINISTRAÇÃO DO SISTEMA
**Documento:** 23 — Manual de Administração  
**Versão:** 1.0.0 (Produção)  
**Proprietário:** LECASU, Lda.  
**Data:** 05 de Novembro de 2026  
**Classificação:** Confidencial / Uso Interno  

---

## 1. Visão Geral da Administração

O **LECASU GridOps** é a plataforma corporativa da LECASU, Lda. para supervisão técnica, gestão comercial, controlo de contadores e manutenção operacional de mini-redes solares fotovoltaicas com armazenamento em baterias (BESS) em Moçambique.

Este manual destina-se aos **Administradores do Sistema** e à equipa de suporte técnico da LECASU, descrevendo os procedimentos de configuração, gestão de acessos, segurança, cópias de segurança e monitorização contínua.

---

## 2. Controlo de Acessos e Matriz RBAC

O sistema adota o modelo de controlo de acessos baseado em funções (**Role-Based Access Control - RBAC**) com 6 perfis hierárquicos e separação estrita de privilégios:

| Perfil | Código Interno | Escopo de Permissões |
|---|---|---|
| **Administrador** | `administrador` | Acesso total ao sistema, gestão de utilizadores, trilha de auditoria e configurações avançadas. |
| **Gestor de Operações** | `gestor_operacoes` | Cadastro e edição de mini-redes, ativos técnicos, atribuição de ordens de trabalho e supervisão GIS. |
| **Gestor Comercial** | `gestor_comercial` | Gestão de clientes, celebração de contratos, vinculação de tarifas e emissão de ligações. |
| **Técnico de Campo** | `tecnico_campo` | Instalação de contadores, registo de leituras em campo (online/offline) e execução de ordens de manutenção. |
| **Financeiro** | `financeiro` | Reconciliação bancária, validação de transações M-Pesa / e-Mola, gestão de dívidas e relatórios financeiros. |
| **Parceiro / Auditor** | `parceiro_auditor` | Acesso de leitura estrita a indicadores consolidados, metas de eletrificação e redução de emissões CO₂. |

---

## 3. Gestão de Contas de Utilizadores

### 3.1 Criação de Novo Utilizador
1. Aceder ao menu **Auditoria & Utilizadores** no painel lateral.
2. Clicar no botão **Novo Utilizador**.
3. Preencher obrigatoriamente:
   - **Nome Completo**
   - **Email Institucional** (identificador único no sistema)
   - **Perfil de Acesso (Função)**
   - **Senha Temporária** (mínimo de 8 caracteres, contendo letras e números)
4. Confirmar a criação. O utilizador será registado com estado `ativo` e a operação será inscrita no log de auditoria com o carimbo temporal e o ID do administrador.

### 3.2 Desativação de Utilizadores
- Em caso de saída ou transferência de funções, a conta deve ser colocada no estado `inativo`.
- **Regra de Conformidade:** As contas de utilizador nunca devem ser eliminadas diretamente da base de dados para garantir a rastreabilidade histórica e a integridade referencial dos registos criados no passado.

### 3.3 Redefinição de Credenciais
- O administrador pode acionar a redefinição de senha na ficha do utilizador.
- Todas as senhas são armazenadas exclusivamente utilizando hash criptográfico com **bcryptjs** (salt rounds = 10), sendo impossível a recuperação em texto simples.

---

## 4. Gestão Tarifária e Parâmetros Comerciais

O módulo **Configurações / Tarifas** permite gerir os escalões de faturação aprovados pela autoridade reguladora (ARENE):

1. **Tarifa Social / Doméstica Básica:** Destinada a iluminação e consumos essenciais (0 - 30 kWh/mês).
2. **Tarifa Doméstica Geral:** Consumos residenciais normais (> 30 kWh/mês).
3. **Tarifa Comercial:** Pequenos negócios locais (mercearias, quiosques, barbearias).
4. **Tarifa Uso Produtivo (PUE):** Moageiras, carpintarias, bombas solares agrícolas e soldadura.
5. **Taxa Fixa de Disponibilidade:** Valor mensal cobrado pela manutenção da ligação à mini-rede.

---

## 5. Procedimentos de Cópia de Segurança (Backup)

O LECASU GridOps dispõe de ferramentas nativas e scripts para garantir a redundância e proteção dos dados corporativos.

### 5.1 Execução de Backup Estruturado via Script
No terminal do servidor, executar:
```bash
node scripts/backup_db.js
```
O utilitário exporta todas as tabelas para a diretoria `backups/`, gerando um ficheiro com carimbo temporal no formato:
`backup_lecasu_gridops_YYYY-MM-DDTHH-mm-ss-msZ.json`

### 5.2 Backup Nativo com pg_dump (Recomendado para Produção)
Para criar uma cópia física binária comprimida do PostgreSQL:
```bash
pg_dump -U postgres -h 127.0.0.1 -F c -b -v -f "/var/backups/gridops/gridops_$(date +%Y%m%d_%H%M%S).dump" lecasu_gridops
```

### 5.3 Agendamento Automático via Cron (Linux)
Adicionar a seguinte linha ao crontab do sistema (`crontab -e`) para execução diária às 02:00:
```cron
0 2 * * * /usr/bin/node /var/www/lecasu-gridops/scripts/backup_db.js >> /var/log/gridops-backup.log 2>&1
```

---

## 6. Procedimentos de Restauração e Recuperação (Disaster Recovery)

### 6.1 Simulação de Restauração (Dry-Run)
Antes de aplicar qualquer restauração em ambiente real, execute uma validação prévia sem qualquer impacto na base de dados:
```bash
node scripts/restore_db.js backups/backup_alvo.json --dry-run
```

### 6.2 Restauração Efetiva em Caso de Falha
Para restaurar a base de dados a partir do backup estruturado:
```bash
node scripts/restore_db.js backups/backup_alvo.json
```
O script executa uma transação atómica (`BEGIN ... COMMIT`), respeitando a ordem correta das chaves estrangeiras. Em caso de qualquer inconsistência, a operação sofre reversão automática (`ROLLBACK`).

---

## 7. Monitorização, Auditoria e Diagnóstico

### 7.1 Ponto de Verificação de Saúde (Healthcheck)
O sistema expõe um endpoint REST público para ferramentas de monitorização (Uptime Robot, Zabbix, Datadog):
- **URL:** `GET https://gridops.lecasu.co.mz/api/health`
- **Resposta esperada:** HTTP 200 OK com estado da conexão ao PostgreSQL e tempo de atividade (`uptime`).

### 7.2 Trilha de Auditoria Imutável
Todas as operações críticas do sistema são registadas automaticamente na tabela `audit_logs`:
- Início de sessão (login bem-sucedido ou falhado).
- Cadastro e alteração de mini-redes, clientes e contratos.
- Emissão de ordens de trabalho e manutenções.
- Reconciliações financeiras e anulações de transações.

---

## 8. Gestão do Processo em Produção (PM2)

O servidor de produção é gerido através do gestor de processos **PM2**:

- **Iniciar aplicação em modo cluster:**
  ```bash
  pm2 start ecosystem.config.js --env production
  ```
- **Verificar estado das instâncias:**
  ```bash
  pm2 status
  ```
- **Visualizar registos em tempo real:**
  ```bash
  pm2 logs lecasu-gridops
  ```
- **Recarregar o serviço sem perda de conexões (Zero Downtime):**
  ```bash
  pm2 reload lecasu-gridops
  ```
