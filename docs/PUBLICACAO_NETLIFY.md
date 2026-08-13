# Publicação do frontend no Netlify

O Netlify publica o aplicativo Next.js usando o adaptador OpenNext gerenciado
pela plataforma. Não adicione `@netlify/plugin-nextjs`: a configuração moderna é
automática e suporta App Router, SSR, Route Handlers e Middleware.

## Escopo da primeira publicação

A primeira URL pública é uma prévia funcional do frontend com o guia fictício
local. Login, sincronização e conteúdo PostgreSQL permanecem indisponíveis até a
configuração das variáveis do Supabase. A API C++ não é executada pelo Netlify e
será hospedada separadamente; enquanto `GUIDO_API_URL` estiver ausente, o
frontend usa o fallback demonstrativo já validado.

Projeto Netlify atual:

- produção: `https://guido-ajuda-digital.netlify.app`;
- painel: `https://app.netlify.com/projects/guido-ajuda-digital`.

Projetos novos podem herdar visibilidade privada da equipe. Para uma publicação
aberta, confirme **Project configuration > General > Visitor access > Project
visibility > Public**. A produção só é considerada pública depois de uma
requisição sem sessão Netlify responder com sucesso.

## Configuração

- build: `npm run build`;
- diretório detectado: `.next`;
- runtime: Node.js 22 LTS;
- arquivo: `netlify.toml`.

No painel do Netlify, as variáveis devem ser cadastradas em **Project
configuration > Environment variables**, nunca gravadas no repositório:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
GUIDO_API_URL=
```

Para a primeira prévia, deixe as três ausentes. Após a configuração dos serviços:

- `NEXT_PUBLIC_SUPABASE_URL`: URL pública do projeto Supabase;
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: somente `sb_publishable_...`;
- `GUIDO_API_URL`: URL HTTPS pública da API C++.

Nunca configure no Netlify senha PostgreSQL, `service_role`, `sb_secret_...` ou
`GUIDO_DATABASE_URL`: essas credenciais pertencem exclusivamente à hospedagem da
API C++.

## Autenticação

Depois que existir uma URL pública definitiva, ela deve ser adicionada ao
Supabase Auth como Site URL e Redirect URL. O endereço local continua permitido
apenas para desenvolvimento.

## Atualizações

O fluxo recomendado é conectar o repositório GitHub ao Netlify para que cada
push autorizado gere um novo deploy. Deploy manual pela CLI serve apenas para a
primeira prévia ou diagnóstico.
