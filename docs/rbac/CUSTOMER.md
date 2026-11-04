# Perfil de Acesso: CUSTOMER (Cliente / Consumidor Final)

## 1. Identificação do Perfil
* **Código Canónico:** `CUSTOMER`
* **Identificador na Base de Dados:** `cliente`
* **Estado no Ciclo de Vida do Projeto:** **Fase Posterior (Fora do Âmbito do MVP Imediato)**
* **Canal Previsto Futuro:** Portal Web do Cliente / Aplicação Móvel de Autoatendimento

---

## 2. Regra Anti-Alucinação para o Agente (Fase 1 - MVP)
> [!IMPORTANT]
> **BLOQUEIO FORMAL NO MVP:** O agente de desenvolvimento **NÃO DEVE** criar telas de autoatendimento, formulários de registo direto de clientes, portais de login para consumidores ou aplicações móveis para o consumidor final nesta fase.
>
> O foco no MVP é exclusivamente:
> 1. Modelação relacional da base de dados (tabelas `clients`, `contracts`, `meters`, `payments`).
> 2. Manutenção da chave primária `client_id` e integridade referencial nas transações operacionais.

---

## 3. Responsabilidades Futuras (Fase 2 / Expansão)
* Consulta em tempo real do saldo de energia pré-paga e histórico de consumo em kWh.
* Acesso e download de recibos de compra com tokens STS de 20 dígitos.
* Consulta de faturas em aberto e opções de pagamento via integração USSD/M-Pesa.
* Abertura de pedidos de assistência técnica e reporte de cortes de fornecimento.

---

## 4. Restrições & Escopo de Dados Futuro
* **Isolamento Absoluto por `customer_id`:** O utilizador cliente terá acesso **única e exclusivamente aos seus próprios dados**, contratos, contadores e pagamentos.
* ❌ **Totalmente Bloqueado:** Não tem visibilidade sobre nenhuma outra instalação, cliente, ativo da mini-rede ou configurações corporativas.

---

## 5. Matriz CRUD por Entidade (Projeção Futura)
| Entidade | Create | Read | Update | Delete |
| :--- | :---: | :---: | :---: | :---: |
| **Próprios Dados (`clients`)** | ❌ Não | ✅ Sim (Apenas o seu registo) | ❌ Solicitação prévia | ❌ Bloqueado |
| **Próprio Contrato (`contracts`)** | ❌ Não | ✅ Sim (Apenas o seu contrato) | ❌ Bloqueado | ❌ Bloqueado |
| **Próprio Contador (`meters`)** | ❌ Não | ✅ Sim (Apenas o seu medidor) | ❌ Bloqueado | ❌ Bloqueado |
| **Próprios Pagamentos (`payments`)**| ❌ Não | ✅ Sim (Histórico próprio) | ❌ Bloqueado | ❌ Bloqueado |
| **Outros Clientes / Geral** | ❌ Não | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |
| **Módulos Técnicos e O&M** | ❌ Não | ❌ Bloqueado | ❌ Bloqueado | ❌ Bloqueado |

