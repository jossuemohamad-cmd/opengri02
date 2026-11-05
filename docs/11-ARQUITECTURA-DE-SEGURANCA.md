# 11 — Arquitectura de Segurança e Governação
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Plano Diretor de Segurança de Informação, Cibersegurança e Continuidade de Negócio  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Referências Centrais:** PRD Consolidada (`docs/02-PRD-CONSOLIDADA.md`), Matriz de Permissões (`docs/04-MATRIZ-DE-PERMISSOES.md`) e Dicionário de Dados (`docs/09-DICIONARIO-DE-DADOS.md`)  
**Responsável:** Segurança da Informação, Cibersegurança e Governação de TI  
**Data de Emissão:** 05 de Novembro de 2026  
**Estado:** Submetido para Validação e Aprovação Formal  

---

## 1. Princípios de Segurança da Informação

O **LECASU GridOps** rege-se pelos padrões da norma **ISO/IEC 27001** e pelas diretrizes do **OWASP Top 10**, aplicando o princípio de **Defesa em Profundidade** (*Defense in Depth*) em cinco camadas estruturais:

```
[ Camada 1: Perímetro de Rede & Transporte ] -> HTTPS, TLS 1.3, Firewall, Rate Limiting
[ Camada 2: Autenticação & Identidade ]      -> JWT Stateless, bcrypt, Revogação Remota
[ Camada 3: Autorização & Controlo RBAC ]    -> Menor Privilégio, Segregação de Funções (SoD)
[ Camada 4: Aplicação & Lógica de Negócio ]  -> Validação de Schemas, Sanitização, Anti-CSRF
[ Camada 5: Dados, Auditoria & Cópia ]       -> Encriptação em Repouso, Logs Imutáveis, Backups 3-2-1
```

---

## 2. Controlo de Acesso Baseado em Funções (RBAC) e Multitenancy

### 2.1 Isolamento Multitenant por Organização
* Cada entidade de dados está vinculada à `organization_id` correspondente.
* As queries na camada de repositório incluem obrigatoriamente a cláusula de isolamento `WHERE organization_id = :current_user_org_id`, impedindo que operadores de uma organização consultem dados de outra entidade em ambientes partilhados.

### 2.2 Escopo Concessional por Mini-Rede
* Utilizadores de campo (`FIELD_TECHNICIAN` e `COMMUNITY_AGENT`) têm o seu escopo restrito às concessões parametrizadas na tabela `user_mini_grid_assignments`.
* Um middleware de segurança de rotas (`verifyMiniGridScope`) interceta cada requisição que envolva clientes, contadores ou OTs:
  - Se a concessão do recurso não constar das mini-redes atribuídas ao operador, a requisição é terminada imediatamente com código `403 Forbidden` e o evento é registado no log de alertas de segurança.

---

## 3. Proteção de Informações Financeiras e Dados Pessoais (PII)

### 3.1 Proteção de Informações Financeiras
1. **Imutabilidade de Livro-Razão:** Não existem operações de `UPDATE` ou `DELETE` nas tabelas `payments`, `sts_tokens`, `invoices` e `account_transactions`. Correções são efetuadas exclusivamente por via de transações de compensação contábil.
2. **Mitigação de Ataques de Repetição (Replay Attacks):** As transações móveis (M-Pesa / e-Mola) validam a unicidade do identificador de transação (`mobile_provider_tx_id`) através de um índice único na base de dados com restrição de chave. Se a mesma transação for submetida duas vezes, a segunda tentativa é rejeitada com código `409 Conflict`.
3. **Regra de Quatro Olhos em Estornos:** Conforme a regra `RN-REV-002`, o pedido de estorno de qualquer quantia financeira exige a solicitação formal por um Gestor Comercial e a homologação obrigatória pelo Responsável Financeiro.

### 3.2 Proteção de Dados Pessoais de Consumidores (PII)
* Os documentos de identificação (BI, NUIT, passaporte) e dados biométricos/fotográficos são acessíveis apenas a perfis com necessidade estrita de serviço (`COMMERCIAL_MANAGER`, `ADMIN`).
* Para perfis de fiscalização externa (`AUDITOR_PARTNER`), o sistema aplica **máscaras dinâmicas de dados** na camada de serialização da API (ex: `Nome: Alb**** Chi****`, `Contacto: +258 84 *** *567`, `Doc: *******4567M`).

