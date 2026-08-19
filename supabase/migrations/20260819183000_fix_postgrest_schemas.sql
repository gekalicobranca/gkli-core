-- Esta instância do GKLI Core não possui o schema legado Ciclo.
-- Mantê-lo em pgrst.db_schemas impede o PostgREST de iniciar e retorna HTTP 503.
alter role authenticator set pgrst.db_schemas =
  'public, graphql_public, audit, core, security, gkit_new, gkit_ate, gkit_performa, gkli_regua';

notify pgrst, 'reload config';
notify pgrst, 'reload schema';
