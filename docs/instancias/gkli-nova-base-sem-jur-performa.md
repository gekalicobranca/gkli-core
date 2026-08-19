# GKLI Core - nova base sem JUR e Performa

## Modulos que entram

- Core / Admin Core
- Painel
- Ciclo
- Colab
- GKLI Flex
- GKLI New
- GKLI ATE
- GKLI DIR

## Modulos que nao entram

- GKLI Jur
- GKLI Performa
- Legados ja aposentados: `crm`, `din`, `fix`, `flex`, `intr`

## Ordem recomendada para criar a base

1. Criar um projeto Supabase vazio.
2. Configurar as variaveis locais em `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, se aplicavel
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Executar primeiro:
   - `sql/63_bootstrap_nova_instancia_supabase.sql`
4. Executar em seguida:
   - `sql/64_gkli_core_sem_jur_performa.sql`
5. Aplicar a camada de identidade GKLI:
   - `sql/65_gkli_branding_catalog.sql`
6. Aplicar os aliases de URL dos modulos ativos:
   - `sql/66_gkli_module_url_aliases.sql`
7. Rodar os scripts SQL/migrations dos modulos que serao usados:
   - GKLI New: `sql/24_gkit_new_bootstrap.sql` ate `sql/28_gkit_new_api_grants.sql`
   - Ciclo: `sql/40_ciclo_tipo_cliente.sql` ate `sql/42_ciclo_onboarding_workflow.sql`
   - GKLI ATE: `sql/45_gkit_ate_bootstrap.sql` e `sql/46_gkit_ate_repair_indices.sql`
   - GKLI Flex: migrations `supabase/migrations/20260625152443_*`, `20260625153007_*`, `20260625153541_*`, e demais objetos Flex em `public`
   - GKLI DIR: `sql/50_gkit_dir_module.sql`
8. Nao rodar:
   - `sql/52_gkit_performa_module.sql`
   - `sql/53_gkit_performa_rankings.sql`
   - `sql/61_gkit_jur_module.sql`
   - qualquer migration `supabase/migrations/*gkit_jur*`
   - `supabase/migrations/20260703173814_gkit_jur_cron_locks.sql`
9. Criar o primeiro usuario no Supabase Auth.
10. Rodar:
   - `node scripts/bootstrap-admin.mjs -- --auth-id=UUID_DO_AUTH --email=email@dominio.com --name="Nome do Admin"`
11. Validar:
   - `node scripts/check-supabase.mjs`
   - `npm run build`
   - login em `/login`
   - entrada em `/plataforma`
   - admin em `/admin`

## Como me dar acesso a base depois

Quando a base estiver criada, me passe apenas as informacoes necessarias para eu validar pelo ambiente local:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3005
```

O caminho mais pratico e colar esses valores no `.env.local` desta pasta ou me dizer que voce ja colocou. Eu nao preciso da senha do painel Supabase.

Se quiser que eu rode comandos do Supabase CLI vinculados ao projeto, voce tambem pode executar o login/link do Supabase no seu terminal e me avisar quando estiver pronto:

```powershell
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
```

Para operacao normal pelo app, a chave critica e `SUPABASE_SERVICE_ROLE_KEY`, sempre server-side. Ela nao deve ir para variaveis `NEXT_PUBLIC_*`.
