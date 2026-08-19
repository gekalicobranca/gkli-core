begin;

delete from security.perfil_permissoes
where permissao_id in (
  select p.id
  from security.permissoes p
  join core.apps a on a.id = p.app_id
  where a.codigo not in ('core', 'gkli-regua')
);

delete from security.permissoes
where app_id in (
  select id from core.apps where codigo not in ('core', 'gkli-regua')
);

delete from security.usuario_app_acessos
where app_id in (
  select id from core.apps where codigo not in ('core', 'gkli-regua')
);

delete from core.apps
where codigo not in ('core', 'gkli-regua');

insert into core.apps (codigo, nome, descricao, status, url_path, ordem)
values ('gkli-regua', 'GKLI Régua', 'Importações, templates e lotes de e-mail.', 'ativo', '/modulos/gkli-regua', 10)
on conflict (codigo) do update
set nome = excluded.nome,
    descricao = excluded.descricao,
    status = excluded.status,
    url_path = excluded.url_path,
    ordem = excluded.ordem,
    updated_at = now();

commit;
