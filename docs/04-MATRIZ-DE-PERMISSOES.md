# 04 — Matriz de Permissões (RBAC)
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Matriz de Controlo de Acesso Baseado em Funções (Role-Based Access Control)  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Referências Centrais:** Nota Conceptual e Especificação Funcional v1.0 (`docs/PRD.md`), PRD Consolidada (`docs/02-PRD-CONSOLIDADA.md`) e Diretrizes de Governação (`AGENTS.md`)  
**Responsável:** Segurança de Informação e Arquitetura de Sistemas  
**Data de Emissão:** 05 de Novembro de 2026  
**Estado:** Submetido para Validação e Aprovação Formal  

---

## 1. Princípios de Segurança e Governação

O modelo de controlo de acessos do **LECASU GridOps** rege-se pelos seguintes princípios fundamentais:

1. **Princípio do Menor Privilégio (PoLP):** Cada perfil possui acesso estritamente delimitado às entidades e ações indispensáveis ao cumprimento das suas atribuições operacionais.
2. **Segregação de Funções (Segregation of Duties - SoD):** Prevenção ativa de conflitos de interesse e fraudes. Operações de alto risco financeiro ou operacional exigem separação entre quem solicita, quem executa e quem valida/aprova.
3. **Escopo Geográfico e Concessional:** Perfis operacionais de base (`FIELD_TECHNICIAN` e `COMMUNITY_AGENT`) têm o seu raio de ação circunscrito à mini-rede geográfica a que estão formalmente alocados.
4. **Proteção de Dados Pessoais (PII):** Acesso a documentos de identificação de clientes é restrito aos perfis comerciais e de administração, sendo mascarado para auditores externos.
5. **Rastreabilidade e Trilha de Auditoria:** Qualquer ação executada no sistema fica associada ao utilizador autenticado, sem possibilidade de ações anónimas ou exclusão física de logs.

---

## 2. Perfis de Utilizador Homologados

| Código do Perfil | Denominação Oficial | Âmbito Operacional Principal |
| :--- | :--- | :--- |
| **`ADMIN`** | Administrador do Sistema | Gestão de utilizadores, concessões, segurança, cópias de segurança e parametrizações globais. |
| **`OPERATIONS_MANAGER`** | Gestor Operacional / Engenharia | Supervisão da geração, monitorização de ativos BESS, despacho e validação final de OTs complexas. |
| **`COMMERCIAL_MANAGER`** | Gestor Comercial / Atendimento | Gestão da carteira de clientes, aprovação de contratos, campanhas comerciais e tarifários. |
| **`FINANCE`** | Responsável Financeiro | Reconciliação bancária/móvel, validação de receitas, aprovação de estornos e fecho contabilístico. |
| **`FIELD_TECHNICIAN`** | Técnico de Campo / Eletricista | Instalação e manutenção de contadores, vistorias, execução física de OTs e recolha de leituras via PWA. |
| **`COMMUNITY_AGENT`** | Agente Comunitário | Ponto de contacto presencial na aldeia, venda de tokens STS em dinheiro vivo e registo de candidaturas. |
| **`AUDITOR_PARTNER`** | Auditor Externo / Parceiro | Consulta e fiscalização de indicadores de eletrificação, impacto social e relatórios regulatórios. |
| **`CUSTOMER`** | Consumidor / Cliente Final | Portal do cliente para consulta de consumos próprios, faturas, histórico de tokens e pedidos de apoio. |

---

## 3. Matriz Granular de Acesso por Entidade e Ação

### Legenda de Permissões:
* **C (Create):** Permissão para criar novos registos.
* **R (Read):** Permissão para consultar e visualizar dados (inclui pesquisa e detalhe).
* **U (Update):** Permissão para editar dados existentes (campos não bloqueados por auditoria).
* **D (Deactivate):** Permissão para desativar registo (*soft-delete* auditado; proibida eliminação física).
* **A (Approve):** Permissão para aprovar estados críticos (contratos, fecho de OTs, tarifas).
* **E (Execute):** Permissão para executar ações operacionais em campo (preencher checklist, associar selo).
* **REC (Reconcile):** Permissão para cruzar e validar transações financeiras com extratos bancários.
* **EXP (Export):** Permissão para exportar listagens para ficheiros CSV/Excel/PDF.
* **VOID (Void/Revert):** Permissão para solicitar ou autorizar anulação/estorno de lançamentos.

---

### Tabela Matriz de Permissões

