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
3. Repetir esses dois valores em `.env.backend.local`; a chave publishable não
   concede privilégios administrativos e é usada para validar sessões no Auth.
4. Em **Connect**, copiar a conexão PostgreSQL **Session pooler**, porta `5432`,
   para `GUIDO_DATABASE_URL` em `.env.backend.local`. Ela é apropriada ao backend
   persistente e funciona em redes IPv4. Cole a URL inteira sem aspas; o
   inicializador lê o valor literalmente, inclusive caracteres especiais da senha.
5. Em **Authentication > URL Configuration**, definir Site URL como
   `http://localhost:3000` e adicionar `http://localhost:3000/**` às Redirect URLs.
6. Revisar as migrations versionadas em `database/migrations`.
7. Aplicar RLS primeiro em ambiente de desenvolvimento e repetir os testes negativos.
8. Configurar Storage privado e limites antes de qualquer upload.

Nunca copie para o projeto ou para o navegador `service_role`, `sb_secret_...`
ou tokens administrativos. A senha PostgreSQL pertence somente a
`.env.backend.local`, que está ignorado pelo Git e usa permissão local restrita.

O cliente de servidor em `src/lib/supabase/server.ts` aceita cookies e o proxy de
progresso retransmite o access token à API C++, que o valida novamente no
Supabase Auth. `src/proxy.ts` mantém a renovação da sessão no Next.js.
