-- Expõe somente schemas que realmente existem nesta instância.
-- O PostgREST não inicia quando pgrst.db_schemas contém um schema ausente.
do $$
declare
  exposed_schemas text;
begin
  select string_agg(schema_name, ', ' order by position)
    into exposed_schemas
  from (
    select candidate.schema_name, candidate.position
    from (
      values
        ('public', 1),
        ('graphql_public', 2),
        ('audit', 3),
        ('core', 4),
        ('security', 5),
        ('gkit_new', 6),
        ('gkit_ate', 7),
        ('gkit_performa', 8),
        ('gkli_regua', 9)
    ) as candidate(schema_name, position)
    where exists (
      select 1
      from pg_namespace
      where nspname = candidate.schema_name
    )
  ) as existing_schemas;

  execute format(
    'alter role authenticator set pgrst.db_schemas = %L',
    exposed_schemas
  );
end
$$;

notify pgrst, 'reload config';
notify pgrst, 'reload schema';
