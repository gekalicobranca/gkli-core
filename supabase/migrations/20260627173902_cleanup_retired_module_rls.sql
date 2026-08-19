begin;

-- As instâncias novas da GEKALI nunca tiveram os schemas legados crm e gkli_intr.
-- A remoção física defensiva continua sendo feita em migração posterior.

-- Otimiza policies que chamavam auth.uid() por linha.
drop policy if exists usuario_app_acessos_select_self_or_admin on security.usuario_app_acessos;
create policy usuario_app_acessos_select_self_or_admin
on security.usuario_app_acessos
for select
to authenticated
using (usuario_id = (select auth.uid()) or (select security.is_admin_global()));

drop policy if exists usuario_carteiras_select_self_or_admin on security.usuario_carteiras;
create policy usuario_carteiras_select_self_or_admin
on security.usuario_carteiras
for select
to authenticated
using (usuario_id = (select auth.uid()) or (select security.is_admin_global()));

drop policy if exists usuario_perfis_select_self_or_admin on security.usuario_perfis;
create policy usuario_perfis_select_self_or_admin
on security.usuario_perfis
for select
to authenticated
using (usuario_id = (select auth.uid()) or (select security.is_admin_global()));

drop policy if exists usuarios_select_self_or_admin on security.usuarios;
create policy usuarios_select_self_or_admin
on security.usuarios
for select
to authenticated
using (id = (select auth.uid()) or (select security.is_admin_global()));

-- Substitui policies ALL por policies só de escrita para evitar duplicidade em SELECT.
drop policy if exists perfil_permissoes_admin_global_all on security.perfil_permissoes;
create policy perfil_permissoes_admin_global_insert on security.perfil_permissoes
for insert to authenticated with check ((select security.is_admin_global()));
create policy perfil_permissoes_admin_global_update on security.perfil_permissoes
for update to authenticated using ((select security.is_admin_global())) with check ((select security.is_admin_global()));
create policy perfil_permissoes_admin_global_delete on security.perfil_permissoes
for delete to authenticated using ((select security.is_admin_global()));

drop policy if exists perfis_admin_global_all on security.perfis;
create policy perfis_admin_global_insert on security.perfis
for insert to authenticated with check ((select security.is_admin_global()));
create policy perfis_admin_global_update on security.perfis
for update to authenticated using ((select security.is_admin_global())) with check ((select security.is_admin_global()));
create policy perfis_admin_global_delete on security.perfis
for delete to authenticated using ((select security.is_admin_global()));

drop policy if exists permissoes_admin_global_all on security.permissoes;
create policy permissoes_admin_global_insert on security.permissoes
for insert to authenticated with check ((select security.is_admin_global()));
create policy permissoes_admin_global_update on security.permissoes
for update to authenticated using ((select security.is_admin_global())) with check ((select security.is_admin_global()));
create policy permissoes_admin_global_delete on security.permissoes
for delete to authenticated using ((select security.is_admin_global()));

drop policy if exists usuario_app_acessos_admin_global_all on security.usuario_app_acessos;
create policy usuario_app_acessos_admin_global_insert on security.usuario_app_acessos
for insert to authenticated with check ((select security.is_admin_global()));
create policy usuario_app_acessos_admin_global_update on security.usuario_app_acessos
for update to authenticated using ((select security.is_admin_global())) with check ((select security.is_admin_global()));
create policy usuario_app_acessos_admin_global_delete on security.usuario_app_acessos
for delete to authenticated using ((select security.is_admin_global()));

drop policy if exists usuario_carteiras_admin_global_all on security.usuario_carteiras;
create policy usuario_carteiras_admin_global_insert on security.usuario_carteiras
for insert to authenticated with check ((select security.is_admin_global()));
create policy usuario_carteiras_admin_global_update on security.usuario_carteiras
for update to authenticated using ((select security.is_admin_global())) with check ((select security.is_admin_global()));
create policy usuario_carteiras_admin_global_delete on security.usuario_carteiras
for delete to authenticated using ((select security.is_admin_global()));

drop policy if exists usuario_perfis_admin_global_all on security.usuario_perfis;
create policy usuario_perfis_admin_global_insert on security.usuario_perfis
for insert to authenticated with check ((select security.is_admin_global()));
create policy usuario_perfis_admin_global_update on security.usuario_perfis
for update to authenticated using ((select security.is_admin_global())) with check ((select security.is_admin_global()));
create policy usuario_perfis_admin_global_delete on security.usuario_perfis
for delete to authenticated using ((select security.is_admin_global()));

drop policy if exists usuarios_admin_global_all on security.usuarios;
create policy usuarios_admin_global_insert on security.usuarios
for insert to authenticated with check ((select security.is_admin_global()));
create policy usuarios_admin_global_update on security.usuarios
for update to authenticated using ((select security.is_admin_global())) with check ((select security.is_admin_global()));
create policy usuarios_admin_global_delete on security.usuarios
for delete to authenticated using ((select security.is_admin_global()));

notify pgrst, 'reload schema';

commit;
