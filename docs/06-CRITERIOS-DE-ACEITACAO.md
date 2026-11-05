# 06 — Critérios de Aceitação e Cenários de Teste
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Critérios de Aceitação Formais e Cenários de Verificação (BDD / Gherkin)  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Referências Centrais:** PRD Consolidada (`docs/02-PRD-CONSOLIDADA.md`), Catálogo de Requisitos (`docs/03-CATALOGO-DE-REQUISITOS.md`) e Regras de Negócio (`docs/05-REGRAS-DE-NEGOCIO.md`)  
**Responsável:** Garantia de Qualidade de Software (QA) e Engenharia de Sistemas  
**Data de Emissão:** 05 de Novembro de 2026  
**Estado:** Submetido para Validação e Aprovação Formal  

---

## 1. Metodologia de Aceitação

Para assegurar que o desenvolvimento posterior seja 100% verificável, auditável e sem ambiguidades, todos os critérios de aceitação foram estruturados no formato internacional **BDD / Gherkin**:
* **Dado que (Given):** O contexto ou pré-condição inicial do sistema.
* **Quando (When):** A ação executada pelo utilizador ou evento disparado pelo sistema.
* **Então (Then):** O resultado esperado observável, garantindo validações de negócio e persistência na base de dados.

---

## 2. Cenários de Aceitação por Processo Crítico

### 2.1 Processo 1: Onboarding de Mini-Rede e Georreferenciação

#### Cenário CA-01: Cadastro de nova central fotovoltaica com coordenadas válidas (Sucesso)
* **Dado que** o utilizador está autenticado com o perfil `OPERATIONS_MANAGER` ou `ADMIN`,
* **E** está na vista de cadastro de mini-redes,
* **Quando** preenche os campos obrigatórios: Nome da Mini-Rede ("Mini-Rede de Mavume"), Província ("Inhambane"), Distrito ("Funhalouro"), Coordenadas GPS válidas (`-23.7541, 35.1234`), Potência Solar (`120 kWp`) e Capacidade BESS (`240 kWh`),
* **E** clica em "Criar Mini-Rede",
* **Então** o sistema deve persistir a mini-rede na base de dados com estado `Ativa`,
* **E** deve registar um log de auditoria com o autor da criação,
* **E** a central deve surgir renderizada no mapa com o respetivo marcador oficial e detalhes no painel lateral.

#### Cenário CA-02: Bloqueio de cadastro com potência negativa ou coordenadas inválidas (Erro)
* **Dado que** o utilizador está na interface de cadastro de mini-rede,
* **Quando** tenta submeter uma potência fotovoltaica negativa (`-50 kWp`) ou coordenadas GPS fora do território moçambicano,
* **Então** o sistema deve bloquear a submissão no cliente e no servidor com mensagem de erro clara: "A potência instalada deve ser superior a zero e as coordenadas devem ser válidas.",
* **E** nenhum registo deve ser criado na base de dados.

---

### 2.2 Processo 2: Cadastro de Cliente e Criação de Contrato

#### Cenário CA-03: Cadastro completo de cliente individual com documento legal (Sucesso)
* **Dado que** o utilizador tem perfil `COMMERCIAL_MANAGER` ou `COMMUNITY_AGENT`,
* **Quando** submete os dados de um novo cliente: Nome Completo ("Alberto Chissano"), Contacto Móvel Válido ("+258 84 123 4567"), Tipo de Documento ("BI"), Número ("110100234567M") e Coordenadas do Local de Consumo,
* **Então** o sistema gera um código único e estruturado para o cliente (ex: `CLI-MAV-001`),
* **E** o cliente transita para o estado `Ativo`, ficando apto a receber um contrato.

#### Cenário CA-04: Associação de contador com validação de unicidade (Exceção)
* **Dado que** existe um contrato ativo para o cliente `CLI-MAV-001`,
* **Quando** o técnico tenta associar um contador cujo número de série já se encontra vinculado a outro contrato ativo no sistema,
* **Então** o sistema deve rejeitar a operação exibindo o alerta: "O contador com número de série informado já se encontra ativo no contrato CLI-MAV-089.",
* **E** o vínculo não deve ser gravado até que ocorra a desassociação formal prévia.

---

### 2.3 Processo 3: Venda de Energia Pré-Paga STS e Amortização de Dívidas

