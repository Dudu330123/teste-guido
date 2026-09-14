# Publicação na Vercel

O repositório oficial é `castroo00/guido`, a produção usa a branch `main` e a URL atual é `https://guido-orpin.vercel.app`.

## Variáveis públicas obrigatórias

Configure em produção e preview:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Essas variáveis identificam o projeto e usam a chave pública protegida por RLS. Nunca configure `service_role`, `sb_secret_...`, senha do banco ou segredo OAuth como variável `NEXT_PUBLIC_*`.

## Autenticação social

Os Client IDs e secrets de Google e Apple ficam no painel do Supabase. Em **Authentication > URL Configuration**, permita `https://guido-orpin.vercel.app/auth/callback`. A URL cadastrada no provedor social é a callback do próprio Supabase (`https://SEU-PROJECT-REF.supabase.co/auth/v1/callback`).

Branches geram previews e `main` gera produção pela integração Git. Cada domínio de preview usado para testar login precisa estar autorizado nas Redirect URLs do Supabase.
