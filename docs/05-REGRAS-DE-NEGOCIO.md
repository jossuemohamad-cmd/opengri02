# 05 — Documento de Regras de Negócio
## LECASU GridOps — Plataforma Integrada de Gestão de Mini-Redes de Energia

**Documento:** Especificação Aprofundada de Regras de Negócio e Estados Operacionais  
**Projeto:** LECASU GridOps  
**Organização Promotora:** LECASU, Lda.  
**Referências Centrais:** Nota Conceptual e Especificação Funcional v1.0 (`docs/PRD.md`), PRD Consolidada (`docs/02-PRD-CONSOLIDADA.md`) e Diretrizes de Governação (`AGENTS.md`)  
**Responsável:** Análise de Sistemas, Engenharia Financeira e Regulação Energética  
**Data de Emissão:** 05 de Novembro de 2026  
**Estado:** Submetido para Validação e Aprovação Formal  

---

## 1. Princípios Gerais e Enquadramento Regulatório

As regras de negócio do **LECASU GridOps** foram estruturadas para garantir o equilíbrio entre:
* **Viabilidade Económico-Financeira da Operadora (LECASU):** Garantia de cobrança, combate ativo a perdas não técnicas e controlo rigoroso de caixa.
* **Acessibilidade e Equidade Social:** Proteção de famílias de baixos rendimentos através de tarifas sociais e mecanismos humanizados de cobrança de dívidas.
* **Conformidade Regulatória em Moçambique:** Respeito integral pelo quadro legal da Autoridade Reguladora de Energia (**ARENE**), Fundo de Energia (**FUNAE**) e regulamentos de concessão de mini-redes isoladas.

---

## 2. Regras de Tarifários e Faturação (RN-TAR)

### RN-TAR-001: Estrutura Tarifária por Escalões de Consumo
1. O sistema deve suportar tabelas tarifárias progressivas por escalões de energia consumida no mês civil (kWh/mês), diferenciadas por categoria de consumidor:
   * **Escalão 1 (Social / Subsistência):** Consumo básico até $X\text{ kWh/mês}$ (ex: $0 - 30\text{ kWh}$), com tarifa bonificada por kWh.
   * **Escalão 2 (Doméstico Geral):** Consumo intermédio (ex: $31 - 100\text{ kWh}$), com tarifa de custo pleno.
   * **Escalão 3 (Doméstico Intensivo):** Consumo elevado (ex: $> 100\text{ kWh}$), com tarifa desincentivadora de sobrecarga do BESS.
   * **Tarifa PUE (Usos Produtivos):** Tarifa especial direcionada a equipamentos de geração de rendimento (moageiras, marcenarias, soldadura, bombas solares, refrigeração comercial), podendo conter preços diferenciados para horários de ponta solar (geração direta fotovoltaica entre as 09:00 e as 15:00).
2. **Impostos e Taxas:** O sistema deve calcular o IVA (Taxa legal de Moçambique: 16%) quando legalmente aplicável e taxas regulatórias obrigatórias de forma parametrizada.

### RN-TAR-002: Taxa de Disponibilidade e Potência Contratada
1. Contratos de fornecimento podem conter uma **Taxa Fixa de Disponibilidade de Rede** (cobrada mensalmente independentemente do consumo de energia).
2. Para clientes em regime pré-pago STS, a taxa de disponibilidade é deduzida na primeira compra de energia de cada mês civil. Caso o cliente passe o mês inteiro sem comprar energia, a taxa acumula como saldo devedor na sua conta corrente.

---

## 3. Regras de Pré-Pagamento STS e Pós-Pagamento (RN-FAT)

### RN-FAT-001: Venda de Energia Pré-Paga STS (IEC 62055-41)
1. A emissão de créditos pré-pagos deve cumprir rigorosamente o standard internacional STS (Standard Transfer Specification).
2. Ao introduzir o montante em dinheiro ou ao receber a notificação de pagamento móvel (M-Pesa/e-Mola):
   * O sistema valida se o número de série do contador é um equipamento STS registado e ativo.
   * O sistema apura a tarifa vigente do contrato associado.
   * Deduzem-se eventuais amortizações de dívida prioritárias (conforme RN-FIN-002) e taxas fixas devidas.
   * O valor líquido restante é convertido em quantidade de energia em quilowatt-hora ($E_{\text{kWh}} = V_{\text{liquido}} / \text{Tarifa}_{\text{kWh}}$).
   * O gerador STS computa o **Token Criptografado de 20 Dígitos Decimais**.
   * O token é persistido de forma imutável e enviado por SMS ao telemóvel do cliente.