#### Cenário CA-05: Emissão de token STS para cliente sem dívidas (Sucesso)
* **Dado que** o cliente `CLI-MAV-001` possui contador STS ativo (Nº Série `01234567890`) e saldo devedor zero,
* **Quando** o cliente efetua um pagamento de `500,00 MT` via M-Pesa com referência confirmada,
* **Então** o motor tarifário aplica a tarifa em vigor (ex: `10,00 MT/kWh`), apurando `50,00 kWh` líquidos,
* **E** o gerador STS emite um token de 20 dígitos numéricos no formato `XXXX-XXXX-XXXX-XXXX-XXXX`,
* **E** a transação é gravada na conta corrente do cliente como liquidada,
* **E** é disparado um SMS automático com o código do token para o número móvel do cliente.

#### Cenário CA-06: Emissão de token STS com amortização automática de dívida (Regra Especial)
* **Dado que** o cliente `CLI-MAV-002` possui contador STS ativo e uma dívida acumulada de `600,00 MT`,
* **E** a percentagem parametrizada de amortização da concessão é de `25%`,
* **Quando** o cliente compra `200,00 MT` de eletricidade,
* **Então** o sistema retém automaticamente `50,00 MT` ($25\%$ de $200\text{ MT}$) para amortização da dívida,
* **E** a dívida em conta corrente é reduzida de `600,00 MT` para `550,00 MT`,
* **E** os `150,00 MT` restantes são convertidos na quantidade proporcional de kWh gerando o token STS de 20 dígitos,
* **E** o recibo emitido e o SMS discriminam: `Valor Pago: 200 MT | Amortizado: 50 MT | Dívida Restante: 550 MT | Energia: 15 kWh | Token: XXXX-XXXX-XXXX-XXXX-XXXX`.

---

### 2.4 Processo 4: Registo de Leituras e Faturação Pós-Paga

#### Cenário CA-07: Processamento de fatura mensal regular pós-paga (Sucesso)
* **Dado que** o contador do cliente `CLI-MAV-010` tinha leitura anterior de `1.200 kWh` no dia 25 do mês passado,
* **Quando** o técnico submete a leitura atual de `1.350 kWh` no fecho do ciclo,
* **Então** o sistema calcula o consumo exato de `150 kWh`,
* **E** aplica a tabela tarifária progressiva calculando o valor de energia, a taxa fixa e o IVA,
* **E** gera uma fatura com estado `Emitida`, data de vencimento a 10 dias e referência para pagamento móvel.

#### Cenário CA-08: Bloqueio de leitura com consumo negativo (Erro / Proteção)
* **Dado que** a leitura anterior registada era de `2.450 kWh`,
* **Quando** o operador insere acidentalmente `2.350 kWh` sem indicar rotação de mostrador,
* **Então** o sistema bloqueia a gravação exibindo o erro: "Leitura atual inferior à anterior (-100 kWh). Verifique o mostrador ou assinale rotação de escala.",
* **E** a leitura anterior permanece inalterada.

---

### 2.5 Processo 5: Reconciliação Financeira de Canais Móveis

#### Cenário CA-09: Reconciliação automática de extrato M-Pesa com transações GridOps (Sucesso)
* **Dado que** o Responsável Financeiro (`FINANCE`) acede ao módulo de reconciliação,
* **Quando** importa o ficheiro de extrato CSV oficial fornecido pela Vodacom M-Pesa,
* **Então** o sistema confronta cada linha do extrato com as transações pendentes no GridOps pelo ID da operadora e valor,
* **E** marca as correspondências exatas com o estado `Reconciliado`, atualizando o saldo bancário,
* **E** gera uma lista separada para transações com divergência de montante ou data.

---

### 2.6 Processo 6: Reversão e Estorno de Transação com Quatro Olhos

#### Cenário CA-10: Fluxo completo de estorno com dupla aprovação (Governação SoD)
* **Dado que** foi registado um pagamento manual incorreto de `1.500,00 MT` no cliente errado,
* **Quando** o Gestor Comercial (`COMMERCIAL_MANAGER`) submete um pedido de estorno fundamentado com justificação textual,
* **Então** a transação passa para o estado `Pendente de Aprovação Financeira`, sem alterar ainda o saldo,
* **E** o Responsável Financeiro (`FINANCE`) recebe a notificação no painel de aprovações,
* **Quando** o Responsável Financeiro revê os comprovativos e clica em "Autorizar Estorno",
* **Então** o sistema gera uma transação de compensação a débito de `1.500,00 MT`,
* **E** atualiza a conta corrente sem eliminar o registo original,
* **E** arquiva a dupla assinatura digital no log de auditoria imutável.

---

### 2.7 Processo 7: Execução de Ordem de Trabalho em Campo e SLA

