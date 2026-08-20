alter table gkli_regua.lote_itens drop column if exists cliente_id;
alter table gkli_regua.importacao_itens drop column if exists cliente_id;
drop table if exists gkli_regua.clientes;

comment on table gkli_regua.importacao_itens is
  'Cada linha importada e um registro autonomo contendo cobranca, credor e dados da pessoa fisica.';
