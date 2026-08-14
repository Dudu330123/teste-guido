# Publicação na Vercel

## Estado atual

O projeto `c-teste/guido` executa o monólito Next.js na Vercel. A URL de produção
é `https://guido-orpin.vercel.app`. Supabase continua responsável por Auth,
PostgreSQL e Storage; nenhuma credencial administrativa é enviada ao frontend.

## Variáveis

Produção, previews e desenvolvimento remoto usam somente:

- `NEXT_PUBLIC_SUPABASE_URL`;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Ambas são públicas por contrato. Nunca cadastrar `service_role`, `sb_secret_...`,
senha do banco ou token de acesso administrativo na Vercel.

## GitHub

O repositório oficial é `castroo00/guido` e a branch de produção é `main`.
Depois que o proprietário conectar sua identidade GitHub à conta Vercel, o
projeto deve ser associado ao repositório para deploy automático. Alterações em
branches geram previews; somente versões validadas devem chegar à `main`.

## Supabase Auth

Em **Authentication > URL Configuration**, usar:

- Site URL: `https://guido-orpin.vercel.app`;
- Redirect URL: `https://guido-orpin.vercel.app/**`;
- manter `http://localhost:3000/**` para desenvolvimento local.

A URL antiga do Netlify pode permanecer temporariamente durante a transição.
Essa configuração deve ser alterada isoladamente pelo painel: não usar um push
integral de `config.toml` sem revisar confirmação de e-mail, MFA e rate limits.

## Empacotamento

`.vercelignore` exclui o backend C++ congelado e artefatos locais. Esses arquivos
não participam do Next.js e aumentavam o primeiro upload de aproximadamente
140 KB para 290 MB sem qualquer benefício de execução.