| Entidade / Módulo | `ADMIN` | `OPERATIONS_MANAGER` | `COMMERCIAL_MANAGER` | `FINANCE` | `FIELD_TECHNICIAN` | `COMMUNITY_AGENT` | `AUDITOR_PARTNER` | `CUSTOMER` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Mini-Redes & Subestações** | C, R, U, D, EXP | C, R, U, EXP | R | R | R *(local)* | R *(local)* | R, EXP | — |
| **Traçado de Rede & GIS** | C, R, U, D, EXP | C, R, U, EXP | R | — | R, U *(local)* | R *(local)* | R | — |
| **Ativos Técnicos (Painéis/BESS)** | C, R, U, D, EXP | C, R, U, A, EXP | R | R | R, U *(manutenção)* | — | R, EXP | — |
| **Clientes & Candidaturas** | C, R, U, D, EXP | R | C, R, U, A, EXP | R | R *(local)* | C, R *(local)* | R *(mascarado)* | R *(próprio)* |
| **Contratos de Fornecimento** | C, R, U, D, EXP | R | C, R, U, A, EXP | R | R *(local)* | R *(local)* | R | R *(próprio)* |
| **Parque de Contadores** | C, R, U, D, EXP | R, U | R, U | R | C, R, U, E | R *(local)* | R | R *(próprio)* |
| **Leituras de Consumo** | C, R, U, D, EXP | R, EXP | R, EXP | R, EXP | C, R, E | C, R *(local)* | R, EXP | R *(próprio)* |
| **Estrutura Tarifária** | C, R, U, D, EXP | R | R, U | R, A | — | R *(consulta)* | R | R *(consulta)* |
| **Faturação Pós-Paga** | C, R, U, D, EXP | R | C, R, U, EXP | R, A, EXP | — | R *(local)* | R, EXP | R *(próprio)* |
| **Tokens Pré-Pagos STS** | C, R, U, EXP | R | R, EXP | R, EXP | — | C, R, E *(venda)* | R, EXP | R *(próprio)* |
| **Pagamentos & Caixa** | C, R, U, EXP | R | R, EXP | C, R, U, REC, EXP | — | C, R, E *(recibos)* | R, EXP | R *(próprio)* |
| **Reversões / Estornos** | C, R, U, A | — | Solicitar (VOID) | Autorizar (A, VOID) | — | — | R | — |
| **Ordens de Trabalho (OTs)** | C, R, U, D, EXP | C, R, U, A, EXP | C, R *(comercial)* | R | R, E, U *(fecho)* | Solicitar | R, EXP | R *(próprias)* |
| **Relatórios Executivos** | C, R, EXP | C, R, EXP | C, R, EXP | C, R, EXP | — | — | R, EXP | — |
| **Relatórios Oficiais ARENE** | C, R, A, EXP | C, R, A, EXP | R, EXP | R, A, EXP | — | — | R, EXP | — |
| **Configurações & Utilizadores**| C, R, U, D | — | — | — | — | — | — | — |
| **Trilha de Auditoria (Logs)** | R, EXP | R | — | R *(financeiro)* | — | — | R, EXP | — |

---

## 4. Regras de Segregação de Funções (SoD)

Para salvaguardar o património da LECASU e a integridade perante os clientes, vigoram as seguintes restrições de sistema:

1. **Validação de Ordens de Trabalho:**
   * O técnico de campo (`FIELD_TECHNICIAN`) que executa a OT física e submete o fecho de campo **não tem permissão** para validar/encerrar administrativamente a ordem.
   * A validação final cabe obrigatoriamente ao Gestor Operacional (`OPERATIONS_MANAGER`) ou Gestor Comercial (`COMMERCIAL_MANAGER`).

2. **Fluxo de Estornos e Reversões Financeiras (Regra dos Quatro Olhos):**
   * Agentes Comunitários (`COMMUNITY_AGENT`) e operadores de atendimento **não podem** anular pagamentos ou estornar vendas STS.
   * Caso ocorra um erro material (e.g., digitação errada do número do contador), o pedido de anulação deve ser submetido formalmente pelo `COMMERCIAL_MANAGER` com justificação detalhada.
   * A autorização e emissão da transação de compensação cabe **exclusivamente** ao perfil `FINANCE`.

3. **Alteração de Parâmetros Tarifários:**
   * Apenas o `ADMIN` e o `COMMERCIAL_MANAGER` com parecer favorável do `FINANCE` podem criar ou alterar versões de tabelas tarifárias.
   * As tarifas entram em vigor com carimbo de aprovação e data de vigência, não podendo ter efeitos retroativos sobre faturas já liquidadas.

4. **Tratamento de Contadores Danificados / Suspeita de Fraude:**
   * O técnico de campo pode sinalizar um contador sob suspeita de manipulação ou by-pass através de uma OT de fiscalização.
   * A desassociação ou substituição física do contador só se torna efetiva no sistema após aprovação da ordem pelo `OPERATIONS_MANAGER`.

---

## 5. Escopo Geográfico e Políticas de Acesso Territorial

1. **Utilizadores de Escopo Geral (Acesso Multi-Concessão):**
   * `ADMIN`, `OPERATIONS_MANAGER`, `COMMERCIAL_MANAGER`, `FINANCE` e `AUDITOR_PARTNER` têm visibilidade transversal sobre todas as mini-redes operadas pela LECASU em Moçambique, podendo filtrar por Província, Distrito ou Central.

2. **Utilizadores de Escopo Local (Acesso Monoconcecional):**
   * Cada conta de `FIELD_TECHNICIAN` e `COMMUNITY_AGENT` está vinculada a uma ou mais mini-redes específicas no momento da sua criação cadastral.
   * As APIs do sistema barram automaticamente qualquer tentativa de aceder, visualizar ou transacionar clientes, contadores ou OTs pertencentes a concessões distintas daquelas a que o utilizador está autorizado.

3. **Política de Autenticação e Sessão:**
   * Os utilizadores de campo utilizam autenticação por PIN seguro de 6 dígitos ou palavra-passe com token JWT associado ao dispositivo PWA.
   * Em caso de perda ou roubo de telemóvel de um agente ou técnico, o `ADMIN` pode revogar a sessão remotamente com efeito imediato, bloqueando a sincronização offline pendente até apuramento de auditoria.

