# Fundação do GKLI Core

O GKLI Core é a base central para identidade e escopo entre aplicativos GKLI.

## Domínios

- Usuários: cadastro central de pessoa, email, status e tipo de acesso.
- Tipos de acesso: perfis base como administrador, operação e financeiro.
- Apps permitidos: lista de aplicativos que cada usuário pode abrir.
- Carteiras: escopo operacional aplicado por usuário.
- Auditoria: trilha de mudanças sensíveis em cadastros e permissões.

## Regra alvo

Um usuário só deve operar um app se tiver vínculo em `usuario_apps`. Para dados restritos por carteira, o app também deve respeitar `usuario_carteiras`.

Administradores podem ser tratados como escopo global, mas essa regra deve ficar explícita no backend e ser auditável.

## Estado de implantação

1. Migration inicial criada em `supabase/migrations/20260605000000_gkli_core_foundation.sql`.
2. Migration de acesso ao Data API criada em `supabase/migrations/20260605001000_gkli_core_api_access.sql`.
3. Repositório de leitura criado para consultar o schema `gkli_core` com `SUPABASE_SERVICE_ROLE_KEY`.
4. Telas e contratos já usam leitura real com fallback para dados de exemplo.

## Próxima etapa técnica

1. Aplicar as migrations no Supabase de destino.
2. Configurar `SUPABASE_SERVICE_ROLE_KEY` no ambiente server-side local/Vercel.
3. Criar CRUD administrativo para usuários, tipos de acesso, apps e carteiras.
4. Proteger rotas e APIs com sessão/permissões reais.
5. Fazer COB, Flex e Colab consultarem o Core para menu, acesso e escopo.
6. Persistir auditoria nas mutações administrativas.

## Contrato inicial com Flex

O Core expõe `GET /api/gkli-core/flex-access` para o Flex consultar:

- app `gkli_flex`
- usuários autorizados a abrir o Flex
- tipos de acesso traduzidos para permissões `gkli_flex.*`
- carteiras do Flex disponíveis para escopo

## Contrato inicial com Colab

O Core expõe `GET /api/gkli-core/colab-access` para o Colab consultar:

- app `gkli_colab`
- usuários autorizados a abrir a área do colaborador
- tipos de acesso traduzidos para permissões `gkli_colab.*`
