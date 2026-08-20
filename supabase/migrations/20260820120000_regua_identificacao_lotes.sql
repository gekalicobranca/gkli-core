begin;

alter table gkli_regua.importacoes
  add column if not exists codigo_lote text;

with numerados as (
  select
    id,
    'LOT-' || to_char(created_at at time zone 'America/Sao_Paulo', 'YYYYMMDD') || '-' ||
    lpad(row_number() over (order by created_at, id)::text, 4, '0') as codigo
  from gkli_regua.importacoes
  where codigo_lote is null
)
update gkli_regua.importacoes i
set codigo_lote = n.codigo
from numerados n
where n.id = i.id;

alter table gkli_regua.importacoes
  alter column codigo_lote set not null;

create unique index if not exists gkli_regua_importacoes_codigo_lote_uidx
  on gkli_regua.importacoes (codigo_lote);

create unique index if not exists gkli_regua_lotes_importacao_credor_uidx
  on gkli_regua.lotes (importacao_id, carteira_id);

comment on column gkli_regua.importacoes.codigo_lote is
  'Identificador operacional único gerado para cada arquivo importado.';

commit;
