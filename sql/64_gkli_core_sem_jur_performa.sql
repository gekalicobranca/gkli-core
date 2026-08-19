-- GKLI Core - ajuste de nova instancia sem JUR e sem Performa
--
-- Use depois do bootstrap central (`sql/63_bootstrap_nova_instancia_supabase.sql`)
-- e antes de liberar a instancia para usuarios.
--
-- Objetivo:
-- - manter Core/Admin, Painel, Ciclo, Colab, GKIT Flex, GKIT New, GKIT ATE e GKIT DIR;
-- - remover/inativar JUR e Performa caso tenham entrado pelo seed original;
-- - garantir que o PostgREST exponha apenas os schemas vivos dessa instancia.

begin;

-- Se este ajuste for executado antes dos scripts de modulo, os schemas ainda
-- precisam existir para o PostgREST conseguir montar o schema cache.
create schema if not exists ciclo;
create schema if not exists gkit_new;
create schema if not exists gkit_ate;

-- Remove acessos concedidos a apps que nao serao usados nesta instancia.
with target_apps as (
  select id
  from core.apps
  where codigo in ('gkit_jur', 'gkit_performa')
)
delete from security.usuario_app_acessos access
using target_apps
where access.app_id = target_apps.id;

-- Remove permissoes finas e relacoes de perfil desses apps.
delete from security.permissoes
where codigo like 'gkit_jur.%'
   or codigo like 'gkit_performa.%'
   or codigo in ('gkit_jur.read', 'gkit_jur.write', 'gkit_performa.read', 'gkit_performa.write');

-- Remove os apps do catalogo central para que nao aparecam no hub/admin.
delete from core.apps
where codigo in ('gkit_jur', 'gkit_performa');

-- Garante que os apps desejados estejam ativos e ordenados.
insert into core.apps (codigo, nome, descricao, status, url_path, ordem)
values
  ('painel', 'Painel', 'Hub operacional da plataforma.', 'ativo', '/modulos/painel', 10),
  ('core', 'Admin Core', 'Administracao de usuarios, acessos, apps e carteiras.', 'ativo', '/admin', 20),
  ('ciclo', 'Ciclo', 'Operacao de contratos, documentos, onboarding e regularidade.', 'ativo', '/modulos/ciclo', 30),
  ('colab', 'Colab', 'Area do colaborador.', 'ativo', '/modulos/colab', 40),
  ('gkit_new', 'GKIT New', 'CRM e oportunidades.', 'ativo', '/modulos/gkit-new', 50),
  ('gkit_flex', 'GKIT Flex', 'Gestao financeira operacional, comissoes, pagamentos, previsoes e cadastros.', 'ativo', '/modulos/gkit-flex', 60),
  ('gkit_ate', 'GKIT Ate', 'Atendimento consultivo e tarefas.', 'ativo', '/modulos/gkit-ate', 70),
  ('gkit_dir', 'GKIT Dir', 'Diretoria e acompanhamento executivo.', 'ativo', '/modulos/gkit-dir', 80)
on conflict (codigo) do update
set nome = excluded.nome,
    descricao = excluded.descricao,
    status = excluded.status,
    url_path = excluded.url_path,
    ordem = excluded.ordem,
    updated_at = now();

commit;

-- Limpeza fisica defensiva: so faz efeito se scripts/migrations de JUR ou Performa
-- tiverem sido rodados por engano.
drop schema if exists gkit_jur cascade;
drop schema if exists gkit_performa cascade;

drop table if exists public.gkit_performa_rankings cascade;
drop table if exists public.gkit_performa_importacoes cascade;
drop table if exists public.gkit_performa_agenda_itens cascade;

-- Mantem o Data API alinhado aos schemas vivos da instancia GKLI.
-- Nao incluir `gkit_jur` nem `gkit_performa`.
grant usage on schema public, audit, core, security, ciclo, gkit_new, gkit_ate
  to authenticated, service_role;

grant select on all tables in schema audit, core, security, ciclo, gkit_new, gkit_ate
  to authenticated;

grant all on all tables in schema audit, core, security, ciclo, gkit_new, gkit_ate
  to service_role;

alter role authenticator set pgrst.db_schemas =
  'public, graphql_public, audit, core, security, ciclo, gkit_new, gkit_ate';

notify pgrst, 'reload config';
notify pgrst, 'reload schema';
