-- Expose GKLI Core to Supabase Data API and grant server-side access.
-- Keep operational reads behind the service role used by the Next.js server.

grant usage on schema gkli_core to service_role;
grant all on all tables in schema gkli_core to service_role;
grant all on all routines in schema gkli_core to service_role;
grant all on all sequences in schema gkli_core to service_role;

alter default privileges for role postgres in schema gkli_core
  grant all on tables to service_role;

alter default privileges for role postgres in schema gkli_core
  grant all on routines to service_role;

alter default privileges for role postgres in schema gkli_core
  grant all on sequences to service_role;

-- Current exposed schemas observed in the project:
-- public, graphql_public, gkli_flex, colaborador_area
-- Add gkli_core without removing the existing schemas.
alter role authenticator set pgrst.db_schemas =
  'public, graphql_public, gkli_flex, colaborador_area, gkli_core';

notify pgrst, 'reload config';
notify pgrst, 'reload schema';
