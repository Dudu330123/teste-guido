# Banco de dados

## Escolha

PostgreSQL atende ao modelo relacional, constraints, transações, busca textual, concorrência e auditoria do Guido. A hospedagem prevista é Supabase, mas o schema evita usar o navegador como camada de autorização administrativa.

## Entidades implementadas no schema inicial

- `profiles` e `team_members` complementam as identidades de `auth.users`;
- `categories`, `applications` e `tutorials` formam o catálogo;
- `tutorial_search_terms` mantém sinônimos controlados;
- `guide_versions` separa plataforma e versão;
- `steps`, `media_assets` e `step_media` representam o conteúdo ordenado;
- `guide_reviews` sustenta revisão humana;
- `user_progress` e `favorites` pertencem ao usuário;
- `guide_reports` registra problemas;
- `audit_logs` registra operações críticas sem conteúdo sensível.

## Migrations

- `001_initial_schema.sql`: tipos, tabelas, constraints, índices e gatilhos;
- `002_row_level_security.sql`: RLS com leitura pública somente de conteúdo publicado e isolamento de dados de usuário.
- `003_profiles_trigger.sql`: criação segura do perfil mínimo após cadastro no Supabase Auth.
- `004_supabase_public_access.sql`: leitura de conteúdo publicado, demonstração explicitamente marcada e bucket privado de mídia.
- `005_restrict_auth_trigger_execution.sql` e `006_document_auth_profile_trigger.sql`: endurecimento e documentação do cadastro.
- `007_shared_guide_image_drafts.sql`: rascunhos compartilhados, autorização da equipe e bucket privado.
- `008_admin_published_guide_images.sql`: estrutura inicial das imagens públicas por contexto.
- `010_restrict_guide_publishing_to_superadmin.sql`: etapa histórica que restringiu a publicação ao superadmin.
- `20260820055619_allow_authenticated_guide_image_uploads.sql`: permite criação e substituição por qualquer conta autenticada, preservando a remoção para o superadmin.

As migrations são verificadas em PostgreSQL efêmero pela CI. A aplicação remota
ocorre somente no projeto escolhido pelo responsável e sem credenciais no Git.
O seed de desenvolvimento permanece `draft` e não publica nada.

## Acesso da aplicação

O Next.js usa a chave publicável e o JWT da sessão. Grants definem quais tabelas cada papel alcança e RLS restringe as linhas. Chaves `service_role` e `sb_secret_...` não são usadas no navegador nem necessárias para a jornada pública e de usuário do MVP.

`user_progress.current_step` é zero-based para coincidir com o visualizador: primeiro passo é `0`. O Route Handler valida o valor contra a quantidade real de etapas antes do upsert.

## Busca

`tutorials.search_document` usa `tsvector` em português e índice GIN. Termos controlados têm índice próprio. Ranking, paginação e `EXPLAIN ANALYZE` serão ajustados com dados reais; nenhum banco vetorial foi introduzido.

## Backup e recuperação

Antes de produção: configurar backup automático, retenção aprovada, PITR conforme o plano contratado e ensaio documentado de restauração. Backup sem teste de restauração não será considerado validado.