### RN-FAT-002: Ciclo de Faturação Pós-Paga
1. **Data de Fecho de Ciclo:** Definida no dia 25 de cada mês civil para todos os clientes pós-pagos.
2. **Janela de Recolha de Leituras:** Entre o dia 25 e o dia 28 do mês.
3. **Emissão de Fatura:** Dia 01 do mês seguinte, com prazo de vencimento a 10 dias de calendário (vencimento a dia 10).
4. **Composição da Fatura Pós-Paga:**
   $$\text{Total a Pagar} = (\text{Consumo Medido (kWh)} \times \text{Tarifa}) + \text{Taxa Fixa} + \text{IVA} + \text{Saldo Devedor Anterior} - \text{Créditos}$$
5. As faturas não liquidadas até ao vencimento entram automaticamente em estado *Vencida*.

---

## 4. Regras de Cálculo de Consumo e Validação Metrológica (RN-MED)

### RN-MED-001: Fórmula de Cálculo do Consumo Faturável
1. O consumo de energia de um período é calculado por:
   $$\text{Consumo (kWh)} = \text{Leitura Atual} - \text{Leitura Anterior}$$
2. **Rotação Completa de Mostrador:** Se a leitura atual for menor que a leitura anterior devido ao estouro do mostrador mecânico (ex: passou de 99.998 para 00.015 num mostrador de 5 dígitos), o cálculo deve computar:
   $$\text{Consumo} = (100.000 - \text{Leitura Anterior}) + \text{Leitura Atual}$$
   Este evento requer sinalização técnica e anexação obrigatória da fotografia do mostrador.

### RN-MED-002: Filtros de Deteção de Anomalias de Medição
1. **Consumo Negativo:** O sistema bloqueia imediatamente a submissão de leituras que resultem em consumo negativo sem justificação de rotação, exigindo nova verificação.
2. **Consumo Anormalmente Elevado:** Se o consumo apurado for superior a $300\%$ da média móvel dos últimos 3 meses do cliente, o sistema emite um alerta de *Consumo Excessivo* e encaminha a leitura para validação do Gestor Comercial antes de faturar.
3. **Consumo Zero Consecutivo:** Se um cliente ativo registar consumo zero por 2 meses consecutivos, o sistema gera automaticamente uma Ordem de Trabalho de **Fiscalização de Fraude / Inviolabilidade de Contador**.

---

## 5. Regras de Gestão de Saldos, Créditos e Dívidas (RN-FIN)

### RN-FIN-001: Conta Corrente do Consumidor
1. Cada contrato de cliente possui uma Conta Corrente associada, composta por:
   * **Saldo Credor:** Adiantamentos de pagamentos efetuados pelo cliente que cobrem faturas futuras.
   * **Saldo Devedor:** Faturas pós-pagas vencidas, taxas de ligação parceladas ou taxas de religação pendentes.
2. Pagamentos efetuados abatem primeiro as dívidas mais antigas (critério FIFO - *First In, First Out*).

### RN-FIN-002: Amortização Automática de Dívida no Pré-Pago STS
1. Quando um cliente que possui saldo devedor em conta corrente efetua uma compra de token pré-pago STS:
   * O sistema aplica uma regra de amortização parcial (percentagem parametrizável, recomendada em $20\%$ a $30\%$ do valor da recarga).
   * **Exemplo Prático:** Se o cliente deve $500\text{ MT}$ e efetua uma recarga de $200\text{ MT}$ com retenção de $25\%$:
     - $50\text{ MT}$ são imediatamente deduzidos da dívida (reduzindo-a para $450\text{ MT}$).
     - $150\text{ MT}$ líquidos são convertidos em eletricidade gerando o token STS.
   * O recibo discrimina expressamente: Montante Pago, Valor Amortizado, Saldo Devedor Remanescente e kWh Gerados.
   * Esta regra impede o corte de fornecimento permitindo a recuperação gradual do crédito pela LECASU.

---

## 6. Regras de Pagamentos e Reconciliação Financeira (RN-PAG)

### RN-PAG-001: Unicidade e Identificador de Transação
1. Toda e qualquer entrada de fundos no sistema deve possuir uma Chave Única de Transação (`transaction_reference`).
2. Para transações móveis (M-Pesa, e-Mola, mKesh), a chave é o ID fornecido pela operadora (ex: `8J271G6TY`). O sistema rejeita categoricamente qualquer tentativa de reinserir um ID de transação já processado (prevenção contra ataques de repetição).

