LECASU GridOps
Nota Conceptual e Especificação Funcional da Plataforma Integrada de Gestão de Mini-Redes
Documento de definição do produto, requisitos funcionais e roteiro para desenvolvimento do produto mínimo viável.
Elemento Informação
Entidade promotora LECASU, Lda.
Versão 1.0
Data Outubro de 2026
Estado Documento base para validação e desenvolvimento
Âmbito Operação, gestão comercial, manutenção e reporte de mini-redes

ENERGIA • CONECTIVIDADE • OPERAÇÃO • IMPACTO

Resumo executivo
O LECASU GridOps é uma plataforma digital proposta para centralizar a gestão operacional, comercial, técnica e social de uma carteira de mini-redes. A solução deverá permitir que cada mini-rede, cliente, contrato, contador, pagamento, activo e ocorrência técnica seja registado e acompanhado numa base de dados única, com representação geográfica e histórico auditável.
O produto será desenvolvido inicialmente como uma ferramenta interna da LECASU para apoiar a operação de projectos de electrificação rural. A sua arquitectura deverá, contudo, permitir a utilização por parceiros, financiadores, agentes comunitários, técnicos de campo e, numa fase posterior, outros operadores de mini-redes.
A primeira versão deverá concentrar-se no cadastro geográfico, gestão de clientes e contratos, registo de leituras e pagamentos, gestão de avarias e produção de relatórios. Integrações com contadores inteligentes, plataformas de pagamento móvel, sistemas de monitorização e aplicações para clientes deverão ser acrescentadas por fases.
Decisão de produto
O GridOps não deverá substituir sistemas de controlo industrial, EMS ou SCADA. A plataforma deverá funcionar como camada de gestão e inteligência do negócio, integrando dados técnicos dos equipamentos sempre que existam interfaces ou APIs compatíveis.
Resultados esperados
⦁ Uma visão única e actualizada das mini-redes, clientes, activos e operações.
⦁ Maior controlo sobre consumo, receitas, pagamentos, perdas e dívidas.
⦁ Registo estruturado de avarias, intervenções, tempos de resposta e custos de manutenção.
⦁ Relatórios consistentes para a gestão, entidades públicas, parceiros e financiadores.
⦁ Uma base tecnológica escalável para futuras operações de mini-redes da LECASU.
1 Enquadramento e objectivos
A operação de mini-redes exige a coordenação de informação técnica, comercial, financeira e comunitária. Quando estes dados são mantidos em folhas isoladas, mensagens, aplicações dos fabricantes ou arquivos físicos, torna-se difícil conhecer o estado real de cada instalação, reconciliar receitas, responder a avarias e demonstrar resultados.
O GridOps responde a esta necessidade através de uma plataforma modular, acessível por navegador e preparada para utilização móvel. A solução deverá suportar operações em localidades com conectividade limitada, mantendo os dados organizados e sincronizando-os quando a ligação estiver disponível.
1.1 Objectivo geral
Desenvolver uma plataforma integrada para registar, monitorizar e gerir mini-redes, clientes, contratos, consumo, pagamentos, activos, intervenções técnicas e indicadores de impacto.
1.2 Objectivos específicos
⦁ Georreferenciar mini-redes, rede de distribuição, activos e clientes.
⦁ Manter um cadastro único de clientes, contratos, contadores e ligações.
⦁ Registar e analisar consumo, vendas de energia, pagamentos e dívidas.
⦁ Gerir solicitações, avarias, ordens de trabalho e manutenção preventiva.
⦁ Calcular indicadores técnicos, comerciais, financeiros e sociais.
⦁ Produzir relatórios exportáveis e garantir rastreabilidade das alterações.
⦁ Disponibilizar integrações graduais com medição inteligente e pagamentos digitais.
1.3 Limites da primeira versão
O produto mínimo viável não deverá executar protecções eléctricas, controlo em tempo real de inversores, despacho automático de baterias ou funções críticas de SCADA. Também não deverá depender, na primeira versão, de uma marca específica de contador, inversor ou plataforma de pagamento.
1.4 Princípios de concepção
⦁ Fonte única de informação para evitar ficheiros e registos contraditórios.
⦁ Funcionamento offline nas tarefas de campo, com sincronização posterior.
⦁ Arquitectura modular e independente de uma única marca de equipamento.
⦁ Rastreabilidade das operações, alterações e aprovações.
⦁ Interfaces simples, adequadas a utilizadores técnicos e não técnicos.
⦁ Implementação por fases, orientada por resultados do piloto.
1.5 Benefícios operacionais
A adopção da plataforma deverá reduzir duplicações, melhorar a qualidade dos dados, acelerar a resposta a avarias, reforçar o controlo da receita e permitir que a LECASU demonstre o desempenho das mini-redes com evidências consistentes.

