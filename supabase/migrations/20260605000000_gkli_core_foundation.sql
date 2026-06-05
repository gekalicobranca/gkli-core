-- GKLI Core foundation
-- Central identity, access types, allowed apps, wallet scope and audit events.

create schema if not exists gkli_core;

create table if not exists gkli_core.tipos_acesso (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  descricao text,
  nivel text not null default 'carteira',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists gkli_core.usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  status text not null default 'ativo',
  tipo_acesso_id uuid references gkli_core.tipos_acesso(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists gkli_core.apps (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  namespace text not null unique,
  descricao text,
  status text not null default 'ativo',
  created_at timestamptz not null default now()
);

create table if not exists gkli_core.carteiras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  codigo text not null unique,
  app_origem_id uuid references gkli_core.apps(id),
  status text not null default 'ativa',
  created_at timestamptz not null default now()
);

create table if not exists gkli_core.usuario_apps (
  usuario_id uuid not null references gkli_core.usuarios(id) on delete cascade,
  app_id uuid not null references gkli_core.apps(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (usuario_id, app_id)
);

create table if not exists gkli_core.usuario_carteiras (
  usuario_id uuid not null references gkli_core.usuarios(id) on delete cascade,
  carteira_id uuid not null references gkli_core.carteiras(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (usuario_id, carteira_id)
);

create table if not exists gkli_core.permissoes (
  id uuid primary key default gen_random_uuid(),
  permission text not null unique,
  descricao text,
  created_at timestamptz not null default now()
);

create table if not exists gkli_core.tipo_acesso_permissoes (
  tipo_acesso_id uuid not null references gkli_core.tipos_acesso(id) on delete cascade,
  permissao_id uuid not null references gkli_core.permissoes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (tipo_acesso_id, permissao_id)
);

create table if not exists gkli_core.auditoria_eventos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references gkli_core.usuarios(id),
  entidade text not null,
  entidade_id uuid,
  acao text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists gkli_core_usuarios_tipo_acesso_idx
  on gkli_core.usuarios(tipo_acesso_id);

create index if not exists gkli_core_carteiras_app_origem_idx
  on gkli_core.carteiras(app_origem_id);

create index if not exists gkli_core_auditoria_eventos_created_at_idx
  on gkli_core.auditoria_eventos(created_at desc);

insert into gkli_core.tipos_acesso (id, nome, descricao, nivel, ativo)
values
  ('00000000-0000-4000-8000-000000000101', 'Administrador', 'Pode gerenciar usuarios, apps, carteiras e permissoes globais.', 'global', true),
  ('00000000-0000-4000-8000-000000000102', 'Operacao', 'Acesso operacional aos apps habilitados e as carteiras vinculadas.', 'carteira', true),
  ('00000000-0000-4000-8000-000000000103', 'Financeiro', 'Permite rotinas financeiras dentro dos apps autorizados.', 'carteira', true)
on conflict (nome) do update set
  descricao = excluded.descricao,
  nivel = excluded.nivel,
  ativo = excluded.ativo;

insert into gkli_core.apps (id, nome, namespace, descricao, status)
values
  ('00000000-0000-4000-8000-000000000201', 'GKLI Core', 'gkli_core', 'Identidade, acessos, apps e carteiras.', 'sistema'),
  ('00000000-0000-4000-8000-000000000202', 'GKLI COB', 'gkli_cob', 'Cobranca, acordos, regua e mensageria.', 'ativo'),
  ('00000000-0000-4000-8000-000000000203', 'GKLI Flex', 'gkli_flex', 'Financeiro operacional light.', 'ativo'),
  ('00000000-0000-4000-8000-000000000204', 'GKLI Colab', 'gkli_colab', 'Area do colaborador para pagamentos e recibos.', 'ativo')
on conflict (namespace) do update set
  nome = excluded.nome,
  descricao = excluded.descricao,
  status = excluded.status;

insert into gkli_core.permissoes (permission, descricao)
values
  ('gkli_core.admin', 'Administracao total do GKLI Core.'),
  ('gkli_core.usuarios.read', 'Leitura de usuarios.'),
  ('gkli_core.usuarios.write', 'Escrita de usuarios.'),
  ('gkli_core.acessos.read', 'Leitura de tipos de acesso.'),
  ('gkli_core.acessos.write', 'Escrita de tipos de acesso.'),
  ('gkli_core.apps.read', 'Leitura de apps permitidos.'),
  ('gkli_core.apps.write', 'Escrita de apps permitidos.'),
  ('gkli_core.carteiras.read', 'Leitura de carteiras.'),
  ('gkli_core.carteiras.write', 'Escrita de carteiras.'),
  ('gkli_flex.admin', 'Administracao total do GKLI Flex.'),
  ('gkli_flex.importacoes.read', 'Leitura de importacoes no GKLI Flex.'),
  ('gkli_flex.importacoes.write', 'Escrita de importacoes no GKLI Flex.'),
  ('gkli_flex.financeiro.read', 'Leitura financeira no GKLI Flex.'),
  ('gkli_flex.financeiro.write', 'Escrita financeira no GKLI Flex.'),
  ('gkli_flex.pagamentos.read', 'Leitura de pagamentos no GKLI Flex.'),
  ('gkli_flex.pagamentos.write', 'Escrita de pagamentos no GKLI Flex.'),
  ('gkli_flex.fechamentos.read', 'Leitura de fechamentos no GKLI Flex.'),
  ('gkli_colab.admin', 'Administracao total do GKLI Colab.'),
  ('gkli_colab.dashboard.read', 'Leitura do dashboard do GKLI Colab.'),
  ('gkli_colab.pagamentos.read', 'Leitura de pagamentos do GKLI Colab.'),
  ('gkli_colab.recibos.read', 'Leitura de recibos do GKLI Colab.')
on conflict (permission) do update set
  descricao = excluded.descricao;

insert into gkli_core.tipo_acesso_permissoes (tipo_acesso_id, permissao_id)
select tipo.id, permissao.id
from gkli_core.tipos_acesso tipo
cross join gkli_core.permissoes permissao
where tipo.nome = 'Administrador'
on conflict do nothing;

insert into gkli_core.tipo_acesso_permissoes (tipo_acesso_id, permissao_id)
select tipo.id, permissao.id
from gkli_core.tipos_acesso tipo
join gkli_core.permissoes permissao on permissao.permission in (
  'gkli_core.usuarios.read',
  'gkli_core.apps.read',
  'gkli_core.carteiras.read',
  'gkli_flex.importacoes.read',
  'gkli_flex.importacoes.write',
  'gkli_flex.financeiro.read',
  'gkli_flex.financeiro.write',
  'gkli_flex.pagamentos.read',
  'gkli_flex.pagamentos.write',
  'gkli_flex.fechamentos.read',
  'gkli_colab.dashboard.read',
  'gkli_colab.recibos.read'
)
where tipo.nome = 'Operacao'
on conflict do nothing;

insert into gkli_core.tipo_acesso_permissoes (tipo_acesso_id, permissao_id)
select tipo.id, permissao.id
from gkli_core.tipos_acesso tipo
join gkli_core.permissoes permissao on permissao.permission in (
  'gkli_core.usuarios.read',
  'gkli_core.apps.read',
  'gkli_core.carteiras.read',
  'gkli_flex.financeiro.read',
  'gkli_flex.financeiro.write',
  'gkli_flex.pagamentos.read',
  'gkli_flex.pagamentos.write',
  'gkli_colab.dashboard.read',
  'gkli_colab.pagamentos.read',
  'gkli_colab.recibos.read'
)
where tipo.nome = 'Financeiro'
on conflict do nothing;
