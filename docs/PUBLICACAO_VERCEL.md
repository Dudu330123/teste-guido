# Publicação na Vercel

## Estado atual

O projeto `c-teste/guido` executa o monólito Next.js na Vercel. A URL de produção
é `https://guido-orpin.vercel.app`. PostgreSQL, Auth Guido, email e Storage são
configurados como serviços independentes; nenhum segredo administrativo é enviado ao frontend.

## Variáveis

Produção e previews precisam de `DATABASE_URL`, `AUTH_SESSION_SECRET`,
`AUTH_BASE_URL`, `EMAIL_FROM` e configuração de Storage. Google OAuth usa
`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` e `GOOGLE_REDIRECT_URI` quando ativado.
Nunca cadastrar senha do banco, client secret ou token administrativo no frontend.

## GitHub

O repositório oficial é `castroo00/guido` e a branch de produção é `main`.
Depois que o proprietário conectar sua identidade GitHub à conta Vercel, o
projeto deve ser associado ao repositório para deploy automático. Alterações em
branches geram previews; somente versões validadas devem chegar à `main`.

## URLs de autenticação

Configure `AUTH_BASE_URL` com a URL pública. Se Google OAuth estiver ativo,
cadastre essa URL mais `/api/auth/google/callback` no Google Cloud Console.

## Empacotamento

`.vercelignore` exclui o backend C++ congelado e artefatos locais. Esses arquivos
não participam do Next.js e aumentavam o primeiro upload de aproximadamente
140 KB para 290 MB sem qualquer benefício de execução.