2 Utilizadores e níveis de acesso
A plataforma deverá aplicar controlo de acesso baseado em funções. Cada utilizador visualizará apenas os dados e acções necessários ao seu trabalho.
Perfil Responsabilidades Acesso principal
Administrador Configuração geral, utilizadores, permissões e parâmetros. Acesso integral e gestão do sistema.
Gestor de operações Acompanhamento de desempenho, ocorrências e equipas. Mini-redes, activos, ordens e painéis.
Gestor comercial Clientes, contratos, tarifas, pagamentos e cobrança. Módulos comercial e financeiro.
Técnico de campo Inspecções, leituras, avarias e intervenções. Aplicação móvel e ordens atribuídas.
Agente comunitário Cadastro, apoio ao cliente e sensibilização. Clientes e pedidos da localidade.
Financeiro Reconciliação, receitas, dívidas e relatórios. Pagamentos e relatórios financeiros.
Parceiro ou auditor Consulta de resultados e evidências autorizadas. Painéis e relatórios de leitura.
Cliente Consulta de consumo, saldo e pedidos, numa fase posterior. Portal ou aplicação do cliente.

3 Visão funcional da solução

Figura 1 Visão funcional do LECASU GridOps
A plataforma centraliza dados provenientes do cadastro de campo, medição, pagamentos e manutenção. A informação consolidada alimenta as operações diárias, a gestão comercial, os indicadores e os relatórios.
3.1 Componentes de utilização
Componente Função
Portal web Administração, planeamento, análise, gestão comercial e relatórios.
Aplicação móvel Cadastro, GPS, fotografias, leituras, inspecções e ordens de trabalho.
Base de dados central Registo único de entidades, históricos e relações.
Camada de integração Ligação a contadores, pagamentos, monitorização e notificações.
Motor de indicadores Cálculo de métricas técnicas, comerciais, financeiras e sociais.

4 Módulos funcionais
4.1 Cadastro de mini-redes e GIS
⦁ Registo do código, nome, província, distrito, localidade e coordenadas.
⦁ Capacidade fotovoltaica, armazenamento, potência de conversão e data de entrada em operação.
⦁ Mapa com perímetro de serviço, rede de distribuição, activos e clientes.
⦁ Estado operacional: planeada, em instalação, activa, parcialmente indisponível ou suspensa.
⦁ Associação de documentos, fotografias, desenhos e contactos locais.
4.2 Gestão de clientes e contratos
⦁ Cadastro de pessoa, negócio ou instituição, incluindo contactos e coordenadas.
⦁ Classificação residencial, comercial, institucional, telecomunicações, serviço público ou uso produtivo.
⦁ Registo de contrato, potência contratada, tarifa, caução e data de activação.
⦁ Histórico de alterações, suspensões, transferências e encerramento.
⦁ Associação do cliente à mini-rede, ramal e contador correctos.
4.3 Contadores, leituras e consumo
⦁ Inventário de contadores, números de série, tecnologia, estado e localização.
⦁ Leituras manuais, importação de ficheiros e integração futura por API.
⦁ Consumo por período, categoria, cliente e mini-rede.
⦁ Alertas de ausência de leitura, consumo anormal e possível fraude.
⦁ Histórico de substituição, calibração e manutenção do contador.
4.4 Tarifas, facturação e pagamentos
⦁ Configuração de tarifas, taxas e regras de facturação autorizadas.
⦁ Pré-pagamento, pós-pagamento ou modelos híbridos.
⦁ Registo de transacções, recibos, reversões e reconciliação.
⦁ Histórico de saldo, dívida, vencimentos e notificações.
⦁ Integração gradual com M-Pesa, e-Mola, mKesh e outros canais.

