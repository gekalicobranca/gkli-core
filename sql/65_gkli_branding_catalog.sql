-- GKLI Core - identidade visual e nomes de catalogo
--
-- Este script deve rodar depois do bootstrap da nova instancia sem JUR/Performa.
-- Ele troca a camada visivel para GKLI mantendo codigos internos, schemas,
-- rotas e permissoes gkit_* enquanto os modulos herdados ainda dependem deles.

update core.apps
set
  nome = 'GKLI Core',
  descricao = 'Usuarios, carteiras, perfis, modulos e auditoria central.'
where codigo = 'core';

update core.apps
set
  nome = 'GKLI Ciclo',
  descricao = 'Lifecycle, onboarding, documentos e cadastro mestre.'
where codigo = 'ciclo';

update core.apps
set
  nome = 'GKLI Colab',
  descricao = 'Portal individual de colaboradores, pagamentos, comissoes e documentos.'
where codigo = 'colab';

update core.apps
set
  nome = 'GKLI New',
  descricao = 'CRM 2.0 enxuto: clientes, contatos, oportunidades e workflow.'
where codigo = 'gkit_new';

update core.apps
set
  nome = 'GKLI Flex',
  descricao = 'Financial Xperience: comissoes, contas a pagar, cadastros financeiros e auditoria mensal.'
where codigo = 'gkit_flex';

update core.apps
set
  nome = 'GKLI ATE',
  descricao = 'Atendimentos consultivos do ASTREA com tarefas vinculadas.'
where codigo = 'gkit_ate';

update core.apps
set
  nome = 'GKLI DIR',
  descricao = 'Diretorio de clientes com dados cadastrais vindos do Ciclo.'
where codigo = 'gkit_dir';

update security.permissoes
set
  nome = replace(nome, 'GKIT', 'GKLI'),
  descricao = replace(descricao, 'GKIT', 'GKLI')
where nome like '%GKIT%'
   or descricao like '%GKIT%';

