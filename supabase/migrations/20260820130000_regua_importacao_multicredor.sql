begin;

alter table gkli_regua.importacoes
  alter column carteira_id drop not null;

comment on column gkli_regua.importacoes.carteira_id is
  'Credor único quando aplicável; nulo para lotes de importação com múltiplos credores.';

commit;