4.5 Gestão de activos
⦁ Registo hierárquico de centrais, inversores, baterias, quadros, transformadores, cabos, postes e protecções.
⦁ Número de série, fabricante, modelo, garantia, data de instalação e localização.
⦁ Histórico de inspecções, avarias, reparações, substituições e custos.
⦁ Documentos associados, incluindo fichas técnicas, manuais e relatórios.
4.6 Operação e manutenção
⦁ Pedidos de intervenção, incidentes, reclamações e manutenção programada.
⦁ Classificação de prioridade, impacto, responsável e prazo.
⦁ Ordem de trabalho com diagnóstico, actividades, materiais, fotografias e assinatura.
⦁ Tempos de resposta e resolução, indisponibilidade e causa raiz.
⦁ Plano de manutenção preventiva por activo e localidade.
4.7 Indicadores e relatórios
⦁ Painéis por mini-rede, período, cliente, categoria e região.
⦁ Exportação para Excel e PDF, com filtros e controlo de versões.
⦁ Relatórios técnicos, comerciais, financeiros, ambientais e sociais.
⦁ Perfis de relatório específicos para gestão, parceiros, financiadores e auditoria.
4.8 Comunicação e atendimento
⦁ Registo de pedidos, reclamações e comunicações com clientes.
⦁ Notificações de pagamento, saldo, interrupção programada e conclusão de intervenção.
⦁ SMS, correio electrónico e WhatsApp sujeitos a integrações autorizadas.
⦁ Histórico de contacto associado à ficha do cliente.
5 Identificação e codificação
Cada entidade deverá possuir um identificador único, legível e não reutilizável. O formato poderá ser configurado, mantendo um padrão central.
Entidade Exemplo Interpretação
Mini-rede MR-MPT-001 Mini-rede número 001 na região codificada MPT.
Cliente residencial MR001-RES-0001 Cliente residencial 0001 da mini-rede 001.
Uso produtivo MR001-PUE-0012 Cliente de uso produtivo 0012.
Contador MTR-MR001-0048 Contador 0048 associado à mini-rede 001.
Activo AST-MR001-INV-02 Segundo inversor da mini-rede 001.
Ordem de trabalho OT-2026-000145 Ordem de trabalho sequencial do ano 2026.

6 Estrutura de dados
O modelo de dados deverá preservar as relações entre localidade, mini-rede, cliente, contrato, contador, leitura, pagamento, activo e ocorrência. A eliminação física de registos operacionais deverá ser evitada; alterações relevantes devem manter histórico.
Entidade Campos essenciais
Mini-rede Código, nome, localização, coordenadas, capacidade, estado, datas e operador.
Cliente Código, nome, identificação, contacto, GPS, categoria, estado e consentimentos.
Contrato Número, cliente, tarifa, potência, datas, estado e documentos.
Contador Série, tipo, protocolo, estado, cliente, instalação e última comunicação.
Leitura Contador, data, energia, fonte, qualidade e utilizador ou sistema de origem.
Pagamento Referência, cliente, valor, data, canal, estado e reconciliação.
Activo Código, classe, modelo, série, garantia, localização e estado.
Ocorrência Tipo, prioridade, descrição, activo ou cliente, datas e estado.
Ordem de trabalho Ocorrência, técnico, actividades, materiais, evidências e aprovação.

6.1 Ficha mínima do cliente
⦁ Dados de identificação e contacto.
⦁ Coordenadas GPS, fotografia e referência de localização.
⦁ Mini-rede, ramal, fase e contador associado.
⦁ Categoria e finalidade do fornecimento.
⦁ Contrato, tarifa, potência e data de activação.
⦁ Consumo, pagamentos, saldo, dívida e ocorrências.
⦁ Informação de uso produtivo e impacto, quando aplicável.

7 Processos operacionais prioritários
Processo Fluxo resumido Resultado
Nova ligação Pedido → vistoria → contrato → contador → activação. Cliente activo e georreferenciado.
Leitura e cobrança Leitura → validação → cálculo → pagamento → reconciliação. Consumo e receita actualizados.
Avaria Registo → triagem → atribuição → intervenção → validação → fecho. Ocorrência resolvida com histórico.
Manutenção preventiva Plano → aviso → ordem → execução → evidências → próxima data. Activo mantido e calendário actualizado.
Desligação e religação Alerta → autorização → execução → regularização → religação. Estado comercial e técnico coerente.

8 Indicadores de desempenho
Dimensão Indicadores mínimos
Técnica Energia produzida e vendida; perdas; disponibilidade; interrupções; carga de pico; autonomia; estado dos activos.
Comercial Clientes activos; novas ligações; consumo por categoria; receita média; taxa de cobrança; dívida; saldo pré-pago.
Manutenção Ordens abertas; tempo de resposta; tempo médio de reparação; reincidência; custo por activo e mini-rede.
Financeira Receita; custos operacionais; margem operacional; custo de energia; reconciliação e valores não identificados.
Social Pessoas beneficiadas; escolas e unidades sanitárias; negócios; usos produtivos; mulheres e jovens abrangidos.
Ambiental Geração renovável; consumo de diesel evitado; emissões evitadas, quando exista metodologia validada.