---

## 4. Gestão de Sessões, Tokens e Revogação Remota

### 4.1 Estratégia de Tokens JWT
* **Assinatura:** Assinados com chave assimétrica forte utilizando algoritmo `HS256` ou `RS256` com segredo gerado por entropia criptográfica e rotatividade periódica.
* **Tempo de Vida Útil:**
  - *Desktop:* Token com expiração de 8 horas (`expiresIn: '8h'`).
  - *Dispositivo Móvel PWA de Campo:* Token com expiração estendida de 7 dias, associado ao identificador físico do hardware (`device_fingerprint`).
* **Conteúdo do Payload:** Contém apenas dados não sensíveis: `user_id`, `role`, `organization_id` e lista de `assigned_mini_grids`.

### 4.2 Lista Negra de Sessões e Revogação Remota
* Para permitir o bloqueio imediato em caso de extravio, roubo ou furto de telemóveis de técnicos ou agentes, o sistema mantém uma tabela em memória/cache (`revoked_tokens`) que armazena tokens revogados antes do seu termo natural.
* O Administrador pode disparar a ação "Terminar Sessões do Utilizador", invalidando instantaneamente qualquer tentativa de sincronização offline ou acesso com aquele dispositivo.

---

## 5. Auditoria de Segurança e Trilha Imutável (*Append-Only*)

1. **Garantia de Não Repúdio:** Todas as operações que alteram estado cadastral, financeiro ou operacional disparam a escrita na tabela `audit_logs`.
2. **Restrição Física de Base de Dados:**
   - A nível de utilizador de base de dados do PostgreSQL utilizado pela aplicação, são concedidas apenas permissões de `SELECT` e `INSERT` na tabela `audit_logs`.
   - É expressamente revogado qualquer direito de `UPDATE`, `DELETE`, `TRUNCATE` ou `DROP` nesta tabela (`REVOKE UPDATE, DELETE ON audit_logs FROM gridops_app_user;`).
3. **Payload Completo:** O registo armazena os valores anteriores (`old_values`) e novos (`new_values`) em formato estruturado JSONB, permitindo a reconstituição histórica exata de qualquer registo modificado no passado.

---

## 6. Política de Cópias de Segurança (Backups) e Recuperação de Desastres

### 6.1 Estratégia de Cópias de Segurança (Regra 3-2-1)
* **3 Cópias dos Dados:** A base de dados de produção em operação, uma cópia local de alta velocidade e uma cópia externa fora do datacenter primário.
* **2 Meios Diferentes:** Armazenamento em disco SSD corporativo e armazenamento em nuvem/objeto seguro e cifrado (S3-compatible / Cloud Storage).
* **1 Cópia Offsite Cifrada:** Replicação diária encriptada com chave AES-256 para localidade remota geograficamente separada.

### 6.2 Rotina de Execução de Backups
| Tipo de Backup | Periodicidade | Retenção | Destino |
| :--- | :--- | :--- | :--- |
| **Backup Completo (*Full Dump*)** | Diário (às 02:00 UTC) | 30 dias | Armazenamento local + Cloud Segura |
| **Arquivamento de WAL (*Continuous Archiving*)** | Contínuo (a cada 15 min) | 7 dias | Suporte a Point-in-Time Recovery (PITR) |
| **Backup de Imagens e Ficheiros de OTs** | Diário incremental | 90 dias | Repositório de objetos seguro |
| **Backup Semanal Consolidado** | Semanal (Domingos) | 12 meses | Armazenamento frio de longo prazo |

### 6.3 Objetivos de Continuidade de Negócio
* **RPO (*Recovery Point Objective*):** $\le 15\text{ minutos}$ (máxima perda aceitável de transações em caso de desastre catastrófico no servidor principal, assegurada pelo arquivamento contínuo de logs WAL).
* **RTO (*Recovery Time Objective*):** $\le 2\text{ horas}$ para restabelecimento completo do serviço em infraestrutura de contingência.
* **Testes Periódicos de Restauração:** Simulação de restauração completa realizada trimestralmente em ambiente isolado de *Staging* para validação da integridade das cópias de segurança.
