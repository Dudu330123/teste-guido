# Supabase no Guido

O Supabase fornece PostgreSQL, autenticação, políticas de acesso e Storage. Para o usuário comum isso é invisível: ele entra com Google, Apple ou e-mail e usa uma conta Guido.

## Configuração do projeto

1. Em **Project Settings > API**, copie a URL e a chave pública `publishable`.
2. Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` no `.env.local` e na Vercel.
3. Em **Authentication > URL Configuration**, defina a URL pública do Guido como Site URL e permita:
   - `http://localhost:3000/auth/callback`
   - `https://guido-orpin.vercel.app/auth/callback`
4. Em **Authentication > Providers**, habilite apenas provedores com credenciais oficiais configuradas.

## Google

Crie credenciais OAuth Web no Google Cloud. No cliente Google, cadastre como URI de redirecionamento autorizado a URL exibida pelo painel do provedor Google no Supabase:

```text
https://SEU-PROJECT-REF.supabase.co/auth/v1/callback
```

Cole o Client ID e o Client Secret em **Authentication > Providers > Google**. Esses segredos pertencem ao painel do Supabase e nunca ao código ou às variáveis `NEXT_PUBLIC_*`.

## Apple

O botão Apple usa o mesmo fluxo OAuth. Para ativá-lo, configure o Service ID e a chave da Apple em **Authentication > Providers > Apple**, seguindo a URL de callback indicada pelo Supabase. Enquanto o provedor estiver desabilitado, o restante do login continua funcionando.

## Identidade e autorização

- a identidade canônica é `auth.users.id`;
- o gatilho `handle_new_auth_user` cria o registro correspondente em `profiles`;
- `team_members` concede funções administrativas separadamente da conta comum;
- APIs protegidas validam a sessão no servidor e as políticas RLS limitam o acesso;
- nenhuma `service_role` ou chave secreta pode ser enviada ao navegador.

Entrar pela primeira vez com Google ou Apple cria automaticamente a identidade necessária. A pessoa não precisa criar nem acessar uma conta no site do Supabase.