8.1 Painel executivo
O painel executivo deverá apresentar a carteira de mini-redes num mapa e permitir filtragem por estado, região e período. Os principais indicadores devem incluir disponibilidade, energia, clientes, receitas, cobrança, perdas, avarias e usos produtivos.
9 Integrações
Integração Finalidade Prioridade
Contadores inteligentes Leituras, saldo, eventos e estado de comunicação. Alta, após validação do fabricante.
Sistemas EMS e SCADA Produção, armazenamento, alarmes e disponibilidade. Média.
Pagamentos móveis Cobrança, confirmação e reconciliação automática. Alta.
SMS e WhatsApp Alertas, avisos e atendimento ao cliente. Média.
Sistemas contabilísticos Lançamentos, receitas, impostos e reconciliação. Média.
Mapas e geocodificação Visualização espacial e apoio às equipas de campo. Alta.

Cada integração deverá ser avaliada quanto à disponibilidade de API, custos, segurança, propriedade dos dados, limites de utilização e continuidade do fornecedor.
10 Requisitos não funcionais
Requisito Especificação inicial
Disponibilidade Acesso web fiável, com cópias de segurança e recuperação documentada.
Desempenho Operações comuns com resposta rápida em ligações móveis normais.
Escalabilidade Suporte a múltiplas mini-redes, regiões e organizações.
Mobilidade Interface responsiva e aplicação de campo preparada para modo offline.
Interoperabilidade APIs documentadas e formatos abertos para importação e exportação.
Auditabilidade Registo de utilizador, data, alteração e origem do dado.
Usabilidade Fluxos simples, linguagem clara e formação reduzida para tarefas de campo.

11 Segurança e governação de dados
⦁ Autenticação segura e, para perfis críticos, autenticação multifactor.
⦁ Permissões por função, organização, região e mini-rede.
⦁ Encriptação das comunicações e protecção das cópias de segurança.
⦁ Registos de auditoria não editáveis pelos utilizadores comuns.
⦁ Políticas de retenção, correcção, exportação e eliminação autorizada de dados.
⦁ Consentimento e informação adequada aos clientes sobre utilização dos seus dados.
⦁ Plano de resposta a incidentes e recuperação após falha.
⦁ Separação entre ambiente de desenvolvimento, testes e produção.
12 Produto mínimo viável
O MVP deve comprovar o fluxo completo de cadastro, operação, cobrança e intervenção numa mini-rede, evitando dependências de integrações externas ainda não contratadas.
Incluído no MVP Fora do MVP inicial
Cadastro de mini-redes, clientes, contratos, contadores e activos. Controlo eléctrico em tempo real.
Mapa GIS e recolha de coordenadas. Despacho automático de baterias.
Leituras e pagamentos manuais ou por importação. Integração com todas as marcas de contadores.
Avarias, ordens de trabalho e fotografias. Portal completo de auto-atendimento do cliente.
Painéis e relatórios exportáveis. Modelos avançados de inteligência artificial.
Utilizadores, permissões e auditoria. Aplicações nativas separadas para cada plataforma.

12.1 Critérios de aceitação do MVP

1.  Cadastrar uma mini-rede e visualizá-la no mapa.
2.  Cadastrar um cliente, associá-lo a contrato e contador e consultar o histórico.
3.  Registar leituras e visualizar consumo por período.
4.  Registar pagamento e actualizar a posição financeira do cliente.
5.  Abrir, atribuir e encerrar uma ordem de trabalho com evidências.
6.  Gerar relatório por mini-rede e exportá-lo.
7.  Aplicar permissões diferentes e registar alterações no histórico de auditoria.
8.  Executar cópia de segurança e demonstrar restauração controlada.
    13 Roteiro de implementação
    Fase Conteúdo Resultado
    0 Descoberta Validação de processos, utilizadores, formulários, tarifas e integrações. Requisitos aprovados e protótipo navegável.
    1 MVP Cadastro, GIS, clientes, contratos, leituras, pagamentos, O&M e relatórios. Piloto operacional numa mini-rede.
    2 Integração Contadores, pagamentos móveis, notificações e aplicação offline. Redução de tarefas manuais.
    3 Inteligência Previsões, anomalias, manutenção preditiva e painéis avançados. Optimização operacional e financeira.
    4 Produto Multi-organização, licenciamento, suporte e documentação comercial. Solução disponível para terceiros.

