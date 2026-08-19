-- GKLI Core - URLs visiveis dos modulos ativos
--
-- Mantem core.apps.codigo como gkit_* para compatibilidade com schemas,
-- permissoes, APIs e migracoes herdadas, mas publica url_path em /modulos/gkli-*.

update core.apps
set url_path = '/modulos/gkli-new'
where codigo = 'gkit_new';

update core.apps
set url_path = '/modulos/gkli-flex'
where codigo = 'gkit_flex';

update core.apps
set url_path = '/modulos/gkli-ate'
where codigo = 'gkit_ate';

update core.apps
set url_path = '/modulos/gkli-dir'
where codigo = 'gkit_dir';

