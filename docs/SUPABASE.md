# Integração do Supabase — sujeita a revisão de produto

As migrations `001` a `008` são validadas em PostgreSQL efêmero; a `007` adiciona
rascunhos privados e a `008` adiciona publicação imediata restrita a
administradores. Elas devem ser aplicadas ao projeto Supabase remoto. A
auditoria de segurança da CLI não apresentou alertas
depois da migration `005`. O conteúdo demonstrativo continua pendente de revisão
humana e não deve ser promovido a oficial.

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
4. Revisar as migrations versionadas em `supabase/migrations`, incluindo as políticas da demonstração e do Storage.
5. Aplicar toda mudança futura por uma nova migration; não editar o schema remoto diretamente.
6. Usar `supabase/seed.sql` somente para a demonstração fictícia.
7. Repetir os testes negativos de RLS antes de publicar.
8. Adicionar a URL de produção às Redirect URLs antes do deploy.

Nunca copie para o projeto ou para o navegador `service_role`, `sb_secret_...`
ou tokens administrativos. O frontend e os Route Handlers usam somente a chave publicável e as permissões da sessão.

O cliente de servidor em `src/lib/supabase/server.ts` aceita cookies e valida o usuário com `auth.getUser()` antes de operações privadas. `src/proxy.ts` mantém a renovação da sessão no Next.js. Catálogo e guias são lidos diretamente com RLS; progresso e histórico passam por Route Handlers sem chave administrativa.

## Primeiro membro da equipe

O cadastro no Auth não concede acesso administrativo. Depois que a migration
`007` estiver aplicada, um responsável deve inserir explicitamente o primeiro
usuário em `team_members` pelo SQL Editor, usando o UUID existente em
`Authentication > Users`. Não use e-mail ou senha no código:

```sql
insert into public.team_members (user_id, role)
values ('UUID_DO_USUARIO', 'superadmin')
on conflict (user_id) do update
set role = excluded.role, active = true;
```

Depois desse bootstrap, outros membros devem ser cadastrados por um fluxo
administrativo auditado, ainda pendente.

`editor`, `reviewer` e `admin` não publicam imagens. O papel `superadmin` fica
reservado ao responsável principal e é o único autorizado a acessar o painel e
alterar os prints vistos por todos os usuários.

## Integração com GitHub

O diretório `supabase/` fica na raiz do repositório `castroo00/guido`. Na integração
oficial, configure:

- repositório: `castroo00/guido`;
- branch de produção: `main`;
- working directory: `.`;
- deploy para produção: habilitado;
- branching automático: opcional, pois ambientes de preview exigem plano compatível.

A autorização OAuth do GitHub foi iniciada pelo proprietário em 13 de agosto de
2026. O vínculo no nível do projeto só deve ser considerado concluído quando o
painel exibir `castroo00/guido` e uma migration enviada pela `main` aparecer no
histórico remoto sem `db push` manual.

A autorização do aplicativo GitHub do Supabase exige confirmação do proprietário
da conta no painel. Depois de habilitada, novas migrations presentes em
`supabase/migrations` são aplicadas quando chegam à branch de produção. Alterações
de Auth e o conteúdo de `seed.sql` não são enviados automaticamente para produção.

Proteja a `main` com o status check da integração antes de ampliar a equipe. Não
adicione `SUPABASE_ACCESS_TOKEN`, senha do banco, `service_role` ou `sb_secret_...`
ao repositório. A chave publicável usada pelo navegador fica apenas nas variáveis
de ambiente do ambiente de execução.