### RN-PAG-002: Regras de Caixa de Agentes Comunitários
1. Os agentes comunitários que recolhem dinheiro vivo possuem um limite de crédito e teto máximo de caixa diário.
2. Ao atingir o limite estipulado, o sistema bloqueia novas emissões de tokens STS pelo agente até que este efetue o depósito de prestação de contas na conta bancária ou na carteira corporativa da LECASU.

### RN-PAG-003: Reconciliação Bancária e Auditoria
1. O Responsável Financeiro importa periodicamente os ficheiros de extrato oficial das operadoras e bancos.
2. O algoritmo de reconciliação automática cruza montante, carimbo temporal (janela de tolerância $\pm 5\text{ minutos}$) e referência do operador.
3. Transações órfãs (dinheiro recebido na conta sem contador identificado ou token emitido sem correspondência no extrato) são movidas para uma fila de *Divergências Pendentes de Conciliação*.

---

## 7. Regras de Reversões e Cancelamentos de Transações (RN-REV)

### RN-REV-001: Proibição de Eliminação ou Edição Direta
1. É formalmente proibido anular, editar ou apagar qualquer recibo ou transação aprovada na base de dados.
2. A correção de qualquer erro financeiro ou metrológico deve ser efetuada obrigatoriamente através de uma **Transação de Compensação / Estorno Auditado** que anula contabilmente o efeito da transação original, mantendo o histórico de ambas intacto.

### RN-REV-002: Fluxo de Aprovação em Quatro Olhos
1. **Iniciação:** Apenas o Gestor Comercial (`COMMERCIAL_MANAGER`) pode abrir um pedido formal de estorno, indicando: ID da Transação original, motivo fundamentado e ficheiros comprovativos (e.g. captura de ecrã ou declaração do cliente).
2. **Autorização:** Apenas o Responsável Financeiro (`FINANCE`) pode aprovar ou rejeitar o estorno.
3. **Efeito Operacional:** Em contadores STS, se o token incorreto já tiver sido gerado, o estorno financeiro não invalida o token no contador físico; o ajuste deve ser refletido na conta corrente ou emitido um token técnico de ajuste conforme procedimentos do fabricante.

---

## 8. Regras de Ordens de Trabalho e Manutenção (RN-OT)

### RN-OT-001: Estados e Transições de Ordens de Trabalho

```
   [ ABERTA ]  ------------------------+
       |                               |
       v                               |
 [ ATRIBUÍDA ]                         |
       |                               |
       v                               v
[ EM DESLOCAÇÃO ]               [ CANCELADA ]
       |                         (com motivo)
       v
[ EM EXECUÇÃO ]
       |
       v
[ CONCLUÍDA EM CAMPO ]
       |
       v
[ AUDITADA / ENCERRADA ]
```

1. **Aberta:** Criada no sistema por solicitação comercial, alarme de telemetria ou queixa.
2. **Atribuída:** Designada a um técnico de campo específico com mini-rede correspondente.
3. **Em Deslocação:** Técnico confirma início de rota até ao local da intervenção.
4. **Em Execução:** Técnico inicia o preenchimento do checklist técnico no local.
5. **Concluída em Campo:** Técnico finalizou a intervenção física, anexou as fotografias obrigatórias, registou peças gastas e recolheu assinatura do cliente/técnico.
6. **Auditada / Encerrada:** Supervisor operacional valida a qualidade técnica e fecha formalmente a OT.
7. **Cancelada:** Apenas o gestor pode cancelar uma OT, sendo obrigatório preencher a justificação do cancelamento no log de auditoria.

### RN-OT-002: Prazos de Atendimento (SLA)
* **OT de Criticidade Alta (Perigo iminente de choque, incêndio, corte geral de central):** SLA de resolução $\le 4\text{ horas}$.
* **OT de Criticidade Média (Cliente isolado sem energia, avaria de inversor secundário):** SLA de resolução $\le 24\text{ horas}$.
* **OT de Criticidade Baixa (Vistoria preventiva, nova ligação programada, inspeção periódica):** SLA de resolução $\le 72\text{ horas}$.

---

## 9. Regras de Desligação e Religação de Fornecimento (RN-COR)

### RN-COR-001: Desligação por Incumprimento Contratual
1. Um cliente entra em processo de corte de fornecimento quando:
   * Possui fatura pós-paga vencida há mais de 30 dias de calendário.
   * Não possui plano de pagamento acordado ou incumpriu duas prestações consecutivas.
