# Banco de dados

## Escolha

PostgreSQL atende ao modelo relacional, constraints, transações, busca textual, concorrência e auditoria do Guido. A conexão é independente de Supabase e fica atrás do adapter server-side.

## Entidades implementadas no schema inicial

- `users`, `user_identities`, `sessions` e tokens de Auth formam a identidade Guido;
- `profiles` e `team_members` complementam `users`;
- `categories`, `applications` e `tutorials` formam o catálogo;
- `tutorial_search_terms` mantém sinônimos controlados;
- `guide_versions` separa plataforma e versão;
- `steps`, `media_assets` e `step_media` representam o conteúdo ordenado;
- `guide_reviews` sustenta revisão humana;
- `user_progress` e `favorites` pertencem ao usuário;
- `guide_reports` registra problemas;
- `audit_logs` registra operações críticas sem conteúdo sensível.

## Migrations

`db/migrations/001_independent_foundation.sql` cria banco novo para desenvolvimento local. Execute `npm run db:migrate` com `DATABASE_URL`. As migrations em `supabase/migrations` são históricas e não são necessárias para o runtime novo.

- `001_initial_schema.sql`: tipos, tabelas, constraints, índices e gatilhos;
- `002_row_level_security.sql`: RLS com leitura pública somente de conteúdo publicado e isolamento de dados de usuário.
- `003_profiles_trigger.sql`: criação segura do perfil mínimo após cadastro no Supabase Auth.
- `004_supabase_public_access.sql`: leitura de conteúdo publicado, demonstração explicitamente marcada e bucket privado de mídia.
- `005_restrict_auth_trigger_execution.sql` e `006_document_auth_profile_trigger.sql`: endurecimento e documentação do cadastro.
- `007_shared_guide_image_drafts.sql`: rascunhos compartilhados, autorização da equipe e bucket privado.
- `008_admin_published_guide_images.sql`: estrutura inicial das imagens públicas por contexto.
- `010_restrict_guide_publishing_to_superadmin.sql`: etapa histórica que restringiu a publicação ao superadmin.
- `20260820055619_allow_authenticated_guide_image_uploads.sql`: permite criação e substituição por qualquer conta autenticada, preservando a remoção para o superadmin.
- `20260825225755_migrate_local_guides_to_database.sql`: importa o catálogo local e os roteiros editoriais para `categories`, `applications`, `tutorials`, `guide_versions` e `steps`, sem publicar automaticamente guias reais.
- `20260825231732_relink_existing_guide_images.sql`: relaciona os registros já existentes de `guide_public_images` às versões e etapas estruturadas sem mover ou renomear objetos no Storage.

As migrations são verificadas em PostgreSQL efêmero pela CI. A aplicação remota
ocorre somente no projeto escolhido pelo responsável e sem credenciais no Git.
O seed de desenvolvimento permanece `draft` e não publica nada.

## Fonte do catálogo e dos roteiros

PostgreSQL é a fonte principal do catálogo, das versões por sistema operacional
e dos passos. O conteúdo em `src/data` permanece temporariamente como fallback
de disponibilidade e como entrada reprodutível do gerador
`scripts/generate-guide-catalog-migration.mjs`; ele não substitui alterações
editoriais feitas no banco.

`tutorials.image_context_slug` mantém a chave histórica usada pelos uploads,
`steps.editorial_key` identifica o passo de forma estável e
`guide_public_images.guide_version_id`/`guide_step_id` ligam a imagem ao roteiro.
Os arquivos continuam no bucket `guide-public`: somente referências relacionais
foram acrescentadas. Na migração inicial, 745 registros de imagem foram
preservados e vinculados, sem alterar suas chaves de Storage.

`guide_versions.public_for_upload` permite mostrar um roteiro na ferramenta de
envio sem torná-lo um guia oficial. A navegação pública continua exigindo
`status = 'published'`, com exceção da demonstração explicitamente marcada.

## Acesso da aplicação

O Next.js usa a chave publicável e o JWT da sessão. Grants definem quais tabelas cada papel alcança e RLS restringe as linhas. Chaves `service_role` e `sb_secret_...` não são usadas no navegador nem necessárias para a jornada pública e de usuário do MVP.

`user_progress.current_step` é zero-based para coincidir com o visualizador: primeiro passo é `0`. O Route Handler valida o valor contra a quantidade real de etapas antes do upsert.

## Busca

`tutorials.search_document` usa `tsvector` em português e índice GIN. Termos controlados têm índice próprio. Ranking, paginação e `EXPLAIN ANALYZE` serão ajustados com dados reais; nenhum banco vetorial foi introduzido.

## Backup e recuperação

Antes de produção: configurar backup automático, retenção aprovada, PITR conforme o plano contratado e ensaio documentado de restauração. Backup sem teste de restauração não será considerado validado.