#### Cenário CA-11: Fecho de OT em campo com recolha obrigatória de evidências (Sucesso)
* **Dado que** o técnico de campo tem uma OT atribuída com prioridade Alta (SLA 4h) para reparação de disjuntor,
* **Quando** conclui a reparação física e preenche o formulário de fecho: coordenadas GPS locais, peças substituídas e 2 fotos obrigatórias (antes e depois),
* **Então** o sistema calcula o tempo real decorrido desde a abertura,
* **E** transita a OT para o estado `Concluída em Campo`,
* **E** sinaliza conformidade de cumprimento do SLA no painel do supervisor.

#### Cenário CA-12: Bloqueio de fecho de OT sem evidência fotográfica (Erro)
* **Dado que** o técnico está a submeter o encerramento de uma OT em campo,
* **Quando** tenta gravar a conclusão sem efetuar o upload de fotografias da intervenção,
* **Então** o sistema bloqueia o envio com a mensagem: "É obrigatório anexar no mínimo duas fotografias comprovativas para concluir a Ordem de Trabalho.",
* **E** a OT mantém-se no estado `Em Execução`.

---

### 2.8 Processo 8: Desligação por Incumprimento e Religação

#### Cenário CA-13: Emissão de ordem de corte após esgotamento de prazo e aviso (Sucesso)
* **Dado que** um cliente pós-pago tem fatura vencida há mais de 30 dias,
* **E** o sistema disparou um SMS de aviso formal prévio há mais de 48 horas úteis,
* **Quando** o motor de cobrança executa a rotina diária em dia útil,
* **Então** é gerada uma Ordem de Trabalho de `Desligação por Inadimplência`,
* **E** o contrato do cliente transita para o estado `Suspenso por Dívida`.

#### Cenário CA-14: Emissão imediata de OT de religação prioritária pós-liquidação (Sucesso)
* **Dado que** o cliente `CLI-MAV-034` está com fornecimento cortado e contrato suspenso,
* **Quando** efetua a liquidação integral da dívida pendente acrescida da taxa oficial de religação,
* **Então** o sistema confirma a liquidação em tempo real,
* **E** gera imediatamente uma OT prioritária de `Religação de Fornecimento` com SLA máximo de 12 horas úteis,
* **E** notifica o técnico de campo e o cliente da emissão da ordem.

---

### 2.9 Processo 9: Operação Offline no PWA e Sincronização

#### Cenário CA-15: Recolha de leituras em aldeia sem rede GSM e sincronização posterior (Offline-First)
* **Dado que** o técnico de campo está numa zona sem rede móvel (modo offline ativo na PWA),
* **Quando** recolhe 25 leituras de contadores ao longo da rota,
* **Então** as leituras são salvas na base local (IndexedDB) com UUIDs próprios e estado `Pendente de Sincronização`,
* **E** a interface exibe o indicador "25 registos em cache local",
* **Quando** o técnico regressa a uma zona com conectividade à internet,
* **Então** a PWA dispara automaticamente o processo de sincronização em segundo plano,
* **E** o servidor processa as 25 leituras de forma idempotente sem duplicidades,
* **E** a interface atualiza o estado para "Todos os dados sincronizados com sucesso".

---

## 3. Matriz de Rastreabilidade (Requisitos $\leftrightarrow$ Critérios de Aceitação)

| Requisito Funcional | Critério de Aceitação BDD Correspondente | Tipo de Verificação |
| :--- | :--- | :--- |
| **RF-M01-001 / RF-M01-004** | CA-01 (Cadastro de Central) e CA-02 (Validações GIS) | Teste Funcional de Cadastro e Mapa |
| **RF-M02-001 / RF-M02-004** | CA-03 (Cadastro de Cliente) e CA-04 (Unicidade de Contador) | Teste de Integridade Referencial |
| **RF-M04-002 / RF-M04-006** | CA-05 (Token STS Regular) e CA-06 (Amortização de Dívida) | Teste de Cálculo Tarifário e Vending |
| **RF-M03-003 / RF-M04-003** | CA-07 (Faturação Pós-Paga) e CA-08 (Consumo Negativo) | Teste Metrológico e Motor de Faturação |
| **RF-M04-007** | CA-09 (Reconciliação M-Pesa / Bancária) | Teste de Processamento Financeiro em Lote |
| **RF-M04-008** | CA-10 (Fluxo de Estorno em Quatro Olhos) | Teste de Segregação de Funções (SoD) |
| **RF-M06-001 / RF-M06-004** | CA-11 (Fecho de OT com Fotos) e CA-12 (Bloqueio sem Evidências) | Teste de Regras de O&M e Evidências |
| **RF-M06-007 / RF-M06-008** | CA-13 (Corte por Dívida) e CA-14 (Religação Prioritária) | Teste de Ciclo Comercial e Cobrança |
| **RNF-OFFLINE-001 a 004** | CA-15 (PWA Offline e Sincronização Idempotente) | Teste de Resiliência de Rede e Cache |
