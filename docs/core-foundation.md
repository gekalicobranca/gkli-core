# GKLI Core foundation

O GKLI Core e a base central para identidade e escopo entre aplicativos GKLI.

## Dominios

- Usuarios: cadastro central de pessoa, email, status e tipo de acesso.
- Tipos de acesso: perfis base como administrador, operacao e financeiro.
- Apps permitidos: lista de aplicativos que cada usuario pode abrir.
- Carteiras: escopo operacional aplicado por usuario.
- Auditoria: trilha de mudancas sensiveis em cadastros e permissoes.

## Regra alvo

Um usuario so deve operar um app se tiver vinculo em `usuario_apps`. Para dados restritos por carteira, o app tambem deve respeitar `usuario_carteiras`.

Administradores podem ser tratados como escopo global, mas essa regra deve ficar explicita no backend e auditavel.

## Proxima etapa tecnica

1. Criar migrations Supabase a partir de `features/gkli-core/schema-plan.sql`.
2. Criar repositories para ler usuarios, tipos de acesso, apps e carteiras.
3. Substituir os dados mockados por consultas reais.
4. Fazer COB e Flex consultarem o Core para menu, acesso e escopo.