14 Riscos e medidas de controlo
Risco Impacto Medida proposta
Âmbito excessivo Atraso e aumento de custos. MVP fechado, prioridades e controlo formal de alterações.
APIs proprietárias Integrações indisponíveis ou dispendiosas. Validar fornecedores e manter importação manual como alternativa.
Conectividade limitada Dados atrasados no terreno. Modo offline, filas de sincronização e indicadores de estado.
Dados incorrectos Relatórios e cobrança inconsistentes. Validações, duplicados, revisão e auditoria.
Acesso indevido Exposição ou alteração de dados. Permissões, MFA, encriptação e monitorização.
Dependência do programador Dificuldade de manutenção. Código documentado, repositório controlado e transferência de conhecimento.
Mudança de equipamentos Integrações tornam-se obsoletas. Arquitectura modular e adaptadores por fornecedor.

15 Modelo de desenvolvimento e propriedade
Antes da contratação do desenvolvimento, a LECASU deverá definir por escrito a propriedade do código-fonte, base de dados, desenhos, documentação, domínio, contas de alojamento e credenciais. O contrato deve prever acesso ao repositório, entregas por marcos, correcção de erros, garantia, suporte e transferência de conhecimento.
A plataforma deverá ser construída de forma modular e documentada. Tecnologias específicas devem ser seleccionadas após validação do ambiente de alojamento, competências da equipa, custos recorrentes, requisitos de integração e necessidade de funcionamento offline.
16 Próximos passos

1.  Nomear o responsável de produto da LECASU e o grupo de validação.
2.  Mapear os processos actuais e os formulários utilizados no terreno.
3.  Validar o âmbito do MVP e classificar requisitos por prioridade.
4.  Desenhar os ecrãs e preparar um protótipo navegável.
5.  Definir o modelo de dados e as regras de codificação.
6.  Consultar fornecedores de contadores e pagamentos sobre APIs.
7.  Solicitar propostas técnicas e financeiras a equipas de desenvolvimento.
8.  Seleccionar uma mini-rede ou conjunto de dados para o piloto.
9.  Testar, formar utilizadores, corrigir e aprovar antes da expansão.
    17 Requisitos para pedido de proposta a programadores
    O pedido de proposta deverá exigir metodologia, arquitectura sugerida, plano de trabalho, composição da equipa, orçamento por fase, custos recorrentes, suporte, garantias e demonstração de projectos semelhantes. As propostas devem responder explicitamente a cada requisito do MVP.
    Entregável mínimo Condição de aprovação
    Protótipo navegável Fluxos principais validados pela LECASU.
    Código-fonte Disponível em repositório controlado pela LECASU.
    Base de dados Modelo documentado e scripts de instalação e migração.
    Ambientes Desenvolvimento, testes e produção separados.
    Testes Evidência de testes funcionais, segurança e recuperação.
    Documentação Manual de administração, utilizador, API e operação.
    Formação Sessões para administradores e utilizadores-chave.
    Garantia e suporte Prazos de resposta, correcção e manutenção definidos.

Anexo A Histórias de utilizador prioritárias
Código História de utilizador Prioridade
US-01 Como gestor, quero visualizar todas as mini-redes num mapa para conhecer o seu estado. Obrigatória
US-02 Como agente, quero cadastrar um cliente com GPS e fotografia, mesmo sem internet. Obrigatória
US-03 Como comercial, quero associar contrato e contador ao cliente. Obrigatória
US-04 Como operador, quero registar leituras e consultar consumos históricos. Obrigatória
US-05 Como financeiro, quero registar e reconciliar pagamentos. Obrigatória
US-06 Como técnico, quero receber e encerrar ordens de trabalho com evidências. Obrigatória
US-07 Como gestor, quero exportar indicadores por mini-rede e período. Obrigatória
US-08 Como cliente, quero consultar consumo, saldo e pedidos. Futura
US-09 Como operador, quero receber automaticamente leituras dos contadores. Futura
US-10 Como gestor, quero prever procura e identificar anomalias. Futura

Anexo B Lista inicial de ecrãs
⦁ Autenticação e recuperação de acesso.
⦁ Painel executivo e mapa da carteira.
⦁ Lista e ficha de mini-rede.
⦁ Mapa de activos, rede e clientes.
⦁ Lista e ficha de cliente.
⦁ Contrato e ligação.
⦁ Contador, leituras e consumo.
⦁ Pagamentos, saldo e reconciliação.
⦁ Activos e manutenção preventiva.
⦁ Ocorrências e ordens de trabalho.
⦁ Relatórios e exportações.
⦁ Utilizadores, permissões e auditoria.
⦁ Configurações de categorias, tarifas e notificações.
