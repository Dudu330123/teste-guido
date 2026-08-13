# Integração inicial do Supabase — sujeita a revisão

As migrations locais foram criadas e validadas apenas em PostgreSQL efêmero. Nenhuma migration foi executada em projeto Supabase remoto. O modelo ainda precisa de revisão de produto, LGPD e permissões antes dessa aplicação.

- `profiles`: dados mínimos do usuário e preferência de sistema; relacionado a `auth.users`;
- `team_members`: vínculo entre usuários internos, equipe e papel;
- `applications`: catálogo, identificação e origem do logo;
- `tasks`: tarefas disponíveis por aplicativo;
- `guides`: variante versionada por tarefa e sistema operacional;
- `guide_steps`: ordem, instrução e referências de mídia;
- `user_progress`: progresso por usuário e versão do guia;
- `favorites`: associação de usuário a tarefa ou guia;
- `guide_reviews`: revisões humanas, parecer e status;
- `audit_logs`: eventos administrativos mínimos, sem conteúdo sensível.

## Configuração do projeto de desenvolvimento

1. Abrir o projeto `GUIDO` no painel oficial do Supabase.
2. Em **Connect** ou **Settings > API Keys**, copiar somente a Project URL e a
   chave **Publishable** (`sb_publishable_...`) para `.env.local`.
3. Em **Authentication > URL Configuration**, definir Site URL como
   `http://localhost:3000` e adicionar `http://localhost:3000/**` às Redirect URLs.
4. Revisar as migrations versionadas em `database/migrations`, incluindo as políticas da demonstração e do Storage.
5. Aplicar as migrations manualmente, em ordem, primeiro em ambiente de desenvolvimento.
6. Aplicar `database/seeds/development.sql` somente se desejar a demonstração fictícia.
7. Repetir os testes negativos de RLS antes de publicar.
8. Adicionar a URL de produção às Redirect URLs antes do deploy.

Nunca copie para o projeto ou para o navegador `service_role`, `sb_secret_...`
ou tokens administrativos. O frontend e os Route Handlers usam somente a chave publicável e as permissões da sessão.

O cliente de servidor em `src/lib/supabase/server.ts` aceita cookies e valida o usuário com `auth.getUser()` antes de operações privadas. `src/proxy.ts` mantém a renovação da sessão no Next.js. Catálogo e guias são lidos diretamente com RLS; progresso e histórico passam por Route Handlers sem chave administrativa.