2. **Aviso Prévio Obrigatório:** O sistema deve disparar automaticamente um SMS e emitir notificação escrita com antecedência mínima obrigatória de **48 horas úteis** antes da execução física do corte.
3. Não são permitidas desligações em fins de semana, vésperas de feriados ou feriados nacionais de Moçambique, salvaguardando a capacidade de regularização do cliente.
4. Esgotado o prazo de 48 horas, o sistema gera a Ordem de Trabalho de **Desligação por Inadimplência**. O técnico desliga o disjuntor de ramal na caixa de derivação e sela a infraestrutura.

### RN-COR-002: Processo de Religação Imediata
1. A religação de fornecimento fica condicionada a:
   * Liquidação integral do montante em mora (ou pagamento da primeira prestação de plano de pagamento homologado pelo Comercial).
   * Pagamento da **Taxa Oficial de Religação** aprovada no tarifário.
2. Uma vez reconhecido o pagamento no sistema, é gerada automaticamente uma OT de **Religação Prioritária**, com SLA máximo de execução física de **12 horas úteis**.

---

## 10. Regras de Sincronização Offline e Operações Remotas (RN-SYNC)

### RN-SYNC-001: Armazenamento Local e Identificadores Universais (UUID)
1. Todos os registos gerados no modo offline em dispositivos de campo (leituras, checklists de OT, assinaturas) devem receber um identificador global único gerado no cliente (**UUID v4**).
2. O sistema em servidor nunca deve gerar chaves sequenciais primárias para eventos de campo que possam colidir em sincronização diferida.

### RN-SYNC-002: Princípio da Idempotência e Tratamento de Conflitos
1. A API de sincronização deve ser rigorosamente idempotente: submeter o mesmo pacote de sincronização repetidas vezes não pode duplicar registos nem inflacionar saldos.
2. **Resolução de Conflitos de Estado:**
   * Se o estado de um cliente ou OT tiver sido alterado no servidor enquanto o técnico esteve offline, a regra de resolução é:
     - **Dados Técnicos de Campo (Leitura de Contador, Fotos, Selos):** Prevalece o registo do técnico de campo com base no carimbo de data/hora real de recolha em campo.
     - **Dados Contratuais e Financeiros (Tarifa, Saldo, Suspensão Comercial):** Prevalece a regra mais restritiva de segurança do servidor central.
3. Toda e qualquer colisão resolvida pelo sistema é arquivada num log de auditoria de sincronização para inspeção do Administrador.

---

## 11. Decisões Pendentes (Aguardando Despacho Executivo da LECASU)

Para estrito cumprimento do princípio de fidelidade ao PRD e de não inventar requisitos, consolidam-se as seguintes cinco matérias sob reserva de validação final pela direção da LECASU:

| Nº | Tema da Decisão | Impacto Operacional / Técnico | Opções em Análise | Decisão Necessária |
| :---: | :--- | :--- | :--- | :--- |
| **01** | **Identificação de Clientes Sem Documentos** | Bloqueio de onboarding de clientes rurais sem BI ou NUIT formal. | **Opção A:** Atestado emitido pelo Chefe da Aldeia/Régulo.<br>**Opção B:** Declaração com duas testemunhas da comunidade. | Definir o documento supletivo legal aceite na concessão. |
| **02** | **Tabela Tarifária Oficial ARENE** | Cálculo da faturação e limites de consumo dos escalões. | **Opção A:** Tabela padrão piloto ($0-30\text{ kWh}$ Social a $X\text{ MT}$; $>30\text{ kWh}$ a $Y\text{ MT}$).<br>**Opção B:** Tarifa fixa com taxa de disponibilidade elevada. | Homologar a tabela de preços oficial aprovada pelo regulador. |
| **03** | **Tolerância Regulatória de Corte** | Prazo exato entre vencimento de fatura e emissão da OT de corte. | **Opção A:** 30 dias após vencimento + aviso de 48h.<br>**Opção B:** 15 dias para clientes comerciais / PUE. | Confirmar prazos contratuais de interrupção de fornecimento. |
| **04** | **Fluxo de Aprovação de Estornos** | Risco de fraude em anulação de pagamentos por operadores locais. | **Opção A:** Aprovação única pelo Gestor Comercial.<br>**Opção B:** Dupla aprovação obrigatória (Comercial + Financeiro). | Aprovar a política de segregação de funções e alçadas. |
| **05** | **Fornecedor do Vending STS** | Integração criptográfica dos tokens de 20 dígitos no piloto. | **Opção A:** Módulo de software proprietário via API de gateway STS.<br>**Opção B:** Algoritmo open-source IEC 62055-41 com chaves locais. | Definir o parceiro/equipamentos fornecedores de chaves STS. |
