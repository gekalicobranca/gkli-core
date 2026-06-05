-- GKLI Core schema plan
-- Central identity, access, allowed apps and wallet scope.

create schema if not exists gkli_core;

create table if not exists gkli_core.usuarios (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  status text not null default 'ativo',
  tipo_acesso_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists gkli_core.tipos_acesso (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique,
  descricao text,
  nivel text not null default 'carteira',
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists gkli_core.apps (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  namespace text not null unique,
  descricao text,
  status text not null default 'ativo',
  created_at timestamptz not null default now()
);

-- Namespaces iniciais esperados: gkli_core, gkli_flex, gkli_colab.

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
