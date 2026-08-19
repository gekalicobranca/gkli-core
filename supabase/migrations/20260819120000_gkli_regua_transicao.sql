create schema if not exists gkli_regua;

create table if not exists gkli_regua.carteiras (
  id uuid primary key default extensions.gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  cnpj text,
  email text,
  descricao text,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists gkli_regua.clientes (
  id uuid primary key default extensions.gen_random_uuid(),
  carteira_id uuid references gkli_regua.carteiras(id) on delete restrict,
  nome text not null,
  documento text,
  email text,
  status text not null default 'ativo' check (status in ('ativo', 'inativo', 'bloqueado')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists gkli_regua_clientes_carteira_documento_uidx
  on gkli_regua.clientes (carteira_id, documento) where documento is not null and documento <> '';
create index if not exists gkli_regua_clientes_carteira_idx on gkli_regua.clientes (carteira_id, status);
create index if not exists gkli_regua_clientes_email_idx on gkli_regua.clientes (lower(email));

create table if not exists gkli_regua.templates (
  id uuid primary key default extensions.gen_random_uuid(),
  nome text not null,
  assunto text not null,
  corpo_html text not null,
  corpo_texto text,
  status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists gkli_regua.importacoes (
  id uuid primary key default extensions.gen_random_uuid(),
  carteira_id uuid not null references gkli_regua.carteiras(id) on delete restrict,
  arquivo_nome text not null,
  status text not null default 'processado' check (status in ('processando', 'processado', 'falhou')),
  total_linhas integer not null default 0,
  linhas_validas integer not null default 0,
  linhas_invalidas integer not null default 0,
  criado_por uuid references security.usuarios(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists gkli_regua.importacao_itens (
  id uuid primary key default extensions.gen_random_uuid(),
  importacao_id uuid not null references gkli_regua.importacoes(id) on delete cascade,
  carteira_id uuid references gkli_regua.carteiras(id) on delete restrict,
  cliente_id uuid references gkli_regua.clientes(id) on delete set null,
  linha integer not null,
  nome text not null,
  documento text,
  email text,
  valor numeric(14,2),
  vencimento date,
  referencia text,
  dados jsonb not null default '{}'::jsonb,
  status text not null default 'apto' check (status in ('apto', 'invalido', 'bloqueado', 'incluido')),
  motivo text,
  created_at timestamptz not null default now(),
  unique (importacao_id, linha)
);

create table if not exists gkli_regua.lotes (
  id uuid primary key default extensions.gen_random_uuid(),
  carteira_id uuid not null references gkli_regua.carteiras(id) on delete restrict,
  importacao_id uuid not null references gkli_regua.importacoes(id) on delete restrict,
  template_id uuid not null references gkli_regua.templates(id) on delete restrict,
  nome text not null,
  status text not null default 'preparado' check (status in ('preparado', 'em_envio', 'concluido', 'cancelado', 'falhou')),
  total_itens integer not null default 0,
  criado_por uuid references security.usuarios(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists gkli_regua.lote_itens (
  id uuid primary key default extensions.gen_random_uuid(),
  lote_id uuid not null references gkli_regua.lotes(id) on delete cascade,
  importacao_item_id uuid not null references gkli_regua.importacao_itens(id) on delete restrict,
  cliente_id uuid references gkli_regua.clientes(id) on delete set null,
  destinatario text not null,
  assunto text not null,
  corpo_html text not null,
  corpo_texto text,
  status text not null default 'preparado' check (status in ('preparado', 'enviado', 'falhou', 'cancelado')),
  provedor_id text,
  erro text,
  enviado_at timestamptz,
  created_at timestamptz not null default now(),
  unique (lote_id, importacao_item_id, destinatario)
);

create index if not exists gkli_regua_importacoes_created_idx on gkli_regua.importacoes (created_at desc);
create index if not exists gkli_regua_lotes_created_idx on gkli_regua.lotes (created_at desc);
create index if not exists gkli_regua_lote_itens_status_idx on gkli_regua.lote_itens (lote_id, status);

alter table gkli_regua.carteiras enable row level security;
alter table gkli_regua.clientes enable row level security;
alter table gkli_regua.templates enable row level security;
alter table gkli_regua.importacoes enable row level security;
alter table gkli_regua.importacao_itens enable row level security;
alter table gkli_regua.lotes enable row level security;
alter table gkli_regua.lote_itens enable row level security;

revoke all on schema gkli_regua from anon, authenticated;
revoke all on all tables in schema gkli_regua from anon, authenticated;
grant usage on schema gkli_regua to service_role;
grant all on all tables in schema gkli_regua to service_role;

alter role authenticator set pgrst.db_schemas =
  'public, graphql_public, audit, core, security, ciclo, gkit_new, gkit_ate, gkit_performa, gkli_regua';

insert into core.apps (codigo, nome, descricao, status, url_path, ordem)
values (
  'gkli-regua',
  'GKLI Régua',
  'Operação transitória de importação, templates e lotes de e-mail.',
  'ativo',
  '/modulos/gkli-regua',
  55
)
on conflict (codigo) do update set
  nome = excluded.nome,
  descricao = excluded.descricao,
  status = excluded.status,
  url_path = excluded.url_path,
  ordem = excluded.ordem,
  updated_at = now();

insert into security.permissoes (codigo, nome, descricao, app_id, recurso, acao, sistema, status)
select p.codigo, p.nome, p.descricao, a.id, p.recurso, p.acao, true, 'ativo'
from core.apps a
cross join (values
  ('gkli_regua.read', 'Consultar GKLI Régua', 'Consulta carteiras, clientes, templates, importações e lotes.', 'gkli_regua', 'read'),
  ('gkli_regua.write', 'Operar GKLI Régua', 'Cria cadastros, importa bases e gera lotes.', 'gkli_regua', 'write')
) as p(codigo, nome, descricao, recurso, acao)
where a.codigo = 'gkli-regua'
on conflict (codigo) do update set
  nome = excluded.nome,
  descricao = excluded.descricao,
  app_id = excluded.app_id,
  recurso = excluded.recurso,
  acao = excluded.acao,
  status = 'ativo',
  updated_at = now();

insert into security.perfil_permissoes (perfil_id, permissao_id)
select perfil.id, permissao.id
from security.perfis perfil
cross join security.permissoes permissao
where perfil.codigo = 'admin_global'
  and permissao.codigo in ('gkli_regua.read', 'gkli_regua.write')
on conflict (perfil_id, permissao_id) do nothing;

notify pgrst, 'reload config';
notify pgrst, 'reload schema';
