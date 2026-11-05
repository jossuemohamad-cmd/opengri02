# REGRAS GERAIS DO PROJECTO — LECASU GRIDOPS

## 1. Documento de referência obrigatório

O documento `docs/PRD.md` é a fonte principal de requisitos funcionais e de negócio do LECASU GridOps.

Antes de executar qualquer tarefa:

- Consulta o PRD.
- Identifica os requisitos relacionados com a tarefa.
- Respeita os módulos, processos, perfis de utilizador e critérios de aceitação definidos.
- Não inventes funcionalidades nem regras de negócio.
- Se uma informação não estiver definida, apresenta a dúvida e aguarda aprovação.

## 2. Regra de desenvolvimento

O projecto deve ser desenvolvido por etapas e módulos.

Não avances para o módulo seguinte sem:

- Concluir o módulo actual.
- Testar as funcionalidades.
- Corrigir os erros encontrados.
- Apresentar o resultado para revisão.
- Receber aprovação explícita.

## 3. Arquitectura e qualidade

- Mantém uma arquitectura organizada, modular e escalável.
- Evita duplicação de código.
- Separa frontend, backend, base de dados e lógica de negócio.
- Implementa validação de dados e tratamento de erros.
- Aplica permissões de acordo com os perfis definidos no PRD.
- Mantém histórico de auditoria nas operações relevantes.
- Prepara as operações de campo para funcionamento offline e sincronização posterior, conforme o PRD.

## 4. UX/UI

- Desenvolve uma interface profissional, consistente e intuitiva.
- Evita layouts genéricos de aplicações geradas por IA.
- Mantém consistência de tipografia, espaçamento, margens, paddings, cores e componentes.
- Evita excesso de cartões, botões e elementos desnecessários.
- Garante responsividade em desktop, tablet e dispositivos móveis.
- Não substituas interfaces aprovadas sem necessidade e autorização.
- Todos os botões, formulários, filtros e acções devem funcionar realmente.

## 5. Implementação real

Não entregues apenas protótipos ou interfaces estáticas.

As funcionalidades devem estar ligadas à lógica de negócio, backend e base de dados quando aplicável.

Não uses dados fictícios como substitutos permanentes de dados reais.

## 6. Controlo de alterações

Antes de alterações estruturais:

- Explica o que pretendes alterar.
- Identifica os ficheiros afectados.
- Apresenta o plano.
- Aguarda aprovação quando a alteração afectar arquitectura, dados ou funcionalidades já aprovadas.

## 7. Relatórios de progresso

No final de cada etapa, apresenta:

- O que foi concluído.
- Requisitos do PRD implementados.
- Ficheiros criados ou modificados.
- Testes executados e respectivos resultados.
- Problemas encontrados.
- Questões que precisam de decisão.
- Próxima etapa proposta.

## 8. Regra fundamental

O PRD prevalece sobre suposições do agente.

Se houver conflito entre uma sugestão técnica e um requisito aprovado, identifica o conflito e pede autorização antes de alterar o requisito.

Nunca avances automaticamente para a etapa seguinte.
