# GKLI Core

Base central da Gekali para usuários, tipos de acesso, apps permitidos e carteiras.

## Stack

- Next.js
- Vercel
- Supabase cloud
- Schema: `gkli_core`

## Módulos

- Hub de Apps
- Cockpit
- Usuários
- Tipos de acesso
- Apps permitidos
- Carteiras
- Chaves e auditoria

## Estado atual

O app possui a fundação visual no mesmo padrão do GKLI Flex, com telas iniciais,
camada de leitura Supabase e fallback para dados de exemplo enquanto o schema
`gkli_core` ainda não estiver aplicado.

O desenho das tabelas está em `features/gkli-core/schema-plan.sql` e a migration
inicial versionada está em `supabase/migrations/20260605000000_gkli_core_foundation.sql`.

## Hub de Apps

A rota `/modulos/gkli-core` concentra o acesso aos apps do grupo GKLI: Core, COB, Flex e Colab. O cockpit administrativo do Core fica em `/modulos/gkli-core/cockpit`.

Os links externos podem ser configurados pelas variáveis:

- `NEXT_PUBLIC_GKLI_COB_URL`
- `NEXT_PUBLIC_GKLI_FLEX_URL`
- `NEXT_PUBLIC_GKLI_COLAB_URL`

Para leitura operacional do schema `gkli_core`, configure também a variável
server-side `SUPABASE_SERVICE_ROLE_KEY`. Ela não deve ser exposta no navegador.

## Integração com Flex

O contrato inicial para o Flex está em `GET /api/gkli-core/flex-access`. Ele lê
o Supabase quando as tabelas estão disponíveis e mantém fallback para a base de
exemplo durante implantação.

## Integração com Colab

O contrato inicial para o Colab está em `GET /api/gkli-core/colab-access`. Ele
segue a mesma regra de leitura real com fallback.
